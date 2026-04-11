/**
 * Overlay Store — Zustand store for alarm firing overlay state.
 * Logs alarm events (fired, snoozed, dismissed) with challenge solve time.
 */

import { create } from "zustand";
import type { Alarm, AlarmEvent, SnoozeState } from "@/types/alarm";
import { AlarmEventType } from "@/types/alarm";
import * as ipc from "@/lib/mock-ipc";

interface OverlayStore {
  isVisible: boolean;
  firingAlarm: Alarm | null;
  snoozeState: SnoozeState | null;
  firedAt: string | null;

  fireAlarm: (alarm: Alarm) => void;
  snooze: () => void;
  dismiss: (challengeSolveTimeSec?: number) => void;
  hide: () => void;
}

function logEvent(
  alarm: Alarm,
  type: AlarmEventType,
  snoozeCount: number,
  challengeSolveTimeSec?: number
): void {
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
  ipc.createAlarmEvent(event);
}

export const useOverlayStore = create<OverlayStore>((set, get) => ({
  isVisible: false,
  firingAlarm: null,
  snoozeState: null,
  firedAt: null,

  fireAlarm: (alarm) => {
    const existing = ipc.getSnoozeState(alarm.AlarmId);
    const now = new Date().toISOString();
    logEvent(alarm, AlarmEventType.Fired, existing?.SnoozeCount ?? 0);
    set({
      isVisible: true,
      firingAlarm: alarm,
      snoozeState: existing,
      firedAt: now,
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
    logEvent(firingAlarm, AlarmEventType.Snoozed, newState.SnoozeCount);
    set({ isVisible: false, snoozeState: newState });
  },

  dismiss: (challengeSolveTimeSec) => {
    const { firingAlarm, snoozeState } = get();
    if (firingAlarm) {
      ipc.clearSnooze(firingAlarm.AlarmId);
      logEvent(
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
