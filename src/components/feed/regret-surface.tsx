import { AuthorRow } from "@/components/feed/author-row";
import { cn, regretFontSize } from "@/lib/utils";
import type { Regret } from "@/types";

/** Underline "jeregrette.com" the way the design does. */
function renderText(text: string) {
  return text.split(/(jeregrette\.com)/).map((part, index) =>
    part === "jeregrette.com" ? (
      <span key={index} className="underline">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/**
 * The coloured area of a regret: dark top-down overlay on a solid colour,
 * author row pinned top-left, message centred.
 */
export function RegretSurface({
  regret,
  className,
  textClassName,
  authorOffset = 11,
  compact = false,
}: {
  regret: Regret;
  className?: string;
  textClassName?: string;
  authorOffset?: number;
  /** Quoted inside a repost, where there is far less room. */
  compact?: boolean;
}) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 50%), linear-gradient(90deg, ${regret.background} 0%, ${regret.background} 100%)`,
      }}
    >
      <AuthorRow author={regret.author} time={regret.time} offset={authorOffset} />

      {/*
        Padded by the height of the author row on both sides: the message stays
        centred where the design puts it, but can no longer grow underneath the
        handle or the action bar.
      */}
      <div
        className={cn(
          "flex h-full items-center justify-center px-4 pt-[55px]",
          // no action bar under a quoted post, so it keeps that room for text
          compact ? "pb-[16px]" : "pb-[55px]",
        )}
      >
        <p
          className={cn(
            "max-h-full w-[331px] max-w-full overflow-hidden whitespace-pre-line text-center font-semibold leading-[1.35] text-white",
            textClassName,
          )}
          style={{ fontSize: regretFontSize(regret.text, compact) }}
        >
          {renderText(regret.text)}
        </p>
      </div>
    </div>
  );
}
