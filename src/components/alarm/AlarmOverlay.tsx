/**
 * AlarmOverlay — Full-screen overlay when an alarm fires.
 */

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Moon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOverlayStore } from "@/stores/overlay-store";
import { ChallengeType, ChallengeDifficulty } from "@/types/alarm";
import { suggestDifficulty } from "@/lib/adaptive-challenge";
import MathChallenge from "./MathChallenge";

const AlarmOverlay = () => {
  const isVisible = useOverlayStore((s) => s.isVisible);
  const alarm = useOverlayStore((s) => s.firingAlarm);
  const snoozeState = useOverlayStore((s) => s.snoozeState);
  const snooze = useOverlayStore((s) => s.snooze);
  const dismiss = useOverlayStore((s) => s.dismiss);
  const { t } = useTranslation();

  const [showChallenge, setShowChallenge] = useState(false);
  const [autoDismissRemaining, setAutoDismissRemaining] = useState<number | null>(null);

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
    (solveTimeSec: number) => {
      dismiss(solveTimeSec);
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
      {autoDismissRemaining !== null && (
        <p className="absolute top-6 text-xs font-body opacity-60">
          {t("overlay.autoDismissIn", { time: formatCountdown(autoDismissRemaining) })}
        </p>
      )}

      <div className="mb-8 animate-pulse-glow">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
          <Bell className="h-12 w-12 text-primary" />
        </div>
      </div>

      <h1 className="text-7xl font-heading font-bold">{alarm.Time}</h1>

      {alarm.Label && (
        <p className="mt-3 text-xl font-body opacity-70">{alarm.Label}</p>
      )}

      {snoozeState && snoozeState.SnoozeCount > 0 && (
        <p className="mt-2 text-sm font-body opacity-50">
          {t("overlay.snoozedCount", {
            current: snoozeState.SnoozeCount,
            max: alarm.MaxSnoozeCount,
            remaining: snoozeRemaining,
          })}
        </p>
      )}

      {showChallenge ? (
        <div className="mt-10">
          <MathChallenge
            difficulty={suggestDifficulty(alarm.ChallengeDifficulty ?? ChallengeDifficulty.Easy)}
            onSolved={handleChallengeSolved}
          />
        </div>
      ) : (
        <div className="mt-12 flex gap-4 px-6 w-full max-w-xs">
          {canSnooze && (
            <Button
              onClick={snooze}
              variant="outline"
              size="lg"
              className="flex-1 h-16 flex-col gap-1 rounded-xl border-2 border-alarm-snooze text-alarm-snooze hover:bg-alarm-snooze/10"
            >
              <Moon className="h-5 w-5" />
              <span className="text-xs font-body">
                {t("overlay.snooze", { min: alarm.SnoozeDurationMin })}
              </span>
            </Button>
          )}

          <Button
            onClick={handleDismissClick}
            size="lg"
            className="flex-1 h-16 flex-col gap-1 rounded-xl bg-alarm-dismiss text-primary-foreground hover:bg-alarm-dismiss/90"
          >
            <X className="h-5 w-5" />
            <span className="text-xs font-body">{t("overlay.dismiss")}</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AlarmOverlay;
