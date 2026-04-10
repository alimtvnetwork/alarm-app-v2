# Coding Guideline Compliance

**Version:** 1.1.0  
**Updated:** 2026-04-10

---

## Summary

Violations of the project's own coding guidelines found in spec code samples. These code samples will be copied verbatim by AI — every violation will propagate into the codebase.

---

## GC-001: 22 Functions Exceed 15-Line Limit

**Severity:** 🔴 Critical  
**Rule Violated:** Linter CODE RED — max 15 lines per function  
**Status:** ✅ Resolved — all logic functions decomposed into ≤15-line subfunctions

**Resolution:**
- `compute_next_fire_time` → decomposed into `compute_once`, `compute_daily`, `compute_weekly`, `compute_cron` (each ≤15 lines)
- `resolve_local_to_utc` → decomposed into `handle_fall_back`, `handle_spring_forward`
- `MacOsWakeListener::start` → decomposed into `register_wake_observer`, `register_sleep_observer`
- `validate_custom_sound` → decomposed into `validate_extension`, `reject_symlink`, `resolve_canonical`, `reject_restricted_path`, `validate_file_size`
- `run_gradual_volume` → extracted `compute_quadratic_volume`
- `configure_audio_session` → decomposed into `set_playback_category`, `activate_session`
- `validate_webhook_url` → decomposed into `require_https`, `reject_blocked_host`, `reject_private_ip`, `reject_non_standard_port`
- `fire_webhook` → extracted `build_webhook_client`, `log_webhook_result`
- `is_private_ip` → split into `is_private_v4`, `is_private_v6`

**Exemptions documented:**
- `AlarmRow` struct + `from_row`: field-per-line data mapping, no logic — exempt from 15-line rule
- `Alarm` TS interface: type declaration, no logic — exempt
- Test functions: individual `#[tokio::test]` functions are each ≤15 lines
- `on_timezone_change`, `check_and_fire_alarms`, `run_migrations`, `purge_old_events`: already ≤15 lines after prior fixes

---

## GC-002: Boolean Fields Missing `Is`/`Has` Prefix in TS Interfaces

**Severity:** 🔴 Critical  
**Rule Violated:** `02-boolean-principles/01-naming-prefixes.md` — "Every boolean MUST start with `is` or `has`"  
**Status:** ✅ Resolved — all TS boolean fields now use `Is`/`Has` prefix with PascalCase

---

## GC-003: Boolean Fields Missing `Is`/`Has` Prefix in Rust Structs

**Severity:** 🔴 Critical  
**Rule Violated:** `02-boolean-principles/01-naming-prefixes.md`  
**Status:** ✅ Resolved — Rust boolean fields renamed with `is_` prefix, serde serializes to `IsEnabled` etc.

---

## GC-004: Magic Numbers in Code Samples

**Severity:** 🟡 Medium  
**Rule Violated:** Linter CODE RED — no magic numbers  
**Status:** ✅ Resolved — named constants added across all files in Fix Phase 16

**Resolution:** `DEFAULT_EVENT_RETENTION_DAYS = 90` added to data model, `ALARM_CHECK_INTERVAL_SECS = 30` added to alarm-firing, concurrency guide, platform-constraints, startup sequence, cheat sheet, and NFR spec. `MAX_SOUND_FILE_SIZE` already existed. DST `3,0,0` replaced by walk-forward algorithm (no magic number needed). SQL `DEFAULT` values in schema are acceptable as they are declarative, not logic.

---

## GC-005: `.unwrap()` Used Extensively in Non-Test Code

**Severity:** 🟡 Medium  
**Rule Violated:** Error handling guidelines — avoid `.unwrap()` in production code  
**Status:** ✅ Resolved — all production `.unwrap()` calls removed in Fix Phase 16

**Resolution:** The `NaiveTime::from_hms_opt(3,0,0).unwrap()` calls were eliminated entirely by replacing the hardcoded DST approach with a walk-forward algorithm. Remaining `.unwrap()` calls are exclusively in test code (`09-test-strategy.md`, `12-platform-and-concurrency-guide.md` test section) which is acceptable Rust convention.

---

## GC-006: IPC Payload Keys Use camelCase

**Severity:** 🟡 Medium  
**Rule Violated:** `11-key-naming-pascalcase.md` §1 — request keys must be PascalCase  
**Status:** ✅ Resolved — all IPC payload keys converted to PascalCase

---

## GC-007: Rust Struct Field `from_row()` Maps to snake_case Column Names

**Severity:** 🔴 Critical  
**Rule Violated:** Combined NV-001 + GC-003  
**Cross-ref:** NV-001, CG-004  
**Status:** ✅ Resolved — `from_row()` string literals updated to PascalCase column names

---

## GC-008: `safeInvoke` Function Name Uses camelCase

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved — **Not a violation**

**Resolution:** PascalCase mandate applies to **serialized string keys** only (JSON keys, DB columns, config keys, log keys). TypeScript/JavaScript function names follow language convention (camelCase). This is not a violation.

---

## GC-009: `13-analytics.md` Duplicate Schema Still Uses snake_case (Regression)

**Severity:** 🔴 Critical  
**Location:** `02-features/13-analytics.md` (lines 91–103)  
**Cross-ref:** IC-005  
**Status:** ✅ Resolved — duplicate schema removed, replaced with cross-reference to canonical `01-data-model.md`

**Resolution:** Removed the full `CREATE TABLE alarm_events` SQL block from `13-analytics.md`. Replaced with a reference to the canonical schema in `01-data-model.md` and a summary of key column names. Also resolves IC-005 (duplicate schema definition).

---

## GC-010: `13-ai-cheat-sheet.md` Code Samples Use snake_case (Regression)

**Severity:** 🔴 Critical  
**Location:** `01-fundamentals/13-ai-cheat-sheet.md` (lines 89–91)  
**Status:** ✅ Resolved — `row.get("enabled")` → `row.get("IsEnabled")`, `row.get("repeat_days_of_week")` → `row.get("RepeatDaysOfWeek")`

---

## GC-011: Concurrency Guide Race 1 SQL Uses snake_case (Regression)

**Severity:** 🔴 Critical  
**Location:** `01-fundamentals/12-platform-and-concurrency-guide.md` (lines 166–167)  
**Status:** ✅ Resolved — already fixed during Fix Phase 5 (table rename pass updated this SQL to `Alarms`/`AlarmId`/`DeletedAt`)

---

## GC-012: Concurrency Guide Race 4 Uses `alarm.id` and `self.pool` (Regression)

**Severity:** 🟡 Medium  
**Location:** `01-fundamentals/12-platform-and-concurrency-guide.md` (lines 227–234)  
**Status:** ✅ Resolved — `alarm.id` → `alarm.alarm_id`, `self.pool` → `conn: &Connection`, removed `async`/`.await`

---

## Issues Found So Far: 12
## Open: 2 | Resolved: 10
