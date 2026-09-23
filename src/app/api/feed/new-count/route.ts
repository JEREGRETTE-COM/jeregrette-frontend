import { NextResponse, type NextRequest } from "next/server";

import { withFreshToken } from "@/lib/auth";
import { countNewPosts } from "@/lib/posts";

import { feedError } from "../respond";

/** Polled by the "nouveaux regrets" banner. */
export async function GET(request: NextRequest) {
  // The API validates it too; this only keeps junk from costing a round trip.
  const since = request.nextUrl.searchParams.get("since") ?? "";
  if (!Number.isFinite(Date.parse(since))) {
    return NextResponse.json({ error: "invalid since" }, { status: 400 });
  }

  try {
    const count = await withFreshToken((token) => countNewPosts(since, token));
    return NextResponse.json({ count });
  } catch (error) {
    return feedError(error);
  }
}
