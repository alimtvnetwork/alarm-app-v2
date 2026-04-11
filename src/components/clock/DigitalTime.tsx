/**
 * DigitalTime — Large HH:MM:SS digital time display with date and next alarm countdown.
 */

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { useAlarmStore } from "@/stores/alarm-store";

function getNextAlarmCountdown(alarms: { Time: string; IsEnabled: boolean }[]): string | null {
  const enabled = alarms.filter((a) => a.IsEnabled);
  if (enabled.length === 0) return null;

  const now = new Date();
  let minDiffMs = Infinity;

  for (const alarm of enabled) {
    const [h, m] = alarm.Time.split(":").map(Number);
    const target = new Date(now);
    target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const diff = target.getTime() - now.getTime();
    if (diff < minDiffMs) minDiffMs = diff;
  }

  if (minDiffMs === Infinity) return null;

  const totalMin = Math.floor(minDiffMs / 60000);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;

  if (hours === 0) return `Alarm in ${mins}m`;
  return `Alarm in ${hours}h ${mins}m`;
}

const DigitalTime = () => {
  const [now, setNow] = useState(new Date());
  const is24Hour = useSettingsStore((s) => s.settings.Is24Hour);
  const alarms = useAlarmStore((s) => s.alarms);

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

  const countdown = getNextAlarmCountdown(alarms);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-baseline gap-1">
        <span className="text-5xl font-heading font-light tracking-tight text-foreground">
          {formatTime(now)}
        </span>
        {period && (
          <span className="text-lg font-heading font-medium text-muted-foreground">
            {period}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground font-body">{dateStr}</p>
      {countdown && (
        <p className="mt-1 text-xs font-body text-primary">{countdown}</p>
      )}
    </div>
  );
};

export default DigitalTime;
