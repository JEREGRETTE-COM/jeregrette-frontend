import { feed as seed } from "@/lib/feed-data";
import { applyReaction } from "@/lib/reactions";
import type { FeedItem, ReactionId, Regret } from "@/types";

/**
 * In-memory feed, seeded with the Figma content. There is no database yet:
 * everything lives in this module, so the data resets whenever the server
 * restarts (and on every hot reload in dev). Swap this file for real queries
 * when a backend exists — the exported functions are the whole surface.
 */
const items: FeedItem[] = structuredClone(seed);

let sequence = 0;

function nextId(prefix: string) {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

export function getFeed(): FeedItem[] {
  return items;
}

export function getRegret(id: string): Regret | undefined {
  for (const item of items) {
    const regret = item.kind === "regret" ? item.regret : item.repost.regret;
    if (regret.id === id) return regret;
  }
  return undefined;
}

export function listRegretIds(): string[] {
  return Array.from(
    new Set(
      items.map((item) =>
        item.kind === "regret" ? item.regret.id : item.repost.regret.id,
      ),
    ),
  );
}

export function addRegret(regret: Omit<Regret, "id" | "counts" | "reposts" | "time">) {
  const created: Regret = {
    ...regret,
    id: nextId("regret"),
    time: "à l’instant",
    counts: { skull: 0, laugh: 0, cry: 0 },
    reposts: 0,
  };
  items.unshift({ kind: "regret", regret: created });
  return created;
}

export function addRepost({
  regretId,
  comment,
  author,
}: {
  regretId: string;
  comment: string;
  author: { handle: string; avatar: string };
}) {
  const regret = getRegret(regretId);
  if (!regret) return undefined;

  regret.reposts += 1;
  items.unshift({
    kind: "repost",
    repost: {
      id: nextId("repost"),
      author,
      time: "à l’instant",
      comment,
      counts: { skull: 0, laugh: 0, cry: 0 },
      reposts: 0,
      regret,
    },
  });
  return regret;
}

export function toggleReaction(itemId: string, reaction: ReactionId) {
  const target = items.find((item) =>
    item.kind === "regret" ? item.regret.id === itemId : item.repost.id === itemId,
  );
  if (!target) return;

  const entry = target.kind === "regret" ? target.regret : target.repost;
  const next = applyReaction(entry, reaction);
  entry.counts = next.counts;
  entry.reacted = next.reacted;
}
