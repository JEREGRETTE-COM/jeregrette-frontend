"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

type AuthFieldProps = React.ComponentProps<"input"> & {
  id: string;
  label: string;
  className?: string;
};

/**
 * Pill input with an overlaid label — a plain placeholder cannot carry the
 * red asterisk from the design, so the label is hidden on focus/typing.
 *
 * A password field also gets a reveal button. Figma has no eye glyph, so the
 * two icons are drawn in the same stroke style as the ones it does provide.
 */
export function AuthField({
  id,
  label,
  className,
  type,
  required = true,
  ...props
}: AuthFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={cn("relative h-[50px] shrink-0", className)}>
      <input
        id={id}
        required={required}
        placeholder=" "
        type={isPassword && revealed ? "text" : type}
        className={cn(
          "bg-field peer h-full w-full rounded-[25px] px-5 text-[15px] font-light text-white outline-none placeholder:text-transparent",
          isPassword && "pr-[52px]",
        )}
        {...props}
      />
      <label
        htmlFor={id}
        className="text-muted pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[14px] font-light peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden"
      >
        {label}
        {required ? <span className="text-required">*</span> : null}
      </label>

      {isPassword ? (
        <button
          type="button"
          aria-label={revealed ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={revealed}
          onClick={() => setRevealed((current) => !current)}
          className="absolute right-[14px] top-1/2 flex size-[28px] -translate-y-1/2 items-center justify-center opacity-70 transition-opacity hover:opacity-100"
        >
          <Image
            src={revealed ? "/icons/eye-off.svg" : "/icons/eye.svg"}
            alt=""
            width={20}
            height={20}
            unoptimized
            className="h-[20px] w-[20px]"
          />
        </button>
      ) : null}
    </div>
  );
}
