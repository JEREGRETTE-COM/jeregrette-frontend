import { AuthorRow } from "@/components/feed/author-row";
import { cn } from "@/lib/utils";
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
}: {
  regret: Regret;
  className?: string;
  textClassName?: string;
  authorOffset?: number;
}) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 50%), linear-gradient(90deg, ${regret.background} 0%, ${regret.background} 100%)`,
      }}
    >
      <AuthorRow author={regret.author} time={regret.time} offset={authorOffset} />
      <p
        className={cn(
          "absolute left-1/2 top-1/2 w-[331px] max-w-[90%] -translate-x-1/2 -translate-y-1/2 whitespace-pre-line text-center text-[20px] font-semibold text-white",
          textClassName,
        )}
      >
        {renderText(regret.text)}
      </p>
    </div>
  );
}
