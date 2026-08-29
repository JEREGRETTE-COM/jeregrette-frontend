export type NavItem = {
  label: string;
  href: string;
};

export type ReactionId = "skull" | "laugh" | "cry";

export type Author = {
  handle: string;
  avatar: string;
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
