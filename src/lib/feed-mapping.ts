import { toAuthor } from "@/lib/auth";
import { colorOf } from "@/lib/palette";
import { watermarkOf } from "@/lib/patterns";
import { quotedPost, type ReactionBreakdown } from "@/lib/posts";
import { reactions } from "@/lib/reactions";
import type { ApiPost } from "@/types/api";
import type { FeedItem, ReactionId, Regret } from "@/types";

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

/** The post now carries its own counts; the API types them loosely. */
function breakdownOf(post: ApiPost): ReactionBreakdown | undefined {
  const raw = post.reactions?.breakdown;
  if (!raw || typeof raw !== "object") return undefined;

  const breakdown: ReactionBreakdown = {};
  for (const [type, count] of Object.entries(raw)) {
    const value = Number(count);
    if (Number.isFinite(value)) breakdown[type as ReactionId] = value;
  }
  return breakdown;
}

function countsFrom(breakdown: ReactionBreakdown | undefined) {
  const counts = emptyCounts();
  for (const reaction of reactions) {
    counts[reaction.id] = breakdown?.[reaction.id] ?? 0;
  }
  return counts;
}

export function toRegret(post: ApiPost, breakdown?: ReactionBreakdown): Regret {
  // Prefer what the post carries; the separate call is only for older payloads.
  const counts = breakdownOf(post) ?? breakdown;

  return {
    id: post.id,
    author: toAuthor(post.author),
    authorId: post.author_id,
    allowRepost: post.allow_repost,
    allowOpinionOnRepost: post.allow_opinion_on_repost,
    time: relativeTime(post.created_at),
    text: post.content,
    background: colorOf(post),
    watermark: watermarkOf(post),
    mentions: post.mentions ?? [],
    counts: countsFrom(counts),
    countsKnown: counts !== undefined || post.reactions_count === 0,
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
        authorId: post.author_id,
        allowRepost: post.allow_repost,
        allowOpinionOnRepost: post.allow_opinion_on_repost,
        time: relativeTime(post.created_at),
        comment: post.content,
        mentions: post.mentions ?? [],
        counts: countsFrom(breakdownOf(post) ?? breakdowns.get(post.id)),
        countsKnown:
          (breakdownOf(post) ?? breakdowns.get(post.id)) !== undefined ||
          post.reactions_count === 0,
        reacted: post.my_reaction ?? undefined,
        reposts: post.reposts_count,
        regret: toRegret(quoted, breakdowns.get(quoted.id)),
      },
    };
  }

  return { kind: "regret", regret: toRegret(post, breakdowns.get(post.id)) };
}
