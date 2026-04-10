# Sound & Vibration

**Version:** 1.6.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 (Sound Selection) / P1 (Gradual Volume, Vibration)  
**Resolves:** BE-AUDIO-001, BE-AUDIO-002, BE-AUDIO-003, SEC-PATH-001

---

## Keywords

`sound`, `audio`, `vibration`, `volume`, `fade-in`, `tone`, `native`, `custom-sound`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ✅ |


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

- User can select any local `.mp3`, `.wav`, `.ogg`, or `.flac` file as an alarm sound
- File selection via `tauri-plugin-dialog` open dialog (filter: audio files)
- IPC command: `invoke("set_custom_sound", { AlarmId, FilePath })`
- The file path is stored in the `SoundFile` field on the alarm
- Built-in sounds use a key (e.g., `"classic-beep"`); custom sounds store the absolute file path
- Preview plays the selected file via Rust audio backend before confirming

### Custom Sound Validation (Resolves BE-AUDIO-002 + SEC-PATH-001)

> Without validation, custom sounds can reference missing files, oversized files, or sensitive system paths.

```rust
use std::path::Path;

const MAX_SOUND_FILE_SIZE: u64 = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS: &[&str] = &["mp3", "wav", "ogg", "flac"];

/// Validates a custom sound file path. Decomposed into ≤15-line subfunctions.
pub fn validate_custom_sound(path: &str) -> Result<(), AlarmAppError> {
    tracing::debug!(path = %path, "validate_custom_sound");
    validate_extension(path)?;
    reject_symlink(path)?;
    let canonical = resolve_canonical(path)?;
    reject_restricted_path(&canonical)?;
    validate_file_size(&canonical)
}

fn validate_extension(path: &str) -> Result<(), AlarmAppError> {
    let ext = Path::new(path).extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .unwrap_or_default();
    let is_allowed = ALLOWED_EXTENSIONS.contains(&ext.as_str());
    if !is_allowed {
        return Err(AlarmAppError::InvalidSoundFormat(ext));
    }
    Ok(())
}

fn reject_symlink(path: &str) -> Result<(), AlarmAppError> {
    if Path::new(path).is_symlink() {
        return Err(AlarmAppError::SymlinkRejected);
    }
    Ok(())
}

fn resolve_canonical(path: &str) -> Result<std::path::PathBuf, AlarmAppError> {
    Path::new(path).canonicalize()
        .map_err(|_| AlarmAppError::FileNotFound { path: path.to_string() })
}

fn reject_restricted_path(canonical: &Path) -> Result<(), AlarmAppError> {
    let path_str = canonical.to_string_lossy();
    #[cfg(target_os = "macos")]
    if path_str.starts_with("/System") || path_str.starts_with("/Library") {
        return Err(AlarmAppError::RestrictedPath);
    }
    #[cfg(target_os = "windows")]
    if path_str.starts_with("C:\\Windows") || path_str.starts_with("C:\\Program Files") {
        return Err(AlarmAppError::RestrictedPath);
    }
    #[cfg(target_os = "linux")]
    if path_str.starts_with("/etc") || path_str.starts_with("/sys") || path_str.starts_with("/proc") {
        return Err(AlarmAppError::RestrictedPath);
    }
    Ok(())
}

fn validate_file_size(canonical: &Path) -> Result<(), AlarmAppError> {
    let metadata = std::fs::metadata(canonical)
        .map_err(|_| AlarmAppError::FileNotFound { path: canonical.to_string_lossy().to_string() })?;
    if metadata.len() > MAX_SOUND_FILE_SIZE {
        return Err(AlarmAppError::SoundFileTooLarge { size_bytes: metadata.len(), max_bytes: MAX_SOUND_FILE_SIZE });
    }
    Ok(())
}
```

**Validation timing:**
- **On select:** Validate when user picks file via dialog → reject immediately with clear error
- **On alarm fire:** Check `Path::exists()`. If missing → fall back to `classic-beep`, show "⚠ Sound file missing" in overlay, log warning
- **On alarm edit:** If stored path is invalid, show warning badge + "Re-select sound" button

### Missing Sound Fallback (On Fire)

```rust
pub fn resolve_sound_path(sound_file: &str) -> String {
    // Built-in sounds: key lookup (always available)
    let is_plain_filename = !sound_file.contains('/') && !sound_file.contains('\\');
    // EXEMPT: !contains() on library method is idiomatic for path checking
    if is_plain_filename {
        return get_builtin_sound_path(sound_file);
    }

    // Custom sound: check existence
    if Path::new(sound_file).exists() {
        return sound_file.to_string();
    }

    // Fallback
    tracing::warn!(path = %sound_file, "Custom sound file missing — using default");
    get_builtin_sound_path("classic-beep")
}
```

---

## Gradual Volume Increase (Fade-In)

> **Resolves BE-AUDIO-001.** Raw linear amplitude sounds wrong — human hearing is logarithmic.

- Alarm starts at ~10% volume and increases **perceptually** to 100%
- Duration options: 15, 30, or 60 seconds
- Implemented in Rust via native audio API — volume ramp controlled by the `audio/gradual_volume.rs` module
- Per-alarm setting: `IsGradualVolume: boolean`, `GradualVolumeDurationSec: number`

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
        if elapsed >= duration { sink.set_volume(1.0); break; }
        sink.set_volume(compute_quadratic_volume(elapsed, duration));
    }
}

/// Quadratic curve: feels more natural than linear.
/// t² provides perceptually even increase from 10% → 100%.
fn compute_quadratic_volume(elapsed: Duration, total: Duration) -> f32 {
    let t = elapsed.as_secs_f32() / total.as_secs_f32();
    MIN_VOLUME + (1.0 - MIN_VOLUME) * (t * t)
}
```

**Why quadratic, not logarithmic?** True log curves start too quietly. `t²` provides a perceptually even increase from 10% → 100% that users perceive as "steady ramp." The 100ms update interval keeps transitions smooth without excessive CPU use.

---

## Platform Audio Sessions (Resolves BE-AUDIO-003)

> Without platform-specific audio session configuration, alarms may be muted by Do Not Disturb or follow media volume instead of alarm volume.

### macOS — Core Audio Session

```rust
// src-tauri/src/audio/platform_macos.rs
use objc2_av_foundation::{AVAudioSession, AVAudioSessionCategory};

pub fn configure_audio_session() -> Result<(), AlarmAppError> {
    let session = unsafe { AVAudioSession::sharedInstance() };
    set_playback_category(&session)?;
    activate_session(&session)?;
    tracing::info!("macOS audio session configured: Playback + DuckOthers");
    Ok(())
}

fn set_playback_category(session: &AVAudioSession) -> Result<(), AlarmAppError> {
    unsafe { session.setCategory_withOptions_error(
        AVAudioSessionCategory::Playback,
        AVAudioSessionCategoryOptions::DuckOthers,
    ) }.map_err(|e| AlarmAppError::Audio(format!("Failed to set audio session: {e}")))
}

fn activate_session(session: &AVAudioSession) -> Result<(), AlarmAppError> {
    unsafe { session.setActive_error(true) }
        .map_err(|e| AlarmAppError::Audio(format!("Failed to activate audio session: {e}")))
}
```

### Windows — No Special Config Required

Windows `rodio` uses WASAPI by default, which plays independently of focus state. No additional configuration needed.

### Linux — PulseAudio/PipeWire

`rodio` uses CPAL → ALSA/PulseAudio. No special session config required, but ensure the stream is created with the "alarm" media role:

```rust
// Set PulseAudio/PipeWire media.role to "alarm" for priority playback
// This is handled automatically by rodio on most Linux desktop environments
```

### Integration Point

Call `configure_audio_session()` at **Step 6a** of the startup sequence (parallel init), before any audio playback occurs.

---

## Vibration

- Independent toggle per alarm: `IsVibrationEnabled: boolean`
- Pattern: 200ms on, 100ms off, repeat
- **Desktop (macOS/Windows/Linux):** Not available — toggle hidden
- **Mobile (iOS):** Taptic Engine haptics via native API
- **Mobile (Android):** Vibration API via native API
- Feature-detected at runtime; toggle hidden on unsupported platforms
- Fires simultaneously with audio

---

## IPC Commands

| Command | Payload | Returns |
|---------|---------|---------|
| `list_sounds` | `void` | `AlarmSound[]` |
| `set_custom_sound` | `{ FilePath: string }` | `AlarmSound` |
| `validate_custom_sound` | `{ FilePath: string }` | `{ IsValid: boolean, Error: string \| null }` |

---

## Acceptance Criteria

- [ ] Sound preview button plays selected sound briefly (via Rust audio backend)
- [ ] Each alarm stores its own sound selection (built-in key or file path)
- [ ] User can select a custom local audio file via native file dialog
- [ ] Custom sound validation: extension, size (<10MB), no symlinks, no system paths
- [ ] Missing custom sound falls back to `classic-beep` with warning in overlay
- [ ] Custom sound file path persists in SQLite
- [ ] Gradual volume works via native audio volume ramp (quadratic curve)
- [ ] macOS audio session set to Playback + DuckOthers (plays through DND)
- [ ] Vibration fires on supported platforms (mobile) when enabled
- [ ] Vibration toggle hidden on desktop platforms

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Alarm Firing | `./03-alarm-firing.md` |
| Design System (UI States) | `../01-fundamentals/02-design-system.md` |
| Platform Constraints | `../01-fundamentals/04-platform-constraints.md` |
| Data Model | `../01-fundamentals/01-data-model.md` |
| Security Issues | `../03-app-issues/05-security-issues.md` → SEC-PATH-001 |
