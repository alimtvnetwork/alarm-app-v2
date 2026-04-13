/**
 * Group CRUD tests — create, update, delete groups and alarm-group relationships.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { useAlarmStore } from "@/stores/alarm-store";

describe("Group CRUD Flow", () => {
  beforeEach(() => {
    localStorage.clear();
    useAlarmStore.setState({ alarms: [], groups: [], isLoading: false });
  });

  it("creates a group", async () => {
    const group = await useAlarmStore.getState().addGroup("Morning", "#FF6B6B");
    expect(group).not.toBeNull();
    expect(group!.Name).toBe("Morning");
    expect(group!.Color).toBe("#FF6B6B");
    expect(useAlarmStore.getState().groups).toHaveLength(1);
  });

  it("creates multiple groups with unique IDs", async () => {
    const g1 = await useAlarmStore.getState().addGroup("Morning", "#FF6B6B");
    const g2 = await useAlarmStore.getState().addGroup("Night", "#4A90D9");
    expect(g1!.AlarmGroupId).not.toBe(g2!.AlarmGroupId);
    expect(useAlarmStore.getState().groups).toHaveLength(2);
  });

  it("updates a group", async () => {
    const group = await useAlarmStore.getState().addGroup("Morning", "#FF6B6B");
    await useAlarmStore.getState().updateGroup({
      ...group!,
      Name: "Early Morning",
      Color: "#00FF00",
    });
    const updated = useAlarmStore.getState().groups[0];
    expect(updated.Name).toBe("Early Morning");
    expect(updated.Color).toBe("#00FF00");
  });

  it("deletes a group", async () => {
    const group = await useAlarmStore.getState().addGroup("Delete Me", "#000");
    expect(useAlarmStore.getState().groups).toHaveLength(1);
    await useAlarmStore.getState().deleteGroup(group!.AlarmGroupId);
    expect(useAlarmStore.getState().groups).toHaveLength(0);
  });

  it("nullifies alarm GroupId when group is deleted", async () => {
    const group = await useAlarmStore.getState().addGroup("Temp", "#FFF");
    const alarm = await useAlarmStore.getState().addAlarm({
      Time: "07:00",
      Label: "Grouped",
      GroupId: group!.AlarmGroupId,
    });
    expect(useAlarmStore.getState().alarms[0].GroupId).toBe(group!.AlarmGroupId);

    await useAlarmStore.getState().deleteGroup(group!.AlarmGroupId);
    expect(useAlarmStore.getState().alarms[0].GroupId).toBeNull();
  });
});
