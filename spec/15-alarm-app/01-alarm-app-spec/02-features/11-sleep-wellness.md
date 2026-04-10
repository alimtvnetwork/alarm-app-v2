# Sleep & Wellness

**Version:** 1.2.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** Low  
**Priority:** P2 — Nice to Have

---

## Keywords

`sleep`, `bedtime`, `wellness`, `calculator`, `mood`, `ambient`, `native`, `audio`

---

## Description

Sleep and wellness features including bedtime reminders, sleep cycle calculator, mood logging, and ambient sleep sounds. All state persisted in SQLite; audio via native playback (Rust `rodio`); notifications via OS-native APIs.

---

## Native Implementation

| Aspect | Web (Previous) | Native (Tauri) |
|--------|---------------|----------------|
| Bedtime notification | Browser Notification API | `tauri-plugin-notification` (OS-native) |
| Ambient audio | Web Audio API | Rust `rodio` crate (native playback) |
| Sleep data storage | localStorage | SQLite `Settings` + `AlarmEvents` tables |
| Accelerometer (sleep tracking) | `DeviceMotionEvent` | CoreMotion (iOS) / SensorManager (Android) |
| Auto-stop timer | `setTimeout` (throttled in background) | Rust `tokio::time` (reliable background timer) |

---

## Features

### Bedtime Reminder (P2)

- User sets target bedtime (e.g., 11:00 PM) — stored in SQLite `Settings` table
- OS-native notification 15–30 minutes before (configurable)
- Optional: play ambient sounds automatically at bedtime
- Rust background thread monitors bedtime schedule (not affected by WebView throttling)

### Sleep Duration Calculator (P2)

- Input: desired wake-up time
- Output: optimal bedtimes based on 90-minute sleep cycles
- Example: "To wake at 6:30 AM, go to sleep at 11:00 PM (5 cycles) or 9:30 PM (6 cycles)"
- Reverse mode: given bedtime, suggest alarm times
- Pure frontend calculation — no IPC needed

### Sleep Quality / Mood Logging (P2)

- After dismissing an alarm, optional prompt:
  - Quality: 1–5 stars
  - Mood: 😴 😐 😊 😁
  - Optional notes (free text)
- Data stored in SQLite `AlarmEvents` table for analytics
- IPC: `log_sleep_quality { AlarmId, Quality, Mood, Notes }`

### Ambient / White Noise Sleep Sounds (P2)

- Sound player: rain, ocean, forest, white noise, brown noise, fan, fireplace
- Audio played via Rust `rodio` — not Web Audio API
- Auto-stop timer: 30 min, 1 hour, until alarm — Rust background timer (reliable)
- Plays alongside or separate from alarm sounds
- IPC: `play_ambient { Sound, DurationMin }`, `stop_ambient`

### Sleep Cycle Tracking (P3)

- **Mobile only** (iOS / Android) — hidden on desktop
- Uses native accelerometer: CoreMotion (iOS), SensorManager (Android)
- Alarm window (e.g., 6:00–6:30 AM) — ring during lightest phase
- Rust processes sensor data and determines optimal wake time

---

## Acceptance Criteria

- [ ] Bedtime reminder sends OS-native notification 15–30 min before configured bedtime
- [ ] Sleep calculator shows optimal bedtimes based on 90-minute cycles for a given wake time
- [ ] Sleep quality prompt appears after alarm dismissal (optional, configurable)
- [ ] Quality (1–5), mood, and notes logged to `AlarmEvents` table via IPC
- [ ] Ambient sounds play via Rust `rodio` and auto-stop after configured duration
- [ ] `stop_ambient` immediately stops playback
- [ ] Sleep cycle tracking hidden on desktop (feature-detected at runtime)
- [ ] All IPC payload keys use PascalCase (`AlarmId`, `Quality`, `Sound`, `DurationMin`)

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Analytics | `./13-analytics.md` |
| Sound & Vibration | `./05-sound-and-vibration.md` |
| Platform Constraints | `../01-fundamentals/04-platform-constraints.md` |
| Tauri Architecture | `../01-fundamentals/06-tauri-architecture-and-framework-comparison.md` |
| Domain Enums | `../01-fundamentals/01-data-model.md` → Domain Enums section |
