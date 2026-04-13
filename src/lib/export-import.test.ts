/**
 * Export/Import Tests — Verifies JSON export format and import merge/replace modes.
 */

import { describe, expect, it, beforeEach, vi } from "vitest";
import { importAlarmsFromJson } from "@/lib/export-import";
import { ImportMode } from "@/types/alarm";
import * as ipc from "@/lib/mock-ipc";

describe("export-import", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("importAlarmsFromJson in Merge mode skips existing IDs", () => {
    const existing = ipc.listAlarms();
    const json = JSON.stringify(existing);

    const result = importAlarmsFromJson(json, ImportMode.Merge);
    expect(result.skipped).toBe(existing.length);
    expect(result.imported).toBe(0);
  });

  it("importAlarmsFromJson in Merge mode adds new alarms", () => {
    const newAlarm = {
      ...ipc.listAlarms()[0],
      AlarmId: "import-test-new-id",
      Label: "Imported",
    };
    const json = JSON.stringify([newAlarm]);

    const result = importAlarmsFromJson(json, ImportMode.Merge);
    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(0);
  });

  it("importAlarmsFromJson in Replace mode replaces all alarms", () => {
    const before = ipc.listAlarms().length;
    expect(before).toBeGreaterThan(0);

    const newAlarms = [
      { ...ipc.listAlarms()[0], AlarmId: "replace-1", Label: "Replaced" },
    ];
    const json = JSON.stringify(newAlarms);

    const result = importAlarmsFromJson(json, ImportMode.Replace);
    expect(result.imported).toBe(1);
  });

  it("importAlarmsFromJson throws on invalid input", () => {
    expect(() => importAlarmsFromJson("{}", ImportMode.Merge)).toThrow(
      "Invalid format"
    );
  });

  it("importAlarmsFromJson throws on malformed JSON", () => {
    expect(() => importAlarmsFromJson("not json", ImportMode.Merge)).toThrow();
  });
});
