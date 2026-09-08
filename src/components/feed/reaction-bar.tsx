"use client";

import { useOptimistic } from "react";

import { toggleReactionAction } from "@/app/actions";
import { applyReaction, reactions, type ReactionState } from "@/lib/reactions";
import { cn } from "@/lib/utils";
import type { ReactionId } from "@/types";

/** Figma 85:876 — the reaction pill. Fixed at 314px once there is room. */
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
      className="bg-surface flex h-[34px] min-w-0 flex-1 items-center rounded-[20px] p-[2px] sm:w-[314px] sm:flex-none"
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
            className="flex h-[30px] min-w-0 flex-1 items-center justify-center gap-[3px] rounded-[25px] border-[0.5px] border-transparent px-1 sm:w-[62px] sm:flex-none sm:justify-start sm:gap-[4px] sm:pl-[7px]"
            style={
              active
                ? { backgroundColor: reaction.color, borderColor: "#ffffff" }
                : undefined
            }
          >
            <span className="text-[17px] leading-none sm:text-[20px]">{reaction.emoji}</span>
            <span
              className={cn(
                "text-[12px] leading-none sm:text-[14px]",
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
