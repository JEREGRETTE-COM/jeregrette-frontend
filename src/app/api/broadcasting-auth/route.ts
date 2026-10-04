import { NextResponse, type NextRequest } from "next/server";

import { api, ApiError } from "@/lib/api";
import { withFreshToken } from "@/lib/auth";

/**
 * Signs a private Reverb channel for Echo. The browser cannot do it itself: the
 * token lives in an httpOnly cookie and API_URL is server-side only, so the
 * request is relayed to Laravel's /broadcasting/auth with the bearer added.
 */
export async function POST(request: NextRequest) {
  // pusher-js posts a form; accept JSON as well.
  const body = request.headers.get("content-type")?.includes("application/json")
    ? ((await request.json().catch(() => ({}))) as Record<string, unknown>)
    : Object.fromEntries(await request.formData().catch(() => new FormData()));

  const socketId = typeof body.socket_id === "string" ? body.socket_id : "";
  const channelName = typeof body.channel_name === "string" ? body.channel_name : "";
  // Only the user's own notification channel is ever asked for.
  if (!socketId || !channelName.startsWith("private-App.Models.User.")) {
    return NextResponse.json({ error: "invalid channel" }, { status: 400 });
  }

  try {
    const signature = await withFreshToken((token) =>
      api<{ auth: string; channel_data?: string }>("/broadcasting/auth", {
        method: "POST",
        body: { socket_id: socketId, channel_name: channelName },
        token,
      }),
    );
    return NextResponse.json(signature);
  } catch (error) {
    // Echo stops retrying on a 403: a dead session or a refused channel both end here.
    if (error instanceof ApiError && (error.isUnauthenticated || error.status === 403)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    console.error(
      "[broadcasting] auth failed",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
