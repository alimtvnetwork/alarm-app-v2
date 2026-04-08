# Snooze System

**Version:** 1.1.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 — Must Have

---

## Keywords

`snooze`, `delay`, `re-trigger`, `limit`, `duration`

---

## Description

When an alarm fires, the user can snooze it to delay re-triggering by a configurable interval. A snooze limit prevents infinite postponing.

---

## Configuration

| Setting | Default | Range |
|---------|---------|-------|
| Snooze duration | 5 minutes | 1–30 minutes |
| Snooze limit | 3 | 1–10 (0 = disabled/no snooze option) |

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
5. When snooze limit reached, "Snooze" button is hidden — only "Dismiss" remains
6. Remaining snooze count displayed: "Snooze (2 remaining)"

---

## Acceptance Criteria

- [ ] Snooze delays alarm by configured duration
- [ ] Snooze count displayed on overlay
- [ ] Snooze button hidden when limit reached
- [ ] Snooze state persists across app restart
- [ ] Dismissing clears snooze state from SQLite

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Alarm Firing | `./03-alarm-firing.md` |
| Data Model | `../01-fundamentals/01-data-model.md` |
