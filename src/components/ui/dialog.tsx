"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Overlay for dialogs. By default closing goes back in history, which is what
 * an intercepted route wants: the URL it pushed is popped instead of a new
 * entry being stacked. A dialog opened from local state passes `onClose`.
 */
export function Dialog({
  label,
  children,
  onClose,
}: {
  label: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef<() => void>(() => router.back());

  useEffect(() => {
    close.current = onClose ?? (() => router.back());
  }, [onClose, router]);

  // Escape closes, focus moves inside, and the page behind stops scrolling.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close.current();
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    panel.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={(event) => {
        // only a click on the backdrop itself, not one that bubbled from the card
        if (event.target === event.currentTarget) close.current();
      }}
      className="font-poppins fixed inset-0 z-[90] flex overflow-y-auto bg-black/70 p-4 backdrop-blur-[2px]"
    >
      <div ref={panel} tabIndex={-1} className="m-auto w-full max-w-[520px] outline-none">
        {children}
      </div>
    </div>
  );
}
