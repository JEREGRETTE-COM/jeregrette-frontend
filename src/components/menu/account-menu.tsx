"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { signOutAction } from "@/app/actions";
import { initial } from "@/lib/utils";
import type { Author } from "@/types";

/** Figma 131:968 — the hamburger panel: profile, settings, sign out. */
export function AccountMenu({ author }: { author: Author }) {
  // open only ever becomes true from a click, so the portal never runs on the
  // server and needs no mounted guard.
  const [open, setOpen] = useState(false);

  // Escape closes, and the feed behind must not scroll under the panel.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const panel = (
    <div className="bg-menu fixed inset-0 z-[100] overflow-y-auto">
      <div className="relative mx-auto flex min-h-full w-full max-w-[420px] flex-col px-[12px] pb-[63px] pt-[74px]">
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
          className="absolute right-[11px] top-[15px] size-[35px] transition-opacity hover:opacity-80"
        >
          <Image src="/icons/close.svg" alt="" width={35} height={35} unoptimized />
        </button>

        <Link
          href="/profil"
          onClick={() => setOpen(false)}
          className="bg-field flex h-[60px] items-center gap-[12px] rounded-[10px] px-[12px]"
        >
          {author.avatar ? (
            <Image
              src={author.avatar}
              alt=""
              width={35}
              height={35}
              className="h-[35px] w-[35px] shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-full bg-white/20 text-[15px] font-semibold text-white"
            >
              {initial(author.handle)}
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-[14px] font-medium leading-none text-white">
              Voir mon profil
            </span>
            <span className="mt-[5px] block truncate text-[10px] leading-none text-[#afafaf]">
              {author.handle}
            </span>
          </span>
        </Link>

        {/*
          No screen exists for settings yet, so the row is shown as the design
          has it but does not navigate.
        */}
        <div
          aria-disabled
          className="bg-row mt-[11px] flex h-[50px] items-center gap-[18px] rounded-[10px] px-[12px] opacity-60"
        >
          <Image
            src="/icons/settings.svg"
            alt=""
            width={30}
            height={30}
            unoptimized
            className="h-[30px] w-[30px]"
          />
          <span className="text-[14px] font-medium text-white">Parametres</span>
        </div>

        <form action={signOutAction} className="mt-auto pt-[24px]">
          <button
            type="submit"
            className="flex h-[50px] w-full items-center gap-[18px] rounded-[10px] bg-[rgba(255,0,0,0.21)] px-[12px]"
          >
            <Image
              src="/icons/logout.svg"
              alt=""
              width={30}
              height={30}
              unoptimized
              className="h-[30px] w-[30px]"
            />
            <span className="text-danger text-[14px] font-medium">Se deconnecter</span>
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex size-[35px] shrink-0 items-center justify-center"
      >
        <Image
          src="/icons/menu.svg"
          alt=""
          width={18}
          height={18}
          unoptimized
          className="h-[18px] w-[18px]"
        />
      </button>

      {/*
        Rendered into <body>: the header is sticky with a z-index, which creates
        a stacking context. A fixed overlay nested inside it stays trapped under
        the feed however high its own z-index.
      */}
      {open ? createPortal(panel, document.body) : null}
    </>
  );
}
