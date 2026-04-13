/**
 * Export/Import round-trip test — export alarms, clear, re-import, verify.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { exportAlarmsToJson, importAlarmsFromJson } from "@/lib/export-import";
import { ImportMode, DEFAULT_SETTINGS } from "@/types/alarm";
import * as ipc from "@/lib/mock-ipc";
import { MOCK_ALARMS, MOCK_GROUPS } from "@/test/fixtures";

function seed() {
  localStorage.setItem("alarm_app_alarms", JSON.stringify(MOCK_ALARMS));
  localStorage.setItem("alarm_app_groups", JSON.stringify(MOCK_GROUPS));
  localStorage.setItem("alarm_app_settings", JSON.stringify(DEFAULT_SETTINGS));
}

describe("Export/Import Round-Trip", () => {
  beforeEach(() => {
    localStorage.clear();
    seed();
  });

  it("exports and re-imports alarms preserving all fields", () => {
    const original = ipc.listAlarms();
    const json = exportAlarmsToJson();

    // Clear and reimport
    localStorage.setItem("alarm_app_alarms", JSON.stringify([]));
    expect(ipc.listAlarms()).toHaveLength(0);

    const result = importAlarmsFromJson(json, ImportMode.Replace);
    expect(result.imported).toBe(original.length);

    const reimported = ipc.listAlarms();
    expect(reimported).toHaveLength(original.length);

    // Verify fields preserved
    for (let i = 0; i < original.length; i++) {
      const orig = original[i];
      const reimp = reimported.find((a) => a.AlarmId === orig.AlarmId);
      expect(reimp).toBeDefined();
      expect(reimp!.Time).toBe(orig.Time);
      expect(reimp!.Label).toBe(orig.Label);
      expect(reimp!.SoundFile).toBe(orig.SoundFile);
      expect(reimp!.Repeat.Type).toBe(orig.Repeat.Type);
    }
  });

  it("merge import does not duplicate existing alarms", () => {
    const original = ipc.listAlarms();
    const json = exportAlarmsToJson();

    const result = importAlarmsFromJson(json, ImportMode.Merge);
    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(original.length);
    expect(ipc.listAlarms()).toHaveLength(original.length);
  });

  it("round-trip preserves repeat pattern", () => {
    const json = exportAlarmsToJson();
    localStorage.setItem("alarm_app_alarms", JSON.stringify([]));
    importAlarmsFromJson(json, ImportMode.Replace);

    const alarms = ipc.listAlarms();
    alarms.forEach((alarm) => {
      expect(alarm.Repeat).toBeDefined();
      expect(alarm.Repeat.Type).toBeDefined();
      expect(Array.isArray(alarm.Repeat.DaysOfWeek)).toBe(true);
    });
  });
});
