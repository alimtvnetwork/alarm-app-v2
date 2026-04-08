# Sound & Vibration

**Version:** 1.0.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** Low  
**Priority:** P0 (Sound Selection) / P1 (Gradual Volume, Vibration)

---

## Keywords

`sound`, `audio`, `vibration`, `volume`, `fade-in`, `tone`

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
- Implemented via Web Audio API `GainNode` with `linearRampToValueAtTime`
- Per-alarm setting: `gradualVolume: boolean`, `gradualVolumeDurationSec: number`

---

## Vibration

- Independent toggle per alarm: `vibrationEnabled: boolean`
- Pattern: 200ms on, 100ms off, repeat
- Feature-detected: `navigator.vibrate` — toggle hidden on unsupported browsers
- Fires simultaneously with audio

---

## Acceptance Criteria

- [ ] Sound preview button plays selected sound briefly
- [ ] Each alarm stores its own sound selection
- [ ] Gradual volume works via Web Audio API gain ramp
- [ ] Vibration fires on supported devices when enabled
- [ ] Vibration toggle hidden on unsupported platforms

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Alarm Firing | `./03-alarm-firing.md` |
| Web API Constraints | `../01-fundamentals/04-web-api-constraints.md` |
