/**
 * Integration tests for core alarm flows:
 * - Create alarm via store
 * - Toggle alarm on/off
 * - Duplicate alarm
 * - Dismiss alarm via overlay
 * - Snooze alarm via overlay
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
    const store = useAlarmStore.getState();
    const alarm = await store.addAlarm({ Time: "08:30", Label: "Morning" });

    expect(alarm.Time).toBe("08:30");
    expect(alarm.Label).toBe("Morning");
    expect(alarm.IsEnabled).toBe(true);
    expect(alarm.SnoozeDurationMin).toBe(5);
    expect(alarm.MaxSnoozeCount).toBe(3);
    expect(alarm.SoundFile).toBe("classic-beep");
    expect(alarm.Repeat.Type).toBe(RepeatType.Once);

    const alarms = useAlarmStore.getState().alarms;
    expect(alarms).toHaveLength(1);
    expect(alarms[0].AlarmId).toBe(alarm.AlarmId);
  });

  it("creates multiple alarms with unique IDs", async () => {
    const store = useAlarmStore.getState();
    const a1 = await store.addAlarm({ Time: "07:00", Label: "First" });
    const a2 = await store.addAlarm({ Time: "08:00", Label: "Second" });

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
    const store = useAlarmStore.getState();
    const alarm = await store.addAlarm({ Time: "07:00", Label: "Toggle Test" });

    await useAlarmStore.getState().toggleAlarm(alarm.AlarmId, false);
    const updated = useAlarmStore.getState().alarms.find((a) => a.AlarmId === alarm.AlarmId);
    expect(updated?.IsEnabled).toBe(false);

    await useAlarmStore.getState().toggleAlarm(alarm.AlarmId, true);
    const restored = useAlarmStore.getState().alarms.find((a) => a.AlarmId === alarm.AlarmId);
    expect(restored?.IsEnabled).toBe(true);
  });
});

describe("Duplicate Alarm Flow", () => {
  beforeEach(() => {
    localStorage.clear();
    useAlarmStore.setState({ alarms: [], groups: [], isLoading: false });
  });

  it("duplicates alarm with new ID and same settings", async () => {
    const store = useAlarmStore.getState();
    const original = await store.addAlarm({ Time: "06:00", Label: "Original" });

    const duplicate = await useAlarmStore.getState().duplicateAlarm(original.AlarmId);
    expect(duplicate).not.toBeNull();
    expect(duplicate!.AlarmId).not.toBe(original.AlarmId);
    expect(duplicate!.Time).toBe("06:00");
    expect(duplicate!.SoundFile).toBe(original.SoundFile);
    expect(useAlarmStore.getState().alarms).toHaveLength(2);
  });
});

describe("Dismiss Alarm Flow", () => {
  beforeEach(() => {
    useOverlayStore.setState({
      isVisible: false,
      firingAlarm: null,
      snoozeState: null,
      firedAt: null,
    });
  });

  it("fires alarm → shows overlay → dismiss clears it", async () => {
    const alarm = buildAlarm({ Label: "Dismiss Test" });
    await useOverlayStore.getState().fireAlarm(alarm);

    const fired = useOverlayStore.getState();
    expect(fired.isVisible).toBe(true);
    expect(fired.firingAlarm?.Label).toBe("Dismiss Test");

    await useOverlayStore.getState().dismiss();

    const dismissed = useOverlayStore.getState();
    expect(dismissed.isVisible).toBe(false);
    expect(dismissed.firingAlarm).toBeNull();
  });
});

describe("Snooze Alarm Flow", () => {
  beforeEach(() => {
    useOverlayStore.setState({
      isVisible: false,
      firingAlarm: null,
      snoozeState: null,
      firedAt: null,
    });
  });

  it("snoozes alarm and hides overlay", async () => {
    const alarm = buildAlarm({ MaxSnoozeCount: 3 });
    await useOverlayStore.getState().fireAlarm(alarm);
    await useOverlayStore.getState().snooze();

    const state = useOverlayStore.getState();
    expect(state.isVisible).toBe(false);
  });
});

describe("Delete Alarm Flow", () => {
  beforeEach(() => {
    localStorage.clear();
    useAlarmStore.setState({ alarms: [], groups: [], isLoading: false });
  });

  it("deletes alarm from store", async () => {
    const store = useAlarmStore.getState();
    const alarm = await store.addAlarm({ Time: "09:00", Label: "Delete Me" });
    expect(useAlarmStore.getState().alarms).toHaveLength(1);

    await useAlarmStore.getState().deleteAlarm(alarm.AlarmId);
    expect(useAlarmStore.getState().alarms).toHaveLength(0);
  });
});
