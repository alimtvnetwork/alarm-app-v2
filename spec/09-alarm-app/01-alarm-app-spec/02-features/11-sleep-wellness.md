# Sleep & Wellness

**Version:** 1.0.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** Low  
**Priority:** P2 — Nice to Have

---

## Keywords

`sleep`, `bedtime`, `wellness`, `calculator`, `mood`, `ambient`

---

## Description

Sleep and wellness features including bedtime reminders, sleep cycle calculator, mood logging, and ambient sleep sounds.

---

## Features

### Bedtime Reminder (P2)

- User sets target bedtime (e.g., 11:00 PM)
- Notification 15–30 minutes before (configurable)
- Optional: enable "Do Not Disturb" mode or play ambient sounds

### Sleep Duration Calculator (P2)

- Input: desired wake-up time
- Output: optimal bedtimes based on 90-minute sleep cycles
- Example: "To wake at 6:30 AM, go to sleep at 11:00 PM (5 cycles) or 9:30 PM (6 cycles)"
- Reverse mode: given bedtime, suggest alarm times

### Sleep Quality / Mood Logging (P2)

- After dismissing an alarm, optional prompt:
  - Quality: 1–5 stars
  - Mood: 😴 😐 😊 😁
  - Optional notes (free text)
- Data stored for analytics

### Ambient / White Noise Sleep Sounds (P2)

- Sound player: rain, ocean, forest, white noise, brown noise, fan, fireplace
- Auto-stop timer: 30 min, 1 hour, until alarm
- Plays alongside or separate from alarm sounds

### Sleep Cycle Tracking (P3)

- Uses accelerometer to estimate sleep phases
- Alarm window (e.g., 6:00–6:30 AM) — ring during lightest phase
- Requires `DeviceMotionEvent` permission

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Analytics | `./13-analytics.md` |
| Sound & Vibration | `./05-sound-and-vibration.md` |
