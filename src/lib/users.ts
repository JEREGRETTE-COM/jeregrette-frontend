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

async function listPostsPage(path: string, token: string, cursor?: string) {
  const suffix = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
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

/** The cursor query parameter name is inferred and unverified. */
export function listMyPosts(token: string, cursor?: string) {
  return listPostsPage("/users/me/posts", token, cursor);
}

export function listUserPosts(id: string, token: string, cursor?: string) {
  return listPostsPage(`/users/${id}/posts`, token, cursor);
}
