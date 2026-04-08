# Sound & Vibration

**Version:** 1.1.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** Low  
**Priority:** P0 (Sound Selection) / P1 (Gradual Volume, Vibration)

---

## Keywords

`sound`, `audio`, `vibration`, `volume`, `fade-in`, `tone`, `native`

---

## Description

Each alarm can have a different alarm sound from a built-in library. Volume can increase gradually (fade-in) for a gentler wake-up. Vibration is independently toggleable per alarm.

---

## Sound Library

| ID | Name | Category |
|----|------|----------|
| `classic-beep` | Classic Beep | Classic |
| `digital-buzz` | Digital Buzz | Digital |
| `gentle-chime` | Gentle Chime | Gentle |
| `rooster` | Rooster | Classic |
| `bell` | Bell | Classic |
| `rain-gentle` | Gentle Rain | Nature |
| `birds-morning` | Morning Birds | Nature |
| `ocean-wave` | Ocean Wave | Nature |

---

## Gradual Volume Increase (Fade-In)

- Alarm starts at ~10% volume and increases linearly to 100%
- Duration options: 15, 30, or 60 seconds
- Implemented in Rust via native audio API — volume ramp controlled by the `audio/gradual_volume.rs` module
- Per-alarm setting: `gradualVolume: boolean`, `gradualVolumeDurationSec: number`

---

## Vibration

- Independent toggle per alarm: `vibrationEnabled: boolean`
- Pattern: 200ms on, 100ms off, repeat
- **Desktop (macOS/Windows/Linux):** Not available — toggle hidden
- **Mobile (iOS):** Taptic Engine haptics via native API
- **Mobile (Android):** Vibration API via native API
- Feature-detected at runtime; toggle hidden on unsupported platforms
- Fires simultaneously with audio

---

## Acceptance Criteria

- [ ] Sound preview button plays selected sound briefly (via Rust audio backend)
- [ ] Each alarm stores its own sound selection
- [ ] Gradual volume works via native audio volume ramp
- [ ] Vibration fires on supported platforms (mobile) when enabled
- [ ] Vibration toggle hidden on desktop platforms

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Alarm Firing | `./03-alarm-firing.md` |
| Platform Constraints | `../01-fundamentals/04-platform-constraints.md` |
