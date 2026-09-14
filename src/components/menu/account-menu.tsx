"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { signOutAction } from "@/app/actions";
import { initial } from "@/lib/utils";
import type { Author } from "@/types";

const PREFERENCE_KEY = "jr_notifications";

type NotificationState = "unsupported" | "default" | "granted" | "denied";

function readPermission(): NotificationState {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

function readPreference() {
  try {
    return window.localStorage.getItem(PREFERENCE_KEY) !== "off";
  } catch {
    return true;
  }
}

function writePreference(enabled: boolean) {
  try {
    window.localStorage.setItem(PREFERENCE_KEY, enabled ? "on" : "off");
  } catch {
    // private browsing: the choice simply is not remembered
  }
}

/** Figma 131:968 — the hamburger panel: profile, notifications, settings, sign out. */
export function AccountMenu({
  author,
  unreadCount = 0,
}: {
  author: Author;
  unreadCount?: number;
}) {
  const badge = unreadCount > 9 ? "9+" : String(unreadCount);

  // open only ever becomes true from a click, so the portal never runs on the
  // server and needs no mounted guard.
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationState>("unsupported");
  const [preference, setPreference] = useState(true);

  function openMenu() {
    // read on open rather than on render: both only exist in the browser
    setPermission(readPermission());
    setPreference(readPreference());
    setOpen(true);
  }

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

  const enabled = permission === "granted" && preference;

  async function toggleNotifications() {
    if (permission === "unsupported" || permission === "denied") return;

    if (enabled) {
      // a site cannot revoke a granted permission; it can only stop using it
      writePreference(false);
      setPreference(false);
      return;
    }

    const result = permission === "granted" ? "granted" : await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      writePreference(true);
      setPreference(true);
    }
  }

  const notificationHint =
    permission === "unsupported"
      ? "Non disponible sur ce navigateur"
      : permission === "denied"
        ? "Bloquées dans les réglages du navigateur"
        : null;

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
              unoptimized
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
          Figma 131:1216 — the row opens the notifications list; the switch on the
          right still controls the browser permission, as before.
        */}
        <div className="bg-row mt-[10px] flex min-h-[50px] items-center gap-[12px] rounded-[10px] px-[12px] py-[10px]">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="flex min-w-0 flex-1 items-center gap-[18px]"
          >
            <Image
              src="/icons/bell.svg"
              alt=""
              width={30}
              height={30}
              unoptimized
              className="h-[30px] w-[30px] shrink-0"
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-[8px] text-[14px] font-medium text-white">
                Notifications
                {unreadCount > 0 ? (
                  <span className="bg-required flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-[5px] text-[11px] font-semibold leading-none text-white">
                    {badge}
                  </span>
                ) : null}
              </span>
              {notificationHint ? (
                <span className="block text-[11px] text-[#afafaf]">{notificationHint}</span>
              ) : null}
            </span>
          </Link>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="Notifications du navigateur"
            disabled={permission === "unsupported" || permission === "denied"}
            onClick={toggleNotifications}
            className="shrink-0 disabled:opacity-40"
          >
            <span
              aria-hidden
              className={`flex h-[18px] w-[32px] items-center rounded-full p-[2px] transition-colors ${
                enabled ? "bg-white" : "bg-white/20"
              }`}
            >
              <span
                className={`size-[14px] rounded-full transition-transform ${
                  enabled ? "translate-x-[14px] bg-black" : "bg-white"
                }`}
              />
            </span>
          </button>
        </div>

        {/*
          No screen exists for settings yet, so the row is shown as the design
          has it but does not navigate.
        */}
        <div
          aria-disabled
          className="bg-row mt-[10px] flex h-[50px] items-center gap-[18px] rounded-[10px] px-[12px] opacity-60"
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

        {/* Figma 223:1198 — dark row, white label, red icon */}
        <form action={signOutAction} className="mt-auto pt-[24px]">
          <button
            type="submit"
            className="bg-row flex h-[50px] w-full items-center gap-[18px] rounded-[10px] px-[12px]"
          >
            <Image
              src="/icons/logout.svg"
              alt=""
              width={30}
              height={30}
              unoptimized
              className="h-[30px] w-[30px]"
            />
            <span className="text-[14px] font-medium text-white">Se deconnecter</span>
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        aria-label={unreadCount > 0 ? `Menu, ${unreadCount} notifications non lues` : "Menu"}
        aria-expanded={open}
        onClick={openMenu}
        className="relative flex size-[35px] shrink-0 items-center justify-center"
      >
        <Image
          src="/icons/menu.svg"
          alt=""
          width={18}
          height={18}
          unoptimized
          className="h-[18px] w-[18px]"
        />
        {unreadCount > 0 ? (
          <span
            aria-hidden
            className="bg-required absolute -right-[2px] -top-[1px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-[4px] text-[10px] font-semibold leading-none text-white"
          >
            {badge}
          </span>
        ) : null}
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
