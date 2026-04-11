/**
 * Overlay Store — Zustand store for alarm firing overlay state.
 * Controls the full-screen overlay shown when an alarm fires.
 */

import { create } from "zustand";
import type { Alarm, SnoozeState } from "@/types/alarm";
import * as ipc from "@/lib/mock-ipc";

interface OverlayStore {
  isVisible: boolean;
  firingAlarm: Alarm | null;
  snoozeState: SnoozeState | null;

  fireAlarm: (alarm: Alarm) => void;
  snooze: () => void;
  dismiss: () => void;
  hide: () => void;
}

export const useOverlayStore = create<OverlayStore>((set, get) => ({
  isVisible: false,
  firingAlarm: null,
  snoozeState: null,

  fireAlarm: (alarm) => {
    const existing = ipc.getSnoozeState(alarm.AlarmId);
    set({
      isVisible: true,
      firingAlarm: alarm,
      snoozeState: existing,
    });
  },

  snooze: () => {
    const { firingAlarm, snoozeState } = get();
    if (!firingAlarm) return;

    const canSnooze =
      firingAlarm.MaxSnoozeCount === 0
        ? false
        : !snoozeState || snoozeState.SnoozeCount < firingAlarm.MaxSnoozeCount;

    if (!canSnooze) return;

    const newState = ipc.snoozeAlarm(
      firingAlarm.AlarmId,
      firingAlarm.SnoozeDurationMin
    );
    set({ isVisible: false, snoozeState: newState });
  },

  dismiss: () => {
    const { firingAlarm } = get();
    if (firingAlarm) {
      ipc.clearSnooze(firingAlarm.AlarmId);
    }
    set({ isVisible: false, firingAlarm: null, snoozeState: null });
  },

  hide: () => {
    set({ isVisible: false });
  },
}));
