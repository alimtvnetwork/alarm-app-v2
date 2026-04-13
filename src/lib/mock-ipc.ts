/**
 * Mock IPC Layer — Simulates Tauri IPC commands using localStorage.
 * Mirrors the command signatures from spec/15-alarm-app/01-fundamentals/01-data-model.md.
 * When migrating to Tauri, replace this with real `invoke()` calls.
 */

import type { Alarm, AlarmGroup, AlarmEvent, AlarmSound, Settings, SnoozeState } from "@/types/alarm";
import { DEFAULT_SETTINGS } from "@/types/alarm";
import { normalizeAlarmTimezone } from "@/lib/alarm-timezone";
import { MOCK_ALARMS, MOCK_GROUPS, MOCK_SOUNDS, MOCK_EVENTS } from "@/test/fixtures";

// ─── Storage Keys ────────────────────────────────────────────────

const STORAGE_KEYS = {
  ALARMS: "alarm_app_alarms",
  GROUPS: "alarm_app_groups",
  SETTINGS: "alarm_app_settings",
  EVENTS: "alarm_app_events",
  SNOOZE: "alarm_app_snooze",
} as const;

// ─── Helpers ─────────────────────────────────────────────────────

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function normalizeSettings(settings: Settings): Settings {
  return {
    ...settings,
    SystemTimezone: normalizeAlarmTimezone(settings.SystemTimezone),
  };
}

function seedIfEmpty(): void {
  if (!localStorage.getItem(STORAGE_KEYS.ALARMS)) {
    saveJson(STORAGE_KEYS.ALARMS, MOCK_ALARMS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.GROUPS)) {
    saveJson(STORAGE_KEYS.GROUPS, MOCK_GROUPS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    saveJson(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    saveJson(STORAGE_KEYS.EVENTS, MOCK_EVENTS);
  }
}

// Initialize on first import
seedIfEmpty();

// ─── Alarm Commands ──────────────────────────────────────────────

export function listAlarms(): Alarm[] {
  const alarms = loadJson<Alarm[]>(STORAGE_KEYS.ALARMS, []);
  return alarms.filter((a) => a.DeletedAt === null);
}

export function getAlarm(alarmId: string): Alarm | null {
  const alarms = loadJson<Alarm[]>(STORAGE_KEYS.ALARMS, []);
  return alarms.find((a) => a.AlarmId === alarmId) ?? null;
}

export function createAlarm(alarm: Alarm): Alarm {
  const alarms = loadJson<Alarm[]>(STORAGE_KEYS.ALARMS, []);
  alarms.push(alarm);
  saveJson(STORAGE_KEYS.ALARMS, alarms);
  return alarm;
}

export function updateAlarm(alarm: Alarm): Alarm {
  const alarms = loadJson<Alarm[]>(STORAGE_KEYS.ALARMS, []);
  const idx = alarms.findIndex((a) => a.AlarmId === alarm.AlarmId);
  if (idx >= 0) {
    alarms[idx] = { ...alarm, UpdatedAt: new Date().toISOString() };
    saveJson(STORAGE_KEYS.ALARMS, alarms);
    return alarms[idx];
  }
  return alarm;
}

export function deleteAlarm(alarmId: string): void {
  const alarms = loadJson<Alarm[]>(STORAGE_KEYS.ALARMS, []);
  const idx = alarms.findIndex((a) => a.AlarmId === alarmId);
  if (idx >= 0) {
    alarms[idx] = {
      ...alarms[idx],
      DeletedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
    };
    saveJson(STORAGE_KEYS.ALARMS, alarms);
  }
}

export function toggleAlarm(alarmId: string, isEnabled: boolean): Alarm | null {
  const alarms = loadJson<Alarm[]>(STORAGE_KEYS.ALARMS, []);
  const idx = alarms.findIndex((a) => a.AlarmId === alarmId);
  if (idx >= 0) {
    alarms[idx] = {
      ...alarms[idx],
      IsEnabled: isEnabled,
      UpdatedAt: new Date().toISOString(),
    };
    saveJson(STORAGE_KEYS.ALARMS, alarms);
    return alarms[idx];
  }
  return null;
}

export function reorderAlarms(alarmIds: string[]): void {
  const alarms = loadJson<Alarm[]>(STORAGE_KEYS.ALARMS, []);
  const ordered = alarmIds
    .map((id) => alarms.find((a) => a.AlarmId === id))
    .filter(Boolean) as Alarm[];
  const rest = alarms.filter((a) => !alarmIds.includes(a.AlarmId));
  saveJson(STORAGE_KEYS.ALARMS, [...ordered, ...rest]);
}

// ─── Group Commands ──────────────────────────────────────────────

export function listGroups(): AlarmGroup[] {
  return loadJson<AlarmGroup[]>(STORAGE_KEYS.GROUPS, []);
}

export function createGroup(group: AlarmGroup): AlarmGroup {
  const groups = loadJson<AlarmGroup[]>(STORAGE_KEYS.GROUPS, []);
  groups.push(group);
  saveJson(STORAGE_KEYS.GROUPS, groups);
  return group;
}

export function updateGroup(group: AlarmGroup): AlarmGroup {
  const groups = loadJson<AlarmGroup[]>(STORAGE_KEYS.GROUPS, []);
  const idx = groups.findIndex((g) => g.AlarmGroupId === group.AlarmGroupId);
  if (idx >= 0) {
    groups[idx] = group;
    saveJson(STORAGE_KEYS.GROUPS, groups);
  }
  return group;
}

export function deleteGroup(groupId: string): void {
  const groups = loadJson<AlarmGroup[]>(STORAGE_KEYS.GROUPS, []);
  saveJson(STORAGE_KEYS.GROUPS, groups.filter((g) => g.AlarmGroupId !== groupId));
  // Unassign alarms from deleted group
  const alarms = loadJson<Alarm[]>(STORAGE_KEYS.ALARMS, []);
  const updated = alarms.map((a) =>
    a.GroupId === groupId ? { ...a, GroupId: null, UpdatedAt: new Date().toISOString() } : a
  );
  saveJson(STORAGE_KEYS.ALARMS, updated);
}

// ─── Settings Commands ───────────────────────────────────────────

export function getSettings(): Settings {
  const stored = loadJson<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  const normalized = normalizeSettings(stored);
  if (normalized.SystemTimezone !== stored.SystemTimezone) {
    saveJson(STORAGE_KEYS.SETTINGS, normalized);
  }
  return normalized;
}

export function updateSettings(partial: Partial<Settings>): Settings {
  const current = getSettings();
  const updated = normalizeSettings({ ...current, ...partial });
  saveJson(STORAGE_KEYS.SETTINGS, updated);
  return updated;
}

// ─── Sound Commands ──────────────────────────────────────────────

export function listSounds(): AlarmSound[] {
  return MOCK_SOUNDS;
}

// ─── Snooze Commands ─────────────────────────────────────────────

export function getSnoozeState(alarmId: string): SnoozeState | null {
  const states = loadJson<SnoozeState[]>(STORAGE_KEYS.SNOOZE, []);
  return states.find((s) => s.AlarmId === alarmId) ?? null;
}

export function snoozeAlarm(alarmId: string, durationMin: number): SnoozeState {
  const states = loadJson<SnoozeState[]>(STORAGE_KEYS.SNOOZE, []);
  const existing = states.find((s) => s.AlarmId === alarmId);
  const snoozeUntil = new Date(
    Date.now() + durationMin * 60 * 1000
  ).toISOString();

  const newState: SnoozeState = {
    AlarmId: alarmId,
    SnoozeUntil: snoozeUntil,
    SnoozeCount: existing ? existing.SnoozeCount + 1 : 1,
  };

  const filtered = states.filter((s) => s.AlarmId !== alarmId);
  filtered.push(newState);
  saveJson(STORAGE_KEYS.SNOOZE, filtered);
  return newState;
}

export function clearSnooze(alarmId: string): void {
  const states = loadJson<SnoozeState[]>(STORAGE_KEYS.SNOOZE, []);
  saveJson(STORAGE_KEYS.SNOOZE, states.filter((s) => s.AlarmId !== alarmId));
}

// ─── Event Commands ──────────────────────────────────────────────

export function listAlarmEvents(): AlarmEvent[] {
  return loadJson<AlarmEvent[]>(STORAGE_KEYS.EVENTS, []);
}

export function createAlarmEvent(event: AlarmEvent): AlarmEvent {
  const events = loadJson<AlarmEvent[]>(STORAGE_KEYS.EVENTS, []);
  events.push(event);
  saveJson(STORAGE_KEYS.EVENTS, events);
  return event;
}

// ─── Reset (dev utility) ────────────────────────────────────────

export function resetAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  seedIfEmpty();
}
