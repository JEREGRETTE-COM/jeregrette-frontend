"use client";

import { useEffect, useState } from "react";

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

/**
 * Browser notifications, moved here when the hamburger menu gave way to the two
 * round buttons of Figma 248:962.
 */
export function BrowserNotificationsSwitch() {
  const [permission, setPermission] = useState<NotificationState>("unsupported");
  const [preference, setPreference] = useState(true);

  // Both only exist in the browser. Read on the next frame rather than in the
  // effect body: React warns about state set while it is still committing.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPermission(readPermission());
      setPreference(readPreference());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const enabled = permission === "granted" && preference;

  async function toggle() {
    if (permission === "unsupported" || permission === "denied") return;

    if (enabled) {
      // a site cannot revoke a granted permission; it can only stop using it
      writePreference(false);
      setPreference(false);
      return;
    }

    const result =
      permission === "granted" ? "granted" : await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      writePreference(true);
      setPreference(true);
    }
  }

  const hint =
    permission === "unsupported"
      ? "Non disponible sur ce navigateur"
      : permission === "denied"
        ? "Bloquées dans les réglages du navigateur"
        : null;

  return (
    <div className="bg-row mb-[14px] flex items-center gap-[12px] rounded-[10px] px-[14px] py-[12px]">
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium text-white">
          Alertes sur cet appareil
        </span>
        <span className="text-label mt-[3px] block text-[11px] leading-[1.3]">
          {hint ?? "Être prévenu même quand l’onglet est fermé."}
        </span>
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Notifications du navigateur"
        disabled={permission === "unsupported" || permission === "denied"}
        onClick={toggle}
        className={`relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors disabled:opacity-40 ${
          enabled ? "bg-white" : "bg-white/25"
        }`}
      >
        <span
          className={`absolute top-[3px] size-[20px] rounded-full transition-all ${
            enabled ? "left-[23px] bg-black" : "left-[3px] bg-white"
          }`}
        />
      </button>
    </div>
  );
}
