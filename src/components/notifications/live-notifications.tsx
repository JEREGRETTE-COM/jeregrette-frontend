"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { readPreference } from "@/components/notifications/browser-notifications-switch";
import { getEcho } from "@/lib/echo";
import { summarizeNotification } from "@/lib/notification-summary";

/** Only while the socket is down: a refresh re-reads the badge and the list. */
const FALLBACK_POLL_MS = 30_000;

type BroadcastNotification = Record<string, unknown> & { id?: string; type?: string };

/** The tab is in the background and the reader asked for alerts on this device. */
function shouldAlert() {
  return (
    document.visibilityState === "hidden" &&
    "Notification" in window &&
    Notification.permission === "granted" &&
    readPreference()
  );
}

async function alert(event: BroadcastNotification, open: (href: string) => void) {
  const { text, href } = summarizeNotification(event.type ?? null, event);
  const options = { body: text, icon: "/icon_192x192.png", tag: event.id };
  try {
    const notification = new Notification("Je regrette", options);
    notification.onclick = () => {
      window.focus();
      if (href) open(href);
      notification.close();
    };
  } catch {
    // Android Chrome only allows them through the service worker.
    const registration = await navigator.serviceWorker?.getRegistration();
    await registration?.showNotification("Je regrette", options).catch(() => {});
  }
}

/**
 * Listens on the user's private Reverb channel. Each notification the API
 * broadcasts refreshes the server components (header badge, /notifications)
 * and, when the tab is hidden, raises a system alert. Renders nothing.
 */
export function LiveNotifications({ userId }: { userId: string | number }) {
  const router = useRouter();

  useEffect(() => {
    const echo = getEcho();
    const channel = `App.Models.User.${userId}`;

    echo?.private(channel).notification((event: BroadcastNotification) => {
      router.refresh();
      if (shouldAlert()) void alert(event, (href) => router.push(href));
    });

    const timer = window.setInterval(() => {
      const connected = echo?.connector.pusher.connection.state === "connected";
      if (!connected && document.visibilityState === "visible") router.refresh();
    }, FALLBACK_POLL_MS);

    return () => {
      window.clearInterval(timer);
      echo?.leave(channel);
    };
  }, [userId, router]);

  return null;
}
