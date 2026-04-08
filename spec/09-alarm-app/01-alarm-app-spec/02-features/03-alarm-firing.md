# Alarm Firing

**Version:** 1.2.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** Low  
**Priority:** P0 — Must Have

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

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Snooze System | `./04-snooze-system.md` |
| Sound & Vibration | `./05-sound-and-vibration.md` |
| Platform Constraints | `../01-fundamentals/04-platform-constraints.md` |
| Dismissal Challenges | `./06-dismissal-challenges.md` |
| Data Model | `../01-fundamentals/01-data-model.md` |
| Analytics | `./13-analytics.md` |
