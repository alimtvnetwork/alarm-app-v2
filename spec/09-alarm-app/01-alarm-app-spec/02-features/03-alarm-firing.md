# Alarm Firing

**Version:** 1.0.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** Low  
**Priority:** P0 — Must Have

---

## Keywords

`firing`, `trigger`, `overlay`, `dismiss`, `audio`, `notification`

---

## Description

When the current time matches an enabled alarm's time and day, the alarm fires. A full-screen overlay appears with the alarm label, and audio plays. The user can dismiss or snooze.

---

## Firing Logic

1. A 1-second `setInterval` compares `HH:MM` of current time against all enabled alarms
2. On match, check `recurringDays`: if empty (one-time) or current day is in the array → fire
3. Play alarm sound via Web Audio API
4. Show full-screen `AlarmOverlay` with alarm label
5. Fire system notification via Notification API (if permitted)
6. If one-time alarm, set `enabled: false` after firing

---

## AlarmOverlay UI

| Element | Description |
|---------|-------------|
| Alarm label | Large text showing the alarm's label |
| Current time | Displayed prominently |
| Dismiss button | Stops audio, closes overlay |
| Snooze button | Stops audio, schedules re-fire after snooze duration |

---

## Acceptance Criteria

- [ ] Alarm fires within 1 second of matching time
- [ ] Audio plays immediately on fire (Web Audio API)
- [ ] Full-screen overlay blocks all other interaction
- [ ] Dismiss stops audio and closes overlay
- [ ] Snooze stops audio and re-triggers after configured duration
- [ ] System notification fires alongside in-app overlay
- [ ] One-time alarms auto-disable after firing
- [ ] Only one alarm overlay can be active at a time (queue if multiple fire simultaneously)

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Snooze System | `./04-snooze-system.md` |
| Sound & Vibration | `./05-sound-and-vibration.md` |
| Web API Constraints | `../01-fundamentals/04-web-api-constraints.md` |
| Dismissal Challenges | `./06-dismissal-challenges.md` |
