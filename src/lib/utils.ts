import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names and resolve Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** First letter of a handle, for the avatar fallback. "@kemityu" -> "K" */
export function initial(handle: string) {
  return (handle.replace(/^@/, "")[0] ?? "?").toUpperCase();
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
