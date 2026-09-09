import { getAccessToken } from "@/lib/auth";
import { toFeedItem } from "@/lib/feed-mapping";
import { getReactionBreakdown, listPosts, type ReactionBreakdown } from "@/lib/posts";
import type { FeedItem } from "@/types";
import type { ApiPost, PostCursor } from "@/types/api";

/** How many posts the feed shows before older ones are dropped. */
export const FEED_LIMIT = 200;
const PAGE_SIZE = 50;
const MAX_PAGES = 10;
/** Parallel breakdown requests in flight. Enough to be quick, not a flood. */
const BREAKDOWN_CONCURRENCY = 8;

/**
 * Follows meta.next_cursor until the limit is reached. The seen-id guard also
 * protects against the cursor query parameters being wrong: an API that ignores
 * them would return the same page forever.
 */
async function collectPosts(token: string, startCursor?: PostCursor) {
  const posts: ApiPost[] = [];
  const seen = new Set<string>();
  let cursor: PostCursor | undefined = startCursor;
  let hasMore = false;

  for (let page = 0; page < MAX_PAGES && posts.length < FEED_LIMIT; page += 1) {
    const { data, meta } = await listPosts({ token, cursor, limit: PAGE_SIZE });

    const fresh = (data ?? []).filter((post) => !seen.has(post.id));
    if (fresh.length === 0) break;

    for (const post of fresh) {
      seen.add(post.id);
      posts.push(post);
    }

    if (!meta?.has_more || !meta.next_cursor) {
      cursor = undefined;
      break;
    }
    cursor = meta.next_cursor;
    hasMore = true;
  }

  // Nothing is dropped: the loop stops before fetching past the limit.
  return { posts, cursor: cursor ?? null, hasMore: hasMore && Boolean(cursor) };
}

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

export type FeedPage = {
  items: FeedItem[];
  cursor: PostCursor | null;
  hasMore: boolean;
};

/** One batch of up to FEED_LIMIT posts, plus where to resume. */
export async function loadFeedPage(cursor?: PostCursor): Promise<FeedPage | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const batch = await collectPosts(token, cursor);
  return {
    items: await toFeedItems(batch.posts, token),
    cursor: batch.cursor,
    hasMore: batch.hasMore,
  };
}
