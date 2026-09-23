"use client";

import { useWindowVirtualizer, windowScroll } from "@tanstack/react-virtual";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { CardSkeleton } from "@/components/feed/card-skeleton";
import {
  FeedContext,
  feedItemId,
  patchItem,
  showsPost,
  type FeedActions,
} from "@/components/feed/feed-context";
import { RegretCard } from "@/components/feed/regret-card";
import { RepostCard } from "@/components/feed/repost-card";
import type { FeedPage } from "@/lib/feed";
import type { FeedItem } from "@/types";

/** The banner's poll, only while the tab is in front. */
const POLL_MS = 30_000;
/** Load the next draw this far before the reader reaches the bottom. */
const PRELOAD_PX = 800;
/** Cards are 400px tall at least; the real height is measured once rendered. */
const ESTIMATED_ROW = 410;

/**
 * One occurrence of a post. The server recycles posts seen long ago once
 * everything has been seen, so the same post can legitimately sit twice in the
 * list: the key is per draw, never per post.
 */
type Entry = { key: string; item: FeedItem };

type Status = "idle" | "loading" | "error" | "expired";

class SessionExpired extends Error {}

async function fetchPage(): Promise<FeedPage> {
  const response = await fetch("/api/feed", { cache: "no-store" });
  // The route already refreshed the token and replayed once.
  if (response.status === 401) throw new SessionExpired();
  if (!response.ok) throw new Error(`GET /api/feed: ${response.status}`);
  return response.json();
}

function toEntries(page: FeedPage, draw: number): Entry[] {
  return page.items.map((item) => ({ key: `${feedItemId(item)}:${draw}`, item }));
}

function FeedCard({ item, currentUserId }: { item: FeedItem; currentUserId?: string }) {
  return item.kind === "regret" ? (
    <RegretCard regret={item.regret} currentUserId={currentUserId} />
  ) : (
    <RepostCard repost={item.repost} currentUserId={currentUserId} />
  );
}

/**
 * The signed-in feed: GET /posts called again and again, since the server
 * keeps track of what it has shown. Every call marks its posts as seen, so
 * only one runs at a time and nothing already on screen is ever thrown away.
 */
export function InfiniteFeed({
  initialPage,
  currentUserId,
}: {
  /** The first draw, rendered by the server. */
  initialPage: FeedPage;
  currentUserId?: string;
}) {
  const [entries, setEntries] = useState(() => toEntries(initialPage, 0));
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [status, setStatus] = useState<Status>("idle");
  const [newCount, setNewCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Refs, not state: the lock must hold between two clicks of the same frame.
  const loading = useRef(false);
  const draw = useRef(1);
  const hasMoreRef = useRef(initialPage.hasMore);
  const failed = useRef(false);
  /**
   * `served_at` of the latest draw, scroll or refresh alike. A post younger than
   * the guarantee window tops the ranking, so it lands in the very next draw:
   * counting from the latest one leaves out posts already on screen.
   */
  const servedAt = useRef(initialPage.servedAt);

  const list = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  /** false until the first effects ran; see `scrollToFn` below. */
  const hydrated = useRef(false);

  const loadMore = useCallback(async () => {
    if (loading.current || !hasMoreRef.current) return;
    loading.current = true;
    failed.current = false;
    setStatus("loading");

    let next: Status = "idle";
    try {
      const page = await fetchPage();
      const index = draw.current++;
      setEntries((current) => [...current, ...toEntries(page, index)]);
      // Only has_more ends the feed: a short page is normal (deleted post,
      // author diversity rule).
      hasMoreRef.current = page.hasMore;
      setHasMore(page.hasMore);
      servedAt.current = page.servedAt ?? servedAt.current;
    } catch (error) {
      // No automatic retry: a lost response still marked its posts as seen,
      // and the reader decides when to ask again.
      failed.current = true;
      next = error instanceof SessionExpired ? "expired" : "error";
    } finally {
      loading.current = false;
      setStatus(next);
    }
  }, []);

  /** Prepends a fresh draw: clearing the list would lose posts already marked seen. */
  const refresh = useCallback(async () => {
    if (loading.current) return;
    loading.current = true;
    setRefreshing(true);

    try {
      const page = await fetchPage();
      const index = draw.current++;
      setEntries((current) => [...toEntries(page, index), ...current]);
      hasMoreRef.current = true;
      setHasMore(true);
      failed.current = false;
      setStatus("idle");
      servedAt.current = page.servedAt ?? servedAt.current;
      setNewCount(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      // The banner stays up, so tapping it again is the retry.
      if (error instanceof SessionExpired) setStatus("expired");
    } finally {
      loading.current = false;
      setRefreshing(false);
    }
  }, []);

  function retry() {
    failed.current = false;
    void loadMore();
  }

  // Loads while the sentinel is within reach of the viewport.
  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (items) => {
        if (items.some((item) => item.isIntersecting) && !failed.current) void loadMore();
      },
      { rootMargin: `${PRELOAD_PX}px` },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  // The observer only fires when the intersection changes: a sentinel still in
  // reach after a load (short page, tall screen) needs an explicit nudge.
  useEffect(() => {
    if (status !== "idle" || !hasMore) return;
    const node = sentinel.current;
    if (node && node.getBoundingClientRect().top < window.innerHeight + PRELOAD_PX) {
      void loadMore();
    }
  }, [status, hasMore, entries.length, loadMore]);

  // Posts published since the latest draw, polled while the tab is visible.
  useEffect(() => {
    const timer = window.setInterval(async () => {
      if (document.visibilityState !== "visible" || !servedAt.current) return;
      try {
        const query = new URLSearchParams({ since: servedAt.current });
        const response = await fetch(`/api/feed/new-count?${query}`, { cache: "no-store" });
        if (!response.ok) return;
        const { count } = (await response.json()) as { count: number };
        setNewCount(Number(count) || 0);
      } catch {
        // A missed poll only delays the banner.
      }
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, []);

  // The window scrolls, not the list: the virtualizer needs the list's offset.
  useLayoutEffect(() => {
    const node = list.current;
    if (node) setScrollMargin(node.getBoundingClientRect().top + window.scrollY);
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: entries.length,
    estimateSize: () => ESTIMATED_ROW,
    overscan: 4,
    scrollMargin,
    getItemKey: (index) => entries[index].key,
    // What the server renders before the window can be measured.
    initialRect: { width: 0, height: 1200 },
    // The default reads window.scrollY during render: a page scrolled before
    // hydration (slow phone, restored position) then renders other rows than
    // the server did, React throws the tree away, the page shrinks and the
    // scroll falls back to 0. Hydrate at the server's offset instead...
    initialOffset: 0,
    // ...without the scrollTo(0) the virtualizer makes on mount, which would
    // undo the reader's scroll just the same. The real offset is read below.
    scrollToFn: (offset, options, instance) => {
      if (hydrated.current) windowScroll(offset, options, instance);
    },
  });

  // Effects run after layout effects, so the virtualizer's mount has happened.
  // The scroll event makes it read the real position of the window.
  useEffect(() => {
    hydrated.current = true;
    window.dispatchEvent(new Event("scroll"));
  }, []);

  const actions = useMemo<FeedActions>(
    () => ({
      patchPost: (id, patch) =>
        setEntries((current) =>
          current.map((entry) =>
            showsPost(entry.item, id) ? { ...entry, item: patchItem(entry.item, id, patch) } : entry,
          ),
        ),
      removePost: (id) =>
        setEntries((current) => current.filter((entry) => !showsPost(entry.item, id))),
    }),
    [],
  );

  return (
    <FeedContext value={actions}>
      {newCount > 0 ? (
        <div className="pointer-events-none fixed inset-x-0 top-[78px] z-20 flex justify-center sm:top-[120px]">
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            aria-live="polite"
            className="pointer-events-auto flex h-[40px] items-center rounded-[20px] bg-white px-[18px] text-[14px] font-semibold text-black shadow-lg transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {refreshing
              ? "Chargement…"
              : newCount === 1
                ? "1 nouveau regret"
                : `${newCount > 99 ? "99+" : newCount} nouveaux regrets`}
          </button>
        </div>
      ) : null}

      <div ref={list} className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((row) => {
          const { item } = entries[row.index];
          return (
            <div
              key={row.key}
              data-index={row.index}
              ref={virtualizer.measureElement}
              // the list's own 10px gap, inside the measured row
              className="absolute left-0 top-0 w-full pb-[10px]"
              style={{ transform: `translateY(${row.start - scrollMargin}px)` }}
            >
              <FeedCard item={item} currentUserId={currentUserId} />
            </div>
          );
        })}
      </div>

      <div ref={sentinel} aria-hidden className="h-px" />

      {status === "loading" ? (
        <CardSkeleton />
      ) : status === "error" ? (
        <div className="flex flex-col items-center gap-[10px] py-[10px] text-center">
          <p className="text-muted text-[14px]">Impossible de charger la suite.</p>
          <button
            type="button"
            onClick={retry}
            className="h-[50px] w-full max-w-[280px] rounded-[25px] border-[0.5px] border-[#c5c5c5] text-[15px] font-medium text-white transition-colors hover:bg-white/5"
          >
            Réessayer
          </button>
        </div>
      ) : status === "expired" ? (
        <p className="text-muted py-[10px] text-center text-[14px]">
          Ta session a expiré.{" "}
          <Link href="/connexion" className="font-semibold text-white underline">
            Reconnecte-toi
          </Link>{" "}
          pour voir la suite.
        </p>
      ) : !hasMore ? (
        <p className="text-muted py-[10px] text-center text-[14px]">
          Tu as tout vu, reviens plus tard.
        </p>
      ) : null}
    </FeedContext>
  );
}
