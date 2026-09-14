import { api } from "@/lib/api";
import type {
  ApiItem,
  ApiList,
  ApiPage,
  ApiPost,
  PostCursor,
  ReactionResult,
  ReactionSummary,
  ReactionType,
} from "@/types/api";

/** `{}` stands for "no quoted post" in the payload, so check for a real id. */
export function quotedPost(post: ApiPost): ApiPost | null {
  const quoted = post.original_post;
  if (!quoted || typeof (quoted as ApiPost).id !== "string") return null;
  return quoted as ApiPost;
}

export async function listPosts({
  token,
  cursor,
  limit,
}: {
  token: string;
  cursor?: PostCursor;
  limit?: number;
}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(cursor ?? {})) {
    if (value !== null && value !== undefined) query.set(key, String(value));
  }
  if (limit) query.set("limit", String(limit));

  const suffix = query.size ? `?${query}` : "";
  return api<ApiList<ApiPost>>(`/posts${suffix}`, { token });
}

/** Anonymous: ten posts drawn at random, no cursor, `limit` ignored. */
export async function listPublicPosts() {
  return api<{ data: ApiPost[] }>("/public/posts");
}

export const MAX_CONTENT = 500;
export const MAX_MEDIA_URL = 2000;

export type CreatePostBody = {
  content: string;
  media_url?: string | null;
  allow_repost?: boolean;
  allow_opinion_on_repost?: boolean;
};

export async function createPost(body: CreatePostBody, token: string) {
  const { data } = await api<ApiItem<ApiPost>>("/posts", {
    method: "POST",
    body,
    token,
  });
  return data;
}

export type PostSettings = {
  allow_repost?: boolean;
  allow_opinion_on_repost?: boolean;
};

export async function updatePostSettings(
  id: string,
  settings: PostSettings,
  token: string,
) {
  const { data } = await api<ApiItem<ApiPost>>(`/posts/${id}/settings`, {
    method: "PATCH",
    body: settings,
    token,
  });
  return data;
}

export async function getPost(id: string, token: string) {
  const { data } = await api<ApiItem<ApiPost>>(`/posts/${id}`, { token });
  return data;
}

export async function deletePost(id: string, token: string) {
  return api<{ message: string }>(`/posts/${id}`, { method: "DELETE", token });
}

/** Counts per reaction type, normalised — the API types them as strings. */
export type ReactionBreakdown = Partial<Record<ReactionType, number>>;

export async function setReaction(postId: string, type: ReactionType, token: string) {
  const { data } = await api<ApiItem<ReactionResult>>(`/posts/${postId}/reactions`, {
    method: "POST",
    body: { type },
    token,
  });
  return data;
}

export async function removeReaction(postId: string, token: string) {
  return api<{ message: string }>(`/posts/${postId}/reactions`, {
    method: "DELETE",
    token,
  });
}

export async function getReactionBreakdown(postId: string, token: string) {
  const { data } = await api<ApiItem<ReactionSummary>>(`/posts/${postId}/reactions`, {
    token,
  });

  const breakdown: ReactionBreakdown = {};
  for (const [type, count] of Object.entries(data.breakdown ?? {})) {
    const value = Number(count);
    if (Number.isFinite(value)) breakdown[type as ReactionType] = value;
  }

  return { total: Number(data.total) || 0, breakdown };
}

/**
 * `content` is the optional comment: up to 500 characters, null when empty. The
 * quoted post's `allow_repost` gates the call and `allow_opinion_on_repost`
 * gates the comment.
 */
export async function repost(postId: string, content: string, token: string) {
  const { data } = await api<ApiItem<ApiPost>>(`/posts/${postId}/repost`, {
    method: "POST",
    body: { content: content || null },
    token,
  });
  return data;
}

/**
 * Pages by number, unlike the feed. `limit` defaults to 20; `page` is not in the
 * documentation, only implied by `meta.current_page` and `meta.last_page`.
 */
export async function listReposts(
  postId: string,
  token: string,
  { limit, page }: { limit?: number; page?: number } = {},
) {
  const query = new URLSearchParams();
  if (limit) query.set("limit", String(limit));
  if (page) query.set("page", String(page));

  const suffix = query.size ? `?${query}` : "";
  return api<ApiPage<ApiPost>>(`/posts/${postId}/reposts${suffix}`, { token });
}
