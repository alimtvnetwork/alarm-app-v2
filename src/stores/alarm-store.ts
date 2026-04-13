/**
 * Alarm Store — Zustand store for alarm and group CRUD.
 * Uses mock IPC layer (swap for real Tauri invoke in production).
 */

import { create } from "zustand";
import type { Alarm, AlarmGroup } from "@/types/alarm";
import { RepeatType, DEFAULT_REPEAT_PATTERN } from "@/types/alarm";
import * as ipc from "@/lib/mock-ipc";
import { computeNextFireTime } from "@/lib/next-fire-time";
import {
  isNotificationSupported,
  hasAskedPermission,
  requestNotificationPermission,
} from "@/lib/alarm-notification";

interface AlarmStore {
  alarms: Alarm[];
  groups: AlarmGroup[];

  // Alarm CRUD
  loadAlarms: () => void;
  addAlarm: (partial: Partial<Alarm>) => Alarm;
  updateAlarm: (alarm: Alarm) => void;
  deleteAlarm: (alarmId: string) => void;
  toggleAlarm: (alarmId: string, isEnabled: boolean) => void;
  duplicateAlarm: (alarmId: string) => Alarm | null;
  reorderAlarms: (alarmIds: string[]) => void;

  // Group CRUD
  loadGroups: () => void;
  addGroup: (name: string, color: string) => AlarmGroup;
  updateGroup: (group: AlarmGroup) => void;
  deleteGroup: (groupId: string) => void;
}

function generateId(): string {
  return crypto.randomUUID();
}

function getAlarmTimeZone(): string {
  return ipc.getSettings().SystemTimezone;
}

function createDefaultAlarm(partial: Partial<Alarm>): Alarm {
  const now = new Date().toISOString();
  return {
    AlarmId: generateId(),
    Time: "07:00",
    Date: null,
    Label: "",
    IsEnabled: true,
    IsPreviousEnabled: null,
    Repeat: { ...DEFAULT_REPEAT_PATTERN },
    GroupId: null,
    SnoozeDurationMin: 5,
    MaxSnoozeCount: 3,
    SoundFile: "classic-beep",
    IsVibrationEnabled: false,
    IsGradualVolume: false,
    GradualVolumeDurationSec: 30,
    AutoDismissMin: 15,
    ChallengeType: null,
    ChallengeDifficulty: null,
    ChallengeShakeCount: null,
    ChallengeStepCount: null,
    NextFireTime: null,
    DeletedAt: null,
    CreatedAt: now,
    UpdatedAt: now,
    ...partial,
  };
}

export const useAlarmStore = create<AlarmStore>((set) => ({
  alarms: [],
  groups: [],

  loadAlarms: () => {
    const timeZone = getAlarmTimeZone();
    const alarms = ipc.listAlarms().map((a) => {
      if (!a.NextFireTime && a.IsEnabled) {
        a.NextFireTime = computeNextFireTime(a, timeZone);
        ipc.updateAlarm(a);
      }
      return a;
    });
    set({ alarms });
  },

  addAlarm: (partial) => {
    const alarm = createDefaultAlarm(partial);
    alarm.NextFireTime = computeNextFireTime(alarm, getAlarmTimeZone());
    ipc.createAlarm(alarm);
    set((s) => ({ alarms: [...s.alarms, alarm] }));

    // Prompt for notification permission on first alarm creation
    if (isNotificationSupported() && !hasAskedPermission()) {
      requestNotificationPermission();
    }

    return alarm;
  },

  updateAlarm: (alarm) => {
    alarm.NextFireTime = computeNextFireTime(alarm, getAlarmTimeZone());
    ipc.updateAlarm(alarm);
    set((s) => ({
      alarms: s.alarms.map((a) => (a.AlarmId === alarm.AlarmId ? alarm : a)),
    }));
  },

  deleteAlarm: (alarmId) => {
    ipc.deleteAlarm(alarmId);
    set((s) => ({
      alarms: s.alarms.filter((a) => a.AlarmId !== alarmId),
    }));
  },

  toggleAlarm: (alarmId, isEnabled) => {
    const updated = ipc.toggleAlarm(alarmId, isEnabled);
    if (updated) {
      updated.NextFireTime = computeNextFireTime(updated, getAlarmTimeZone());
      ipc.updateAlarm(updated);
      set((s) => ({
        alarms: s.alarms.map((a) => (a.AlarmId === alarmId ? updated : a)),
      }));
    }
  },

  duplicateAlarm: (alarmId) => {
    const existing = ipc.getAlarm(alarmId);
    if (!existing) return null;
    const now = new Date().toISOString();
    const duplicate: Alarm = {
      ...existing,
      AlarmId: generateId(),
      Label: `${existing.Label} (copy)`,
      CreatedAt: now,
      UpdatedAt: now,
    };
    ipc.createAlarm(duplicate);
    set((s) => ({ alarms: [...s.alarms, duplicate] }));
    return duplicate;
  },

  reorderAlarms: (alarmIds) => {
    ipc.reorderAlarms(alarmIds);
    set((s) => {
      const map = new Map(s.alarms.map((a) => [a.AlarmId, a]));
      const ordered = alarmIds
        .map((id) => map.get(id))
        .filter(Boolean) as Alarm[];
      const rest = s.alarms.filter((a) => !alarmIds.includes(a.AlarmId));
      return { alarms: [...ordered, ...rest] };
    });
  },

  loadGroups: () => {
    set({ groups: ipc.listGroups() });
  },

  addGroup: (name, color) => {
    const groups = ipc.listGroups();
    const group: AlarmGroup = {
      AlarmGroupId: generateId(),
      Name: name,
      Color: color,
      Position: groups.length,
      IsEnabled: true,
    };
    ipc.createGroup(group);
    set((s) => ({ groups: [...s.groups, group] }));
    return group;
  },

  updateGroup: (group) => {
    ipc.updateGroup(group);
    set((s) => ({
      groups: s.groups.map((g) =>
        g.AlarmGroupId === group.AlarmGroupId ? group : g
      ),
    }));
  },

  deleteGroup: (groupId) => {
    ipc.deleteGroup(groupId);
    set((s) => ({
      groups: s.groups.filter((g) => g.AlarmGroupId !== groupId),
      alarms: s.alarms.map((a) =>
        a.GroupId === groupId ? { ...a, GroupId: null } : a
      ),
    }));
  },
}));
