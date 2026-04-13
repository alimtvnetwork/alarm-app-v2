/**
 * useTauriEvents — Hook that initializes Tauri backend event listeners.
 * Listens for alarm-fired and snooze-expired events to show the overlay.
 * No-ops in web preview.
 */

import { useEffect } from "react";
import { useOverlayStore } from "@/stores/overlay-store";
import { initTauriListeners } from "@/lib/tauri-events";

export function useTauriEvents(): void {
  const fireAlarmById = useOverlayStore((s) => s.fireAlarmById);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const init = async () => {
      cleanup = await initTauriListeners(
        // alarm-fired: backend detected an alarm should fire
        async (payload) => {
          await fireAlarmById(payload.AlarmId);
        },
        // snooze-expired: backend says snooze timer elapsed
        async (alarmId) => {
          await fireAlarmById(alarmId);
        },
      );
    };

    init();

    return () => {
      cleanup?.();
    };
  }, [fireAlarmById]);
}
