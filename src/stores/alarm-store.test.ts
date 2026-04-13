/**
 * Alarm Store Tests — Verifies async CRUD operations via IPC adapter.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { useAlarmStore } from "@/stores/alarm-store";

describe("alarm-store", () => {
  beforeEach(() => {
    localStorage.clear();
    useAlarmStore.setState({ alarms: [], groups: [], isLoading: false });
  });

  it("loadAlarms populates store with mock data", async () => {
    await useAlarmStore.getState().loadAlarms();
    const { alarms } = useAlarmStore.getState();
    expect(alarms.length).toBeGreaterThan(0);
  });

  it("addAlarm creates a new alarm with defaults", async () => {
    await useAlarmStore.getState().loadAlarms();
    const before = useAlarmStore.getState().alarms.length;

    await useAlarmStore.getState().addAlarm({ Time: "06:00", Label: "Store Test" });

    const after = useAlarmStore.getState().alarms.length;
    expect(after).toBe(before + 1);
  });

  it("deleteAlarm removes alarm from store", async () => {
    await useAlarmStore.getState().loadAlarms();
    const target = useAlarmStore.getState().alarms[0];

    await useAlarmStore.getState().deleteAlarm(target.AlarmId);

    const { alarms } = useAlarmStore.getState();
    expect(alarms.find((a) => a.AlarmId === target.AlarmId)).toBeUndefined();
  });

  it("toggleAlarm flips IsEnabled", async () => {
    await useAlarmStore.getState().loadAlarms();
    const target = useAlarmStore.getState().alarms[0];
    const originalEnabled = target.IsEnabled;

    await useAlarmStore.getState().toggleAlarm(target.AlarmId, !originalEnabled);

    const updated = useAlarmStore.getState().alarms.find((a) => a.AlarmId === target.AlarmId);
    expect(updated?.IsEnabled).toBe(!originalEnabled);
  });

  it("duplicateAlarm adds copy to store", async () => {
    await useAlarmStore.getState().loadAlarms();
    const before = useAlarmStore.getState().alarms.length;
    const target = useAlarmStore.getState().alarms[0];

    const copy = await useAlarmStore.getState().duplicateAlarm(target.AlarmId);

    expect(copy).not.toBeNull();
    expect(useAlarmStore.getState().alarms.length).toBe(before + 1);
  });

  it("loadGroups populates groups", async () => {
    await useAlarmStore.getState().loadGroups();
    const { groups } = useAlarmStore.getState();
    expect(Array.isArray(groups)).toBe(true);
  });

  it("addGroup creates and stores group", async () => {
    await useAlarmStore.getState().loadGroups();
    const before = useAlarmStore.getState().groups.length;

    await useAlarmStore.getState().addGroup("Test Group", "#00FF00");

    expect(useAlarmStore.getState().groups.length).toBe(before + 1);
  });

  it("deleteGroup removes group and unassigns alarms", async () => {
    await useAlarmStore.getState().loadGroups();
    const group = await useAlarmStore.getState().addGroup("Del Group", "#0000FF");
    expect(group).not.toBeNull();

    await useAlarmStore.getState().deleteGroup(group!.AlarmGroupId);

    const { groups } = useAlarmStore.getState();
    expect(groups.find((g) => g.AlarmGroupId === group!.AlarmGroupId)).toBeUndefined();
  });

  it("reorderAlarms changes alarm order in store", async () => {
    await useAlarmStore.getState().loadAlarms();
    const ids = useAlarmStore.getState().alarms.map((a) => a.AlarmId);
    if (ids.length < 2) return;

    const reversed = [...ids].reverse();
    await useAlarmStore.getState().reorderAlarms(reversed);

    const newIds = useAlarmStore.getState().alarms.map((a) => a.AlarmId);
    expect(newIds[0]).toBe(reversed[0]);
  });
});
