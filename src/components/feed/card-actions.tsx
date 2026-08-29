import Image from "next/image";
import Link from "next/link";

import { ReactionBar } from "@/components/feed/reaction-bar";
import type { ReactionId } from "@/types";

/**
 * Figma 85:875 — 55px bar: the reaction pill on the left, a 66x34 repost pill
 * on the right.
 */
export function CardActions({
  itemId,
  counts,
  reacted,
  reposts,
  repostHref,
}: {
  itemId: string;
  counts: Record<ReactionId, number>;
  reacted?: ReactionId;
  reposts: number;
  repostHref: string;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[55px]">
      <ReactionBar itemId={itemId} counts={counts} reacted={reacted} />

      <Link
        href={repostHref}
        aria-label="Republier"
        className="bg-surface absolute right-[9px] top-[11px] flex h-[34px] w-[66px] items-center rounded-[20px]"
      >
        <Image
          src="/icons/repost.svg"
          alt=""
          width={20}
          height={22}
          unoptimized
          className="ml-[11px] h-[21.5px] w-[19.5px]"
        />
        <span className="ml-[7px] text-[14px] leading-none text-[#afafaf]">{reposts}</span>
      </Link>
    </div>
  );
}
