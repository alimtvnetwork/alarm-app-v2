/**
 * Overlay Store Tests — Verifies alarm firing, snooze, and dismiss flows.
 */

import { describe, expect, it, beforeEach } from "vitest";
import { useOverlayStore } from "@/stores/overlay-store";
import type { Alarm } from "@/types/alarm";
import { DEFAULT_REPEAT_PATTERN, RepeatType } from "@/types/alarm";

function buildAlarm(overrides: Partial<Alarm> = {}): Alarm {
  return {
    AlarmId: crypto.randomUUID(),
    Time: "07:00",
    Date: null,
    Label: "Overlay Test",
    IsEnabled: true,
    IsPreviousEnabled: null,
    Repeat: { ...DEFAULT_REPEAT_PATTERN, Type: RepeatType.Daily },
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

describe("overlay-store", () => {
  beforeEach(() => {
    localStorage.clear();
    useOverlayStore.setState({
      isVisible: false,
      firingAlarm: null,
      snoozeState: null,
      firedAt: null,
    });
  });

  it("fireAlarm shows overlay with alarm data", async () => {
    const alarm = buildAlarm();
    await useOverlayStore.getState().fireAlarm(alarm);

    const state = useOverlayStore.getState();
    expect(state.isVisible).toBe(true);
    expect(state.firingAlarm?.AlarmId).toBe(alarm.AlarmId);
    expect(state.firedAt).toBeTruthy();
  });

  it("dismiss clears overlay state", async () => {
    const alarm = buildAlarm();
    await useOverlayStore.getState().fireAlarm(alarm);
    await useOverlayStore.getState().dismiss();

    const state = useOverlayStore.getState();
    expect(state.isVisible).toBe(false);
    expect(state.firingAlarm).toBeNull();
    expect(state.firedAt).toBeNull();
  });

  it("snooze hides overlay and increments count", async () => {
    const alarm = buildAlarm({ MaxSnoozeCount: 3 });
    await useOverlayStore.getState().fireAlarm(alarm);
    await useOverlayStore.getState().snooze();

    const state = useOverlayStore.getState();
    expect(state.isVisible).toBe(false);
    expect(state.snoozeState?.SnoozeCount).toBe(1);
  });

  it("snooze is blocked when MaxSnoozeCount is 0", async () => {
    const alarm = buildAlarm({ MaxSnoozeCount: 0 });
    await useOverlayStore.getState().fireAlarm(alarm);
    await useOverlayStore.getState().snooze();

    // Should still be visible (snooze was blocked)
    expect(useOverlayStore.getState().isVisible).toBe(true);
  });

  it("hide only hides without clearing state", async () => {
    const alarm = buildAlarm();
    await useOverlayStore.getState().fireAlarm(alarm);
    useOverlayStore.getState().hide();

    const state = useOverlayStore.getState();
    expect(state.isVisible).toBe(false);
    expect(state.firingAlarm).not.toBeNull();
  });
});
