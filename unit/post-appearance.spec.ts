import { expect, test } from "@playwright/test";

import { toFeedItem, toRegret } from "@/lib/feed-mapping";
import { backgroundFor, palette } from "@/lib/palette";
import { patternFor } from "@/lib/patterns";
import { regretBodyFrom } from "@/lib/posts";
import type { ApiPost } from "@/types/api";

function post(overrides: Partial<ApiPost> = {}): ApiPost {
  return {
    id: "abc",
    type: "ORIGINAL",
    content: "Un regret",
    media_url: null,
    author: { id: "u1", username: "alice" } as ApiPost["author"],
    author_id: "u1",
    allow_repost: true,
    allow_opinion_on_repost: true,
    reactions_count: 0,
    reposts_count: 0,
    score: 0,
    my_reaction: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

test.describe("listes partagées avec le backend", () => {
  test("30 couleurs dans l'ordre du backend", () => {
    expect(palette).toEqual([
      "#907f3e", "#f18183", "#379dea", "#967800", "#108687", "#7c00ff",
      "#985e3b", "#42d05e", "#e63e8b", "#954210", "#01d5c4", "#822952",
      "#e2ad32", "#eb4b5a", "#048c80", "#ffb200", "#450fb3", "#788263",
      "#c683d0", "#23c9f3", "#1c35a5", "#5a0067", "#106386", "#de7315",
      "#774b79", "#5491be", "#0a263d", "#6a0012", "#471717", "#2c3d0a",
    ]);
  });

  test("repli par l'id identique à la formule du backfill", () => {
    // "abc" → 97 + 98 + 99 = 294 → 294 % 30 = 24, 294 % 3 = 0
    expect(backgroundFor("abc")).toBe("#774b79");
    expect(patternFor("abc")).toBe("text");
  });
});

test.describe("toRegret", () => {
  test("utilise les valeurs envoyées par l'API", () => {
    const regret = toRegret(post({ background_color: "#F18183", watermark: "logo" }));
    expect(regret.background).toBe("#f18183");
    expect(regret.watermark).toBe("logo");
  });

  test("retombe sur l'id quand les champs sont absents", () => {
    const regret = toRegret(post());
    expect(regret.background).toBe(backgroundFor("abc"));
    expect(regret.watermark).toBe(patternFor("abc"));
  });

  test("retombe sur l'id pour une valeur inconnue", () => {
    const regret = toRegret(
      post({ background_color: "#123456", watermark: "stars" as ApiPost["watermark"] }),
    );
    expect(regret.background).toBe(backgroundFor("abc"));
    expect(regret.watermark).toBe(patternFor("abc"));
  });
});

test("repost : la carte citée garde les valeurs de original_post", () => {
  const original = post({ id: "orig", background_color: "#42d05e", watermark: "brand" });
  const item = toFeedItem(
    post({
      id: "rep",
      content: "mon avis",
      background_color: "#0a263d",
      watermark: "logo",
      original_post: original,
    }),
  );
  expect(item.kind).toBe("repost");
  if (item.kind !== "repost") return;
  expect(item.repost.regret.background).toBe("#42d05e");
  expect(item.repost.regret.watermark).toBe("brand");
});

test.describe("payload de publication", () => {
  function form(fields: Record<string, string>) {
    const data = new FormData();
    for (const [key, value] of Object.entries(fields)) data.set(key, value);
    return data;
  }

  test("envoie la couleur choisie", () => {
    expect(
      regretBodyFrom(form({ regret: "  Un regret ", background: "#E63E8B", allow_repost: "0" })),
    ).toEqual({ content: "Un regret", allow_repost: false, background_color: "#e63e8b" });
  });

  test("omet une couleur hors palette", () => {
    expect(regretBodyFrom(form({ regret: "x", background: "red" }))).toEqual({
      content: "x",
      allow_repost: true,
    });
  });
});
