/**
 * AlarmOverlay — Full-screen overlay when an alarm fires.
 * Shows time, label, snooze/dismiss buttons, optional math challenge,
 * and auto-dismiss countdown.
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
      {/* Auto-dismiss countdown */}
      {autoDismissRemaining !== null && (
        <p className="absolute top-6 text-xs text-muted-foreground font-body">
          Auto-dismiss in {formatCountdown(autoDismissRemaining)}
        </p>
      )}

      {/* Alarm icon + animation */}
      <div className="mb-6 animate-pulse-glow">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
          <Bell className="h-10 w-10 text-primary" />
        </div>
      </div>

      {/* Time */}
      <h1 className="text-6xl font-heading font-bold text-foreground">
        {alarm.Time}
      </h1>

      {/* Label */}
      {alarm.Label && (
        <p className="mt-2 text-lg font-body text-muted-foreground">
          {alarm.Label}
        </p>
      )}

      {/* Snooze count */}
      {snoozeState && snoozeState.SnoozeCount > 0 && (
        <p className="mt-1 text-xs font-body text-muted-foreground">
          Snoozed {snoozeState.SnoozeCount}/{alarm.MaxSnoozeCount} times
        </p>
      )}

      {/* Challenge or buttons */}
      {showChallenge ? (
        <div className="mt-8">
          <MathChallenge
            difficulty={alarm.ChallengeDifficulty ?? ChallengeDifficulty.Easy}
            onSolved={handleChallengeSolved}
          />
        </div>
      ) : (
        <div className="mt-10 flex gap-6">
          {/* Snooze */}
          {canSnooze && (
            <Button
              onClick={snooze}
              variant="outline"
              size="lg"
              className="flex h-20 w-20 flex-col items-center gap-1 rounded-full border-2 border-alarm-snooze text-alarm-snooze hover:bg-alarm-snooze/10"
            >
              <Moon className="h-6 w-6" />
              <span className="text-[10px] font-body">
                {alarm.SnoozeDurationMin}m
              </span>
            </Button>
          )}

          {/* Dismiss */}
          <Button
            onClick={handleDismissClick}
            size="lg"
            className="flex h-20 w-20 flex-col items-center gap-1 rounded-full bg-alarm-dismiss text-primary-foreground hover:bg-alarm-dismiss/90"
          >
            <X className="h-6 w-6" />
            <span className="text-[10px] font-body">Dismiss</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AlarmOverlay;
