/**
 * AlarmOverlay — Full-screen overlay when an alarm fires.
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Moon, X, Volume, Volume1, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOverlayStore } from "@/stores/overlay-store";
import { ChallengeType, ChallengeDifficulty } from "@/types/alarm";
import { suggestDifficulty } from "@/lib/adaptive-challenge";
import MathChallenge from "./MathChallenge";
import TypingChallenge from "./TypingChallenge";

const AlarmOverlay = () => {
  const isVisible = useOverlayStore((s) => s.isVisible);
  const alarm = useOverlayStore((s) => s.firingAlarm);
  const snoozeState = useOverlayStore((s) => s.snoozeState);
  const snooze = useOverlayStore((s) => s.snooze);
  const dismiss = useOverlayStore((s) => s.dismiss);
  const { t } = useTranslation();

  const [showChallenge, setShowChallenge] = useState(false);
  const [autoDismissRemaining, setAutoDismissRemaining] = useState<number | null>(null);
  const [volumePercent, setVolumePercent] = useState(0);

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
    if (!isVisible) { setVolumePercent(0); return; }
    if (!alarm?.IsGradualVolume) { setVolumePercent(100); return; }

    const dur = alarm.GradualVolumeDurationSec || 30;
    const start = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      const pct = Math.min(100, Math.round((elapsed / dur) * 100));
      setVolumePercent(pct);
      if (pct < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isVisible, alarm]);

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
    if (alarm?.ChallengeType === ChallengeType.Math || alarm?.ChallengeType === ChallengeType.Typing) {
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
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={`Alarm: ${alarm.Label || alarm.Time}`}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "hsl(20 14% 10%)" }}
    >
      {/* Card container */}
      <div className="relative flex flex-col items-center justify-center w-[340px] h-[500px] rounded-3xl border border-border/20 bg-card/40 backdrop-blur-sm shadow-2xl">
        {autoDismissRemaining !== null && (
          <p className="absolute top-5 text-xs font-body text-muted-foreground">
            {t("overlay.autoDismissIn", { time: formatCountdown(autoDismissRemaining) })}
          </p>
        )}

        {/* Concentric ripple rings + bell */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute w-64 h-64 rounded-full border border-primary/10" />
          <div className="absolute w-48 h-48 rounded-full border border-primary/15" />
          <div className="absolute w-32 h-32 rounded-full border border-primary/20" />
          <div className="animate-pulse-glow">
            <Bell className="h-12 w-12 text-primary/70" />
          </div>
        </div>

        {alarm.IsGradualVolume && (
          <div className="mb-3 flex items-center gap-2 text-xs font-body text-muted-foreground">
            {volumePercent < 33 ? <Volume className="h-4 w-4" /> : volumePercent < 66 ? <Volume1 className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <div className="w-20 h-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${volumePercent}%` }} />
            </div>
            <span>{volumePercent}%</span>
          </div>
        )}

        {/* Time */}
        <h1 className="text-6xl font-heading font-bold tracking-tight text-foreground">
          {alarm.Time}
        </h1>

        {/* Label */}
        {alarm.Label && (
          <p className="mt-2 text-lg font-body text-muted-foreground">{alarm.Label}</p>
        )}

        {/* Buttons or Challenge */}
        {showChallenge ? (
          <div className="mt-8 w-full flex justify-center px-4">
            {alarm.ChallengeType === ChallengeType.Typing ? (
              <TypingChallenge onSolved={handleChallengeSolved} />
            ) : (
              <MathChallenge
                difficulty={suggestDifficulty(alarm.ChallengeDifficulty ?? ChallengeDifficulty.Easy)}
                onSolved={handleChallengeSolved}
              />
            )}
          </div>
        ) : (
          <div className="mt-10 flex gap-3 w-full max-w-[300px] px-4">
            {canSnooze && (
              <button
                onClick={snooze}
                className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl border border-primary/30 bg-primary/10 text-primary font-body text-sm font-medium transition-colors hover:bg-primary/20"
              >
                <Moon className="h-4 w-4" />
                {t("overlay.snooze", { min: alarm.SnoozeDurationMin })}
              </button>
            )}
            <button
              onClick={handleDismissClick}
              className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl bg-primary text-primary-foreground font-body text-sm font-medium transition-colors hover:bg-primary/90"
            >
              <X className="h-4 w-4" />
              {t("overlay.dismiss")}
            </button>
          </div>
        )}

        {/* Snooze count */}
        {snoozeState && snoozeState.SnoozeCount > 0 && (
          <p className="mt-4 text-xs font-body text-muted-foreground/60">
            {t("overlay.snoozedCount", {
              current: snoozeState.SnoozeCount,
              max: alarm.MaxSnoozeCount,
              remaining: snoozeRemaining,
            })}
          </p>
        )}
      </div>
    </div>
  );
};

export default AlarmOverlay;
