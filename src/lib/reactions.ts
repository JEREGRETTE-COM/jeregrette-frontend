import type { ReactionId } from "@/types";

export const reactions: { id: ReactionId; emoji: string; color: string }[] = [
  { id: "skull", emoji: "💀", color: "#ff0000" },
  { id: "laugh", emoji: "🤣", color: "#ff9500" },
  { id: "cry", emoji: "😭", color: "#00aaff" },
];

export type ReactionState = {
  counts: Record<ReactionId, number>;
  reacted?: ReactionId;
};

/**
 * Single-choice picker: tapping the active reaction clears it, tapping another
 * moves the vote. Shared by the store and the optimistic client update so both
 * sides always agree.
 */
export function applyReaction(state: ReactionState, reaction: ReactionId): ReactionState {
  const counts = { ...state.counts };

  if (state.reacted === reaction) {
    counts[reaction] = Math.max(0, counts[reaction] - 1);
    return { counts, reacted: undefined };
  }

  if (state.reacted) {
    counts[state.reacted] = Math.max(0, counts[state.reacted] - 1);
  }
  counts[reaction] += 1;
  return { counts, reacted: reaction };
}
