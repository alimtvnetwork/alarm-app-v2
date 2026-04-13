/**
 * Tauri Event Listeners — Subscribes to backend events (alarm-fired, snooze-expired)
 * and triggers frontend actions (show overlay, re-fire alarm).
 * No-ops in web preview.
 */

const IS_TAURI = typeof window !== "undefined" && "__TAURI__" in window;

type UnlistenFn = () => void;
const unlisteners: UnlistenFn[] = [];

export interface AlarmFiredPayload {
  AlarmId: string;
  Time: string;
  Label: string;
}

export type AlarmFiredHandler = (payload: AlarmFiredPayload) => void;
export type SnoozeExpiredHandler = (alarmId: string) => void;

/**
 * Initialize all Tauri event listeners.
 * Call once on app mount. Returns cleanup function.
 */
export async function initTauriListeners(
  onAlarmFired: AlarmFiredHandler,
  onSnoozeExpired: SnoozeExpiredHandler,
): Promise<UnlistenFn> {
  if (!IS_TAURI) {
    return () => {};
  }

  try {
    const { listen } = await import("@tauri-apps/api/event" as string);

    const u1 = await listen<AlarmFiredPayload>("alarm-fired", (event) => {
      onAlarmFired(event.payload);
    });
    unlisteners.push(u1);

    const u2 = await listen<string>("snooze-expired", (event) => {
      onSnoozeExpired(event.payload);
    });
    unlisteners.push(u2);
  } catch (error) {
    console.warn("[tauri-events] Failed to initialize listeners:", error);
  }

  return () => {
    unlisteners.forEach((fn) => fn());
    unlisteners.length = 0;
  };
}
