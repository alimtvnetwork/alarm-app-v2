# Sound & Vibration

**Version:** 1.3.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 (Sound Selection) / P1 (Gradual Volume, Vibration)  
**Resolves:** BE-AUDIO-001

---

## Keywords

`sound`, `audio`, `vibration`, `volume`, `fade-in`, `tone`, `native`, `custom-sound`

---

## Description

Each alarm has its own sound selection — either from the built-in library (8-10 tones) or a custom local audio file (`.mp3`, `.wav`, `.ogg`). Volume can increase gradually (fade-in). Vibration is independently toggleable per alarm on supported platforms.

---

## Sound Library (Built-In)

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
| `urgent-siren` | Urgent Siren | Digital |
| `soft-piano` | Soft Piano | Gentle |

---

## Custom Sound Files

- User can select any local `.mp3`, `.wav`, or `.ogg` file as an alarm sound
- File selection via `tauri-plugin-dialog` open dialog (filter: audio files)
- IPC command: `invoke("set_custom_sound", { alarmId, filePath })`
- The file path is stored in `soundFile` field on the alarm
- Built-in sounds use a key (e.g., `"classic-beep"`); custom sounds store the absolute file path
- Preview plays the selected file via Rust audio backend before confirming

---

## Gradual Volume Increase (Fade-In)

> **Resolves BE-AUDIO-001.** Raw linear amplitude sounds wrong — human hearing is logarithmic.

- Alarm starts at ~10% volume and increases **perceptually** to 100%
- Duration options: 15, 30, or 60 seconds
- Implemented in Rust via native audio API — volume ramp controlled by the `audio/gradual_volume.rs` module
- Per-alarm setting: `gradualVolume: boolean`, `gradualVolumeDurationSec: number`

### Volume Curve Algorithm

`rodio::Sink::set_volume()` is amplitude-linear, not perceptually linear. A **quadratic curve** approximates perceived loudness:

```rust
// src-tauri/src/audio/gradual_volume.rs

const UPDATE_INTERVAL_MS: u64 = 100;
const MIN_VOLUME: f32 = 0.1;

/// Runs on a tokio::interval, updating sink volume every 100ms
pub async fn run_gradual_volume(sink: &Sink, duration_sec: u32) {
    let mut interval = tokio::time::interval(Duration::from_millis(UPDATE_INTERVAL_MS));
    let start = Instant::now();
    let duration = Duration::from_secs(duration_sec as u64);

    loop {
        interval.tick().await;
        let elapsed = start.elapsed();

        if elapsed >= duration {
            sink.set_volume(1.0);
            break;
        }

        // Quadratic curve: feels more natural than linear
        let t = elapsed.as_secs_f32() / duration.as_secs_f32();
        let volume = MIN_VOLUME + (1.0 - MIN_VOLUME) * (t * t);
        sink.set_volume(volume);
    }
}
```

**Why quadratic, not logarithmic?** True log curves start too quietly. `t²` provides a perceptually even increase from 10% → 100% that users perceive as "steady ramp." The 100ms update interval keeps transitions smooth without excessive CPU use.

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
- [ ] Each alarm stores its own sound selection (built-in key or file path)
- [ ] User can select a custom local audio file via native file dialog
- [ ] Custom sound file path persists in SQLite
- [ ] Gradual volume works via native audio volume ramp
- [ ] Vibration fires on supported platforms (mobile) when enabled
- [ ] Vibration toggle hidden on desktop platforms

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Alarm Firing | `./03-alarm-firing.md` |
| Platform Constraints | `../01-fundamentals/04-platform-constraints.md` |
| Data Model | `../01-fundamentals/01-data-model.md` |
