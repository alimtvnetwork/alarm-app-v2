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
**Status:** 🔴 Open

**Problem:** 22 code blocks across 5 files exceed the 15-line function limit. Some are extreme (51, 55, 57, 98 lines). AI will copy these as-is, creating functions that violate the linter on first run.

| File | Location | Lines |
|------|----------|:-----:|
| `03-alarm-firing.md` | `compute_next_fire_time` | 51 |
| `03-alarm-firing.md` | `resolve_local_to_utc` | 39 |
| `03-alarm-firing.md` | `on_timezone_change` | 16 |
| `03-alarm-firing.md` | `WakeListener` trait block | 21 |
| `03-alarm-firing.md` | `MacOSWakeListener` | 50 |
| `03-alarm-firing.md` | `WindowsWakeListener` | 38 |
| `03-alarm-firing.md` | `LinuxWakeListener` | 48 |
| `03-alarm-firing.md` | `MissedAlarmCheck` | 16 |
| `05-sound-and-vibration.md` | `validate_custom_sound` | 55 |
| `05-sound-and-vibration.md` | `run_gradual_volume` | 26 |
| `05-sound-and-vibration.md` | `configure_audio_session` | 21 |
| `12-smart-features.md` | `validate_webhook_url` | 57 |
| `12-smart-features.md` | `fire_webhook` | 29 |
| `12-platform-and-concurrency-guide.md` | connection pool setup | 24 |
| `12-platform-and-concurrency-guide.md` | migration runner | 19 |
| `12-platform-and-concurrency-guide.md` | `check_and_fire_alarms` | 17 |
| `12-platform-and-concurrency-guide.md` | test block | 55 |
| `01-data-model.md` | TS `Alarm` interface | 20 |
| `01-data-model.md` | Rust `AlarmRow` + `from_row` | 98 |
| `01-data-model.md` | `purge_old_events` | 17 |
| `01-data-model.md` | `run_migrations` | 24 |

**Fix approach:** Each function must be decomposed into ≤15-line subfunctions with clear names.

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
**Status:** 🔴 Open

**Problem:** Multiple hardcoded numbers in code samples without named constants:

| File | Magic Number | Should Be |
|------|:------------:|-----------|
| `01-data-model.md` | `90` | `DEFAULT_EVENT_RETENTION_DAYS` |
| `01-data-model.md` | `5` | `DEFAULT_SNOOZE_DURATION_MIN` |
| `01-data-model.md` | `30` | `DEFAULT_GRADUAL_VOLUME_SEC` |
| `04-platform-constraints.md` | `30` | `ALARM_CHECK_INTERVAL_SECS` |
| `03-alarm-firing.md` | `3, 0, 0` | `DST_FALLBACK_HOUR` (also wrong — LC-006) |
| `05-sound-and-vibration.md` | `10 * 1024 * 1024` | `MAX_SOUND_FILE_SIZE_BYTES` |

---

## GC-005: `.unwrap()` Used Extensively in Non-Test Code

**Severity:** 🟡 Medium  
**Rule Violated:** Error handling guidelines — avoid `.unwrap()` in production code  
**Status:** 🔴 Open

**Problem:** 5 `.unwrap()` calls in non-test Rust code samples:
- `01-data-model.md`: `from_row()` uses `unwrap_or` (acceptable)
- `03-alarm-firing.md` line 135: `NaiveTime::from_hms_opt(3,0,0).unwrap()` — production DST code
- `13-ai-cheat-sheet.md` line 79: same `.unwrap()` in DST example

**Note:** `.unwrap()` in test code (`09-test-strategy.md`) is acceptable Rust convention.

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
**Status:** 🔴 Open

**Problem:** Race condition resolution SQL: `WHERE id = ? AND deleted_at IS NOT NULL` — should be `WHERE AlarmId = ? AND DeletedAt IS NOT NULL`. Fix Phases 2–4 missed this file's SQL statements.

---

## GC-012: Concurrency Guide Race 4 Uses `alarm.id` and `self.pool` (Regression)

**Severity:** 🟡 Medium  
**Location:** `01-fundamentals/12-platform-and-concurrency-guide.md` (lines 227–234)  
**Status:** 🔴 Open

**Problem:** Two issues:
1. `alarm.id` — should be `alarm.alarm_id` (Rust struct field) for consistency
2. `self.pool` — references `SqlitePool` pattern from pre-rusqlite refactor. Should be `conn` or `self.conn`

---

## Issues Found So Far: 12
## Open: 5 | Resolved: 7
