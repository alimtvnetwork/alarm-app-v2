/**
 * AlarmNotification — Request permission and fire OS-level notifications.
 * Falls back gracefully if Notification API is unavailable.
 */

const PERMISSION_KEY = "alarm_notification_asked";

export function isNotificationSupported(): boolean {
  return "Notification" in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | null> {
  if (!isNotificationSupported()) return null;
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";

  const result = await Notification.requestPermission();
  localStorage.setItem(PERMISSION_KEY, "true");
  return result;
}

export function hasAskedPermission(): boolean {
  return localStorage.getItem(PERMISSION_KEY) === "true";
}

export function fireAlarmNotification(label: string, time: string): void {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== "granted") return;

  const title = label || "Alarm";
  const body = `It's ${time} — time to wake up!`;

  try {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: `alarm-${time}`,
      requireInteraction: true,
    });
  } catch {
    /* SW-only context or blocked — fail silently */
  }
}