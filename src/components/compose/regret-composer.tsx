"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";

import { publishRegretAction, type FormState } from "@/app/actions";
import { MENTION_LIST_ID, MentionSuggestions } from "@/components/compose/mention-suggestions";
import { useMentionAutocomplete } from "@/components/compose/use-mention-autocomplete";
import { Button } from "@/components/ui/button";
import { palette } from "@/lib/palette";

/** Figma 106:1177 — full-bleed colour, centred message, send bar. */
export function RegretComposer({ inDialog = false }: { inDialog?: boolean }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    publishRegretAction,
    {},
  );
  const [colour, setColour] = useState(0);
  // Figma 20:372 — the round button in the top bar, struck through once off.
  const [allowRepost, setAllowRepost] = useState(true);

  const { textarea, suggestions, active, update, onKeyDown, select, close } =
    useMentionAutocomplete(() => autoGrow());

  // The message is vertically centred, so the field grows with its content.
  function autoGrow() {
    const el = textarea.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }

  return (
    <form
      action={formAction}
      className="border-surface-border relative flex min-h-[560px] w-full max-w-[520px] flex-col overflow-hidden rounded-[25px] border-y-[3px] sm:min-h-[705px]"
      style={{ backgroundColor: palette[colour] }}
    >
      <input type="hidden" name="background" value={palette[colour]} />
      <input type="hidden" name="allow_repost" value={allowRepost ? "1" : "0"} />

      {/* over the feed, closing pops the intercepted URL instead of stacking one */}
      {inDialog ? (
        <button
          type="button"
          aria-label="Fermer"
          onClick={() => router.back()}
          className="absolute left-[15px] top-[10px] z-10 size-[35px] transition-opacity hover:opacity-80"
        >
          <Image src="/icons/close.svg" alt="" width={35} height={35} unoptimized />
        </button>
      ) : (
        <Link
          href="/"
          aria-label="Fermer"
          className="absolute left-[15px] top-[10px] z-10 size-[35px] transition-opacity hover:opacity-80"
        >
          <Image src="/icons/close.svg" alt="" width={35} height={35} unoptimized />
        </Link>
      )}

      <button
        type="button"
        aria-pressed={allowRepost}
        aria-label={
          allowRepost
            ? "Republication autorisée, désactiver"
            : "Republication désactivée, autoriser"
        }
        title={
          allowRepost
            ? "Les autres peuvent republier ce regret"
            : "Personne ne pourra republier ce regret"
        }
        onClick={() => setAllowRepost((current) => !current)}
        className="absolute right-[72px] top-[10px] z-10 flex size-[35px] items-center justify-center rounded-full bg-white transition-opacity hover:opacity-90"
      >
        <Image
          src={allowRepost ? "/icons/repost-dark.svg" : "/icons/repost-dark-off.svg"}
          alt=""
          width={20}
          height={22}
          unoptimized
          className="h-[19.5px] w-[17.5px]"
        />
      </button>

      <button
        type="button"
        aria-label="Changer la couleur"
        onClick={() => setColour((current) => (current + 1) % palette.length)}
        className="absolute right-[27px] top-[10px] z-10 size-[35px] transition-opacity hover:opacity-80"
      >
        <Image src="/icons/brush.svg" alt="" width={35} height={35} unoptimized />
      </button>

      {/* pt clears the absolutely placed close and brush buttons */}
      <div className="flex min-h-0 flex-1 items-center justify-center px-6 pb-4 pt-[55px]">
        <textarea
          ref={textarea}
          name="regret"
          rows={1}
          required
          maxLength={500}
          onInput={() => {
            autoGrow();
            update();
          }}
          onClick={update}
          onKeyDown={onKeyDown}
          onBlur={close}
          aria-autocomplete="list"
          aria-controls={MENTION_LIST_ID}
          placeholder="Qu’est ce que tu regrettes"
          aria-label="Qu’est ce que tu regrettes"
          className="max-h-full w-[331px] max-w-full resize-none overflow-y-auto bg-transparent text-center text-[24px] font-medium text-white outline-none placeholder:text-white/35"
        />
      </div>

      {/* over the message, just above the send button */}
      <MentionSuggestions
        suggestions={suggestions}
        active={active}
        onSelect={select}
        className="absolute inset-x-6 bottom-[100px]"
      />

      {state.error ? (
        <p className="shrink-0 px-6 pb-[10px] text-center text-[14px] text-white">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="relative mx-auto mb-[16px] h-[75px] w-[calc(100%-48px)] max-w-[491px] shrink-0 rounded-[15px] bg-white text-[15px] font-medium text-black hover:bg-white/90"
      >
        {pending ? "Publication…" : "Publier mon regret"}
        <Image
          src="/icons/send.svg"
          alt=""
          width={28}
          height={28}
          unoptimized
          className="absolute right-[27px] h-[28px] w-[28px]"
        />
      </Button>
    </form>
  );
}
