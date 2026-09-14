"use client";

import Link from "next/link";

/**
 * Fallback for any page that throws, typically when the API times out. The
 * server log keeps the real cause; the message shown here stays generic.
 */
export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[599px] flex-col items-center gap-[12px] px-4 py-20 text-center">
      <p className="text-[17px] font-semibold text-white">Ça n’a pas chargé</p>
      <p className="text-muted max-w-[380px] text-[14px]">
        Le serveur n’a pas répondu à temps. Réessaie dans un instant.
      </p>
      <div className="mt-[6px] flex flex-wrap justify-center gap-[10px]">
        <button
          type="button"
          onClick={() => retry()}
          className="flex h-[44px] items-center rounded-[22px] bg-white px-[20px] text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="flex h-[44px] items-center rounded-[22px] border-[0.5px] border-[#c5c5c5] px-[20px] text-[14px] font-medium text-white transition-colors hover:bg-white/5"
        >
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
