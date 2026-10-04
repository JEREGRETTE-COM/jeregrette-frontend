import { api } from "@/lib/api";
import type {
  ApiAuthUser,
  ApiCursorPage,
  ApiItem,
  ApiPost,
} from "@/types/api";

/** `has_more` comes back as a string on these routes. */
function hasMore(value: boolean | string) {
  return value === true || value === "true" || value === "1";
}

/** Measured against the live API: `cursor` and `limit` are both honoured. */
export const PROFILE_PAGE_SIZE = 50;

async function listPostsPage(
  path: string,
  token: string,
  { cursor, limit = PROFILE_PAGE_SIZE }: { cursor?: string; limit?: number } = {},
) {
  const query = new URLSearchParams();
  if (cursor) query.set("cursor", cursor);
  if (limit) query.set("limit", String(limit));
  const suffix = query.size ? `?${query}` : "";
  const page = await api<ApiCursorPage<ApiPost>>(`${path}${suffix}`, { token });
  return {
    posts: page.data,
    nextCursor: page.meta?.next_cursor ?? null,
    hasMore: hasMore(page.meta?.has_more ?? false),
  };
}

export async function getMe(token: string) {
  const { data } = await api<ApiItem<ApiAuthUser>>("/users/me", { token });
  return data;
}

export async function getUser(id: string, token: string) {
  const { data } = await api<ApiItem<ApiAuthUser>>(`/users/${id}`, { token });
  return data;
}

export function listMyPosts(token: string, options?: { cursor?: string; limit?: number }) {
  return listPostsPage("/users/me/posts", token, options);
}

export function listUserPosts(
  id: string,
  token: string,
  options?: { cursor?: string; limit?: number },
) {
  return listPostsPage(`/users/${id}/posts`, token, options);
}

/** Matches the backend limit on PATCH /users/me. */
export const MAX_BIO = 280;

export type ProfileUpdate = {
  username?: string;
  bio?: string | null;
  avatar_url?: string | null;
};

/** Formats the backend accepts, and the ceiling we refuse before sending. */
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

/**
 * POST /users/me/avatar — multipart, field `avatar`. The backend stores the
 * file and answers with the updated user, `avatar_url` included.
 */
export async function uploadAvatar(file: File, token: string) {
  const form = new FormData();
  form.set("avatar", file);

  const { data } = await api<ApiItem<ApiAuthUser>>("/users/me/avatar", {
    method: "POST",
    body: form,
    token,
  });
  return data;
}

export async function updateMe(update: ProfileUpdate, token: string) {
  const { data } = await api<ApiItem<ApiAuthUser>>("/users/me", {
    method: "PATCH",
    body: update,
    token,
  });
  return data;
}
