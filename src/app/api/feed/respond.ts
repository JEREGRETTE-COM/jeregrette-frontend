import { NextResponse } from "next/server";

import { ApiError } from "@/lib/api";

/**
 * The feed client only needs to tell a dead session (sign in again) from a
 * failure worth a "Réessayer". Nothing from the API's message is passed on.
 */
export function feedError(error: unknown) {
  if (error instanceof ApiError && error.isUnauthenticated) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  console.error("[feed] request failed", error instanceof Error ? error.message : error);
  return NextResponse.json({ error: "unavailable" }, { status: 503 });
}
