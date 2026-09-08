import Image from "next/image";
import Link from "next/link";

import { ReactionBar } from "@/components/feed/reaction-bar";
import { ShareButton } from "@/components/feed/share-button";
import type { ReactionId } from "@/types";

/**
 * Figma 85:875 — 55px bar: reactions on the left, share and repost on the
 * right. Laid out as a flex row so it survives a 360px screen.
 */
export function CardActions({
  itemId,
  counts,
  reacted,
  reposts,
  repostHref,
  regret,
}: {
  itemId: string;
  counts: Record<ReactionId, number>;
  reacted?: ReactionId;
  reposts: number;
  repostHref: string;
  regret: { id: string; text: string; handle: string };
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex h-[55px] items-center gap-[8px] px-[12px] sm:px-[9px] sm:pl-[12px]">
      <ReactionBar itemId={itemId} counts={counts} reacted={reacted} />

      {/* ml-auto pins this group to the right edge once the pill stops growing */}
      <div className="ml-auto flex shrink-0 items-center gap-[8px] sm:gap-[10px]">
        <ShareButton regretId={regret.id} text={regret.text} handle={regret.handle} />

        <Link
          href={repostHref}
          aria-label="Republier"
          className="bg-surface flex h-[34px] w-[54px] shrink-0 items-center justify-center gap-[5px] rounded-[20px] sm:w-[66px] sm:justify-start sm:gap-[7px] sm:pl-[11px]"
        >
          <Image
            src="/icons/repost.svg"
            alt=""
            width={20}
            height={22}
            unoptimized
            className="h-[21.5px] w-[19.5px]"
          />
          <span className="text-[12px] leading-none text-[#afafaf] sm:text-[14px]">
            {reposts}
          </span>
        </Link>
      </div>
    </div>
  );
}
