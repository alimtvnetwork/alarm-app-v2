/**
 * Challenge activation tests — verify challenge type and difficulty settings.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { useAlarmStore } from "@/stores/alarm-store";
import { useOverlayStore } from "@/stores/overlay-store";
import { ChallengeType, ChallengeDifficulty, RepeatType, DEFAULT_REPEAT_PATTERN } from "@/types/alarm";
import type { Alarm } from "@/types/alarm";

function buildAlarm(overrides: Partial<Alarm> = {}): Alarm {
  return {
    AlarmId: crypto.randomUUID(),
    Time: "07:00",
    Date: null,
    Label: "Challenge Test",
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

describe("Challenge Activation", () => {
  beforeEach(() => {
    localStorage.clear();
    useAlarmStore.setState({ alarms: [], groups: [], isLoading: false });
  });

  it("creates alarm with math challenge", async () => {
    const alarm = await useAlarmStore.getState().addAlarm({
      Time: "07:00",
      Label: "Math Morning",
      ChallengeType: ChallengeType.Math,
      ChallengeDifficulty: ChallengeDifficulty.Medium,
    });

    expect(alarm.ChallengeType).toBe(ChallengeType.Math);
    expect(alarm.ChallengeDifficulty).toBe(ChallengeDifficulty.Medium);
  });

  it("creates alarm with typing challenge", async () => {
    const alarm = await useAlarmStore.getState().addAlarm({
      Time: "06:00",
      Label: "Type to wake",
      ChallengeType: ChallengeType.Typing,
    });

    expect(alarm.ChallengeType).toBe(ChallengeType.Typing);
  });

  it("creates alarm with no challenge (null)", async () => {
    const alarm = await useAlarmStore.getState().addAlarm({
      Time: "08:00",
      Label: "No Challenge",
      ChallengeType: null,
    });

    expect(alarm.ChallengeType).toBeNull();
  });

  it("updates alarm to add challenge", async () => {
    const alarm = await useAlarmStore.getState().addAlarm({
      Time: "07:00",
      Label: "Add Challenge Later",
    });
    expect(alarm.ChallengeType).toBeNull();

    await useAlarmStore.getState().updateAlarm({
      ...alarm,
      ChallengeType: ChallengeType.Memory,
      ChallengeDifficulty: ChallengeDifficulty.Hard,
      UpdatedAt: new Date().toISOString(),
    });

    const updated = useAlarmStore.getState().alarms[0];
    expect(updated.ChallengeType).toBe(ChallengeType.Memory);
    expect(updated.ChallengeDifficulty).toBe(ChallengeDifficulty.Hard);
  });

  it("fires alarm with challenge — overlay shows challenge type", async () => {
    useOverlayStore.setState({ isVisible: false, firingAlarm: null, snoozeState: null, firedAt: null });

    const alarm = buildAlarm({
      ChallengeType: ChallengeType.Math,
      ChallengeDifficulty: ChallengeDifficulty.Easy,
    });
    await useOverlayStore.getState().fireAlarm(alarm);

    const state = useOverlayStore.getState();
    expect(state.isVisible).toBe(true);
    expect(state.firingAlarm?.ChallengeType).toBe(ChallengeType.Math);
  });
});
