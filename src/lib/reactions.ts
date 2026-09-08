import type { ReactionId } from "@/types";

export const reactions: { id: ReactionId; emoji: string; color: string }[] = [
  { id: "EMPATHY", emoji: "💀", color: "#ff0000" },
  { id: "LAUGH", emoji: "🤣", color: "#ff9500" },
  { id: "SAD", emoji: "😭", color: "#00aaff" },
  { id: "LIKE", emoji: "👍", color: "#34c759" },
  { id: "SUPPORT", emoji: "💪", color: "#af52de" },
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
