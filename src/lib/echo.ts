import Echo from "laravel-echo";
import Pusher from "pusher-js";

let instance: Echo<"reverb"> | null | undefined;

/**
 * One Reverb connection per tab, shared by every listener. Null when the
 * NEXT_PUBLIC_REVERB_* variables are missing: the app then simply falls back
 * to polling instead of failing.
 */
export function getEcho() {
  if (typeof window === "undefined") return null;
  if (instance !== undefined) return instance;

  const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
  const host = process.env.NEXT_PUBLIC_REVERB_HOST;
  if (!key || !host) return (instance = null);

  const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT) || undefined;
  const tls = (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "https") === "https";

  instance = new Echo({
    broadcaster: "reverb",
    Pusher,
    key,
    wsHost: host,
    wsPort: port ?? 80,
    wssPort: port ?? 443,
    forceTLS: tls,
    enabledTransports: ["ws", "wss"],
    authEndpoint: "/api/broadcasting-auth",
  });
  return instance;
}
