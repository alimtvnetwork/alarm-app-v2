/**
 * NextFireTime — Compute the next fire time for an alarm.
 * Handles Once, Daily, and Weekly repeat patterns.
 */

import type { Alarm } from "@/types/alarm";
import { RepeatType } from "@/types/alarm";

export function computeNextFireTime(alarm: Alarm): string | null {
  if (!alarm.IsEnabled) return null;

  const [hours, minutes] = alarm.Time.split(":").map(Number);
  const now = new Date();

  const buildCandidate = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const addDays = (date: Date, days: number): Date => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  if (alarm.Repeat.Type === RepeatType.Once) {
    if (alarm.Date) {
      const target = new Date(`${alarm.Date}T${alarm.Time}:00`);
      return target > now ? target.toISOString() : null;
    }
    const today = buildCandidate(now);
    return today > now ? today.toISOString() : addDays(today, 1).toISOString();
  }

  if (alarm.Repeat.Type === RepeatType.Daily) {
    const today = buildCandidate(now);
    return today > now ? today.toISOString() : addDays(today, 1).toISOString();
  }

  if (alarm.Repeat.Type === RepeatType.Weekly) {
    const days = alarm.Repeat.DaysOfWeek;
    if (days.length === 0) return null;

    for (let offset = 0; offset <= 7; offset++) {
      const candidate = addDays(now, offset);
      const dayOfWeek = candidate.getDay();
      if (days.includes(dayOfWeek)) {
        const target = buildCandidate(candidate);
        if (target > now) return target.toISOString();
      }
    }
    return null;
  }

  return null;
}
