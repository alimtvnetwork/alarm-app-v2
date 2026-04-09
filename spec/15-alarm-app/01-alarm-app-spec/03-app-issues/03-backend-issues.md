# Backend Issues

**Version:** 1.0.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** Low  
**Source:** AI Feasibility Analysis v1.0.0

---

## Keywords

`backend`, `rust`, `audio`, `timer`, `cron`, `snooze`, `sqlite`, `concurrency`

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

*Backend issues — created: 2026-04-08*
