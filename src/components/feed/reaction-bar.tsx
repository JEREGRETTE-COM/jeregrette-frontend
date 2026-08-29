"use client";

import { useOptimistic } from "react";

import { toggleReactionAction } from "@/app/actions";
import { applyReaction, reactions, type ReactionState } from "@/lib/reactions";
import { cn } from "@/lib/utils";
import type { ReactionId } from "@/types";

/** Figma 85:876 — 190x34 pill holding the three reaction chips. */
export function ReactionBar({
  itemId,
  counts,
  reacted,
}: {
  itemId: string;
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
      className="bg-surface absolute left-[12px] top-[11px] flex h-[34px] w-[190px] items-center rounded-[20px] p-[2px]"
    >
      <input type="hidden" name="itemId" value={itemId} />
      {reactions.map((reaction) => {
        const active = reaction.id === state.reacted;
        return (
          <button
            key={reaction.id}
            type="submit"
            name="reaction"
            value={reaction.id}
            aria-pressed={active}
            className="flex h-[30px] w-[62px] items-center gap-[4px] rounded-[25px] border-[0.5px] border-transparent pl-[7px]"
            style={
              active
                ? { backgroundColor: reaction.color, borderColor: "#ffffff" }
                : undefined
            }
          >
            <span className="text-[20px] leading-none">{reaction.emoji}</span>
            <span
              className={cn(
                "text-[14px] leading-none",
                active ? "font-semibold text-white" : "text-[#afafaf]",
              )}
            >
              {state.counts[reaction.id]}
            </span>
          </button>
        );
      })}
    </form>
  );
}
