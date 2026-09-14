import { NextResponse, type NextRequest } from "next/server";

import { ApiError } from "@/lib/api";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  refreshTokens,
  sessionCookies,
} from "@/lib/auth";

/**
 * Sends the *.vercel.app addresses to the canonical site, path and query intact.
 *
 * Only in production: preview deployments each get their own URL and must stay
 * reachable, and localhost must not bounce to the live site.
 */
function canonicalRedirect(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "production") return null;

  const canonical = process.env.NEXT_PUBLIC_SITE_URL;
  if (!canonical) return null;

  let target: URL;
  try {
    target = new URL(canonical);
  } catch {
    return null;
  }

  const host = request.headers.get("host") ?? request.nextUrl.host;
  // Choosing between jeregrette.com and www belongs to Vercel's domain settings.
  // Redirecting custom domains here as well loops forever as soon as the two
  // disagree (Vercel 308s to www, this 308s back).
  if (host === target.host || !host.endsWith(".vercel.app")) return null;

  const destination = new URL(request.nextUrl.pathname + request.nextUrl.search, target);
  // 308 keeps the method and tells search engines the move is permanent.
  return NextResponse.redirect(destination, 308);
}

/**
 * Renews the access token before the page renders — the only place that can,
 * since Server Components cannot write cookies.
 *
 * Deliberately narrow: this only swaps an expired token for a fresh one. Access
 * control stays in the pages and actions, which check the session themselves.
 */
export async function proxy(request: NextRequest) {
  const redirect = canonicalRedirect(request);
  if (redirect) return redirect;

  const hasAccess = request.cookies.has(ACCESS_COOKIE);
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  // The access cookie expires on its own, so its absence is the signal to renew.
  if (hasAccess || !refreshToken) return NextResponse.next();

  try {
    const tokens = await refreshTokens(refreshToken);

    // Update the request too, so this very render already sees the new token.
    for (const { name, value } of sessionCookies(tokens)) {
      request.cookies.set(name, value);
    }
    const response = NextResponse.next({ request: { headers: request.headers } });
    for (const { name, value, options } of sessionCookies(tokens)) {
      response.cookies.set(name, value, options);
    }
    return response;
  } catch (error) {
    // A dead refresh token would otherwise be retried on every single request.
    if (error instanceof ApiError && error.status !== 0) {
      const response = NextResponse.next();
      response.cookies.delete(ACCESS_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
      return response;
    }
    // The API being unreachable is temporary — keep the token for a later try.
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Page navigations only. Static assets and the generated images never carry
     * a session, so renewing on them would be wasted work.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|icons/|brand/|fonts/).*)",
  ],
};
