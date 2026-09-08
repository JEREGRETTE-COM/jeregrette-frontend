export type NavItem = {
  label: string;
  href: string;
};

import type { ReactionType } from "@/types/api";

/** The backend vocabulary is the vocabulary. */
export type ReactionId = ReactionType;

export type Author = {
  handle: string;
  /** null when the backend has no picture — the UI falls back to an initial. */
  avatar: string | null;
};

export type Regret = {
  id: string;
  author: Author;
  time: string;
  text: string;
  /** Solid colour painted under the card's dark top-down overlay. */
  background: string;
  counts: Record<ReactionId, number>;
  reacted?: ReactionId;
  reposts: number;
};

export type Repost = {
  id: string;
  author: Author;
  time: string;
  comment: string;
  counts: Record<ReactionId, number>;
  reacted?: ReactionId;
  reposts: number;
  regret: Regret;
};

export type FeedItem = { kind: "regret"; regret: Regret } | { kind: "repost"; repost: Repost };
