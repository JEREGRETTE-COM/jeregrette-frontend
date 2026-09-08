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
      className="border-surface-border relative h-[705px] w-[520px] max-w-full overflow-hidden rounded-[25px] border-y-[3px]"
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

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
        <textarea
          ref={textarea}
          name="regret"
          rows={1}
          required
          maxLength={500}
          onInput={autoGrow}
          placeholder="Qu’est ce que tu regrettes"
          aria-label="Qu’est ce que tu regrettes"
          className="pointer-events-auto max-h-[400px] w-[331px] max-w-full resize-none overflow-y-auto bg-transparent text-center text-[24px] font-medium text-white outline-none placeholder:text-white/35"
        />
      </div>

      {state.error ? (
        <p className="absolute inset-x-0 bottom-[101px] text-center text-[14px] text-white">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="absolute bottom-[16px] left-1/2 h-[75px] w-[491px] max-w-[calc(100%-48px)] -translate-x-1/2 rounded-[15px] bg-white text-[15px] font-medium text-black hover:bg-white/90"
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
