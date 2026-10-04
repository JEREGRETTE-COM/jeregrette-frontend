import { expect, test } from "@playwright/test";

import { toFeedItem } from "@/lib/feed-mapping";
import { activeMention, insertMention, splitMentions } from "@/lib/mentions";
import type { ApiPost } from "@/types/api";

const bob = { id: "01BOB", username: "bob_92" };

test.describe("splitMentions", () => {
  test("un pseudo résolu devient une mention, insensible à la casse", () => {
    expect(splitMentions("merci @Bob_92 !", [bob])).toEqual([
      { kind: "text", text: "merci " },
      { kind: "mention", text: "@Bob_92", id: "01BOB" },
      { kind: "text", text: " !" },
    ]);
  });

  test("un pseudo absent de mentions reste du texte", () => {
    expect(splitMentions("salut @inconnu", [bob])).toEqual([
      { kind: "text", text: "salut @inconnu" },
    ]);
  });

  test("une adresse email n'est pas une mention", () => {
    expect(splitMentions("écris à moi@bob_92.com", [bob])).toEqual([
      { kind: "text", text: "écris à moi@bob_92.com" },
    ]);
  });

  test("jeregrette.com reste dans un segment texte", () => {
    const segments = splitMentions("@bob_92 va sur jeregrette.com", [bob]);
    expect(segments[0]).toEqual({ kind: "mention", text: "@bob_92", id: "01BOB" });
    expect(segments[1]).toEqual({ kind: "text", text: " va sur jeregrette.com" });
  });
});

test.describe("autocomplétion", () => {
  test("détecte le @mot sous le curseur", () => {
    expect(activeMention("coucou @bo", 10)).toEqual({ start: 7, query: "bo" });
    expect(activeMention("coucou @", 8)).toEqual({ start: 7, query: "" });
    expect(activeMention("moi@bo", 6)).toBeNull();
    expect(activeMention("@bob fini ", 10)).toBeNull();
  });

  test("remplace le @mot par le pseudo choisi", () => {
    expect(insertMention("salut @bo et toi", 6, 9, "bob_92")).toEqual({
      value: "salut @bob_92  et toi",
      caret: 14,
    });
  });
});

test("le repost porte les mentions de son commentaire, l'original les siennes", () => {
  const base = {
    type: "ORIGINAL",
    media_url: null,
    author: { id: "u1", username: "alice" },
    author_id: "u1",
    allow_repost: true,
    allow_opinion_on_repost: true,
    reactions_count: 0,
    reposts_count: 0,
    score: 0,
    my_reaction: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as unknown as ApiPost;
  const original = { ...base, id: "orig", content: "@carol", mentions: [{ id: "c", username: "carol" }] };
  const item = toFeedItem({
    ...base,
    id: "rep",
    content: "@bob_92",
    mentions: [bob],
    original_post: original,
  });
  if (item.kind !== "repost") throw new Error("expected a repost");
  expect(item.repost.mentions).toEqual([bob]);
  expect(item.repost.regret.mentions).toEqual([{ id: "c", username: "carol" }]);
});
