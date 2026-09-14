import { api } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import type { ApiItem, ApiNotification, NotificationsMeta } from "@/types/api";

/** The API's own default. It accepts no cursor, so this is also the ceiling. */
export const NOTIFICATIONS_LIMIT = 20;

export async function listNotifications(token: string, limit = NOTIFICATIONS_LIMIT) {
  return api<{ data: ApiNotification[]; meta: NotificationsMeta }>(
    `/notifications?limit=${limit}`,
    { token },
  );
}

export async function markNotificationRead(id: string, token: string) {
  const { data } = await api<ApiItem<ApiNotification>>(
    `/notifications/${encodeURIComponent(id)}/read`,
    { method: "PATCH", token },
  );
  return data;
}

export async function markAllNotificationsRead(token: string) {
  return api<{ message: string }>("/notifications/read-all", { method: "POST", token });
}

/**
 * `data` arrives as a string. Laravel database notifications store a JSON
 * object there, so decode it when possible and keep the raw text otherwise.
 */
export function parseNotificationData(raw: string): Record<string, unknown> | string {
  try {
    const value: unknown = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : raw;
  } catch {
    return raw;
  }
}

/** The header badge. One item is enough: only meta.unread_count is read. */
export async function loadUnreadCount() {
  const token = await getAccessToken();
  if (!token) return 0;
  try {
    const { meta } = await listNotifications(token, 1);
    return meta?.unread_count ?? 0;
  } catch {
    // a failing notifications endpoint must not take the header down
    return 0;
  }
}
