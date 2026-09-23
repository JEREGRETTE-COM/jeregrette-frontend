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
import type { ApiPost } from "@/types/api";

/** Per the feed contract: small draws, since each one is marked seen at once. */
export const PAGE_SIZE = 20;
/** Parallel breakdown requests in flight. Enough to be quick, not a flood. */
const BREAKDOWN_CONCURRENCY = 6;
/**
 * How many cards get their counts before the page is sent, for older payloads
 * that do not carry `reactions`. The rest are fetched by the cards themselves.
 */
const EAGER_BREAKDOWNS = 6;

export type FeedPage = {
  items: FeedItem[];
  /** The API's own `has_more`: the only signal that the feed has ended. */
  hasMore: boolean;
  /** The draw's `meta.served_at`: GET /posts/new-count counts posts published after it. */
  servedAt: string | null;
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
  // Posts that carry their own `reactions` need nothing; this covers the rest.
  const needsCall = (post: ApiPost | undefined) =>
    Boolean(post?.id) && !post?.reactions && (post?.reactions_count ?? 0) > 0;

  const withReactions = new Set<string>();
  for (const post of posts.slice(0, EAGER_BREAKDOWNS)) {
    if (needsCall(post)) withReactions.add(post.id);

    const quoted = post.original_post as ApiPost | undefined;
    if (needsCall(quoted)) withReactions.add(quoted!.id);
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
    return { kind: "ready", page: await fetchFeedPage(token) };
  } catch (error) {
    // An expired session reads as signed out; the proxy renews it on the next hit.
    if (error instanceof ApiError && error.isUnauthenticated) return { kind: "anonymous" };
    if (isOutage(error)) return { kind: "outage" };
    throw error;
  }
}

/**
 * One draw of GET /posts. The server marks these posts as seen before replying,
 * so a short page is normal and a post seen long ago may come back: nothing is
 * filtered here.
 */
export async function fetchFeedPage(token: string): Promise<FeedPage> {
  const { data, meta } = await listPosts({ token, limit: PAGE_SIZE });
  const posts = data ?? [];

  return {
    items: await toFeedItems(posts, token),
    hasMore: meta?.has_more !== false,
    servedAt: meta?.served_at ?? null,
  };
}
