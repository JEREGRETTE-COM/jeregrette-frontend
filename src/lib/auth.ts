import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { api, ApiError } from "@/lib/api";
import { handleOf, safeAvatar } from "@/lib/utils";
import { getMe } from "@/lib/users";
import type { ApiAuthUser, ApiUser, AuthTokens, RefreshResponse, AuthResponse } from "@/types/api";
import type { Author } from "@/types";

export const ACCESS_COOKIE = "jr_access";
export const REFRESH_COOKIE = "jr_refresh";

const FALLBACK_ACCESS_MAX_AGE = 60 * 60;
/**
 * The access cookie dies this long before the token does, so the proxy renews
 * it ahead of time instead of a request hitting a 401 at the API.
 */
const ACCESS_EARLY_EXPIRY = 60;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

export function toAuthor(user: ApiUser): Author {
  return {
    id: user.id,
    handle: handleOf(user.username),
    avatar: safeAvatar(user.avatar_url),
    certified: Boolean(user.certified),
    guest: Boolean(user.is_guest),
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
/**
 * Whether the browser reached us over https. A Secure cookie sent back over
 * plain http is dropped by the browser (localhost aside), so tying the flag to
 * NODE_ENV signed out every phone testing a production build over the LAN.
 * Behind a TLS-terminating proxy the original scheme is in x-forwarded-proto.
 */
export function isHttpsRequest(requestHeaders: Headers, fallbackProtocol?: string) {
  const forwarded = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwarded) return forwarded === "https";
  if (fallbackProtocol) return fallbackProtocol === "https:";
  return process.env.NODE_ENV === "production";
}

export function sessionCookies(tokens: AuthTokens, secure: boolean): CookieDescriptor[] {
  const seconds = Number(tokens.expires_in);
  const common = {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
  } as const;

  const descriptors: CookieDescriptor[] = [
    {
      name: ACCESS_COOKIE,
      value: tokens.access_token,
      options: {
        ...common,
        maxAge:
          Number.isFinite(seconds) && seconds > 0
            ? Math.max(seconds - ACCESS_EARLY_EXPIRY, Math.ceil(seconds / 2))
            : FALLBACK_ACCESS_MAX_AGE,
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
  const [jar, requestHeaders] = await Promise.all([cookies(), headers()]);
  for (const { name, value, options } of sessionCookies(tokens, isHttpsRequest(requestHeaders))) {
    jar.set(name, value, options);
  }
}

/**
 * Anyone acting for the first time gets a guest account: the API hands back real
 * tokens, so reacting and posting work without signing up. Cookies can only be
 * written from an action, a route handler or the proxy — never during a render.
 */
export function guestSession() {
  return api<AuthResponse>("/auth/guest", { method: "POST" });
}

export async function createGuestSession() {
  const auth = await guestSession();
  await saveSession(auth.tokens);
  return auth.tokens.access_token;
}

/** The current token, or a brand new guest one. */
export async function ensureSession() {
  return (await getAccessToken()) ?? (await createGuestSession());
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}

/**
 * How long a used refresh token keeps answering with the tokens it was swapped
 * for. Requests sent before the browser stored the new cookies still carry it.
 */
const REFRESH_REUSE_MS = 30_000;

type Refresh = { tokens: Promise<RefreshResponse>; startedAt: number };

/**
 * On globalThis so the proxy and the route handlers, bundled apart, share one
 * map. Per server process only: several instances can still race, which only
 * a grace period on the backend fully covers.
 */
const globalRefreshes = globalThis as typeof globalThis & {
  __jeregretteRefreshes?: Map<string, Refresh>;
};
const refreshes = (globalRefreshes.__jeregretteRefreshes ??= new Map());

/**
 * The API rotates refresh tokens: the first use revokes it and any later use
 * gets a 401. When the access cookie expires, the page, its RSC requests, the
 * feed and its poll all arrive at once with the same refresh token, and each
 * losing 401 used to make the proxy wipe the session. Every caller holding the
 * same token now shares a single call and its result.
 */
export function refreshTokens(refreshToken: string) {
  const now = Date.now();
  for (const [key, refresh] of refreshes) {
    if (now - refresh.startedAt > REFRESH_REUSE_MS) refreshes.delete(key);
  }

  const pending = refreshes.get(refreshToken);
  if (pending) return pending.tokens;

  const tokens = api<RefreshResponse>("/auth/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken },
  });
  refreshes.set(refreshToken, { tokens, startedAt: now });

  // An outage or a timeout leaves the token unused: let the next request retry.
  // A refusal stays shared, since the token is dead for everyone.
  tokens.catch((error) => {
    if (!(error instanceof ApiError && error.status > 0 && error.status < 500)) {
      refreshes.delete(refreshToken);
    }
  });

  return tokens;
}

/**
 * Runs an authenticated call for a Route Handler. On a 401 the refresh token is
 * swapped for new ones and the call replayed once; a second 401 is final.
 *
 * Route Handlers only: a Server Action writing cookies makes Next re-render the
 * page, and the feed page re-rendering means another draw marked as seen.
 */
export async function withFreshToken<T>(call: (token: string) => Promise<T>): Promise<T> {
  const [token, refreshToken] = await Promise.all([getAccessToken(), getRefreshToken()]);

  if (token) {
    try {
      return await call(token);
    } catch (error) {
      if (!(error instanceof ApiError && error.isUnauthenticated)) throw error;
    }
  }
  if (!refreshToken) throw new ApiError(401, "Unauthenticated.");

  const tokens = await refreshTokens(refreshToken);
  await saveSession(tokens);
  return call(tokens.access_token);
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

/** Guards against an open redirect: only a same-origin, relative path is kept. */
export function safeNext(value: string | undefined): string {
  if (value && value.startsWith("/") && !value.startsWith("//") && !value.includes("..")) {
    return value;
  }
  return "/";
}

export async function requireAuthor(next: string): Promise<Author> {
  const author = await getCurrentAuthor();
  if (!author) redirect(`/inscription?next=${encodeURIComponent(next)}`);
  return author;
}
