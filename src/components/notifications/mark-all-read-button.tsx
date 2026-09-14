"use client";

import { useState, useTransition } from "react";

import { markAllNotificationsReadAction } from "@/app/actions";

/** The action revalidates the route, so the list refreshes by itself. */
export function MarkAllReadButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="ml-auto flex shrink-0 flex-col items-end">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await markAllNotificationsReadAction();
            setError(result.error ?? null);
          })
        }
        className="text-[13px] font-medium text-white underline-offset-2 transition-opacity hover:underline disabled:opacity-50"
      >
        {pending ? "…" : "Tout marquer comme lu"}
      </button>
      {error ? <span className="text-danger text-[11px]">{error}</span> : null}
    </div>
  );
}
