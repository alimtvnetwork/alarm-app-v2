/**
 * AlarmTestButtons — Quick-test buttons (5s, 10s, 15s) that fire the alarm overlay
 * after a countdown, for testing alarm firing without waiting for a real schedule.
 */

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Timer } from "lucide-react";
import { useOverlayStore } from "@/stores/overlay-store";
import type { Alarm } from "@/types/alarm";
import { RepeatType } from "@/types/alarm";

const TEST_DURATIONS = [5, 10, 15] as const;

function buildTestAlarm(seconds: number): Alarm {
  const now = new Date();
  const fireAt = new Date(now.getTime() + seconds * 1000);
  const hh = String(fireAt.getHours()).padStart(2, "0");
  const mm = String(fireAt.getMinutes()).padStart(2, "0");

  return {
    AlarmId: `test-${seconds}s-${Date.now()}`,
    Time: `${hh}:${mm}`,
    Date: null,
    Label: `Test alarm (${seconds}s)`,
    IsEnabled: true,
    IsPreviousEnabled: null,
    Repeat: { Type: RepeatType.Once, DaysOfWeek: [], IntervalMinutes: 0, CronExpression: "" },
    GroupId: null,
    SnoozeDurationMin: 1,
    MaxSnoozeCount: 1,
    SoundFile: "classic-beep",
    IsVibrationEnabled: false,
    IsGradualVolume: false,
    GradualVolumeDurationSec: 30,
    AutoDismissMin: 0,
    ChallengeType: null,
    ChallengeDifficulty: null,
    ChallengeShakeCount: null,
    ChallengeStepCount: null,
    NextFireTime: fireAt.toISOString(),
    Position: 0,
    DeletedAt: null,
    CreatedAt: now.toISOString(),
    UpdatedAt: now.toISOString(),
  };
}

const AlarmTestButtons = () => {
  const fireAlarm = useOverlayStore((s) => s.fireAlarm);
  const { t } = useTranslation();
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTest = (seconds: number) => {
    // Clear any existing timer
    if (timerRef.current) clearInterval(timerRef.current);

    setActiveTimer(seconds);
    setRemaining(seconds);

    const endTime = Date.now() + seconds * 1000;

    timerRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setRemaining(left);

      if (left <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setActiveTimer(null);
        fireAlarm(buildTestAlarm(seconds));
      }
    }, 200);
  };

  const cancelTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setActiveTimer(null);
    setRemaining(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-md">
      <div className="mb-3 flex items-center gap-2">
        <Timer className="h-4 w-4 text-primary" />
        <span className="text-sm font-heading font-semibold text-foreground">
          Quick Test
        </span>
      </div>

      <div className="flex gap-2">
        {TEST_DURATIONS.map((sec) => {
          const isActive = activeTimer === sec;
          return (
            <button
              key={sec}
              onClick={() => (isActive ? cancelTest() : startTest(sec))}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-body font-medium transition-all ${
                isActive
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {isActive ? `${remaining}s` : `${sec}s`}
            </button>
          );
        })}
      </div>

      {activeTimer !== null && (
        <p className="mt-2 text-center text-xs text-muted-foreground animate-pulse">
          Alarm will fire in {remaining} second{remaining !== 1 ? "s" : ""}…
        </p>
      )}
    </div>
  );
};

export default AlarmTestButtons;
