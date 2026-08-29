import Image from "next/image";

import { cn } from "@/lib/utils";

import type { Author } from "@/types";

/**
 * Figma 85:870 — 55px bar, avatar at x=11 (x=14 when nested inside a repost).
 */
export function AuthorRow({
  author,
  time,
  offset = 11,
}: {
  author: Author;
  time?: string;
  offset?: number;
}) {
  return (
    <div className="absolute inset-x-0 top-0 h-[55px]">
      <Image
        src={author.avatar}
        alt=""
        width={35}
        height={35}
        className="absolute top-[10px] h-[35px] w-[35px] rounded-full object-cover"
        style={{ left: offset }}
      />
      <p
        className={cn(
          "absolute text-[14px] font-medium leading-none text-white",
          time ? "top-[11px]" : "top-[17px]",
        )}
        style={{ left: offset + 47 }}
      >
        {author.handle}
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
