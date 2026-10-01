/**
 * Card backgrounds, read straight from the palette image: six columns, five
 * rows, in reading order. One list for the whole app — the feed derives a
 * colour from the post id, the composer cycles through it.
 */
export const palette = [
  "#907f3e", "#f18183", "#379dea", "#967800", "#108687", "#7c00ff",
  "#985e3b", "#42d05e", "#e63e8b", "#954210", "#01d5c4", "#822952",
  "#e2ad32", "#eb4b5a", "#048c80", "#ffb200", "#450fb3", "#788263",
  "#c683d0", "#23c9f3", "#1c35a5", "#5a0067", "#106386", "#de7315",
  "#774b79", "#5491be", "#0a263d", "#6a0012", "#471717", "#2c3d0a",
] as const;

/** Stable per post: nothing to store, and the colour never changes under a reader. */
export function backgroundFor(id: string) {
  const sum = [...id].reduce((total, char) => total + char.charCodeAt(0), 0);
  return palette[sum % palette.length];
}
