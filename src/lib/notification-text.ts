import { relativeTime } from "@/lib/feed-mapping";
import { parseNotificationData } from "@/lib/notifications";
import type { ApiNotification } from "@/types/api";
import type { NotificationView } from "@/types";

/** Reads a string at a dotted path such as "user.username". */
function read(source: Record<string, unknown>, path: string): string | null {
  let value: unknown = source;
  for (const key of path.split(".")) {
    if (!value || typeof value !== "object") return null;
    value = (value as Record<string, unknown>)[key];
  }
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return null;
}

function first(source: Record<string, unknown>, paths: string[]) {
  for (const path of paths) {
    const value = read(source, path);
    if (value) return value;
  }
  return null;
}

/** A sentence from the Laravel notification class name, e.g. "PostReacted". */
function phraseFor(type: string | null) {
  const name = (type ?? "").split("\\").pop()?.toLowerCase() ?? "";
  if (name.includes("react")) return "a réagi à ton regret";
  if (name.includes("repost")) return "a republié ton regret";
  if (name.includes("follow")) return "s’est abonné à toi";
  if (name.includes("comment") || name.includes("opinion")) return "a commenté ton regret";
  return null;
}

/**
 * The payload shape is undocumented and no real notification has been seen
 * yet. This reads the keys Laravel notifications usually carry, and falls back
 * to a sentence derived from the class name. Tighten it once a real one exists.
 */
export function toNotificationView(notification: ApiNotification): NotificationView {
  const data = parseNotificationData(notification.data);
  const payload = typeof data === "string" ? {} : data;

  const message =
    typeof data === "string"
      ? data.trim() || null
      : first(payload, ["message", "body", "text", "title", "content"]);
  const rawActor = first(payload, [
    "actor_username",
    "username",
    "actor.username",
    "user.username",
    "from",
  ]);
  const actor = rawActor ? (rawActor.startsWith("@") ? rawActor : `@${rawActor}`) : null;
  // A repost notification carries both ids: the repost is what the reader wants
  // to see, since it holds the comment and quotes the regret underneath.
  const postId = first(payload, [
    "repost_id",
    "repost.id",
    "post_id",
    "post.id",
    "regret_id",
    "original_post_id",
  ]);
  const phrase = phraseFor(notification.type);

  return {
    id: notification.id,
    unread: !notification.read_at,
    text: message ?? (phrase ? `${actor ?? "Quelqu’un"} ${phrase}` : "Nouvelle notification"),
    actor,
    href: postId ? `/regret/${postId}` : null,
    time: relativeTime(notification.created_at),
  };
}
