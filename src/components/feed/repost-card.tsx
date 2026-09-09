import { AuthorRow } from "@/components/feed/author-row";
import { CardActions } from "@/components/feed/card-actions";
import { RegretSurface } from "@/components/feed/regret-surface";
import type { Repost } from "@/types";

/** Figma 85:900 — the reposter's comment above the quoted regret. */
export function RepostCard({ repost }: { repost: Repost }) {
  // The card background is the page background, so without an outline the
  // comment reads as floating between two unrelated posts.
  return (
    <article className="bg-surface border-field-alt relative h-[400px] w-full overflow-hidden rounded-[25px] border">
      <AuthorRow author={repost.author} time={repost.time} note="a republié" />

      {/*
        A flex column, not two absolute boxes: the comment is user text and runs
        to two lines often enough that a fixed offset put the quoted post on top
        of it. The quoted card takes whatever height is left.
      */}
      <div className="absolute inset-x-0 bottom-[55px] top-[55px] flex flex-col px-[17px] pb-[3px] pt-[11px]">
        {repost.comment ? (
          <p className="mb-[9px] line-clamp-2 shrink-0 text-[14px] leading-[1.35] text-white sm:text-[15px]">
            {repost.comment}
          </p>
        ) : null}
        <RegretSurface
          regret={repost.regret}
          authorOffset={14}
          compact
          textClassName="w-[226px] max-w-full"
          className="border-surface-border min-h-0 w-full flex-1 rounded-[15px] border-2"
        />
      </div>

      <CardActions
        itemId={repost.id}
        counts={repost.counts}
        reacted={repost.reacted}
        reposts={repost.reposts}
        repostHref={`/republier/${repost.regret.id}`}
        regret={{
          id: repost.regret.id,
          text: repost.regret.text,
          handle: repost.regret.author.handle,
        }}
      />
    </article>
  );
}
