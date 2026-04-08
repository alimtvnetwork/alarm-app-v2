# Analytics

**Version:** 1.0.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** Low  
**Priority:** P3 — Future

---

## Keywords

`analytics`, `history`, `snooze`, `trends`, `reports`, `statistics`

---

## Description

Tracking and visualization of wake-up patterns, snooze habits, and sleep duration trends.

---

## Features

### Wake-Up History (P3)

- Calendar/timeline showing every alarm fired
- Data: fire time, dismiss time, snooze count, challenge completion time
- Filter by date range, alarm, or group

### Snooze Frequency Report (P3)

- Charts: snooze frequency, average duration, worst offender alarms
- Trends over time (weekly/monthly)
- Goal: help users break snooze habits

### Sleep Duration Trends (P3)

- If bedtime reminders are used, calculate nightly sleep duration
- Weekly/monthly averages with trend lines
- Highlight unusually short or long nights

### Challenge Performance Stats (P3)

- Average solve time per challenge type
- Accuracy rate, improvement trends
- Leaderboard-style gamification

---

## Data Storage

All analytics data stored in localStorage under `alarm-analytics`:
```typescript
interface AlarmEvent {
  alarmId: string;
  firedAt: string;       // ISO 8601
  dismissedAt: string;   // ISO 8601
  snoozeCount: number;
  challengeType?: string;
  challengeSolveTimeSec?: number;
  sleepQuality?: number; // 1-5
  mood?: string;
}
```

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Sleep & Wellness | `./11-sleep-wellness.md` |
| Snooze System | `./04-snooze-system.md` |
| Dismissal Challenges | `./06-dismissal-challenges.md` |
