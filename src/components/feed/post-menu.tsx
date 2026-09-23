"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";

import { deletePostAction, updatePostSettingsAction } from "@/app/actions";
import { useFeedActions } from "@/components/feed/feed-context";
import { useShareRegret, type ShareTarget } from "@/components/feed/use-share-regret";

/**
 * The API setting governs the comment a reposter may attach, not comments on a
 * post. Hidden until that distinction is worth exposing — flip to re-enable.
 */
const SHOW_OPINION_TOGGLE = false;

/**
 * Figma 127:736 — the round three-dots button at the top right of every card.
 * Everyone can share the regret as an image from it; only its author sees
 * reposting and deletion.
 */
export function PostMenu({
  postId,
  isOwner,
  allowRepost,
  allowOpinionOnRepost,
  share,
}: {
  postId: string;
  isOwner: boolean;
  allowRepost: boolean;
  allowOpinionOnRepost: boolean;
  /** The regret the image shows — the quoted one when this card is a repost. */
  share: ShareTarget;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const root = useRef<HTMLDivElement>(null);
  const shareImage = useShareRegret(share);
  // Inside the infinite feed the list is patched here instead of revalidated.
  const feed = useFeedActions();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggle(settings: { allow_repost?: boolean; allow_opinion_on_repost?: boolean }) {
    startTransition(async () => {
      const result = await updatePostSettingsAction(postId, settings, { revalidate: !feed });
      setError(result.error ?? null);
      if (!result.error && feed) {
        feed.patchPost(postId, {
          ...(settings.allow_repost !== undefined && { allowRepost: settings.allow_repost }),
          ...(settings.allow_opinion_on_repost !== undefined && {
            allowOpinionOnRepost: settings.allow_opinion_on_repost,
          }),
        });
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deletePostAction(postId, { revalidate: !feed });
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      feed?.removePost(postId);
    });
  }

  return (
    <div ref={root} className="absolute right-[9px] top-[12px] z-20">
      <button
        type="button"
        aria-label="Options de la publication"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex size-[34px] items-center justify-center rounded-full bg-white/20 transition-opacity hover:opacity-80"
      >
        {/* Figma 214:1065 — the vertical dots, centred in the 34px circle */}
        <Image
          src="/icons/more.svg"
          alt=""
          width={4}
          height={20}
          unoptimized
          className="h-[20px] w-[4px]"
        />
      </button>

      {open ? (
        <div className="bg-menu absolute right-0 top-[40px] w-[248px] rounded-[12px] p-[6px] shadow-lg">
          <button
            type="button"
            disabled={shareImage.busy}
            onPointerDown={shareImage.prefetch}
            onClick={() => {
              setOpen(false);
              void shareImage.share();
            }}
            className="flex h-[38px] w-full items-center gap-[10px] rounded-[8px] px-[10px] text-left text-[13px] text-white hover:bg-white/5 disabled:opacity-40"
          >
            <Image
              src="/icons/share.svg"
              alt=""
              width={16}
              height={16}
              unoptimized
              className="h-[16px] w-[16px] shrink-0"
            />
            Partager en image
          </button>

          {isOwner ? (
            <>
              <div className="my-[6px] h-px bg-white/10" />

              <Row
                label="Autoriser les republications"
                checked={allowRepost}
                disabled={pending}
                onChange={(next) => toggle({ allow_repost: next })}
              />
              {SHOW_OPINION_TOGGLE ? (
                <Row
                  label="Autoriser les commentaires"
                  checked={allowOpinionOnRepost}
                  disabled={pending || !allowRepost}
                  onChange={(next) => toggle({ allow_opinion_on_repost: next })}
                />
              ) : null}

              <div className="my-[6px] h-px bg-white/10" />

              {confirming ? (
                <div className="px-[10px] py-[8px]">
                  <p className="text-[13px] leading-[1.4] text-white">
                    Supprimer définitivement ce regret ?
                  </p>
                  <div className="mt-[10px] flex gap-[8px]">
                    <button
                      type="button"
                      onClick={remove}
                      disabled={pending}
                      className="text-danger h-[32px] flex-1 rounded-[8px] bg-[rgba(255,0,0,0.21)] text-[13px] font-medium disabled:opacity-60"
                    >
                      {pending ? "…" : "Supprimer"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      className="h-[32px] flex-1 rounded-[8px] bg-white/10 text-[13px] font-medium text-white"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="text-danger flex h-[38px] w-full items-center rounded-[8px] px-[10px] text-[13px] font-medium hover:bg-white/5"
                >
                  Supprimer ce regret
                </button>
              )}
            </>
          ) : null}

          {error ? (
            <p className="text-danger px-[10px] pb-[6px] pt-[4px] text-[12px]">{error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Row({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex h-[38px] w-full items-center justify-between gap-[10px] rounded-[8px] px-[10px] text-left text-[13px] text-white hover:bg-white/5 disabled:opacity-40"
    >
      <span className="min-w-0 flex-1">{label}</span>
      <span
        aria-hidden
        className={`flex h-[18px] w-[32px] shrink-0 items-center rounded-full p-[2px] transition-colors ${
          checked ? "bg-white" : "bg-white/20"
        }`}
      >
        <span
          className={`size-[14px] rounded-full transition-transform ${
            checked ? "translate-x-[14px] bg-black" : "bg-white"
          }`}
        />
      </span>
    </button>
  );
}
