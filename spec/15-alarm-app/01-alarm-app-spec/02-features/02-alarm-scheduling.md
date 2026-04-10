# Alarm Scheduling

**Version:** 2.2.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 — Must Have  
**Resolves:** CG-008, CG-011

---

## Keywords

`scheduling`, `recurring`, `repeat`, `one-time`, `daily`, `weekly`, `interval`, `cron`, `repeat-pattern`

---
---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ✅ |


## Description

Alarms use a `RepeatPattern` object (defined in `01-data-model.md`) to control scheduling. Five repeat types are supported:

| Type | Behavior | `RepeatPattern` Fields Used |
|------|----------|---------------------------|
| `Once` | Fires once at `Date` + `Time`, then auto-disables (`IsEnabled = 0`) | `Type = RepeatType::Once` |
| `Daily` | Fires every day at `Time` | `Type = RepeatType::Daily` |
| `Weekly` | Fires on selected days of week at `Time` | `Type = RepeatType::Weekly`, `DaysOfWeek = [0,1,5]` (0=Sun) |
| `Interval` | Fires every N minutes from creation time | `Type = RepeatType::Interval`, `IntervalMinutes = 90` |
| `Cron` | Fires on cron schedule (advanced) | `Type = RepeatType::Cron`, `CronExpression = "0 30 7 * * 1-5"` |

### RepeatPattern Interface

```typescript
interface RepeatPattern {
  Type: RepeatType;            // RepeatType enum: Once | Daily | Weekly | Interval | Cron
  DaysOfWeek: number[];       // 0=Sun, 1=Mon, ..., 6=Sat (weekly only)
  IntervalMinutes: number;    // interval only
  CronExpression: string;     // cron only (parsed by `croner` crate v2.0)
}
```

> **Note:** Scheduling uses `RepeatPattern` exclusively. There is no legacy field.

---

## UI Controls

### Day Selection (Weekly Type)

- **Pill toggles** for Mon–Sun in a horizontal row
- **Shortcut buttons:** Weekdays (Mon–Fri), Weekends (Sat–Sun), Daily (all 7)
- Clicking a shortcut pre-selects the corresponding pills
- At least one day must be selected when type is `weekly`

### Repeat Type Selector

- Segmented control or dropdown: Once | Daily | Weekdays | Weekends | Custom | Interval | Cron
- "Weekdays" and "Weekends" are shortcuts that set `Type = "weekly"` with pre-filled `DaysOfWeek`
- "Interval" shows a numeric input for minutes (min: 1, max: 1440)
- "Cron" shows a text input with validation (P2 — hidden behind advanced toggle)

### Countdown Display

- Below the alarm time: "Alarm in X hours Y minutes"
- Updates every second via `useClock` hook
- Shows relative time to `NextFireTime` (precomputed UTC → local)

---

## NextFireTime Computation

All scheduling logic is in `03-alarm-firing.md` → `compute_next_fire_time()`. This spec defines the user-facing behavior; the firing spec defines the Rust implementation.

| Scenario | Expected Behavior |
|----------|-------------------|
| Once, future date+time | `NextFireTime` = exact UTC of that date+time |
| Once, time already passed today | `NextFireTime` = tomorrow at that time |
| Daily | `NextFireTime` = next occurrence of that time (today if not passed, tomorrow otherwise) |
| Weekly, today is a selected day | If time hasn't passed → today. Otherwise → next selected day |
| Weekly, today is not selected | Next matching day in the cycle |
| Interval | `NextFireTime` = `now + IntervalMinutes` |
| Cron | `NextFireTime` = next match from `croner` crate |

---

## Post-Fire Behavior

| Type | After Firing |
|------|-------------|
| `RepeatType::Once` | Set `IsEnabled = 0`. `NextFireTime = null` |
| `RepeatType::Daily` | Recompute `NextFireTime` to next day same time (DST-aware) |
| `RepeatType::Weekly` | Recompute `NextFireTime` to next matching day (DST-aware) |
| `RepeatType::Interval` | Recompute `NextFireTime` = `now + IntervalMinutes` |
| `RepeatType::Cron` | Recompute `NextFireTime` from cron expression |

---

## Quick Alarm / Timer Shortcut (P1)

One-tap buttons for common quick alarms: "10 min", "30 min", "1 hour", "2 hours".

- Creates a one-time alarm with `Type = RepeatType::Once` and `Date` = today
- `Time` = current time + selected duration
- Label auto-generated: "Quick Alarm (30 min)"
- IPC: `create_alarm` with pre-filled payload

---

## Holiday-Aware Scheduling (P2)

Optional integration with a holiday calendar API.

- When a recurring alarm falls on a public holiday, show notification the night before: "Tomorrow is a holiday. Skip this alarm?"
- User can dismiss notification (alarm fires normally) or skip (alarm suppressed for that day only)
- Holiday data: local JSON file bundled with app, updatable via settings
- No IPC command needed — handled entirely in Rust engine during next-fire-time computation

---

## Acceptance Criteria

- [ ] Day selection via pill toggles for Mon–Sun
- [ ] Shortcut buttons: Weekdays, Weekends, Daily
- [ ] One-time alarms (`Type = "once"`) auto-disable after firing
- [ ] Recurring alarms fire every matching day/interval indefinitely
- [ ] "Alarm in X hours Y minutes" countdown updates in real time
- [ ] `NextFireTime` recomputed correctly after every fire event (DST-aware)
- [ ] Interval alarms fire every N minutes from last fire time
- [ ] Cron alarms fire on next cron match (P2)
- [ ] Quick Alarm buttons create correct one-time alarms (P1)

---

## Cross-References

| Reference | Location |
|-----------|----------|
| RepeatPattern Interface | `../01-fundamentals/01-data-model.md` → Interfaces |
| NextFireTime Computation | `./03-alarm-firing.md` → DST & Timezone-Aware Firing |
| Alarm CRUD | `./01-alarm-crud.md` |
| Alarm Firing | `./03-alarm-firing.md` |
| Cron Parsing | `croner` crate v2.0 (pinned in `01-data-model.md`) |
