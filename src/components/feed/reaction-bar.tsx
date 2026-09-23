"use client";

import { useEffect, useOptimistic, useRef, useState } from "react";

import { toggleReactionAction } from "@/app/actions";
import { useFeedActions } from "@/components/feed/feed-context";
import { requestCounts } from "@/components/feed/reaction-counts";
import { applyReaction, reactions, type ReactionState } from "@/lib/reactions";
import { cn } from "@/lib/utils";
import type { ReactionId } from "@/types";

/**
 * Figma 214:1040 — the reaction pill, translucent white over the card colour.
 * Fixed at 314px once there is room.
 *
 * Counts the server skipped are fetched when the card nears the screen: the
 * chips show emojis alone until then, rather than a zero that would be wrong.
 */
export function ReactionBar({
  itemId,
  counts,
  reacted,
  hideCounts = false,
  countsKnown = true,
}: {
  itemId: string;
  /** Visitors cannot read the breakdown, so the chips show emojis only. */
  hideCounts?: boolean;
  /** false when the server left this card's counts for later. */
  countsKnown?: boolean;
} & ReactionState) {
  const bar = useRef<HTMLFormElement>(null);
  const feed = useFeedActions();
  const [fetched, setFetched] = useState<Record<ReactionId, number> | null>(null);

  useEffect(() => {
    if (hideCounts || countsKnown) return;
    const node = bar.current;
    if (!node) return;

    let live = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        requestCounts(itemId).then((breakdown) => {
          if (!live || !breakdown) return;
          setFetched(
            Object.fromEntries(
              reactions.map((reaction) => [reaction.id, breakdown[reaction.id] ?? 0]),
            ) as Record<ReactionId, number>,
          );
        });
      },
      // start a little before the card reaches the screen
      { rootMargin: "300px" },
    );

    observer.observe(node);
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [countsKnown, hideCounts, itemId]);

  const [state, addOptimistic] = useOptimistic<ReactionState, ReactionId>(
    { counts: fetched ?? counts, reacted },
    applyReaction,
  );
  const showCounts = !hideCounts && (countsKnown || fetched !== null);

  return (
    <form
      ref={bar}
      action={async (formData: FormData) => {
        const reaction = String(formData.get("reaction")) as ReactionId;
        const base = { counts: fetched ?? counts, reacted };
        addOptimistic(reaction);
        const ok = await toggleReactionAction(formData);
        // The feed does not revalidate, so it keeps the vote itself, on every
        // copy of the post, before the optimistic state lets go.
        if (ok && feed) {
          feed.patchPost(itemId, {
            ...applyReaction(base, reaction),
            countsKnown: countsKnown || fetched !== null,
          });
        }
      }}
      className="flex h-[34px] min-w-0 flex-1 items-center rounded-[20px] bg-white/20 p-[2px] sm:w-[314px] sm:flex-none"
    >
      <input type="hidden" name="itemId" value={itemId} />
      {feed ? <input type="hidden" name="scope" value="feed" /> : null}
      <input type="hidden" name="current" value={state.reacted ?? ""} />
      {reactions.map((reaction) => {
        const active = reaction.id === state.reacted;
        return (
          <button
            key={reaction.id}
            type="submit"
            name="reaction"
            value={reaction.id}
            aria-pressed={active}
            className={cn(
              "flex h-[30px] min-w-0 flex-1 items-center justify-center gap-[3px] rounded-[25px] border-[0.5px] border-transparent px-1 sm:w-[62px] sm:flex-none sm:justify-start sm:gap-[4px] sm:pl-[7px]",
              !showCounts && "sm:justify-center sm:pl-1",
            )}
            style={
              active
                ? { backgroundColor: reaction.color, borderColor: "#ffffff" }
                : undefined
            }
          >
            <span className="text-[17px] leading-none sm:text-[20px]">{reaction.emoji}</span>
            {showCounts ? (
              <span
                className={cn(
                  "text-[12px] leading-none sm:text-[14px]",
                  active ? "font-semibold text-white" : "text-white",
                )}
              >
                {state.counts[reaction.id]}
              </span>
            ) : null}
          </button>
        );
      })}
    </form>
  );
}
