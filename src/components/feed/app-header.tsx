import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { LiveNotifications } from "@/components/notifications/live-notifications";
import { getAccessToken, getCurrentAuthor } from "@/lib/auth";
import { loadUnreadCount } from "@/lib/notifications";

/**
 * Figma 85:1050 — blurred bar over the feed. The design pins its content to the
 * bottom of a 110px bar; below sm the bar shrinks and simply centres it.
 *
 * Only the session side waits for the API, behind its own Suspense boundary. An
 * async layout would otherwise hold back the whole page, loading.tsx included,
 * until /users/me and /notifications had both answered.
 */
export function AppHeader() {
  return (
    <header className="group sticky top-0 z-30 w-full bg-[rgba(22,22,22,0.75)] backdrop-blur-[25px]">
      <div className="mx-auto flex h-[68px] w-full max-w-[853px] items-center justify-between gap-3 px-4 sm:h-[110px] sm:items-end sm:px-[18px] sm:pb-[19px]">
        <Link href="/" className="flex min-w-0 items-center gap-[10px]">
          <Image
            src="/brand/logo-header.svg"
            alt="Je regrette"
            width={46}
            height={38}
            unoptimized
            className="h-[30px] w-[36px] shrink-0 sm:h-[38px] sm:w-[46px]"
          />
          {/*
            Signed out there are two actions on the right; the wordmark is the
            first thing that has to give on a narrow screen. Read from the DOM
            with :has(), so the logo never waits for the session.
          */}
          <span className="truncate text-[17px] font-bold leading-none text-white group-has-[[data-signed-out]]:max-[400px]:hidden sm:text-[20px]">
            Je regrette
          </span>
        </Link>

        <Suspense fallback={<div aria-hidden className="h-[37px] w-[37px] shrink-0" />}>
          <HeaderSession />
        </Suspense>
      </div>
    </header>
  );
}

async function HeaderSession() {
  // independent reads, so they share one round trip
  const [token, author, unreadCount] = await Promise.all([
    getAccessToken(),
    // A failing API must not throw here: the page below says there is an outage.
    getCurrentAuthor().catch(() => null),
    loadUnreadCount(),
  ]);

  // Signed in but the API is down: showing "Se connecter" would be a lie.
  if (!author && token) return null;

  // An anonymous account has no profile, no notifications and nothing to sign
  // out of: it sees the visitor's actions, which are its way to a real account.
  if (author && !author.guest) {
    const badge = unreadCount > 9 ? "9+" : String(unreadCount);

    // Figma 248:962 — two round buttons replace the menu: notifications, profile.
    return (
      <div className="flex shrink-0 items-center gap-[10px]">
        <LiveNotifications userId={author.id} />
        <Link
          href="/notifications"
          aria-label={
            unreadCount > 0 ? `Notifications, ${unreadCount} non lues` : "Notifications"
          }
          className="relative flex size-[40px] items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <Image
            src="/icons/bell.svg"
            alt=""
            width={21}
            height={23}
            unoptimized
            className="h-[23px] w-[21px]"
          />
          {unreadCount > 0 ? (
            <span className="bg-danger absolute -right-[2px] -top-[2px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-[4px] text-[10px] font-bold text-white">
              {badge}
            </span>
          ) : null}
        </Link>

        <Link
          href="/profil"
          aria-label="Mon profil"
          className="flex size-[40px] items-center justify-center overflow-hidden rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          {author.avatar ? (
            <Image
              src={author.avatar}
              alt=""
              width={40}
              height={40}
              unoptimized
              className="h-[40px] w-[40px] object-cover"
            />
          ) : (
            <Image src="/icons/profile.svg" alt="" width={20} height={20} unoptimized />
          )}
        </Link>
      </div>
    );
  }

  return (
    <div data-signed-out className="flex shrink-0 items-center gap-[10px] sm:gap-[14px]">
      {/* secondary, so the white pill stays the single primary action */}
      <Link
        href="/connexion"
        className="shrink-0 text-[13px] font-medium text-white transition-opacity hover:opacity-80 sm:text-[14px]"
      >
        Se connecter
      </Link>
      <Link
        href="/inscription"
        className="flex h-[37px] shrink-0 items-center justify-center rounded-[10px] bg-white px-[14px] text-[13px] font-bold text-black transition-opacity hover:opacity-90 sm:w-[142px] sm:px-0 sm:text-[14px]"
      >
        {/* the long label crowds the wordmark out below sm */}
        <span className="sm:hidden">S’inscrire</span>
        <span className="hidden sm:inline">Créer un compte</span>
      </Link>
    </div>
  );
}
