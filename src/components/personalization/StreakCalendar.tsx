/**
 * StreakCalendar — 35-day heatmap showing alarm dismissal streak.
 * Reads alarm events from localStorage to compute daily dismiss counts.
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AlarmEventType } from "@/types/alarm";

interface DayCell {
  date: string;
  count: number;
  isToday: boolean;
}

const TOTAL_DAYS = 35;

const getIntensityClass = (count: number): string => {
  if (count === 0) return "bg-secondary";
  if (count === 1) return "bg-primary/30";
  if (count <= 3) return "bg-primary/55";
  return "bg-primary/85";
};

const loadDismissHistory = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem("alarm_events");
    if (!raw) return {};
    const events = JSON.parse(raw) as Array<{ EventType: string; FiredAt: string }>;
    const counts: Record<string, number> = {};
    for (const ev of events) {
      if (ev.EventType === AlarmEventType.Dismissed) {
        const day = ev.FiredAt.slice(0, 10);
        counts[day] = (counts[day] ?? 0) + 1;
      }
    }
    return counts;
  } catch {
    return {};
  }
};

const computeStreak = (history: Record<string, number>): number => {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if ((history[key] ?? 0) > 0) {
      streak++;
    } else if (i > 0) {
      break;
    } else {
      break;
    }
  }
  return streak;
};

const StreakCalendar = () => {
  const { t } = useTranslation();
  const history = useMemo(loadDismissHistory, []);
  const streak = useMemo(() => computeStreak(history), [history]);

  const days: DayCell[] = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const cells: DayCell[] = [];
    for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      cells.push({ date: key, count: history[key] ?? 0, isToday: key === todayStr });
    }
    return cells;
  }, [history]);

  const weekLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm font-heading">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {t("personalization.streakCalendar")}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-body text-primary">
            <Flame className="h-4 w-4" />
            <span>
              {streak} {t("personalization.dayStreak")}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Week day labels */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekLabels.map((label, i) => (
            <span key={i} className="text-center text-[10px] text-muted-foreground font-body">
              {label}
            </span>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.count} dismissed`}
              className={`aspect-square rounded-sm transition-colors ${getIntensityClass(day.count)} ${
                day.isToday ? "ring-1 ring-primary" : ""
              }`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground font-body">
          <span>{t("personalization.less")}</span>
          <div className="h-3 w-3 rounded-sm bg-secondary" />
          <div className="h-3 w-3 rounded-sm bg-primary/30" />
          <div className="h-3 w-3 rounded-sm bg-primary/55" />
          <div className="h-3 w-3 rounded-sm bg-primary/85" />
          <span>{t("personalization.more")}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCalendar;
