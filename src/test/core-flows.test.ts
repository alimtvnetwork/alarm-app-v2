/**
 * Integration tests for core alarm flows.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { useAlarmStore } from "@/stores/alarm-store";
import { useOverlayStore } from "@/stores/overlay-store";
import type { Alarm } from "@/types/alarm";
import { RepeatType, DEFAULT_REPEAT_PATTERN } from "@/types/alarm";

function buildAlarm(overrides: Partial<Alarm> = {}): Alarm {
  return {
    AlarmId: crypto.randomUUID(),
    Time: "07:00",
    Date: null,
    Label: "Test Alarm",
    IsEnabled: true,
    IsPreviousEnabled: null,
    Repeat: { ...DEFAULT_REPEAT_PATTERN, Type: RepeatType.Once },
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
    Position: 0,
    DeletedAt: null,
    CreatedAt: new Date().toISOString(),
    UpdatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("Create Alarm Flow", () => {
  beforeEach(() => {
    useAlarmStore.setState({ alarms: [], groups: [], isLoading: false });
    localStorage.clear();
  });

  it("creates alarm with correct defaults", async () => {
    const alarm = await useAlarmStore.getState().addAlarm({ Time: "08:30", Label: "Morning" });
    expect(alarm.Time).toBe("08:30");
    expect(alarm.Label).toBe("Morning");
    expect(alarm.IsEnabled).toBe(true);
    expect(alarm.SnoozeDurationMin).toBe(5);
    expect(useAlarmStore.getState().alarms).toHaveLength(1);
  });

  it("creates multiple alarms with unique IDs", async () => {
    const a1 = await useAlarmStore.getState().addAlarm({ Time: "07:00", Label: "First" });
    const a2 = await useAlarmStore.getState().addAlarm({ Time: "08:00", Label: "Second" });
    expect(a1.AlarmId).not.toBe(a2.AlarmId);
    expect(useAlarmStore.getState().alarms).toHaveLength(2);
  });
});

describe("Toggle Alarm Flow", () => {
  beforeEach(() => {
    localStorage.clear();
    useAlarmStore.setState({ alarms: [], groups: [], isLoading: false });
  });

  it("toggles alarm enabled state", async () => {
    const alarm = await useAlarmStore.getState().addAlarm({ Time: "07:00", Label: "Toggle" });
    await useAlarmStore.getState().toggleAlarm(alarm.AlarmId, false);
    expect(useAlarmStore.getState().alarms[0]?.IsEnabled).toBe(false);
    await useAlarmStore.getState().toggleAlarm(alarm.AlarmId, true);
    expect(useAlarmStore.getState().alarms[0]?.IsEnabled).toBe(true);
  });
});

describe("Duplicate Alarm Flow", () => {
  beforeEach(() => {
    localStorage.clear();
    useAlarmStore.setState({ alarms: [], groups: [], isLoading: false });
  });

  it("duplicates with new ID and same settings", async () => {
    const original = await useAlarmStore.getState().addAlarm({ Time: "06:00", Label: "Original" });
    const dup = await useAlarmStore.getState().duplicateAlarm(original.AlarmId);
    expect(dup).not.toBeNull();
    expect(dup!.AlarmId).not.toBe(original.AlarmId);
    expect(dup!.Time).toBe("06:00");
    expect(useAlarmStore.getState().alarms).toHaveLength(2);
  });
});

describe("Dismiss Alarm Flow", () => {
  beforeEach(() => {
    useOverlayStore.setState({ isVisible: false, firingAlarm: null, snoozeState: null, firedAt: null });
  });

  it("fires → shows overlay → dismiss clears", async () => {
    const alarm = buildAlarm({ Label: "Dismiss Test" });
    await useOverlayStore.getState().fireAlarm(alarm);
    expect(useOverlayStore.getState().isVisible).toBe(true);
    expect(useOverlayStore.getState().firingAlarm?.Label).toBe("Dismiss Test");

    await useOverlayStore.getState().dismiss();
    expect(useOverlayStore.getState().isVisible).toBe(false);
    expect(useOverlayStore.getState().firingAlarm).toBeNull();
  });
});

describe("Snooze Alarm Flow", () => {
  beforeEach(() => {
    useOverlayStore.setState({ isVisible: false, firingAlarm: null, snoozeState: null, firedAt: null });
  });

  it("snoozes alarm and hides overlay", async () => {
    const alarm = buildAlarm({ MaxSnoozeCount: 3 });
    await useOverlayStore.getState().fireAlarm(alarm);
    await useOverlayStore.getState().snooze();
    expect(useOverlayStore.getState().isVisible).toBe(false);
  });
});

describe("Delete Alarm Flow", () => {
  beforeEach(() => {
    localStorage.clear();
    useAlarmStore.setState({ alarms: [], groups: [], isLoading: false });
  });

  it("deletes alarm from store", async () => {
    const alarm = await useAlarmStore.getState().addAlarm({ Time: "09:00", Label: "Delete Me" });
    expect(useAlarmStore.getState().alarms).toHaveLength(1);
    await useAlarmStore.getState().deleteAlarm(alarm.AlarmId);
    expect(useAlarmStore.getState().alarms).toHaveLength(0);
  });
});
