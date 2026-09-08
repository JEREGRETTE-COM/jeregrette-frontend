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
