"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";

import { publishRegretAction, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/button";

/** Card colours taken from the feed designs, cycled by the brush button. */
const palette = ["#4b8710", "#a20c37", "#9da20c", "#950ca2", "#383861"];

/** Figma 106:1177 — full-bleed colour, centred message, send bar. */
export function RegretComposer() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    publishRegretAction,
    {},
  );
  const [colour, setColour] = useState(0);
  const textarea = useRef<HTMLTextAreaElement>(null);

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

      <Link
        href="/"
        aria-label="Fermer"
        className="absolute left-[15px] top-[10px] z-10 size-[35px] transition-opacity hover:opacity-80"
      >
        <Image src="/icons/close.svg" alt="" width={35} height={35} unoptimized />
      </Link>

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
          onInput={autoGrow}
          placeholder="Qu’est ce que tu regrettes"
          aria-label="Qu’est ce que tu regrettes"
          className="max-h-full w-[331px] max-w-full resize-none overflow-y-auto bg-transparent text-center text-[24px] font-medium text-white outline-none placeholder:text-white/35"
        />
      </div>

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
