"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

/** First retry, then a widening delay so a struggling API is not hammered. */
const FIRST_DELAY = 8_000;
const MAX_DELAY = 60_000;

/**
 * Shown to a signed-in reader when the API answers 5xx or 429, or not at all.
 * It re-asks the server on its own, so the feed comes back without a reload.
 */
export function FeedOutage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [checks, setChecks] = useState(0);

  useEffect(() => {
    let delay = FIRST_DELAY;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      // A hidden tab must not keep calling an API that is already in trouble.
      if (!document.hidden) {
        setChecks((count) => count + 1);
        router.refresh();
      }
      delay = Math.min(Math.round(delay * 1.5), MAX_DELAY);
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, delay);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="mx-auto flex w-full max-w-[599px] flex-col items-center px-4 py-16 text-center sm:py-24">
      <span
        aria-hidden
        className="flex size-[72px] items-center justify-center rounded-full bg-white/10 text-[30px]"
      >
        🛠️
      </span>

      <h1 className="mt-[18px] text-[20px] font-semibold text-white">Panne technique</h1>

      <p className="text-muted mt-[10px] max-w-[420px] text-[15px]">
        Le fil ne répond pas en ce moment. Le problème vient de nos serveurs, pas de toi.
        Tes regrets sont bien là, ils reviennent dès que c’est réparé.
      </p>

      <button
        type="button"
        onClick={() => startTransition(() => router.refresh())}
        disabled={pending}
        className="mt-[22px] flex h-[46px] items-center rounded-[23px] bg-white px-[22px] text-[15px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {pending ? "Vérification…" : "Réessayer maintenant"}
      </button>

      <p className="text-label mt-[14px] text-[12px]" aria-live="polite">
        {checks === 0
          ? "Cette page se remet toute seule dès que le fil revient."
          : `Vérification automatique (${checks})…`}
      </p>
    </div>
  );
}
