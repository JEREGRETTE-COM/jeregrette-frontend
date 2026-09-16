import { ApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { toFeedItem } from "@/lib/feed-mapping";
import {
  getReactionBreakdown,
  listPosts,
  listPublicPosts,
  type ReactionBreakdown,
} from "@/lib/posts";
import type { FeedItem } from "@/types";
import type { ApiPost, PostCursor } from "@/types/api";

/**
 * What one call really returns. The documentation says `limit` defaults to 100,
 * but the backend caps it at 50 whatever is requested (measured: 100, 150 and
 * 300 all came back with 50 posts).
 */
const PAGE_SIZE = 50;
/** Parallel breakdown requests in flight. Enough to be quick, not a flood. */
const BREAKDOWN_CONCURRENCY = 8;

export type FeedPage = {
  items: FeedItem[];
  /** null when the next batch must go through `limit` instead of the cursor. */
  cursor: PostCursor | null;
  /** The API's own `has_more`, even when nothing more could actually be fetched. */
  hasMore: boolean;
};

/**
 * Per-reaction counts live on their own route, so each post needs a second
 * call. Posts nobody reacted to are skipped, and the rest run a few at a time
 * rather than all at once. Delete all of this the day the post payload carries
 * the breakdown itself.
 */
async function loadBreakdowns(ids: string[], token: string) {
  const breakdowns = new Map<string, ReactionBreakdown>();
  const queue = [...ids];

  const workers = Array.from({ length: BREAKDOWN_CONCURRENCY }, async () => {
    for (let id = queue.pop(); id !== undefined; id = queue.pop()) {
      try {
        const { breakdown } = await getReactionBreakdown(id, token);
        breakdowns.set(id, breakdown);
      } catch {
        // A missing breakdown must not take the whole feed down.
      }
    }
  });

  await Promise.all(workers);
  return breakdowns;
}

/** Turns raw posts into feed items, fetching only the breakdowns that matter. */
export async function toFeedItems(posts: ApiPost[], token: string) {
  const withReactions = new Set<string>();
  for (const post of posts) {
    if (post.reactions_count > 0) withReactions.add(post.id);

    const quoted = post.original_post as ApiPost | undefined;
    if (quoted?.id && quoted.reactions_count > 0) withReactions.add(quoted.id);
  }

  const breakdowns = await loadBreakdowns([...withReactions], token);
  return posts.map((post) => toFeedItem(post, breakdowns));
}

/**
 * What a visitor sees, from GET /public/posts. The API draws ten posts at random
 * and offers no pagination; the reaction breakdown route refuses anonymous
 * calls, so per-reaction counts cannot be shown.
 */
export async function loadPublicFeed(): Promise<FeedItem[]> {
  try {
    const { data } = await listPublicPosts();
    return (data ?? []).map((post) => toFeedItem(post));
  } catch {
    return [];
  }
}

/**
 * What the home page has to show. `outage` is the backend being down rather
 * than the reader being signed out, so the screen can say so and retry.
 */
export type FeedState =
  | { kind: "anonymous" }
  | { kind: "ready"; page: FeedPage }
  | { kind: "outage" };

/** A failure that is the server's, not the request's: retrying can fix it. */
function isOutage(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.status === 0 || error.status === 429 || error.status >= 500)
  );
}

/** The first screen of the feed: one page of the API, one round trip. */
export async function loadFeed(): Promise<FeedState> {
  const token = await getAccessToken();
  if (!token) return { kind: "anonymous" };

  try {
    return { kind: "ready", page: await loadFeedPage(token) };
  } catch (error) {
    // An expired session reads as signed out; the proxy renews it on the next hit.
    if (error instanceof ApiError && error.isUnauthenticated) return { kind: "anonymous" };
    if (isOutage(error)) return { kind: "outage" };
    throw error;
  }
}

async function loadFeedPage(token: string): Promise<FeedPage> {
  const { data, meta } = await listPosts({ token, limit: PAGE_SIZE });
  const hasMore = Boolean(meta?.has_more);

  // TEMP diagnostic (dev only): the new server hands back an empty feed.
  if (process.env.NODE_ENV !== "production") {
    console.info("[diag feed] GET /posts", {
      count: data?.length ?? 0,
      meta,
      firstIds: (data ?? []).slice(0, 3).map((post) => post.id),
    });
  }

  return {
    items: await toFeedItems(data ?? [], token),
    cursor: hasMore ? (meta?.next_cursor ?? null) : null,
    hasMore,
  };
}

/**
 * The next batch after what is already on screen.
 *
 * 1. The cursor — the correct path. The backend ignores it today and hands back
 *    the first page again, so its posts are all filtered out as already seen.
 * 2. A longer list through `limit`, keeping only unseen posts. That only helps
 *    once the backend stops capping `limit` at 50.
 *
 * Filtering happens before the breakdown calls, so re-fetched posts cost nothing
 * beyond the list itself. When neither path brings anything new while the API
 * still reports more, `hasMore` stays true: the caller then says the rest cannot
 * be loaded, instead of claiming the feed has ended.
 */
export async function loadMoreFeed(
  cursor: PostCursor | null,
  seenIds: string[],
): Promise<FeedPage | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const seen = new Set(seenIds);

  if (cursor) {
    const { data, meta } = await listPosts({ token, cursor, limit: PAGE_SIZE });
    const fresh = (data ?? []).filter((post) => !seen.has(post.id));
    if (fresh.length > 0) {
      const hasMore = Boolean(meta?.has_more);
      return {
        items: await toFeedItems(fresh, token),
        cursor: hasMore ? (meta?.next_cursor ?? null) : null,
        hasMore,
      };
    }
  }

  const { data, meta } = await listPosts({ token, limit: seen.size + PAGE_SIZE });
  const fresh = (data ?? []).filter((post) => !seen.has(post.id));

  return {
    items: await toFeedItems(fresh, token),
    cursor: null,
    hasMore: Boolean(meta?.has_more),
  };
}
