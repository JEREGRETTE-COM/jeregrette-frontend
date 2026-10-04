"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

/**
 * Returns where the reader came from — a notification, the feed — and falls
 * back to the feed when the page was opened straight from a link.
 */
export function BackButton({ label = "Retour" }: { label?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/");
      }}
      className="size-[35px] shrink-0 transition-opacity hover:opacity-80"
    >
      <Image src="/icons/back.svg" alt="" width={35} height={35} unoptimized />
    </button>
  );
}
