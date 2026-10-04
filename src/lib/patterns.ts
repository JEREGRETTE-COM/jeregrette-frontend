/**
 * Watermarks from Figma 247:1174 (text), 247:1342 (brand) and 247:1298 (logo).
 * Each file is one tile, repeated over the card and the generated share image.
 */
export const patterns = {
  text: { file: "text.svg", width: 116, height: 24 },
  brand: { file: "brand.svg", width: 116, height: 37 },
  logo: { file: "logo.svg", width: 68, height: 59 },
} as const;

export type PatternName = keyof typeof patterns;
/** The API's name for it: `watermark` on a post. */
export type Watermark = PatternName;

const names = Object.keys(patterns) as PatternName[];

/**
 * White over the card colour. Figma 244:968 measures 10%, which disappears on a
 * phone screen: doubled on purpose, so a shared image keeps a visible mark.
 */
export const PATTERN_OPACITY = 0.2;

/**
 * Drawn from the post id, like the colour. Now only the fallback for posts the
 * API sends without a `watermark`; the backend backfilled with this formula.
 */
export function patternFor(id: string): PatternName {
  const sum = [...id].reduce((total, char) => total + char.charCodeAt(0), 0);
  return names[sum % names.length];
}

export function isKnownWatermark(value: unknown): value is Watermark {
  return typeof value === "string" && (names as string[]).includes(value);
}

/** Stored by the API since posts carry one; drawn from the id otherwise. */
export function watermarkOf(post: { id: string; watermark?: string | null }): Watermark {
  return isKnownWatermark(post.watermark) ? post.watermark : patternFor(post.id);
}
