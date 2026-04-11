/**
 * AlarmOverlay — Full-screen overlay when an alarm fires.
 * Dark charcoal background, rectangular side-by-side snooze/dismiss buttons,
 * "Snooze X of Y remaining" text, auto-dismiss countdown.
 */

import { useEffect, useState, useCallback } from "react";
import { Bell, Moon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOverlayStore } from "@/stores/overlay-store";
import { ChallengeType, ChallengeDifficulty } from "@/types/alarm";
import MathChallenge from "./MathChallenge";

const AlarmOverlay = () => {
  const isVisible = useOverlayStore((s) => s.isVisible);
  const alarm = useOverlayStore((s) => s.firingAlarm);
  const snoozeState = useOverlayStore((s) => s.snoozeState);
  const snooze = useOverlayStore((s) => s.snooze);
  const dismiss = useOverlayStore((s) => s.dismiss);

  const [showChallenge, setShowChallenge] = useState(false);
  const [autoDismissRemaining, setAutoDismissRemaining] = useState<number | null>(null);

  // Auto-dismiss countdown
  useEffect(() => {
    if (!isVisible || !alarm || alarm.AutoDismissMin <= 0) {
      setAutoDismissRemaining(null);
      return;
    }
    let remaining = alarm.AutoDismissMin * 60;
    setAutoDismissRemaining(remaining);

    const id = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(id);
        dismiss();
      } else {
        setAutoDismissRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [isVisible, alarm, dismiss]);

  // Reset challenge state when overlay opens
  useEffect(() => {
    if (isVisible) setShowChallenge(false);
  }, [isVisible]);

  const canSnooze = (() => {
    if (!alarm) return false;
    if (alarm.MaxSnoozeCount === 0) return false;
    if (snoozeState && snoozeState.SnoozeCount >= alarm.MaxSnoozeCount) return false;
    return true;
  })();

  const snoozeRemaining = alarm
    ? alarm.MaxSnoozeCount - (snoozeState?.SnoozeCount ?? 0)
    : 0;

  const handleDismissClick = useCallback(() => {
    if (alarm?.ChallengeType === ChallengeType.Math) {
      setShowChallenge(true);
    } else {
      dismiss();
    }
  }, [alarm, dismiss]);

  const handleChallengeSolved = useCallback(
    (_solveTimeSec: number) => {
      dismiss();
    },
    [dismiss]
  );

  const formatCountdown = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  if (!isVisible || !alarm) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#2a2420] text-[#f0ebe3]">
      {/* Auto-dismiss countdown */}
      {autoDismissRemaining !== null && (
        <p className="absolute top-6 text-xs font-body opacity-60">
          Auto-dismiss in {formatCountdown(autoDismissRemaining)}
        </p>
      )}

      {/* Alarm icon + animation */}
      <div className="mb-8 animate-pulse-glow">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
          <Bell className="h-12 w-12 text-primary" />
        </div>
      </div>

      {/* Time */}
      <h1 className="text-7xl font-heading font-bold">
        {alarm.Time}
      </h1>

      {/* Label */}
      {alarm.Label && (
        <p className="mt-3 text-xl font-body opacity-70">
          {alarm.Label}
        </p>
      )}

      {/* Snooze remaining */}
      {snoozeState && snoozeState.SnoozeCount > 0 && (
        <p className="mt-2 text-sm font-body opacity-50">
          Snooze {snoozeState.SnoozeCount} of {alarm.MaxSnoozeCount} · {snoozeRemaining} remaining
        </p>
      )}

      {/* Challenge or buttons */}
      {showChallenge ? (
        <div className="mt-10">
          <MathChallenge
            difficulty={alarm.ChallengeDifficulty ?? ChallengeDifficulty.Easy}
            onSolved={handleChallengeSolved}
          />
        </div>
      ) : (
        <div className="mt-12 flex gap-4 px-6 w-full max-w-xs">
          {/* Snooze — rectangular */}
          {canSnooze && (
            <Button
              onClick={snooze}
              variant="outline"
              size="lg"
              className="flex-1 h-16 flex-col gap-1 rounded-xl border-2 border-alarm-snooze text-alarm-snooze hover:bg-alarm-snooze/10"
            >
              <Moon className="h-5 w-5" />
              <span className="text-xs font-body">
                Snooze {alarm.SnoozeDurationMin}m
              </span>
            </Button>
          )}

          {/* Dismiss — rectangular */}
          <Button
            onClick={handleDismissClick}
            size="lg"
            className="flex-1 h-16 flex-col gap-1 rounded-xl bg-alarm-dismiss text-primary-foreground hover:bg-alarm-dismiss/90"
          >
            <X className="h-5 w-5" />
            <span className="text-xs font-body">Dismiss</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AlarmOverlay;
