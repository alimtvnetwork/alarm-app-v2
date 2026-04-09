# Backend Issues

**Version:** 1.1.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low  
**Source:** AI Feasibility Analysis v1.0.0, AI Handoff Reliability Report v1.0.0

---

## Keywords

`backend`, `rust`, `audio`, `timer`, `cron`, `snooze`, `sqlite`, `concurrency`, `startup`, `error-handling`, `logging`, `queue`, `volume`

---

## Issue Registry

### BE-TIMER-001 — 1s vs 30s interval contradiction (RESOLVED)

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 100% → 0% |
| **Status** | ✅ Resolved |

**Description:** `04-platform-constraints.md` said "1-second check interval" but `03-alarm-firing.md` said "30-second check interval".

**Root Cause:** Spec inconsistency between documents.

**Resolution:** Standardized to 30-second interval in `04-platform-constraints.md` (2026-04-08). Snooze uses exact `tokio::time::sleep_until()`.

---

### BE-AUDIO-001 — Non-linear volume perception

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 80% |
| **Status** | Open |

**Description:** Spec says "linearly to 100%" but `rodio` volume control is amplitude-linear, not perceptually linear. Gradual volume will sound wrong.

**Root Cause:** No perceptual audio curve specified.

**Suggested Fix:** Apply logarithmic volume curve: `perceived_volume = amplitude^(1/3)`. Implement in `gradual_volume.rs` as a lookup table.

---

### BE-AUDIO-002 — Missing sound file handling

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 75% |
| **Status** | Open |

**Description:** Custom sound file validation has no max file size, no format validation beyond extension, and no handling for moved/deleted files.

**Root Cause:** Missing validation spec.

**Suggested Fix:** On alarm fire, check `std::path::Path::exists()` for custom sound file. If missing, fall back to default `classic-beep` and log a warning. Show "Sound file missing" in overlay.

---

### BE-WAKE-001 — Platform wake-event FFI required

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 75% |
| **Status** | Open |

**Description:** macOS `NSWorkspace`, Windows `WM_POWERBROADCAST`, Linux `systemd-logind` all require platform-specific Rust code. No Tauri plugin exists.

**Root Cause:** Missing from Tauri plugin ecosystem.

**Suggested Fix:** Use conditional compilation: macOS → `objc2` crate, Windows → `windows` crate, Linux → `zbus` crate for systemd D-Bus signals.

---

### BE-CRON-001 — No cron parsing library specified

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 70% |
| **Status** | Open |

**Description:** `RepeatPattern` supports "cron" type but no Rust cron crate is specified. `cron`, `croner`, and `saffron` all have different syntax support.

**Root Cause:** Missing technology decision.

**Suggested Fix:** Use `croner` crate — MIT licensed, lightweight, supports standard 5-field cron + extensions.

---

### BE-SNOOZE-001 — Snooze expiry check may miss due to 30s interval

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 65% |
| **Status** | Open |

**Description:** If snooze duration is 1 minute and check interval is 30s, snooze-expired event could fire up to 30s late.

**Root Cause:** Coarse check interval for snooze.

**Suggested Fix:** Don't poll for snooze. Use `tokio::time::sleep_until(snooze_expiry)` per active snooze — exact-time triggering, no polling delay.

---

### BE-DELETE-001 — Soft-delete permanent removal timing mechanism undefined

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 60% |
| **Status** | Open |

**Description:** "After 5 seconds, Rust backend permanently removes the row" — no timer mechanism specified. `tokio::spawn`? Background thread? What if app crashes during the 5s window?

**Root Cause:** Missing implementation detail.

**Suggested Fix:** Use `tokio::spawn` with `tokio::time::sleep(Duration::from_secs(5))`. On app startup, run a cleanup pass for any rows with `deletedAt` older than 5 seconds (crash recovery).

---

### BE-CONCUR-001 — SQLite write contention during alarm fire

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 55% |
| **Status** | Open |

**Description:** Alarm engine writes `alarm_events` + updates `nextFireTime` while user may be saving an edit. Single-writer SQLite will queue one, potentially causing UI lag.

**Root Cause:** No write-ahead logging or async write strategy specified.

**Suggested Fix:** Enable SQLite WAL mode (`PRAGMA journal_mode=WAL`). This allows concurrent reads during writes. Add to migration init script.

---

### BE-QUEUE-001 — Simultaneous alarm queue behavior undefined

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

**Resolution Plan:** Update `02-features/03-alarm-firing.md` with a "Simultaneous Alarms" section defining FIFO queue, overlay sequencing, and event logging rules.

---

### BE-STARTUP-001 — No app startup sequence defined

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

**Resolution Plan:** Create `01-fundamentals/10-startup-sequence.md` with the ordered initialization steps, error handling at each stage, and a startup state diagram.

---

### BE-ERROR-001 — No error handling strategy defined

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 75% |
| **Status** | Open |
| **Fail %** | 35% |

**Description:** No spec for what happens when things go wrong: SQLite write failure, audio file not found, IPC timeout, corrupt database, notification permission denied after initial grant.

**Root Cause:** Happy-path-only spec.

**Suggested Fix:**

| Error | Behavior |
|-------|----------|
| SQLite write failure | Retry once, then show toast "Failed to save — try again" |
| Audio file not found | Fall back to `classic-beep`, show "Sound file missing" in overlay |
| IPC timeout (>5s) | Cancel operation, show toast "Operation timed out" |
| Corrupt DB | Attempt `PRAGMA integrity_check`. If fails, backup DB + create fresh |
| Notification denied | Fall back to in-app overlay only, show settings hint |
| Migration failure | App refuses to start, show error dialog with "Reset Database" option |

**Resolution Plan:** Create an `error-handling` section in `01-fundamentals/04-platform-constraints.md` with a complete error → behavior mapping table and fallback chains.

---

### BE-LOG-001 — No logging strategy defined

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

**Resolution Plan:** Add logging requirements to `01-fundamentals/04-platform-constraints.md` or create a dedicated `01-fundamentals/11-logging.md` spec.

---

### BE-AUDIO-003 — macOS audio session category not specified

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 65% |
| **Status** | Open |
| **Fail %** | 55% |

**Description:** macOS requires setting the Core Audio session category for alarm-type playback. Without it, audio may be muted by Do Not Disturb or volume may follow system media volume instead of alarm volume.

**Root Cause:** Platform-specific audio detail not in spec.

**Suggested Fix:**
- macOS: Set `AVAudioSession` category to `.playback` with `.duckOthers` option (via `objc2` FFI or `coreaudio-rs`)
- This ensures alarm audio plays even when DND is on
- Alternatively, use Tauri notification with sound attachment for critical alarms

**Resolution Plan:** Add platform-specific audio configuration to `02-features/05-sound-and-vibration.md` under a "Platform Audio Session" section.

---

### BE-VOLUME-001 — Gradual volume algorithm not specified

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 70% |
| **Status** | Open |
| **Fail %** | 45% |

**Description:** Spec says "starts at ~10% volume and increases linearly to 100%" but doesn't provide the algorithm or update interval. AI will implement it incorrectly (too coarse, wrong curve).

**Root Cause:** Missing implementation detail.

**Suggested Fix:**
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

**Resolution Plan:** Add the volume algorithm pseudocode to `02-features/05-sound-and-vibration.md` under "Gradual Volume Implementation".

---

*Backend issues — updated: 2026-04-09*
