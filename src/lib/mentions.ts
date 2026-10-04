const SITE_NAME = "jeregrette.com";
/** Usernames are 3 to 30 characters: letters, digits and underscore. */
const MENTION = /^@[A-Za-z0-9_]{3,30}/;
/** A "@" glued to a word is part of it — an email address, not a mention. */
const WORD = /[A-Za-z0-9_@]/;

export type TextPart = { text: string; kind: "plain" | "mention" | "site" };

/**
 * Splits a regret into the pieces the UI highlights: mentions written by the
 * author, and the site name the design underlines. Kept here so the card and
 * the shared image cut the text exactly the same way.
 */
export function splitRegret(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let plain = "";

  const flush = () => {
    if (plain) parts.push({ text: plain, kind: "plain" });
    plain = "";
  };

  for (let i = 0; i < text.length; ) {
    if (text.startsWith(SITE_NAME, i)) {
      flush();
      parts.push({ text: SITE_NAME, kind: "site" });
      i += SITE_NAME.length;
      continue;
    }

    if (text[i] === "@" && (i === 0 || !WORD.test(text[i - 1]))) {
      const found = MENTION.exec(text.slice(i));
      if (found) {
        flush();
        parts.push({ text: found[0], kind: "mention" });
        i += found[0].length;
        continue;
      }
    }

    plain += text[i];
    i += 1;
  }

  flush();
  return parts;
}
