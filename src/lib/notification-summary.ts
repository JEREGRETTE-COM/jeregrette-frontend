/**
 * Client-safe: shared by the server-rendered list and the live alerts, so it
 * must not import anything that reaches next/headers.
 */

/**
 * `data` has arrived both as a JSON-encoded string and as the object itself;
 * decode the first when possible and keep the raw text otherwise.
 */
export function parseNotificationData(raw: unknown): Record<string, unknown> | string {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw !== "string") return "";
  try {
    const value: unknown = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : raw;
  } catch {
    return raw;
  }
}

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

/**
 * A sentence from `kind` ("post_reacted_to", "post_reposted", "post_mentioned"), or from the
 * Laravel class name on payloads older than it.
 */
function phraseFor(type: string | null) {
  const name = (type ?? "").split("\\").pop()?.toLowerCase() ?? "";
  if (name.includes("react")) return "a réagi à ton regret";
  if (name.includes("repost")) return "a republié ton regret";
  if (name.includes("follow")) return "s’est abonné à toi";
  if (name.includes("comment") || name.includes("opinion")) return "a commenté ton regret";
  if (name.includes("mention")) return "t’a mentionné";
  return null;
}

/**
 * Same payload in GET /notifications (`data`) and over Reverb: kind, message,
 * actor_* , post_id, repost_id, reaction_type. Live events put the PHP class
 * in `type`, so `kind` wins. Older rows have no message nor actor_*, only
 * reactor_username / reposter_username.
 */
export function summarizeNotification(
  type: string | null,
  data: Record<string, unknown> | string,
) {
  const payload = typeof data === "string" ? {} : data;

  const message =
    typeof data === "string"
      ? data.trim() || null
      : first(payload, ["message", "body", "text", "title", "content"]);
  const rawActor = first(payload, [
    "actor_username",
    "reactor_username",
    "reposter_username",
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
  const phrase = phraseFor(read(payload, "kind") ?? type);

  return {
    text: message ?? (phrase ? `${actor ?? "Quelqu’un"} ${phrase}` : "Nouvelle notification"),
    actor,
    href: postId ? `/regret/${postId}` : null,
  };
}
