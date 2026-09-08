import { toAuthor } from "@/lib/auth";
import { quotedPost, type ReactionBreakdown } from "@/lib/posts";
import { reactions } from "@/lib/reactions";
import type { ApiPost } from "@/types/api";
import type { FeedItem, ReactionId, Regret } from "@/types";

/** Card colours from the design. The backend stores none, so we derive one. */
const palette = ["#a20c37", "#9da20c", "#950ca2", "#383861", "#4b8710"];

/**
 * Stable per post, so a regret keeps its colour across renders and devices.
 * Replace with the stored value once the post payload carries one.
 */
export function backgroundFor(id: string) {
  const sum = [...id].reduce((total, char) => total + char.charCodeAt(0), 0);
  return palette[sum % palette.length];
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function relativeTime(iso: string, now = Date.now()) {
  const elapsed = now - new Date(iso).getTime();
  if (!Number.isFinite(elapsed) || elapsed < MINUTE) return "à l’instant";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} min`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)} h`;
  return `${Math.floor(elapsed / DAY)} j`;
}

function emptyCounts(): Record<ReactionId, number> {
  return Object.fromEntries(reactions.map((r) => [r.id, 0])) as Record<
    ReactionId,
    number
  >;
}

function countsFrom(breakdown: ReactionBreakdown | undefined) {
  const counts = emptyCounts();
  for (const reaction of reactions) {
    counts[reaction.id] = breakdown?.[reaction.id] ?? 0;
  }
  return counts;
}

export function toRegret(post: ApiPost, breakdown?: ReactionBreakdown): Regret {
  return {
    id: post.id,
    author: toAuthor(post.author),
    time: relativeTime(post.created_at),
    text: post.content,
    background: backgroundFor(post.id),
    counts: countsFrom(breakdown),
    reacted: post.my_reaction ?? undefined,
    reposts: post.reposts_count,
  };
}

/**
 * A post quoting another is a repost: its own content is the reposter's
 * comment. `type` carries the same information but its values are undocumented.
 */
export function toFeedItem(
  post: ApiPost,
  breakdowns: Map<string, ReactionBreakdown> = new Map(),
): FeedItem {
  const quoted = quotedPost(post);

  if (quoted) {
    return {
      kind: "repost",
      repost: {
        id: post.id,
        author: toAuthor(post.author),
        time: relativeTime(post.created_at),
        comment: post.content,
        counts: countsFrom(breakdowns.get(post.id)),
        reacted: post.my_reaction ?? undefined,
        reposts: post.reposts_count,
        regret: toRegret(quoted, breakdowns.get(quoted.id)),
      },
    };
  }

  return { kind: "regret", regret: toRegret(post, breakdowns.get(post.id)) };
}
