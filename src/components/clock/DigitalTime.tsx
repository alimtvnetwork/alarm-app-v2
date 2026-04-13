/**
 * DigitalTime — Flip-clock style digital time display.
 * Shows DAY : HOURS : MINUTES : SECONDS on a dark card with AM/PM badge.
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/stores/settings-store";
import { useAlarmStore } from "@/stores/alarm-store";
import type { Alarm } from "@/types/alarm";

const DAY_LABELS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

interface FlipSegmentProps {
  value: string;
  label: string;
}

const FlipSegment = ({ value, label }: FlipSegmentProps) => (
  <div className="flex flex-col items-center gap-1.5">
    <span className="text-[2.5rem] sm:text-[3.25rem] font-heading font-extralight tracking-wider text-primary-foreground leading-none tabular-nums">
      {value}
    </span>
    <span className="text-[0.6rem] font-body font-medium tracking-[0.2em] uppercase text-primary-foreground/40">
      {label}
    </span>
  </div>
);

const Colon = () => (
  <div className="flex flex-col items-center gap-1.5 pt-0.5">
    <span className="text-[2rem] sm:text-[2.5rem] font-heading font-extralight text-primary-foreground/30 leading-none">
      :
    </span>
    <span className="text-[0.6rem] invisible">.</span>
  </div>
);

const DigitalTime = () => {
  const [now, setNow] = useState(new Date());
  const is24Hour = useSettingsStore((s) => s.settings.Is24Hour);
  const alarms = useAlarmStore((s) => s.alarms);
  const { t } = useTranslation();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const dayLabel = DAY_LABELS[now.getDay()];

  const displayHour = is24Hour ? String(h).padStart(2, "0") : String(h % 12 || 12).padStart(2, "0");
  const displayMin = String(m).padStart(2, "0");
  const displaySec = String(s).padStart(2, "0");
  const period = is24Hour ? null : (h >= 12 ? "PM" : "AM");

  const countdown = getCountdown(alarms, t);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Flip-clock card */}
      <div className="relative w-full rounded-2xl bg-foreground px-6 py-6 sm:px-10 sm:py-8 shadow-lg">
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <FlipSegment value={dayLabel} label={t("clock.dayLabel", "DAY")} />
          <Colon />
          <FlipSegment value={displayHour} label={t("clock.hoursLabel", "HOURS")} />
          <Colon />
          <FlipSegment value={displayMin} label={t("clock.minutesLabel", "MINUTES")} />
          <Colon />
          <FlipSegment value={displaySec} label={t("clock.secondsLabel", "SECONDS")} />
        </div>

        {/* AM/PM badge */}
        {period && (
          <div className="absolute top-3 right-3 rounded-md bg-primary/80 px-2 py-0.5">
            <span className="text-[0.65rem] font-heading font-semibold tracking-wider text-primary-foreground">
              {period}
            </span>
          </div>
        )}
      </div>

      {/* Date + countdown below the card */}
      <p className="text-sm text-muted-foreground font-body">
        {now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>
      {countdown && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-4 py-1.5">
          <span className="text-sm">⏰</span>
          <span className="text-xs font-body text-muted-foreground">{countdown}</span>
        </div>
      )}
    </div>
  );
};

function getCountdown(alarms: Alarm[], t: (key: string, opts?: Record<string, unknown>) => string): string | null {
  const now = Date.now();
  let minDiffMs = Infinity;

  for (const alarm of alarms) {
    if (!alarm.IsEnabled || !alarm.NextFireTime) continue;
    const diff = new Date(alarm.NextFireTime).getTime() - now;
    if (diff > 0 && diff < minDiffMs) minDiffMs = diff;
  }

  if (minDiffMs === Infinity) return null;

  const totalMin = Math.floor(minDiffMs / 60000);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;

  let timeParts: string[] = [];
  if (hours > 0) timeParts.push(t("clock.hours", { count: hours }));
  if (mins > 0) timeParts.push(t("clock.minutes", { count: mins }));
  if (timeParts.length === 0) timeParts.push(t("clock.minutes", { count: 0 }));

  return t("clock.alarmIn", { time: timeParts.join(` ${t("clock.and")} `) });
}

export default DigitalTime;
