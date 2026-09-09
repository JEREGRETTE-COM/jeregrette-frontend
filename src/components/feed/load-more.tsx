"use client";

import { useRef, useState, useTransition } from "react";

import { loadMoreFeedAction } from "@/app/actions";
import { RegretCard } from "@/components/feed/regret-card";
import { RepostCard } from "@/components/feed/repost-card";
import type { FeedItem } from "@/types";
import type { PostCursor } from "@/types/api";

/** Appends the next batch below the ones the server already rendered. */
function itemId(item: FeedItem) {
  return item.kind === "regret" ? item.regret.id : item.repost.id;
}

export function LoadMore({
  initialIds,
  initialCursor,
  initialHasMore,
}: {
  /** Already rendered by the server, so a repeat batch adds nothing. */
  initialIds: string[];
  initialCursor: PostCursor | null;
  initialHasMore: boolean;
}) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [pending, startTransition] = useTransition();
  const seen = useRef(new Set(initialIds));

  function loadMore() {
    if (!cursor) return;

    startTransition(async () => {
      const page = await loadMoreFeedAction(cursor);

      const fresh = page.items.filter((item) => !seen.current.has(itemId(item)));
      for (const item of fresh) seen.current.add(itemId(item));

      // A batch with nothing new means the feed is exhausted, whatever the API
      // says about has_more.
      if (fresh.length === 0) {
        setHasMore(false);
        setCursor(null);
        return;
      }

      setItems((current) => [...current, ...fresh]);
      setCursor(page.cursor);
      setHasMore(page.hasMore);
    });
  }

  return (
    <>
      {items.map((item) =>
        item.kind === "regret" ? (
          <RegretCard key={item.regret.id} regret={item.regret} />
        ) : (
          <RepostCard key={item.repost.id} repost={item.repost} />
        ),
      )}

      {hasMore && cursor ? (
        <button
          type="button"
          onClick={loadMore}
          disabled={pending}
          className="mx-auto mt-[10px] h-[50px] w-full max-w-[280px] rounded-[25px] border-[0.5px] border-[#c5c5c5] text-[15px] font-medium text-white transition-colors hover:bg-white/5 disabled:opacity-60"
        >
          {pending ? "Chargement…" : "Voir plus"}
        </button>
      ) : (
        <p className="text-muted mt-[10px] pb-[10px] text-center text-[14px]">
          Tu as vu tous les regrets.
        </p>
      )}
    </>
  );
}
