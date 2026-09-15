"use client";

import { useOptimistic } from "react";

import { toggleReactionAction } from "@/app/actions";
import { applyReaction, reactions, type ReactionState } from "@/lib/reactions";
import { cn } from "@/lib/utils";
import type { ReactionId } from "@/types";

/**
 * Figma 214:1040 — the reaction pill, translucent white over the card colour.
 * Fixed at 314px once there is room.
 */
export function ReactionBar({
  itemId,
  counts,
  reacted,
  hideCounts = false,
}: {
  itemId: string;
  /** Visitors cannot read the breakdown, so the chips show emojis only. */
  hideCounts?: boolean;
} & ReactionState) {
  const [state, addOptimistic] = useOptimistic<ReactionState, ReactionId>(
    { counts, reacted },
    applyReaction,
  );

  return (
    <form
      action={(formData: FormData) => {
        addOptimistic(String(formData.get("reaction")) as ReactionId);
        return toggleReactionAction(formData);
      }}
      className="flex h-[34px] min-w-0 flex-1 items-center rounded-[20px] bg-white/20 p-[2px] sm:w-[314px] sm:flex-none"
    >
      <input type="hidden" name="itemId" value={itemId} />
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
              hideCounts && "sm:justify-center sm:pl-1",
            )}
            style={
              active
                ? { backgroundColor: reaction.color, borderColor: "#ffffff" }
                : undefined
            }
          >
            <span className="text-[17px] leading-none sm:text-[20px]">{reaction.emoji}</span>
            {hideCounts ? null : (
              <span
                className={cn(
                  "text-[12px] leading-none sm:text-[14px]",
                  active ? "font-semibold text-white" : "text-white",
                )}
              >
                {state.counts[reaction.id]}
              </span>
            )}
          </button>
        );
      })}
    </form>
  );
}
