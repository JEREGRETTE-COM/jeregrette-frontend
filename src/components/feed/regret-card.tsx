import { CardActions } from "@/components/feed/card-actions";
import { PostMenu } from "@/components/feed/post-menu";
import { RegretSurface } from "@/components/feed/regret-surface";
import type { Regret } from "@/types";

/** Figma 85:1011 — 599x400 card. */
export function RegretCard({
  regret,
  currentUserId,
  hideCounts = false,
}: {
  regret: Regret;
  currentUserId?: string;
  hideCounts?: boolean;
}) {
  return (
    <article className="relative h-[400px] w-full overflow-hidden rounded-[25px]">
      <RegretSurface regret={regret} className="absolute inset-0" />

      <PostMenu
        postId={regret.id}
        isOwner={currentUserId === regret.authorId}
        allowRepost={regret.allowRepost}
        allowOpinionOnRepost={regret.allowOpinionOnRepost}
        share={{ regretId: regret.id, text: regret.text, handle: regret.author.handle }}
      />
      <CardActions
        itemId={regret.id}
        counts={regret.counts}
        reacted={regret.reacted}
        reposts={regret.reposts}
        repostHref={`/republier/${regret.id}`}
        canRepost={regret.allowRepost}
        hideCounts={hideCounts}
      />
    </article>
  );
}
