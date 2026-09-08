import { getAccessToken } from "@/lib/auth";
import { toFeedItem } from "@/lib/feed-mapping";
import { getReactionBreakdown, listPosts, type ReactionBreakdown } from "@/lib/posts";
import type { FeedItem } from "@/types";

/**
 * The per-reaction counts live on their own route, so each post needs a second
 * call. Fired in parallel: the reader waits one extra round trip, not one per
 * card. Delete this the day the post payload carries the breakdown itself.
 */
async function loadBreakdowns(ids: string[], token: string) {
  const entries = await Promise.all(
    ids.map(async (id) => {
      try {
        const { breakdown } = await getReactionBreakdown(id, token);
        return [id, breakdown] as const;
      } catch {
        // A missing breakdown must not take the whole feed down.
        return [id, {} as ReactionBreakdown] as const;
      }
    }),
  );
  return new Map(entries);
}

export async function loadFeed(): Promise<FeedItem[] | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const { data: posts } = await listPosts({ token });

  const ids = new Set<string>();
  for (const post of posts) {
    ids.add(post.id);
    const quoted = post.original_post;
    if (quoted && typeof (quoted as { id?: string }).id === "string") {
      ids.add((quoted as { id: string }).id);
    }
  }

  const breakdowns = await loadBreakdowns([...ids], token);
  return posts.map((post) => toFeedItem(post, breakdowns));
}
