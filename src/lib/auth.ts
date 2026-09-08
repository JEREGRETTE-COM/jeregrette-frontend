import { cookies } from "next/headers";
import { cache } from "react";

import { api, ApiError } from "@/lib/api";
import { getMe } from "@/lib/users";
import type { ApiAuthUser, ApiUser, AuthTokens, RefreshResponse } from "@/types/api";
import type { Author } from "@/types";

export const ACCESS_COOKIE = "jr_access";
export const REFRESH_COOKIE = "jr_refresh";

const FALLBACK_ACCESS_MAX_AGE = 60 * 60;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

/** Design avatars, used while the backend has none for a user. */
const placeholderAvatars = [
  "/avatars/adjamela3.png",
  "/avatars/grandpapa.png",
  "/avatars/aquilafaute.png",
  "/avatars/fucklesmogodeb.png",
  "/avatars/terrifiedofwoman457.png",
];

function placeholderAvatar(seed: string) {
  const sum = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0);
  return placeholderAvatars[sum % placeholderAvatars.length];
}

export function toAuthor(user: ApiUser): Author {
  return {
    handle: `@${user.username}`,
    avatar: user.avatar_url || placeholderAvatar(user.username),
  };
}

type CookieDescriptor = {
  name: string;
  value: string;
  options: {
    httpOnly: true;
    sameSite: "lax";
    path: "/";
    secure: boolean;
    maxAge: number;
  };
};

/**
 * Shared by the Server Actions and the proxy, which set cookies through
 * different APIs but must agree on names, flags and lifetimes.
 */
export function sessionCookies(tokens: AuthTokens): CookieDescriptor[] {
  const seconds = Number(tokens.expires_in);
  const common = {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // Secure cookies are rejected over plain http outside localhost.
    secure: process.env.NODE_ENV === "production",
  } as const;

  const descriptors: CookieDescriptor[] = [
    {
      name: ACCESS_COOKIE,
      value: tokens.access_token,
      options: {
        ...common,
        maxAge:
          Number.isFinite(seconds) && seconds > 0 ? seconds : FALLBACK_ACCESS_MAX_AGE,
      },
    },
  ];

  if (tokens.refresh_token) {
    descriptors.push({
      name: REFRESH_COOKIE,
      value: tokens.refresh_token,
      options: { ...common, maxAge: REFRESH_MAX_AGE },
    });
  }

  return descriptors;
}

export async function saveSession(tokens: AuthTokens) {
  const jar = await cookies();
  for (const { name, value, options } of sessionCookies(tokens)) {
    jar.set(name, value, options);
  }
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export function refreshTokens(refreshToken: string) {
  return api<RefreshResponse>("/auth/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken },
  });
}

/**
 * Cached for the render pass, so a page reading the session in several places
 * still costs one call to /user.
 *
 * Renewal happens in the proxy, before rendering: cookies cannot be written
 * while a Server Component renders.
 */
export const getCurrentUser = cache(async (): Promise<ApiAuthUser | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    // /users/me over /user: same envelope as the rest of the API, and it
    // carries posts_count.
    return await getMe(token);
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthenticated) return null;
    throw error;
  }
});

export async function getCurrentAuthor(): Promise<Author | null> {
  const user = await getCurrentUser();
  return user ? toAuthor(user) : null;
}
