/**
 * Client-safe. The pattern is the backend's, so a word is a link here exactly
 * when the API could have resolved it: "@" not glued to a word ("a@b.com" is
 * an address), then 3 to 30 username characters.
 */
const MENTION = /(?<![A-Za-z0-9_])@([A-Za-z0-9_]{3,30})/g;

export type Mention = { id: string; username: string };

export type TextSegment =
  | { kind: "text"; text: string }
  | { kind: "mention"; text: string; id: string };

/**
 * Splits a post's text on the @words the API resolved. An @word missing from
 * `mentions` (unknown user, past the five-mention cap) stays plain text.
 */
export function splitMentions(text: string, mentions: Mention[]): TextSegment[] {
  const ids = new Map(mentions.map((mention) => [mention.username.toLowerCase(), mention.id]));
  const segments: TextSegment[] = [];
  let last = 0;

  for (const match of text.matchAll(MENTION)) {
    const id = ids.get(match[1].toLowerCase());
    if (!id) continue;
    if (match.index > last) segments.push({ kind: "text", text: text.slice(last, match.index) });
    segments.push({ kind: "mention", text: match[0], id });
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ kind: "text", text: text.slice(last) });
  return segments;
}

/** The @word being typed just before the caret, if any. */
export function activeMention(value: string, caret: number) {
  const match = /(?<![A-Za-z0-9_])@([A-Za-z0-9_]{0,30})$/.exec(value.slice(0, caret));
  return match ? { start: match.index, query: match[1] } : null;
}

/** Replaces the @word being typed with the chosen handle and a space. */
export function insertMention(value: string, start: number, caret: number, username: string) {
  const inserted = `@${username} `;
  return {
    value: value.slice(0, start) + inserted + value.slice(caret),
    caret: start + inserted.length,
  };
}
