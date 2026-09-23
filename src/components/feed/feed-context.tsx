"use client";

import { createContext, useContext } from "react";

import type { FeedItem, Regret } from "@/types";

/** What a card may change about a post in place. */
export type PostPatch = Partial<
  Pick<Regret, "counts" | "countsKnown" | "reacted" | "allowRepost" | "allowOpinionOnRepost">
>;

export type FeedActions = {
  /** Applies to every occurrence of the post, quoted ones included. */
  patchPost: (id: string, patch: PostPatch) => void;
  /** Drops every card showing the post, reposts of it included. */
  removePost: (id: string) => void;
};

/**
 * Set only by the infinite feed. Cards outside it get null and keep relying on
 * the server actions revalidating the page.
 */
export const FeedContext = createContext<FeedActions | null>(null);

export function useFeedActions() {
  return useContext(FeedContext);
}

export function feedItemId(item: FeedItem) {
  return item.kind === "regret" ? item.regret.id : item.repost.id;
}

export function patchItem(item: FeedItem, id: string, patch: PostPatch): FeedItem {
  if (item.kind === "regret") {
    return item.regret.id === id ? { ...item, regret: { ...item.regret, ...patch } } : item;
  }

  const { repost } = item;
  if (repost.id !== id && repost.regret.id !== id) return item;
  return {
    ...item,
    repost: {
      ...(repost.id === id ? { ...repost, ...patch } : repost),
      regret: repost.regret.id === id ? { ...repost.regret, ...patch } : repost.regret,
    },
  };
}

export function showsPost(item: FeedItem, id: string) {
  return item.kind === "regret"
    ? item.regret.id === id
    : item.repost.id === id || item.repost.regret.id === id;
}
