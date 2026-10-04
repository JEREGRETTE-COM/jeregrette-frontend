import { expect, test } from "@playwright/test";

import { parseNotificationData, summarizeNotification } from "@/lib/notification-summary";

test("payload actuel : message et repost_id", () => {
  expect(
    summarizeNotification("App\\Notifications\\PostReposted", {
      kind: "post_reposted",
      message: "@bob a republié ton regret",
      actor_username: "bob",
      post_id: "p1",
      repost_id: "r1",
    }),
  ).toEqual({ text: "@bob a republié ton regret", actor: "@bob", href: "/regret/r1" });
});

test("kind prime sur la classe PHP", () => {
  const { text } = summarizeNotification("App\\Notifications\\Something", {
    kind: "post_reacted_to",
    actor_username: "bob",
    post_id: "p1",
  });
  expect(text).toBe("@bob a réagi à ton regret");
});

test("invité : actor_username null", () => {
  const { text, actor } = summarizeNotification(null, {
    kind: "post_reacted_to",
    actor_username: null,
    post_id: "p1",
  });
  expect(actor).toBeNull();
  expect(text).toBe("Quelqu’un a réagi à ton regret");
});

test("anciennes notifications : reactor_username / reposter_username", () => {
  expect(
    summarizeNotification("App\\Notifications\\PostReactedTo", {
      reactor_username: "carol",
      post_id: "p1",
    }).text,
  ).toBe("@carol a réagi à ton regret");
  expect(
    summarizeNotification("App\\Notifications\\PostReposted", {
      reposter_username: "dan",
      post_id: "p1",
    }).actor,
  ).toBe("@dan");
});

test("mention : phrase et lien vers le post", () => {
  expect(
    summarizeNotification("App\\Notifications\\PostMentioned", {
      kind: "post_mentioned",
      actor_username: "bob",
      post_id: "p1",
    }),
  ).toEqual({ text: "@bob t’a mentionné", actor: "@bob", href: "/regret/p1" });
});

test("data reçu en objet comme en chaîne JSON", () => {
  const payload = { kind: "post_mentioned", actor_username: "bob", post_id: "p1" };
  expect(parseNotificationData(payload)).toEqual(payload);
  expect(parseNotificationData(JSON.stringify(payload))).toEqual(payload);
});
