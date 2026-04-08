# Snooze System

**Version:** 1.2.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 — Must Have

---

## Keywords

`snooze`, `delay`, `re-trigger`, `limit`, `duration`, `per-alarm`, `max-snooze`

---

## Description

When an alarm fires, the user can snooze it to delay re-triggering by a configurable interval. Each alarm has its own `maxSnoozeCount` to prevent infinite postponing.

---

## Configuration

Per-alarm settings (stored on `Alarm` record):

| Setting | Field | Default | Range |
|---------|-------|---------|-------|
| Snooze duration | `snoozeDurationMin` | 5 minutes | 1–30 minutes |
| Max snooze count | `maxSnoozeCount` | 3 | 0–10 (0 = snooze disabled) |

When `maxSnoozeCount = 0`, the Snooze button is never shown — the user must dismiss.

---

## Snooze State

```typescript
interface SnoozeState {
  alarmId: string;
  snoozeCount: number;
  nextFireTime: string; // ISO 8601
}
```

Stored in the `snooze_state` SQLite table. Cleared on dismiss.

---

## Behavior

1. User taps "Snooze" → frontend calls `invoke("snooze_alarm", { alarmId, duration })`
2. Rust backend stops audio, writes snooze state to SQLite
3. `snoozeCount` increments, `snooze_until` set to now + duration
4. Rust alarm engine checks `snooze_state` table alongside regular alarms
5. When `snoozeCount >= maxSnoozeCount`, "Snooze" button is hidden — only "Dismiss" remains
6. Remaining snooze count displayed: "Snooze (2 remaining)"
7. Each snooze event logged in `alarm_events` with `type = 'snoozed'`

---

## Acceptance Criteria

- [ ] Snooze delays alarm by per-alarm configured duration
- [ ] Snooze count displayed on overlay
- [ ] Snooze button hidden when `maxSnoozeCount` reached
- [ ] Snooze button never shown when `maxSnoozeCount = 0`
- [ ] Snooze state persists across app restart
- [ ] Dismissing clears snooze state from SQLite
- [ ] Each snooze event logged in `alarm_events` table

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Alarm Firing | `./03-alarm-firing.md` |
| Data Model | `../01-fundamentals/01-data-model.md` |
| Analytics | `./13-analytics.md` |
