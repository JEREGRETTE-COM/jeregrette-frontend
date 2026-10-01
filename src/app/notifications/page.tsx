import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";
import { NotificationItem } from "@/components/notifications/notification-item";
import { getAccessToken, getCurrentUser } from "@/lib/auth";
import { toNotificationView } from "@/lib/notification-text";
import { listNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Notifications" };

/** No Figma screen yet: built from the profile header and the menu rows. */
export default async function NotificationsPage() {
  const [token, user] = await Promise.all([getAccessToken(), getCurrentUser()]);
  if (!token) redirect("/connexion");
  // An anonymous account receives none: nobody can follow or mention it.
  if (user?.is_guest) redirect("/inscription");

  const result = await listNotifications(token).catch(() => null);

  // TEMP diagnostic (dev only): the payload shape is undocumented.
  if (process.env.NODE_ENV !== "production") {
    for (const notification of (result?.data ?? []).slice(0, 3)) {
      console.info("[diag notif]", notification.type, notification.data);
    }
  }

  const items = (result?.data ?? []).map(toNotificationView);
  const unread = result?.meta?.unread_count ?? items.filter((item) => item.unread).length;

  return (
    <main className="bg-surface font-poppins flex flex-1 flex-col">
      <header className="sticky top-0 z-30 h-[70px] w-full bg-[rgba(22,22,22,0.75)] backdrop-blur-[25px]">
        <div className="mx-auto flex h-full w-full max-w-[599px] items-center gap-[16px] px-[25px]">
          <Link
            href="/"
            aria-label="Retour"
            className="size-[35px] shrink-0 transition-opacity hover:opacity-80"
          >
            <Image src="/icons/back.svg" alt="" width={35} height={35} unoptimized />
          </Link>
          <p className="text-[16px] text-white">Notifications</p>
          {unread > 0 ? <MarkAllReadButton /> : null}
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[599px] flex-col px-[25px] pb-[60px] pt-[12px]">
        {!result ? (
          <p className="text-muted mt-[40px] text-center text-[15px]">
            Impossible de charger les notifications pour le moment.
          </p>
        ) : items.length === 0 ? (
          <div className="mt-[60px] flex flex-col items-center gap-[12px] text-center">
            <Image
              src="/icons/bell.svg"
              alt=""
              width={30}
              height={30}
              unoptimized
              className="h-[30px] w-[30px] opacity-60"
            />
            <p className="text-muted text-[15px]">Aucune notification pour le moment.</p>
          </div>
        ) : (
          <>
            {unread > 0 ? (
              <p className="text-label mb-[10px] text-[13px]">
                {unread} non {unread > 1 ? "lues" : "lue"}
              </p>
            ) : null}
            <ul className="flex flex-col gap-[8px]">
              {items.map((item) => (
                <li key={item.id}>
                  <NotificationItem notification={item} />
                </li>
              ))}
            </ul>
            {result.meta?.has_more ? (
              <p className="text-muted mt-[16px] text-center text-[12px]">
                Seules les plus récentes s’affichent.
              </p>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
