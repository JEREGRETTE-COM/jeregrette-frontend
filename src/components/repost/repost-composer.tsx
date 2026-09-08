"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";

import { publishRepostAction, type FormState } from "@/app/actions";
import { AuthorRow } from "@/components/feed/author-row";
import { RegretSurface } from "@/components/feed/regret-surface";
import { Button } from "@/components/ui/button";
import type { Author, Regret } from "@/types";

/** Figma 113:278 — comment on a regret before republishing it. */
export function RepostComposer({
  regret,
  author,
}: {
  regret: Regret;
  author: Author;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    publishRepostAction,
    {},
  );

  return (
    <form
      action={formAction}
      className="bg-surface relative flex min-h-[560px] w-full max-w-[520px] flex-col overflow-hidden rounded-[25px] sm:min-h-[705px]"
    >
      <input type="hidden" name="regretId" value={regret.id} />

      <Link
        href="/"
        aria-label="Fermer"
        className="absolute left-[15px] top-[10px] size-[35px] transition-opacity hover:opacity-80"
      >
        <Image src="/icons/close.svg" alt="" width={35} height={35} unoptimized />
      </Link>

      <Button
        type="submit"
        disabled={pending}
        className="absolute right-[17px] top-[17px] h-[35px] w-[104px] rounded-[10px] bg-white px-0 text-[15px] font-bold text-black hover:bg-white/90"
      >
        {pending ? "…" : "Republier"}
      </Button>

      <div className="relative mt-[60px] h-[55px] shrink-0">
        <AuthorRow author={author} offset={25} />
      </div>

      <textarea
        name="comment"
        placeholder="Ajouter un commentaire"
        aria-label="Ajouter un commentaire"
        className="bg-field-alt mx-auto mt-[14px] h-[118px] w-[calc(100%-48px)] max-w-[471px] shrink-0 resize-none rounded-[15px] px-[18px] py-[12px] text-[15px] text-white outline-none placeholder:text-white/35"
      />

      {state.error ? (
        <p className="text-required shrink-0 px-6 pt-[10px] text-center text-[14px]">
          {state.error}
        </p>
      ) : null}

      <div className="border-surface-border bg-surface mt-auto flex min-h-0 shrink-0 justify-center border-t-2 px-[23px] py-[28px]">
        <RegretSurface
          regret={regret}
          authorOffset={25}
          className="border-surface-border h-[369px] w-full max-w-[474px] rounded-[15px] border-2"
        />
      </div>
    </form>
  );
}
