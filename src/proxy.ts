import { NextResponse, type NextRequest } from "next/server";

import { ApiError } from "@/lib/api";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  refreshTokens,
  sessionCookies,
} from "@/lib/auth";

/**
 * Renews the access token before the page renders — the only place that can,
 * since Server Components cannot write cookies.
 *
 * Deliberately narrow: this only swaps an expired token for a fresh one. Access
 * control stays in the pages and actions, which check the session themselves.
 */
export async function proxy(request: NextRequest) {
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
