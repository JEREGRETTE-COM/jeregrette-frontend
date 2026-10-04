import { NextResponse, type NextRequest } from "next/server";

import { ApiError } from "@/lib/api";
import { withFreshToken } from "@/lib/auth";
import { searchUsers } from "@/lib/users";
import { safeAvatar } from "@/lib/utils";

/** The username characters the API accepts as a search prefix. */
const QUERY = /^[A-Za-z0-9_]{1,30}$/;

/** Suggestions for the @mention picker of both composers. */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  if (!QUERY.test(query)) return NextResponse.json({ data: [] });

  try {
    const users = await withFreshToken((token) => searchUsers(query, token));
    return NextResponse.json({
      data: users.map((user) => ({
        id: user.id,
        username: user.username,
        avatar: safeAvatar(user.avatar_url),
        certified: Boolean(user.certified),
      })),
    });
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthenticated) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    console.error("[users/search] failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
