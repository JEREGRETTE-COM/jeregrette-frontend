import { CardActions } from "@/components/feed/card-actions";
import { RegretSurface } from "@/components/feed/regret-surface";
import type { Regret } from "@/types";

/** Figma 85:1011 — 599x400 card. */
export function RegretCard({ regret }: { regret: Regret }) {
  return (
    <article className="relative h-[400px] w-full overflow-hidden rounded-[25px]">
      <RegretSurface regret={regret} className="absolute inset-0" />
      <CardActions
        itemId={regret.id}
        counts={regret.counts}
        reacted={regret.reacted}
        reposts={regret.reposts}
        repostHref={`/republier/${regret.id}`}
        regret={{ id: regret.id, text: regret.text, handle: regret.author.handle }}
      />
    </article>
  );
}
