import Image from "next/image";
import Link from "next/link";

import { ReactionBar } from "@/components/feed/reaction-bar";
import type { ReactionId } from "@/types";

/**
 * Figma 85:875 — 55px bar: reactions on the left, repost on the right. Sharing
 * moved into the card's top-right menu (Figma 127:736). Laid out as a flex row
 * so it survives a 360px screen.
 */
export function CardActions({
  itemId,
  counts,
  reacted,
  reposts,
  repostHref,
  canRepost,
  hideCounts = false,
}: {
  itemId: string;
  counts: Record<ReactionId, number>;
  reacted?: ReactionId;
  reposts: number;
  repostHref: string;
  /** The author's `allow_repost`; the backend refuses reposts when it is off. */
  canRepost: boolean;
  hideCounts?: boolean;
}) {
  const pillClassName =
    "bg-surface ml-auto flex h-[34px] w-[54px] shrink-0 items-center justify-center gap-[5px] rounded-[20px] sm:w-[66px] sm:justify-start sm:gap-[7px] sm:pl-[11px]";
  const pillContent = (
    <>
      <Image
        src="/icons/repost.svg"
        alt=""
        width={20}
        height={22}
        unoptimized
        className="h-[21.5px] w-[19.5px]"
      />
      <span className="text-[12px] leading-none text-[#afafaf] sm:text-[14px]">{reposts}</span>
    </>
  );

  return (
    <div className="absolute inset-x-0 bottom-0 flex h-[55px] items-center gap-[8px] px-[12px] sm:px-[9px] sm:pl-[12px]">
      <ReactionBar itemId={itemId} counts={counts} reacted={reacted} hideCounts={hideCounts} />

      {/* ml-auto pins the repost pill to the right edge once the reactions stop growing */}
      {canRepost ? (
        <Link href={repostHref} aria-label="Republier" className={pillClassName}>
          {pillContent}
        </Link>
      ) : (
        <span
          aria-disabled
          title="L’auteur a désactivé la republication"
          className={`${pillClassName} cursor-not-allowed opacity-40`}
        >
          {pillContent}
        </span>
      )}
    </div>
  );
}
