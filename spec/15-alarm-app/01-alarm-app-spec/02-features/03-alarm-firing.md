# Alarm Firing

**Version:** 1.3.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 — Must Have  
**Resolves:** BE-QUEUE-001

---

## Keywords

`firing`, `trigger`, `overlay`, `dismiss`, `audio`, `notification`, `native`, `missed-alarm`, `auto-dismiss`, `next-fire-time`

---

## Description

When the current time matches an enabled alarm's `nextFireTime`, the alarm fires. A full-screen overlay appears with the alarm label, and native audio plays. The user can dismiss or snooze. Missed alarms are detected on app launch and system wake.

---

## Firing Logic

1. Rust backend runs a dedicated background thread with a **30-second check interval**
2. Query: `SELECT * FROM alarms WHERE next_fire_time <= now AND enabled = 1 AND deleted_at IS NULL`
3. For each matched alarm:
   a. Rust triggers native audio playback (via `rodio` or platform audio API)
   b. Rust emits an `alarm-fired` event to the frontend via Tauri IPC
   c. Frontend shows full-screen `AlarmOverlay` with alarm label
   d. Rust dispatches OS-native notification (via Tauri notification plugin)
   e. Insert `alarm_events` row with `type = 'fired'`
4. After firing: Rust recomputes `nextFireTime` based on `repeat` pattern
   - `once` → set `enabled = 0`, `nextFireTime = NULL`
   - `daily` → advance by 24 hours
   - `weekly` → advance to next matching day
   - `interval` → advance by `intervalMinutes`
   - `cron` → compute next from cron expression (via `croner` crate)

---

## Missed Alarm Recovery (Critical Feature)

This is the most important reliability feature. Desktop computers sleep, shut down, and resume — alarms must never be silently lost.

### Strategy

1. **Persist `nextFireTime`** for every enabled alarm in SQLite
2. **On app launch:** query all alarms where `next_fire_time < now AND enabled = 1 AND deleted_at IS NULL AND type != 'acknowledged'` → fire missed alarm notifications
3. **On system wake:** same check via OS power event listener
   - macOS: `NSWorkspace.willSleepNotification` / `didWakeNotification`
   - Windows: `WM_POWERBROADCAST` / `PBT_APMRESUMEAUTOMATIC`
   - Linux: `systemd-logind` `PrepareForSleep` signal
4. **On every 30s tick:** check if any alarm's `nextFireTime <= now`
5. **After firing:** update `nextFireTime` based on repeat pattern, or disable if one-time

### Missed Alarm UI

- Missed alarms show with a distinct "Missed Alarm" badge in the overlay
- Display: alarm label + original scheduled time + "Missed at HH:MM"
- Log as `type = 'missed'` in `alarm_events` table
- Recalculate `nextFireTime` for repeating alarms

### Guarantee

> If the computer was off from 6:00 AM to 9:00 AM and an alarm was set for 7:00 AM, the user sees "Missed Alarm: 7:00 AM — [label]" immediately at 9:00 AM.

---

## Auto-Dismiss

- Optional per-alarm setting: `autoDismissMin` (0 = disabled, 1–60 minutes)
- If an alarm fires and is not dismissed/snoozed within N minutes, it auto-dismisses
- Audio stops, overlay closes, event logged as `type = 'dismissed'` with note `auto`
- Default: 0 (disabled) — user must manually dismiss

---

## AlarmOverlay UI

| Element | Description |
|---------|-------------|
| Alarm label | Large text showing the alarm's label |
| Current time | Displayed prominently |
| Scheduled time | Original fire time (important for missed alarms) |
| Missed badge | "MISSED" indicator if alarm was missed during sleep |
| Dismiss button | Stops audio, closes overlay |
| Snooze button | Stops audio, schedules re-fire (hidden when max snooze reached) |
| Auto-dismiss countdown | Progress bar if auto-dismiss is enabled |

---

## Acceptance Criteria

- [ ] Alarm fires within 30 seconds of `nextFireTime`
- [ ] Native audio plays immediately on fire (Rust backend)
- [ ] Full-screen overlay blocks all other interaction
- [ ] Dismiss stops audio and closes overlay
- [ ] Snooze stops audio and re-triggers after configured duration
- [ ] OS notification fires alongside in-app overlay
- [ ] One-time alarms auto-disable after firing
- [ ] `nextFireTime` recomputed after every fire event
- [ ] Missed alarms detected and surfaced on app launch
- [ ] Missed alarms detected and surfaced on system wake (all 3 platforms)
- [ ] Missed alarms logged with `type = 'missed'` in `alarm_events`
- [ ] Auto-dismiss stops alarm after configured minutes if unacknowledged
- [ ] Only one alarm overlay can be active at a time (queue if multiple fire simultaneously)
- [ ] Queued alarms fire in FIFO order (earliest `nextFireTime` first)
- [ ] Queue badge shows count of pending alarms on overlay

---

## Simultaneous Alarms (Queue System)

> **Resolves BE-QUEUE-001.** Defines behavior when two or more alarms fire within the same 30s check interval.

### Problem

The 30-second check interval may match multiple alarms. Without queue rules, AI implementations will either render multiple overlays (broken) or drop subsequent alarms (data loss).

### Queue Rules

1. **Detection:** On each 30s tick, query returns all alarms where `next_fire_time <= now AND enabled = 1`
2. **Ordering:** Sort matched alarms by `next_fire_time ASC` (earliest first), then `created_at ASC` (tiebreaker)
3. **Immediate logging:** ALL matched alarms insert `alarm_events` row with `type = 'fired'` immediately — do not wait for overlay display
4. **Overlay sequencing:** Show only the first alarm's overlay. Queue the rest in memory
5. **Progression:** When user dismisses or snoozes the current overlay → show next alarm from queue
6. **Auto-dismiss:** Each queued alarm's `autoDismissMin` timer starts when its overlay is shown (not when it enters the queue)
7. **Audio:** Audio plays for the currently displayed alarm only. When progressing to next, restart audio with next alarm's sound

### Queue Data Structure

```rust
struct AlarmQueue {
    /// Ordered FIFO queue of alarms waiting to display overlay
    pending: VecDeque<FiredAlarm>,
    /// Currently displayed alarm (if any)
    active: Option<FiredAlarm>,
}

struct FiredAlarm {
    alarm_id: String,
    label: String,
    sound_id: String,
    fire_time: DateTime<Utc>,     // Original scheduled time
    fired_at: DateTime<Utc>,      // Actual fire time
    auto_dismiss_min: u32,        // 0 = disabled
    is_missed: bool,              // true if fire_time < app_launch_time
}
```

### Queue UI Indicator

When `pending.len() > 0`, show a badge on the `AlarmOverlay`:

```
┌──────────────────────────────────┐
│          🔔 ALARM                │
│                                  │
│     "Morning Workout"           │
│        7:00 AM                   │
│                                  │
│  ┌──────────┐  ┌──────────┐     │
│  │ Dismiss  │  │  Snooze  │     │
│  └──────────┘  └──────────┘     │
│                                  │
│     ┌─────────────────────┐     │
│     │ 2 more alarms pending│    │
│     └─────────────────────┘     │
└──────────────────────────────────┘
```

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| 5+ alarms fire at once | All queued, processed FIFO. No limit on queue size |
| Snooze alarm A, alarm B is next | Show alarm B overlay. Alarm A re-enters queue when snooze expires |
| All queued alarms auto-dismissed | Queue drains, overlay closes, normal state resumes |
| New alarm fires while queue active | Append to end of queue |
| App closed while queue active | All unacknowledged alarms → `missed` on next launch (Step 8 of startup) |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Snooze System | `./04-snooze-system.md` |
| Sound & Vibration | `./05-sound-and-vibration.md` |
| Platform Constraints | `../01-fundamentals/04-platform-constraints.md` |
| Startup Sequence | `../01-fundamentals/07-startup-sequence.md` |
| Dismissal Challenges | `./06-dismissal-challenges.md` |
| Data Model | `../01-fundamentals/01-data-model.md` |
| Analytics | `./13-analytics.md` |
| App Issues | `../03-app-issues/03-backend-issues.md` → BE-QUEUE-001 |
