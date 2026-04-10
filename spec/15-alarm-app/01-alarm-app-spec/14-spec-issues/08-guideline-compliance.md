# Coding Guideline Compliance

**Version:** 1.0.0  
**Updated:** 2026-04-09

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
**Status:** 🔴 Open

**Problem:** TS `Alarm` interface in `01-data-model.md` has 3 boolean fields without prefix:

| Current | Required |
|---------|----------|
| `enabled: boolean` | `isEnabled: boolean` |
| `vibrationEnabled: boolean` | `isVibrationEnabled: boolean` |
| `gradualVolume: boolean` | `isGradualVolume: boolean` |

Also in `AlarmGroup`:
| Current | Required |
|---------|----------|
| `enabled: boolean` | `isEnabled: boolean` |

**Note:** These also need PascalCase (NV-004), so final form: `IsEnabled`, `IsVibrationEnabled`, `IsGradualVolume`.

---

## GC-003: Boolean Fields Missing `Is`/`Has` Prefix in Rust Structs

**Severity:** 🔴 Critical  
**Rule Violated:** `02-boolean-principles/01-naming-prefixes.md`  
**Status:** 🔴 Open

**Problem:** Rust `AlarmRow` struct in `01-data-model.md`:

| Current | Required |
|---------|----------|
| `pub enabled: bool` | `pub is_enabled: bool` |
| `pub previous_enabled: Option<bool>` | `pub is_previous_enabled: Option<bool>` |
| `pub vibration_enabled: bool` | `pub is_vibration_enabled: bool` |

**Note:** Rust struct fields use snake_case by Rust convention, but with serde `rename_all = "PascalCase"` they serialize to `IsEnabled`, `IsPreviousEnabled`, `IsVibrationEnabled`.

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
**Status:** 🔴 Open

**Problem:** IPC payloads in `06-tauri-architecture-and-framework-comparison.md` and feature files use camelCase:

| Current | Required |
|---------|----------|
| `{ id: string, enabled: boolean }` | `{ Id: string, IsEnabled: boolean }` |
| `{ alarmId, enabled }` | `{ AlarmId, IsEnabled }` |
| `{ alarmId: string, label: string }` | `{ AlarmId: string, Label: string }` |

---

## GC-007: Rust Struct Field `from_row()` Maps to snake_case Column Names

**Severity:** 🔴 Critical  
**Rule Violated:** Combined NV-001 + GC-003  
**Cross-ref:** NV-001, CG-004  
**Status:** 🔴 Open

**Problem:** `AlarmRow::from_row()` in `01-data-model.md` uses `row.get("snake_case")` — e.g., `row.get("repeat_type")`, `row.get("group_id")`, `row.get("next_fire_time")`. These map to snake_case SQL columns. When columns are renamed to PascalCase, all `from_row()` string literals must also change.

**Lines affected:** 117–140 in `01-data-model.md`

---

## GC-008: `safeInvoke` Function Name Uses camelCase

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved — **Not a violation**

**Problem:** The TS utility function `safeInvoke` in `04-platform-constraints.md` and `13-ai-cheat-sheet.md`.

**Resolution:** PascalCase mandate applies to **serialized string keys** only (JSON keys, DB columns, config keys, log keys). TypeScript/JavaScript function names follow language convention (camelCase). This is not a violation.

---

## Issues Found So Far: 8
## Open: 7 | Resolved: 1
