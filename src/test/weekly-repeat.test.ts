/**
 * Weekly repeat and alarm update tests.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { useAlarmStore } from "@/stores/alarm-store";
import { RepeatType } from "@/types/alarm";

describe("Weekly Repeat Alarm", () => {
  beforeEach(() => {
    localStorage.clear();
    useAlarmStore.setState({ alarms: [], groups: [], isLoading: false });
  });

  it("creates alarm with weekly repeat and specific days", async () => {
    const alarm = await useAlarmStore.getState().addAlarm({
      Time: "06:30",
      Label: "Gym Days",
      Repeat: {
        Type: RepeatType.Weekly,
        DaysOfWeek: [1, 3, 5], // Mon, Wed, Fri
        IntervalMinutes: 0,
        CronExpression: "",
      },
    });

    expect(alarm.Repeat.Type).toBe(RepeatType.Weekly);
    expect(alarm.Repeat.DaysOfWeek).toEqual([1, 3, 5]);
  });

  it("creates alarm with daily repeat", async () => {
    const alarm = await useAlarmStore.getState().addAlarm({
      Time: "07:00",
      Label: "Daily Wake",
      Repeat: {
        Type: RepeatType.Daily,
        DaysOfWeek: [],
        IntervalMinutes: 0,
        CronExpression: "",
      },
    });

    expect(alarm.Repeat.Type).toBe(RepeatType.Daily);
  });

  it("updates alarm time and label", async () => {
    const alarm = await useAlarmStore.getState().addAlarm({
      Time: "07:00",
      Label: "Original",
    });

    await useAlarmStore.getState().updateAlarm({
      ...alarm,
      Time: "08:30",
      Label: "Updated",
      UpdatedAt: new Date().toISOString(),
    });

    const updated = useAlarmStore.getState().alarms[0];
    expect(updated.Time).toBe("08:30");
    expect(updated.Label).toBe("Updated");
  });

  it("updates alarm repeat type from once to weekly", async () => {
    const alarm = await useAlarmStore.getState().addAlarm({
      Time: "07:00",
      Label: "Switch Repeat",
    });
    expect(alarm.Repeat.Type).toBe(RepeatType.Once);

    await useAlarmStore.getState().updateAlarm({
      ...alarm,
      Repeat: {
        Type: RepeatType.Weekly,
        DaysOfWeek: [0, 6], // Weekends
        IntervalMinutes: 0,
        CronExpression: "",
      },
      UpdatedAt: new Date().toISOString(),
    });

    const updated = useAlarmStore.getState().alarms[0];
    expect(updated.Repeat.Type).toBe(RepeatType.Weekly);
    expect(updated.Repeat.DaysOfWeek).toEqual([0, 6]);
  });
});
