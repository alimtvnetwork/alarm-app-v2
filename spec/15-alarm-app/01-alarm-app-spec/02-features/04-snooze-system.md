# Snooze System

**Version:** 1.5.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 — Must Have  
**Resolves:** BE-SNOOZE-001

---

## Keywords

`snooze`, `delay`, `re-trigger`, `limit`, `duration`, `per-alarm`, `max-snooze`

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

When an alarm fires, the user can snooze it to delay re-triggering by a configurable interval. Each alarm has its own `MaxSnoozeCount` to prevent infinite postponing.

---

## Configuration

Per-alarm settings (stored on `Alarm` record):

| Setting | Field | Default | Range |
|---------|-------|---------|-------|
| Snooze duration | `SnoozeDurationMin` | 5 minutes | 1–30 minutes |
| Max snooze count | `MaxSnoozeCount` | 3 | 0–10 (0 = dismiss only, no snooze) |

When `MaxSnoozeCount = 0`, the Snooze button is never shown — the user must dismiss.

---

## Snooze State

> See `01-fundamentals/01-data-model.md` → SnoozeState interface for the authoritative definition. Reproduced here for context:

```typescript
interface SnoozeState {
  AlarmId: string;
  SnoozeCount: number;
  SnoozeUntil: string; // ISO 8601
}
```

Stored in the `SnoozeState` SQLite table. Cleared on dismiss.

### IPC Commands

| Command | Payload | Returns |
|---------|---------|---------|
| `snooze_alarm` | `{ AlarmId: string, DurationMin: number }` | `SnoozeState` |
| `get_snooze_state` | `void` | `SnoozeState[]` |
| `cancel_snooze` | `{ AlarmId: string }` | `void` |

**`cancel_snooze` behavior:** Clears the active snooze for the given alarm. Used when the user dismisses an alarm that was in a snooze cycle, or when the alarm is deleted while a snooze is pending.

---

## Behavior

> **Resolves BE-SNOOZE-001.** Snooze must use exact-time triggering, not 30s polling.

1. User taps "Snooze" → frontend calls `invoke("snooze_alarm", { AlarmId, Duration })`
2. Rust backend stops audio, writes snooze state to SQLite
3. `SnoozeCount` increments, `SnoozeUntil` set to now + duration
4. **Exact-time snooze trigger:** Rust spawns `tokio::time::sleep_until(snooze_expiry)` per active snooze — does NOT rely on the 30s polling interval
5. When `SnoozeCount >= MaxSnoozeCount`, "Snooze" button is hidden — only "Dismiss" remains
6. Remaining snooze count displayed: "Snooze (2 remaining)"
7. Each snooze event logged in `AlarmEvents` with `Type = AlarmEventType::Snoozed`

### Snooze Timer Implementation

```rust
// On snooze: spawn an exact-time task instead of polling
pub async fn schedule_snooze(engine: Arc<AlarmEngine>, alarm_id: String, duration_min: u32) {
    let expiry = Instant::now() + Duration::from_secs(duration_min as u64 * 60);

    tokio::spawn(async move {
        tokio::time::sleep_until(expiry).await;

        // Verify snooze wasn't cancelled (dismissed) while waiting
        if let Some(state) = engine.get_snooze_state(&alarm_id).await {
            tracing::info!(alarm_id = %alarm_id, "Snooze expired — re-firing");
            engine.fire_alarm(&alarm_id).await;
        }
    });
}
```

**Crash recovery:** On startup, query `SnoozeState` table for active snoozes. If `SnoozeUntil` is in the future, spawn a new `sleep_until` task. If `SnoozeUntil` is in the past, fire immediately as a missed alarm.

---

## Acceptance Criteria

- [ ] Snooze delays alarm by per-alarm configured duration
- [ ] Snooze count displayed on overlay
- [ ] Snooze button hidden when `MaxSnoozeCount` reached
- [ ] Snooze button never shown when `MaxSnoozeCount = 0`
- [ ] Snooze state persists across app restart
- [ ] Dismissing clears snooze state from SQLite
- [ ] Each snooze event logged in `AlarmEvents` table

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Alarm Firing | `./03-alarm-firing.md` |
| Data Model | `../01-fundamentals/01-data-model.md` |
| Analytics | `./13-analytics.md` |
