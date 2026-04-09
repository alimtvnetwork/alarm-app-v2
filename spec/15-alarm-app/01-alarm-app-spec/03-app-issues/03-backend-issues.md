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
| **Likelihood** | 80% → 0% |
| **Status** | ✅ Resolved |

**Description:** Spec says "linearly to 100%" but `rodio` volume control is amplitude-linear, not perceptually linear. Gradual volume will sound wrong.

**Root Cause:** No perceptual audio curve specified.

**Resolution:** Added quadratic volume curve algorithm (`t²`) with 100ms update interval to `02-features/05-sound-and-vibration.md` v1.3.0. Includes complete `gradual_volume.rs` Rust implementation.

---

### BE-AUDIO-002 — Missing sound file handling

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 75% → 0% |
| **Status** | ✅ Resolved |

**Description:** Custom sound file validation has no max file size, no format validation beyond extension, and no handling for moved/deleted files.

**Root Cause:** Missing validation spec.

**Resolution:** Added `validate_custom_sound()` function and `resolve_sound_path()` fallback to `02-features/05-sound-and-vibration.md` v1.4.0. Includes extension check, 10MB size limit, symlink rejection, platform-specific restricted path blocking, and missing-file fallback to `classic-beep`.

---

### BE-WAKE-001 — Platform wake-event FFI required

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 75% → 0% |
| **Status** | ✅ Resolved |

**Description:** macOS `NSWorkspace`, Windows `WM_POWERBROADCAST`, Linux `systemd-logind` all require platform-specific Rust code. No Tauri plugin exists.

**Root Cause:** Missing from Tauri plugin ecosystem.

**Resolution:** Added "Platform Wake-Event Listeners" section to `02-features/03-alarm-firing.md` v1.5.0 with `WakeListener` trait, platform factory, and complete Rust implementations for macOS (`objc2` + `NSWorkspace`), Windows (`WM_POWERBROADCAST` hidden window), and Linux (`zbus` + `PrepareForSleep` D-Bus signal). Includes integration code with alarm engine and file structure additions.

---

### BE-CRON-001 — No cron parsing library specified

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 70% → 0% |
| **Status** | ✅ Resolved |

**Description:** `RepeatPattern` supports "cron" type but no Rust cron crate is specified.

**Root Cause:** Missing technology decision.

**Resolution:** Specified `croner` crate v2.0 in `01-fundamentals/01-data-model.md` v1.6.0 (RepeatPattern section) and pinned in `01-fundamentals/03-file-structure.md` Cargo.toml. Used in `compute_next_fire_time()` in `02-features/03-alarm-firing.md`.

---

### BE-SNOOZE-001 — Snooze expiry check may miss due to 30s interval

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 65% → 0% |
| **Status** | ✅ Resolved |

**Description:** If snooze duration is 1 minute and check interval is 30s, snooze-expired event could fire up to 30s late.

**Root Cause:** Coarse check interval for snooze.

**Resolution:** Snooze now uses exact-time `tokio::time::sleep_until(snooze_expiry)` per active snooze instead of polling. Added to `02-features/04-snooze-system.md` v1.3.0 with Rust implementation and crash recovery strategy.

---

### BE-DELETE-001 — Soft-delete permanent removal timing mechanism undefined

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 60% → 0% |
| **Status** | ✅ Resolved |

**Description:** "After 5 seconds, Rust backend permanently removes the row" — no timer mechanism specified.

**Root Cause:** Missing implementation detail.

**Resolution:** Added `tokio::spawn` + `sleep(5s)` timer and startup cleanup pass to `02-features/01-alarm-crud.md` v1.5.0 with complete Rust implementation for both timer and crash recovery.

---

### BE-CONCUR-001 — SQLite write contention during alarm fire

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 55% → 0% |
| **Status** | ✅ Resolved |

**Description:** Alarm engine writes `alarm_events` + updates `nextFireTime` while user may be saving an edit. Single-writer SQLite will queue one, potentially causing UI lag.

**Root Cause:** No write-ahead logging or async write strategy specified.

**Resolution:** Added WAL mode (`PRAGMA journal_mode=WAL`) and `busy_timeout=5000` to `01-fundamentals/01-data-model.md` v1.5.0 under "SQLite WAL Mode" section, integrated into startup Step 4.

---

### BE-QUEUE-001 — Simultaneous alarm queue behavior undefined

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 70% → 0% |
| **Status** | ✅ Resolved |
| **Fail %** | 50% → 5% |

**Description:** If two alarms fire at the same time (within the same 30s check), the spec says "only one overlay at a time" but doesn't define queue behavior. AI will likely render multiple overlays or drop the second alarm.

**Root Cause:** Missing queue specification.

**Suggested Fix:** Add to `03-alarm-firing.md`:
- Queue order: FIFO (earliest `nextFireTime` first)
- Show first alarm's overlay; queue the rest
- Dismiss/snooze advances to next alarm in queue
- Auto-dismiss timeout applies per-alarm independently
- Queue indicator: "2 more alarms pending" badge on overlay
- All queued alarms log `fired` event immediately (not when overlay shows)

**Resolution:** Added "Simultaneous Alarms (Queue System)" section to `02-features/03-alarm-firing.md` v1.3.0 with FIFO queue rules, `AlarmQueue` Rust struct, overlay sequencing, badge UI, and edge case table.

---

### BE-STARTUP-001 — No app startup sequence defined

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 65% → 0% |
| **Status** | ✅ Resolved |
| **Fail %** | 40% → 5% |

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

**Resolution:** Created `01-fundamentals/07-startup-sequence.md` with 9-step ordered initialization, parallel init via `tokio::join!`, error handling per step, and startup time budget (<750ms).

---

### BE-ERROR-001 — No error handling strategy defined

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 75% → 0% |
| **Status** | ✅ Resolved |
| **Fail %** | 35% → 5% |

**Description:** No spec for what happens when things go wrong: SQLite write failure, audio file not found, IPC timeout, corrupt database, notification permission denied after initial grant.

**Root Cause:** Happy-path-only spec.

**Resolution:** Added comprehensive "Error Handling Strategy" section to `01-fundamentals/04-platform-constraints.md` v1.2.0 with 12-error behavior mapping table, Rust error type (`AlarmAppError`), frontend `safeInvoke` wrapper, and critical path protection rules.

---

### BE-LOG-001 — No logging strategy defined

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 80% → 0% |
| **Status** | ✅ Resolved |
| **Fail %** | 20% → 5% |

**Description:** No log format, log levels, or log file location defined. AI will use `println!()` or skip logging entirely. Debugging production issues will be impossible.

**Root Cause:** Missing observability spec.

**Resolution:** Added logging strategy to `01-fundamentals/07-startup-sequence.md` Step 6b and `01-fundamentals/04-platform-constraints.md`. Uses `tracing` + `tracing-subscriber` + `tracing-appender` (daily rotation, 7-day retention). Log levels: ERROR (failures), WARN (fallbacks), INFO (alarm fire/dismiss/snooze), DEBUG (engine ticks). File: `{app_data_dir}/logs/alarm-app.log`. Frontend logs forwarded to Rust via `log_from_frontend` IPC command.

---

### BE-AUDIO-003 — macOS audio session category not specified

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 65% → 0% |
| **Status** | ✅ Resolved |
| **Fail %** | 55% → 5% |

**Description:** macOS requires setting the Core Audio session category for alarm-type playback. Without it, audio may be muted by Do Not Disturb.

**Root Cause:** Platform-specific audio detail not in spec.

**Resolution:** Added "Platform Audio Sessions" section to `02-features/05-sound-and-vibration.md` v1.4.0 with macOS `AVAudioSession` configuration (`.playback` + `.duckOthers`), Windows/Linux notes, and startup integration point.

---

### BE-VOLUME-001 — Gradual volume algorithm not specified

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 70% → 0% |
| **Status** | ✅ Resolved |
| **Fail %** | 45% → 5% |

**Description:** Spec says "starts at ~10% volume and increases linearly to 100%" but doesn't provide the algorithm or update interval. AI will implement it incorrectly (too coarse, wrong curve).

**Root Cause:** Missing implementation detail.

**Resolution:** Already resolved by BE-AUDIO-001 fix. Complete `run_gradual_volume()` Rust implementation added to `02-features/05-sound-and-vibration.md` v1.4.0 with quadratic curve (`t²`), 100ms `tokio::interval`, `MIN_VOLUME = 0.1`, and `Sink::set_volume()` calls. Includes rationale for quadratic over logarithmic.

---

*Backend issues — updated: 2026-04-09*
