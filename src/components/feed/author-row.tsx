import Image from "next/image";
import Link from "next/link";

import { cn, initial } from "@/lib/utils";

import type { Author } from "@/types";

/**
 * Figma 85:870 — 55px bar, avatar at x=11 (x=14 when nested inside a repost).
 */
export function AuthorRow({
  author,
  time,
  note,
  offset = 11,
}: {
  author: Author;
  time?: string;
  /** Shown after the handle, e.g. "a republié". */
  note?: string;
  offset?: number;
}) {
  return (
    <div className="absolute inset-x-0 top-0 h-[55px]">
      {/* the avatar repeats the handle link, so it stays out of the tab order */}
      <Link
        href={`/u/${author.id}`}
        aria-hidden
        tabIndex={-1}
        className="absolute top-[10px] z-10 h-[35px] w-[35px]"
        style={{ left: offset }}
      >
        {author.avatar ? (
          <Image
            src={author.avatar}
            alt=""
            width={35}
            height={35}
            unoptimized
            className="h-[35px] w-[35px] rounded-full object-cover"
          />
        ) : (
          <span className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-white/20 text-[15px] font-semibold text-white">
            {initial(author.handle)}
          </span>
        )}
      </Link>
      <p
        className={cn(
          "absolute z-10 truncate text-[14px] font-medium leading-none text-white",
          time ? "top-[11px]" : "top-[17px]",
        )}
        style={{ left: offset + 47, maxWidth: `calc(100% - ${offset + 59}px)` }}
      >
        <Link href={`/u/${author.id}`} className="hover:underline">
          {author.handle}
        </Link>
        {author.certified ? (
          <Image
            src="/icons/verified.svg"
            alt="Compte certifié"
            width={18}
            height={18}
            unoptimized
            className="ml-[4px] inline-block h-[14px] w-[14px] align-[-2px]"
          />
        ) : null}
        {note ? <span className="font-normal text-[#afafaf]"> {note}</span> : null}
      </p>
      {time ? (
        <p
          className="absolute top-[29px] text-[10px] leading-none text-[#afafaf]"
          style={{ left: offset + 47 }}
        >
          {time}
        </p>
      ) : null}
    </div>
  );
}
