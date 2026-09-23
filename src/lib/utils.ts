import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names and resolve Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Guests have no username yet, so the UI falls back to a neutral label. */
export function handleOf(username: string | null | undefined) {
  return username ? `@${username}` : "Anonyme";
}

/** First letter of a handle, for the avatar fallback. "@kemityu" -> "K" */
export function initial(handle: string) {
  return (handle.replace(/^@/, "")[0] ?? "?").toUpperCase();
}

/** True for an absolute https:// link, the only kind of avatar the app loads. */
export function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * An avatar the app can render: an https link or a bundled /path. Anything else
 * (http, a typo, a stray string stored through the API) falls back to the initial.
 */
export function safeAvatar(value: string | null | undefined) {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("..")) return value;
  return isHttpsUrl(value) ? value : null;
}

/**
 * The design sets 20px. Long regrets step down so they stay inside the card
 * instead of growing up into the author row.
 */
export function regretFontSize(text: string, compact = false) {
  const size =
    text.length <= 120 ? 20 : text.length <= 250 ? 17 : text.length <= 380 ? 15 : 13;
  // A quoted post gets roughly half the height, so it steps down again.
  return compact ? Math.max(12, size - 3) : size;
}
