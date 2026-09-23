import { NextResponse } from "next/server";

import { withFreshToken } from "@/lib/auth";
import { fetchFeedPage } from "@/lib/feed";

import { feedError } from "./respond";

/**
 * The next draw of the feed, for the infinite scroll. A Route Handler rather
 * than a Server Action: renewing the session writes cookies, which would make
 * an action re-render the feed page and draw (and mark seen) one more page.
 */
export async function GET() {
  try {
    return NextResponse.json(await withFreshToken(fetchFeedPage));
  } catch (error) {
    return feedError(error);
  }
}
