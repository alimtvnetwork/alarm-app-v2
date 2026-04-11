/**
 * DigitalTime — Large HH:MM:SS digital time display with date and next alarm countdown pill.
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/stores/settings-store";
import { useAlarmStore } from "@/stores/alarm-store";
import type { Alarm } from "@/types/alarm";

const DigitalTime = () => {
  const [now, setNow] = useState(new Date());
  const is24Hour = useSettingsStore((s) => s.settings.Is24Hour);
  const alarms = useAlarmStore((s) => s.alarms);
  const { t } = useTranslation();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatTime = (date: Date): string => {
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    const sec = String(s).padStart(2, "0");
    if (is24Hour) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec}`;
    }
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")}:${sec}`;
  };

  const period = is24Hour ? null : (now.getHours() >= 12 ? "PM" : "AM");

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const countdown = getCountdown(alarms, t);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-baseline">
        <span className="text-[2.75rem] font-heading font-light tracking-tight text-foreground leading-none">
          {formatTime(now)}
        </span>
        {period && (
          <span className="text-base font-heading font-medium text-muted-foreground ml-1">
            {period}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground font-body">{dateStr}</p>
      {countdown && (
        <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-4 py-1.5">
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
