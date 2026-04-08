# Alarm Firing

**Version:** 1.1.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** Low  
**Priority:** P0 — Must Have

---

## Keywords

`firing`, `trigger`, `overlay`, `dismiss`, `audio`, `notification`, `native`

---

## Description

When the current time matches an enabled alarm's time and day, the alarm fires. A full-screen overlay appears with the alarm label, and native audio plays. The user can dismiss or snooze.

---

## Firing Logic

1. Rust backend runs a dedicated background thread with a 1-second check interval
2. On match, check `recurringDays`: if empty (one-time) or current day is in the array → fire
3. Rust emits an `alarm-fired` event to the frontend via Tauri IPC
4. Rust triggers native audio playback (via `rodio` or platform audio API)
5. Frontend shows full-screen `AlarmOverlay` with alarm label
6. Rust dispatches OS-native notification (via Tauri notification plugin)
7. If one-time alarm, set `enabled = 0` in SQLite after firing

---

## AlarmOverlay UI

| Element | Description |
|---------|-------------|
| Alarm label | Large text showing the alarm's label |
| Current time | Displayed prominently |
| Dismiss button | Stops audio, closes overlay |
| Snooze button | Stops audio, schedules re-fire after snooze duration |

---

## Missed Alarm Handling

If the system was asleep when an alarm was scheduled to fire:
1. On wake, Rust checks for any missed alarms (fire time < now, enabled, not yet fired)
2. Fire immediately with a "Missed alarm" indicator in the overlay
3. Log missed fire in SQLite for analytics

---

## Acceptance Criteria

- [ ] Alarm fires within 1 second of matching time
- [ ] Native audio plays immediately on fire (Rust backend)
- [ ] Full-screen overlay blocks all other interaction
- [ ] Dismiss stops audio and closes overlay
- [ ] Snooze stops audio and re-triggers after configured duration
- [ ] OS notification fires alongside in-app overlay
- [ ] One-time alarms auto-disable after firing
- [ ] Only one alarm overlay can be active at a time (queue if multiple fire simultaneously)
- [ ] Missed alarms detected and fired on system wake

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Snooze System | `./04-snooze-system.md` |
| Sound & Vibration | `./05-sound-and-vibration.md` |
| Platform Constraints | `../01-fundamentals/04-platform-constraints.md` |
| Dismissal Challenges | `./06-dismissal-challenges.md` |
