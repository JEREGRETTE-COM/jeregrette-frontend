"use client";

import { loadReactionCountsAction } from "@/app/actions";
import type { ReactionId } from "@/types";

type Breakdown = Partial<Record<ReactionId, number>>;

/** Cards ask one by one; this queue turns that into rare, small calls. */
const BATCH = 6;
const GAP = 700;
/** After a refusal (429) or an outage, leave the API alone for a minute. */
const PAUSE_AFTER_REFUSAL = 60_000;

const known = new Map<string, Breakdown>();
const waiting = new Map<string, ((breakdown: Breakdown | null) => void)[]>();
let timer: ReturnType<typeof setTimeout> | null = null;
let pausedUntil = 0;

/** Counts for one card, once the queue gets to it. null when the API refused. */
export function requestCounts(id: string): Promise<Breakdown | null> {
  const cached = known.get(id);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve) => {
    waiting.set(id, [...(waiting.get(id) ?? []), resolve]);
    schedule();
  });
}

function schedule() {
  if (timer || waiting.size === 0) return;
  timer = setTimeout(run, Math.max(GAP, pausedUntil - Date.now()));
}

async function run() {
  timer = null;
  const ids = [...waiting.keys()].slice(0, BATCH);
  if (ids.length === 0) return;

  let result: Record<string, Breakdown> = {};
  try {
    result = (await loadReactionCountsAction(ids)) as Record<string, Breakdown>;
  } catch {
    pausedUntil = Date.now() + PAUSE_AFTER_REFUSAL;
  }

  for (const id of ids) {
    const breakdown = result[id] ?? null;
    if (breakdown) known.set(id, breakdown);
    for (const resolve of waiting.get(id) ?? []) resolve(breakdown);
    waiting.delete(id);
  }

  schedule();
}
