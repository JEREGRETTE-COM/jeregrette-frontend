"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

import { markNotificationReadAction } from "@/app/actions";
import { cn, initial } from "@/lib/utils";
import type { NotificationView } from "@/types";

/** One row. Opening it marks it read, optimistically. */
export function NotificationItem({ notification }: { notification: NotificationView }) {
  const [unread, setUnread] = useState(notification.unread);
  const [, startTransition] = useTransition();

  function markRead() {
    if (!unread) return;
    setUnread(false);
    startTransition(async () => {
      const result = await markNotificationReadAction(notification.id);
      if (result.error) setUnread(true);
    });
  }

  const className = cn(
    "flex w-full items-center gap-[12px] rounded-[10px] px-[12px] py-[12px] text-left transition-colors",
    unread ? "bg-field hover:bg-[#3a3a3a]" : "bg-row hover:bg-[#222222]",
  );

  const content = (
    <>
      {notification.actor ? (
        <span
          aria-hidden
          className="flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-full bg-white/20 text-[15px] font-semibold text-white"
        >
          {initial(notification.actor)}
        </span>
      ) : (
        <span aria-hidden className="flex h-[35px] w-[35px] shrink-0 items-center justify-center">
          <Image
            src="/icons/bell.svg"
            alt=""
            width={30}
            height={30}
            unoptimized
            className="h-[30px] w-[30px]"
          />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block break-words text-[14px] leading-[1.35] text-white",
            unread && "font-medium",
          )}
        >
          {notification.text}
        </span>
        <span className="mt-[3px] block text-[11px] text-[#afafaf]">{notification.time}</span>
      </span>
      {unread ? (
        <span role="img" aria-label="Non lue" className="bg-required size-[8px] shrink-0 rounded-full" />
      ) : null}
    </>
  );

  return notification.href ? (
    <Link href={notification.href} onClick={markRead} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={markRead} className={className}>
      {content}
    </button>
  );
}
