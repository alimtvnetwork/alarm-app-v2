/**
 * Overlay Store — Zustand store for alarm firing overlay state.
 * Logs alarm events (fired, snoozed, dismissed) with challenge solve time.
 * Uses async IPC adapter.
 */

import { create } from "zustand";
import type { Alarm, AlarmEvent, SnoozeState } from "@/types/alarm";
import { AlarmEventType } from "@/types/alarm";
import * as ipc from "@/lib/ipc-adapter";

interface OverlayStore {
  isVisible: boolean;
  firingAlarm: Alarm | null;
  snoozeState: SnoozeState | null;
  firedAt: string | null;

  fireAlarm: (alarm: Alarm) => Promise<void>;
  fireAlarmById: (alarmId: string) => Promise<void>;
  snooze: () => Promise<void>;
  dismiss: (challengeSolveTimeSec?: number) => Promise<void>;
  hide: () => void;
}

async function logEvent(
  alarm: Alarm,
  type: AlarmEventType,
  snoozeCount: number,
  challengeSolveTimeSec?: number
): Promise<void> {
  const now = new Date().toISOString();
  const event: AlarmEvent = {
    AlarmEventId: crypto.randomUUID(),
    AlarmId: alarm.AlarmId,
    Type: type,
    FiredAt: now,
    DismissedAt: type === AlarmEventType.Dismissed ? now : null,
    SnoozeCount: snoozeCount,
    ChallengeType: alarm.ChallengeType ?? null,
    ChallengeSolveTimeSec: challengeSolveTimeSec ?? null,
    SleepQuality: null,
    Mood: null,
    AlarmLabelSnapshot: alarm.Label,
    AlarmTimeSnapshot: alarm.Time,
    Timestamp: now,
  };
  await ipc.createAlarmEvent(event);
}

export const useOverlayStore = create<OverlayStore>((set, get) => ({
  isVisible: false,
  firingAlarm: null,
  snoozeState: null,
  firedAt: null,

  fireAlarm: async (alarm) => {
    const existing = await ipc.getSnoozeState(alarm.AlarmId);
    const now = new Date().toISOString();
    await logEvent(alarm, AlarmEventType.Fired, existing?.SnoozeCount ?? 0);
    set({
      isVisible: true,
      firingAlarm: alarm,
      snoozeState: existing,
      firedAt: now,
    });
  },

  fireAlarmById: async (alarmId) => {
    const alarm = await ipc.getAlarm(alarmId);
    if (alarm) {
      await get().fireAlarm(alarm);
    }
  },

  snooze: async () => {
    const { firingAlarm, snoozeState } = get();
    if (!firingAlarm) return;

    const canSnooze =
      firingAlarm.MaxSnoozeCount === 0
        ? false
        : !snoozeState || snoozeState.SnoozeCount < firingAlarm.MaxSnoozeCount;

    if (!canSnooze) return;

    const newState = await ipc.snoozeAlarm(
      firingAlarm.AlarmId,
      firingAlarm.SnoozeDurationMin
    );
    if (newState) {
      await logEvent(firingAlarm, AlarmEventType.Snoozed, newState.SnoozeCount);
      set({ isVisible: false, snoozeState: newState });
    }
  },

  dismiss: async (challengeSolveTimeSec) => {
    const { firingAlarm, snoozeState } = get();
    if (firingAlarm) {
      await ipc.dismissAlarm(firingAlarm.AlarmId);
      await logEvent(
        firingAlarm,
        AlarmEventType.Dismissed,
        snoozeState?.SnoozeCount ?? 0,
        challengeSolveTimeSec
      );
    }
    set({ isVisible: false, firingAlarm: null, snoozeState: null, firedAt: null });
  },

  hide: () => {
    set({ isVisible: false });
  },
}));
