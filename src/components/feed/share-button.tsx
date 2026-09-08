"use client";

import Image from "next/image";
import { useRef, useState } from "react";

/**
 * Shares the regret as a PNG through the native share sheet (WhatsApp included).
 * Browsers require navigator.share to run inside a user gesture, so the image is
 * prefetched on pointer-down and the click path uses the cached blob.
 * Falls back to a wa.me link when file sharing is unavailable.
 */
export function ShareButton({
  regretId,
  text,
  handle,
}: {
  regretId: string;
  text: string;
  handle: string;
}) {
  const [busy, setBusy] = useState(false);
  const cached = useRef<Promise<Blob> | null>(null);

  /** Probe with a dummy file: only some browsers can share files at all. */
  function supportsFileShare() {
    if (typeof navigator.canShare !== "function") return false;
    const probe = new File([new Blob([""], { type: "image/png" })], "probe.png", {
      type: "image/png",
    });
    return navigator.canShare({ files: [probe] });
  }

  function prefetch() {
    if (!supportsFileShare()) return;
    cached.current ??= fetch(`/regret/${regretId}/image`).then((response) => {
      if (!response.ok) throw new Error("image unavailable");
      return response.blob();
    });
  }

  function pageUrl() {
    return `${window.location.origin}/regret/${regretId}`;
  }

  function caption() {
    return `${text}\n\n— ${handle} sur jeregrette.com\n${pageUrl()}`;
  }

  function openWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(caption())}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function share() {
    // No file sharing here: straight to WhatsApp with the link, no image fetched.
    if (!supportsFileShare()) {
      openWhatsApp();
      return;
    }

    setBusy(true);
    try {
      prefetch();
      const blob = await cached.current!;
      const file = new File([blob], `jeregrette-${regretId}.png`, { type: "image/png" });
      await navigator.share({ files: [file], text: caption() });
    } catch (error) {
      // Dismissing the share sheet is not a failure worth falling back on.
      if (error instanceof DOMException && error.name === "AbortError") return;
      cached.current = null;
      openWhatsApp();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      aria-label="Partager ce regret"
      disabled={busy}
      onPointerDown={prefetch}
      onFocus={prefetch}
      onClick={share}
      className="bg-surface flex h-[34px] w-[38px] shrink-0 items-center justify-center rounded-[20px] disabled:opacity-60 sm:w-[44px]"
    >
      <Image
        src="/icons/share.svg"
        alt=""
        width={20}
        height={20}
        unoptimized
        className="h-[20px] w-[20px]"
      />
    </button>
  );
}
