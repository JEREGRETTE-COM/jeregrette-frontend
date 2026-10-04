import { relativeTime } from "@/lib/feed-mapping";
import { parseNotificationData, summarizeNotification } from "@/lib/notification-summary";
import type { ApiNotification } from "@/types/api";
import type { NotificationView } from "@/types";

export function toNotificationView(notification: ApiNotification): NotificationView {
  return {
    id: notification.id,
    unread: !notification.read_at,
    ...summarizeNotification(notification.type, parseNotificationData(notification.data)),
    time: relativeTime(notification.created_at),
  };
}
