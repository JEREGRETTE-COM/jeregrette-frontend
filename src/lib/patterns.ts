/**
 * Watermarks from Figma 247:1174 (text), 247:1342 (brand) and 247:1298 (logo).
 * Each file is one tile, repeated over the card and over the generated image, so
 * a screenshot of the feed carries the mark too.
 */
export const patterns = {
  text: { file: "text.svg", width: 116, height: 24 },
  brand: { file: "brand.svg", width: 116, height: 37 },
  logo: { file: "logo.svg", width: 68, height: 59 },
} as const;

export type PatternName = keyof typeof patterns;

const names = Object.keys(patterns) as PatternName[];

/**
 * White over the card colour. Figma 244:968 measures 10%, which disappears on a
 * phone screen: doubled on purpose, so a shared image keeps a visible mark.
 */
export const PATTERN_OPACITY = 0.2;

/**
 * Drawn from the post id, like the colour: nothing to store server-side, and a
 * regret keeps the same mark on every device and in every shared image.
 */
export function patternFor(id: string): PatternName {
  const sum = [...id].reduce((total, char) => total + char.charCodeAt(0), 0);
  return names[sum % names.length];
}
