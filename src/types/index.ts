export type NavItem = {
  label: string;
  href: string;
};

import type { ReactionType } from "@/types/api";

/** The backend vocabulary is the vocabulary. */
export type ReactionId = ReactionType;

export type Author = {
  id: string;
  handle: string;
  /** Verified badge from the API's `certified`. */
  certified: boolean;
  /** Account created by POST /auth/guest: no email, no password. */
  guest: boolean;
  /** null when the backend has no picture — the UI falls back to an initial. */
  avatar: string | null;
};

export type Regret = {
  id: string;
  author: Author;
  authorId: string;
  allowRepost: boolean;
  allowOpinionOnRepost: boolean;
  time: string;
  text: string;
  /** Solid colour painted under the card's dark top-down overlay. */
  background: string;
  counts: Record<ReactionId, number>;
  /** false while the per-reaction counts have not been fetched yet. */
  countsKnown: boolean;
  reacted?: ReactionId;
  reposts: number;
};

export type Repost = {
  id: string;
  author: Author;
  authorId: string;
  allowRepost: boolean;
  allowOpinionOnRepost: boolean;
  time: string;
  comment: string;
  counts: Record<ReactionId, number>;
  /** false while the per-reaction counts have not been fetched yet. */
  countsKnown: boolean;
  reacted?: ReactionId;
  reposts: number;
  regret: Regret;
};

export type FeedItem = { kind: "regret"; regret: Regret } | { kind: "repost"; repost: Repost };

/** A notification ready for display, built on the server. */
export type NotificationView = {
  id: string;
  unread: boolean;
  text: string;
  /** "@handle" of whoever triggered it, when the payload says. */
  actor: string | null;
  href: string | null;
  time: string;
};
