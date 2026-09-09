"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/** Appears once the feed is long enough to be tedious to scroll back. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Revenir en haut"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      // the asset already draws its own circle, so the wrapper is only a tap target
      className="fixed bottom-[20px] left-4 z-20 flex size-[50px] items-center justify-center transition-opacity hover:opacity-80 sm:bottom-[64px] sm:left-6"
    >
      {/* the back arrow, turned to point up — no dedicated asset in the design */}
      <Image
        src="/icons/back.svg"
        alt=""
        width={35}
        height={35}
        unoptimized
        className="h-[35px] w-[35px] rotate-90"
      />
    </button>
  );
}
