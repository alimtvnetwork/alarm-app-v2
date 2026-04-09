# Spec Gap Issues

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** None  
**Source:** AI Handoff Reliability Report v1.0.0

---

## Keywords

`spec-gap`, `missing`, `handoff`, `tauri`, `permissions`, `cargo`, `startup`, `error-handling`, `testing`, `logging`

---

## Issue Registry

### SPEC-PERM-001 — No Tauri 2.x permission/capability manifest specified

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 80% |
| **Status** | Open |
| **Fail %** | 45% |

**Description:** Tauri 2.x uses a new `capabilities` system in `tauri.conf.json`. Without an exact permission manifest, AI will miss required plugin permissions and the app will crash at runtime with unhelpful errors.

**Root Cause:** Tauri 2.x capability system is new and poorly documented. Most AIs default to Tauri 1.x patterns.

**Suggested Fix:** Add exact `capabilities` JSON block to `03-file-structure.md` or a new `tauri-config.md`:
```json
{
  "capabilities": [{
    "identifier": "main",
    "windows": ["main"],
    "permissions": [
      "core:default",
      "sql:default",
      "notification:default",
      "dialog:default",
      "fs:default",
      "global-shortcut:default",
      "tray:default",
      "autostart:default",
      "updater:default"
    ]
  }]
}
```

---

### SPEC-CARGO-001 — No Cargo.toml dependency list with pinned versions

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 75% |
| **Status** | Open |
| **Fail %** | 35% |

**Description:** Spec mentions crate names (`rodio`, `chrono-tz`, `croner`, `refinery`) but not versions. AI may pick incompatible versions or use deprecated crates.

**Root Cause:** Missing pinned dependency versions.

**Suggested Fix:** Add to `03-file-structure.md` or `01-data-model.md`:
```toml
[dependencies]
tauri = { version = "2", features = ["tray-icon", "global-shortcut"] }
tauri-plugin-sql = { version = "2", features = ["sqlite"] }
tauri-plugin-notification = "2"
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
tauri-plugin-autostart = "2"
tauri-plugin-updater = "2"
rodio = "0.19"
chrono = { version = "0.4", features = ["serde"] }
chrono-tz = "0.10"
croner = "2.0"
refinery = { version = "0.8", features = ["rusqlite"] }
rusqlite = { version = "0.31", features = ["bundled"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
uuid = { version = "1", features = ["v4"] }
tokio = { version = "1", features = ["full"] }
```

---

### SPEC-QUEUE-001 — Simultaneous alarm queue behavior undefined

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 70% |
| **Status** | Open |
| **Fail %** | 50% |

**Description:** If two alarms fire at the same time (within the same 30s check), the spec says "only one overlay at a time" but doesn't define queue behavior. AI will likely render multiple overlays or drop the second alarm.

**Root Cause:** Missing queue specification.

**Suggested Fix:** Add to `03-alarm-firing.md`:
- Queue order: FIFO (earliest `nextFireTime` first)
- Show first alarm's overlay; queue the rest
- Dismiss/snooze advances to next alarm in queue
- Auto-dismiss timeout applies per-alarm independently
- Queue indicator: "2 more alarms pending" badge on overlay
- All queued alarms log `fired` event immediately (not when overlay shows)

---

### SPEC-STARTUP-001 — No app startup sequence defined

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 65% |
| **Status** | Open |
| **Fail %** | 40% |

**Description:** The spec defines individual features but not the initialization order. AI may initialize components in wrong order (e.g., alarm engine before DB, tray before settings loaded).

**Root Cause:** Missing orchestration spec.

**Suggested Fix:** Add `10-startup-sequence.md` to features or fundamentals:
1. Open SQLite DB connection (app data dir per OS)
2. Run `refinery` migrations
3. Enable WAL mode (`PRAGMA journal_mode=WAL`)
4. Load settings from `settings` table
5. Initialize system tray with "loading..." state
6. Start alarm engine background thread
7. Run missed alarm check (`WHERE next_fire_time < now AND enabled = 1`)
8. Surface missed alarms (notifications + queue)
9. Start WebView / render React UI
10. Update tray with next alarm time

---

### SPEC-ERROR-001 — No error handling strategy defined

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 75% |
| **Status** | Open |
| **Fail %** | 35% |

**Description:** No spec for what happens when things go wrong: SQLite write failure, audio file not found, IPC timeout, corrupt database, notification permission denied after initial grant.

**Root Cause:** Happy-path-only spec.

**Suggested Fix:** Add error handling rules:
| Error | Behavior |
|-------|----------|
| SQLite write failure | Retry once, then show toast "Failed to save — try again" |
| Audio file not found | Fall back to `classic-beep`, show "Sound file missing" in overlay |
| IPC timeout (>5s) | Cancel operation, show toast "Operation timed out" |
| Corrupt DB | Attempt `PRAGMA integrity_check`. If fails, backup DB + create fresh |
| Notification denied | Fall back to in-app overlay only, show settings hint |
| Migration failure | App refuses to start, show error dialog with "Reset Database" option |

---

### SPEC-TEST-001 — No test strategy defined

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 85% |
| **Status** | Open |
| **Fail %** | 30% |

**Description:** No unit test, integration test, or E2E test strategy specified. AI will produce untested code with no verification mechanism.

**Root Cause:** Missing quality assurance spec.

**Suggested Fix:** Add test requirements:
- **Rust unit tests:** `scheduler.rs` (nextFireTime calculation for all 5 repeat types + DST), `gradual_volume.rs`, validation functions
- **Rust integration tests:** IPC command handlers with in-memory SQLite
- **Frontend unit tests:** `useAlarms` hook, `AlarmForm` validation, time formatting
- **E2E test:** Create alarm → wait for fire → dismiss → verify event logged (use Tauri's `tauri-driver` or WebDriver)

---

### SPEC-LOG-001 — No logging strategy defined

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 80% |
| **Status** | Open |
| **Fail %** | 20% |

**Description:** No log format, log levels, or log file location defined. AI will use `println!()` or skip logging entirely. Debugging production issues will be impossible.

**Root Cause:** Missing observability spec.

**Suggested Fix:**
- Use `tracing` crate + `tracing-subscriber` with `tracing-appender` for file output
- Log levels: `ERROR` (failures), `WARN` (fallbacks), `INFO` (alarm fire/dismiss/snooze), `DEBUG` (engine ticks)
- Log file: `{app_data_dir}/logs/alarm-app.log` (rotate daily, keep 7 days)
- Frontend: `console.warn/error` forwarded to Rust via IPC for unified logging

---

### SPEC-REPEAT-001 — RepeatPattern JSON serialization in SQLite ambiguous

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 70% |
| **Status** | Open |
| **Fail %** | 55% |

**Description:** `repeat_days_of_week` stored as JSON string (`"[0,3,5]"`) in a TEXT column. The spec shows TypeScript interfaces but not the Rust serialization/deserialization strategy. AI will likely get `serde_json` parsing wrong.

**Root Cause:** Missing Rust-side data mapping examples.

**Suggested Fix:** Add Rust struct example:
```rust
#[derive(Debug, Serialize, Deserialize)]
struct AlarmRow {
    repeat_type: String,
    repeat_days_of_week: String, // JSON: "[0,3,5]"
    // ...
}

impl AlarmRow {
    fn days_of_week(&self) -> Vec<u8> {
        serde_json::from_str(&self.repeat_days_of_week).unwrap_or_default()
    }
}
```

---

### SPEC-AUDIO-SESSION-001 — macOS audio session category not specified

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 65% |
| **Status** | Open |
| **Fail %** | 55% |

**Description:** macOS requires setting the Core Audio session category for alarm-type playback. Without it, audio may be muted by Do Not Disturb or volume may follow system media volume instead of alarm volume.

**Root Cause:** Platform-specific audio detail not in spec.

**Suggested Fix:** Add to `05-sound-and-vibration.md`:
- macOS: Set `AVAudioSession` category to `.playback` with `.duckOthers` option (via `objc2` FFI or `coreaudio-rs`)
- This ensures alarm audio plays even when DND is on
- Alternatively, use Tauri notification with sound attachment for critical alarms

---

### SPEC-SOUND-VALIDATE-001 — Custom sound file validation rules missing

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 60% |
| **Status** | Open |
| **Fail %** | 30% |

**Description:** User can select any audio file but no max size, format validation, or handling for moved/deleted files is specified.

**Root Cause:** Missing validation rules.

**Suggested Fix:** Add to `05-sound-and-vibration.md`:
- Max file size: 10MB
- Allowed formats: `.mp3`, `.wav`, `.ogg`, `.flac`
- On alarm fire: check `Path::exists()`. If missing → fall back to `classic-beep`, show "⚠ Sound file missing" in overlay
- On alarm edit: if file path invalid, show warning + offer to re-select
- Reject symlinks (security)

---

### SPEC-VOLUME-ALG-001 — Gradual volume algorithm not specified

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 70% |
| **Status** | Open |
| **Fail %** | 45% |

**Description:** Spec says "starts at ~10% volume and increases linearly to 100%" but doesn't provide the algorithm or update interval. AI will implement it incorrectly (too coarse, wrong curve).

**Root Cause:** Missing implementation detail.

**Suggested Fix:** Add to `05-sound-and-vibration.md`:
```
Algorithm:
  update_interval = 100ms
  elapsed = time_since_alarm_fired
  duration = gradualVolumeDurationSec (15, 30, or 60)
  
  if elapsed >= duration:
    volume = 1.0
  else:
    # Perceptual (logarithmic) curve for natural volume increase
    linear_t = elapsed / duration
    volume = 0.1 + 0.9 * (linear_t ^ 2)  # quadratic feels more natural than linear
  
  set_sink_volume(volume)
```
Update `rodio::Sink::set_volume()` every 100ms via a `tokio::interval` timer.

---

*Spec gap issues — created: 2026-04-09*
