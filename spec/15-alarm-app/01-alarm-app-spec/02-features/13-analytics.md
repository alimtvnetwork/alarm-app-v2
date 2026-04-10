# Analytics & Alarm History

**Version:** 1.3.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** Low  
**Priority:** P2 (History) / P3 (Reports)

---

## Keywords

`analytics`, `history`, `log`, `snooze`, `trends`, `reports`, `statistics`, `filter`, `csv-export`

---

## Description

Persistent log of every alarm event (fired, snoozed, dismissed, missed) with filtering, search, and CSV export. Plus visualization of wake-up patterns, snooze habits, and sleep trends.

---

## Alarm History Log (P2)

### Features

- Persistent log of every alarm event stored in `AlarmEvents` SQLite table
- Each event records: type, fired time, dismissed time, snooze count, challenge type/time
- **Filterable by:**
  - Date range (start/end date pickers)
  - Alarm group
  - Event type (fired, snoozed, dismissed, missed)
  - Specific alarm
- **Sortable by:** date (newest/oldest), alarm label, snooze count
- **Exportable as CSV** via native save dialog

### IPC Commands

| Command | Payload | Returns |
|---------|---------|---------|
| `get_alarm_history` | `{ Filter: HistoryFilter }` | `AlarmEvent[]` |
| `export_history_csv` | `{ Filter: HistoryFilter }` | `string` (file path) |
| `clear_history` | `{ Before?: string }` | `{ Deleted: number }` |

### HistoryFilter

```typescript
interface HistoryFilter {
  StartDate?: string;    // ISO 8601
  EndDate?: string;      // ISO 8601
  GroupId?: string;
  AlarmId?: string;
  EventType?: AlarmEventType;
  SortBy?: SortField;
  SortOrder?: SortOrder;
}
```

---

## Analytics Reports (P3)

### Wake-Up History

- Calendar/timeline showing every alarm fired
- Data: fire time, dismiss time, snooze count, challenge completion time
- Filter by date range, alarm, or group

### Snooze Frequency Report

- Charts: snooze frequency, average duration, worst offender alarms
- Trends over time (weekly/monthly)
- Goal: help users break snooze habits

### Sleep Duration Trends

- If bedtime reminders are used, calculate nightly sleep duration
- Weekly/monthly averages with trend lines
- Highlight unusually short or long nights

### Challenge Performance Stats

- Average solve time per challenge type
- Accuracy rate, improvement trends

---

## Data Storage

> **Single source of truth:** The canonical `AlarmEvents` schema is defined in `01-fundamentals/01-data-model.md`. Do not duplicate it here. Refer to that file for column names, types, and constraints.

**Table:** `AlarmEvents` (13 columns)  
**Key columns:** `AlarmEventId`, `AlarmId`, `Type`, `FiredAt`, `DismissedAt`, `SnoozeCount`, `ChallengeType`, `ChallengeSolveTimeSec`, `SleepQuality`, `Mood`, `AlarmLabelSnapshot`, `AlarmTimeSnapshot`, `Timestamp`

---

## Acceptance Criteria

- [ ] All alarm events (fired, snoozed, dismissed, missed) logged automatically
- [ ] History view filterable by date range, group, event type, and alarm
- [ ] History sortable by date, label, snooze count
- [ ] History exportable as CSV via native save dialog
- [ ] History clearable (all or before a date)
- [ ] Analytics reports show snooze trends and wake-up patterns

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Sleep & Wellness | `./11-sleep-wellness.md` |
| Snooze System | `./04-snooze-system.md` |
| Dismissal Challenges | `./06-dismissal-challenges.md` |
| Data Model | `../01-fundamentals/01-data-model.md` |
| Export/Import | `./10-export-import.md` |
| Domain Enums | `../01-fundamentals/01-data-model.md` → Domain Enums (`SortField`, `SortOrder`, `AlarmEventType`) |
| Coding Guidelines | `../../02-coding-guidelines/03-coding-guidelines-spec/` |
