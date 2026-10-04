"use client";

import { useState, useTransition } from "react";

import { loadMoreProfilePostsAction } from "@/app/actions";
import { RegretCard } from "@/components/feed/regret-card";
import { RepostCard } from "@/components/feed/repost-card";
import type { FeedItem } from "@/types";

/**
 * "Voir plus" under a profile: the API serves pages of 50 and hands back a
 * cursor, so older regrets stay reachable instead of stopping at the first page.
 */
export function ProfileLoadMore({
  target,
  initialCursor,
  initialHasMore,
  viewerId,
}: {
  /** "me" or the user id, matching the route the server read. */
  target: string;
  initialCursor: string | null;
  initialHasMore: boolean;
  viewerId: string;
}) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [pending, startTransition] = useTransition();

  function loadMore() {
    if (!cursor) return;
    startTransition(async () => {
      const page = await loadMoreProfilePostsAction(target, cursor);
      setItems((current) => [...current, ...page.items]);
      setCursor(page.cursor);
      setHasMore(page.hasMore && page.items.length > 0);
    });
  }

  return (
    <>
      {items.map((item) =>
        item.kind === "regret" ? (
          <RegretCard key={item.regret.id} regret={item.regret} currentUserId={viewerId} />
        ) : (
          <RepostCard key={item.repost.id} repost={item.repost} currentUserId={viewerId} />
        ),
      )}

      {hasMore && cursor ? (
        <button
          type="button"
          onClick={loadMore}
          disabled={pending}
          className="mx-auto mt-[6px] flex h-[44px] items-center rounded-[22px] border-[0.5px] border-[#c5c5c5] px-[22px] text-[14px] font-medium text-white transition-colors hover:bg-white/5 disabled:opacity-40"
        >
          {pending ? "Chargement…" : "Voir plus"}
        </button>
      ) : null}
    </>
  );
}
