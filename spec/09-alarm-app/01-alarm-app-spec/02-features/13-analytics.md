# Analytics

**Version:** 1.1.0  
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

Analytics data stored in a dedicated SQLite table:

```sql
CREATE TABLE alarm_events (
  id TEXT PRIMARY KEY,
  alarm_id TEXT REFERENCES alarms(id) ON DELETE SET NULL,
  fired_at TEXT NOT NULL,         -- ISO 8601
  dismissed_at TEXT,              -- ISO 8601
  snooze_count INTEGER NOT NULL DEFAULT 0,
  challenge_type TEXT,
  challenge_solve_time_sec REAL,
  sleep_quality INTEGER,          -- 1-5
  mood TEXT
);
```

TypeScript interface (frontend):
```typescript
interface AlarmEvent {
  id: string;
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
| Data Model | `../01-fundamentals/01-data-model.md` |
