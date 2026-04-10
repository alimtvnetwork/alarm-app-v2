# Naming Violations

**Version:** 1.1.0  
**Updated:** 2026-04-09

---

## Summary

Issues where the alarm app spec violates its own coding guidelines — primarily the PascalCase key naming standard (`spec/02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/11-key-naming-pascalcase.md`).

---

## NV-001: Database Column Names Use snake_case

**Severity:** 🔴 Critical  
**Location:** `01-fundamentals/01-data-model.md` (lines 222–275)  
**Rule Violated:** `11-key-naming-pascalcase.md` §1 — "Database column names: `user_id` → `UserId`"  
**Status:** ✅ Resolved — all columns renamed to PascalCase with `Is`/`Has` boolean prefixes

**Violations (30+ columns):**

| Current (snake_case) | Required (PascalCase) |
|----------------------|-----------------------|
| `previous_enabled` | `PreviousEnabled` |
| `repeat_type` | `RepeatType` |
| `group_id` | `GroupId` |
| `max_snooze_count` | `MaxSnoozeCount` |
| `next_fire_time` | `NextFireTime` |
| `deleted_at` | `DeletedAt` |
| `created_at` | `CreatedAt` |
| `updated_at` | `UpdatedAt` |
| `alarm_id` | `AlarmId` |
| `snooze_count` | `SnoozeCount` |
| `fired_at` | `FiredAt` |
| `dismissed_at` | `DismissedAt` |
| `challenge_type` | `ChallengeType` |
| `value_type` | `ValueType` |

**Files affected:** `01-data-model.md`, `07-startup-sequence.md`, `09-test-strategy.md`, `01-alarm-crud.md`, `12-platform-and-concurrency-guide.md`

---

## NV-002: Database Table Names Use snake_case

**Severity:** 🔴 Critical  
**Location:** `01-fundamentals/01-data-model.md` (lines 222–275)  
**Rule Violated:** `11-key-naming-pascalcase.md` §1  
**Status:** ✅ Resolved — tables renamed: `alarm_events` → `AlarmEvents`, `alarm_groups` → `AlarmGroups`, `snooze_state` → `SnoozeState`

| Current (snake_case) | Required (PascalCase) |
|----------------------|-----------------------|
| `alarm_events` | `AlarmEvents` |
| `alarm_groups` | `AlarmGroups` |
| `snooze_state` | `SnoozeState` |

**Note:** `alarms` and `settings` are single-word, so no change needed.

---

## NV-003: Database Index Names Use snake_case

**Severity:** 🟡 Medium  
**Location:** `01-fundamentals/01-data-model.md` (lines 501–504)  
**Status:** ✅ Resolved — indexes renamed to PascalCase (`IdxAlarmsNextFire`, etc.)

| Current | Required |
|---------|----------|
| `idx_alarms_next_fire` | `IdxAlarmsNextFire` |
| `idx_alarms_group` | `IdxAlarmsGroup` |
| `idx_events_alarm` | `IdxEventsAlarm` |
| `idx_events_timestamp` | `IdxEventsTimestamp` |

---

## NV-004: TypeScript Interface Keys Use camelCase

**Severity:** 🔴 Critical  
**Location:** `01-fundamentals/01-data-model.md` (TS interface section)  
**Rule Violated:** `11-key-naming-pascalcase.md` §1 — "JSON response/request keys must be PascalCase"  
**Status:** ✅ Resolved — all TS interface keys converted to PascalCase with `Is`/`Has` boolean prefixes

| Current (camelCase) | Required (PascalCase) |
|---------------------|-----------------------|
| `groupId` | `GroupId` |
| `snoozeDurationMin` | `SnoozeDurationMin` |
| `maxSnoozeCount` | `MaxSnoozeCount` |
| `soundFile` | `SoundFile` |
| `vibrationEnabled` | `VibrationEnabled` |
| `gradualVolume` | `GradualVolume` |
| `gradualVolumeDurationSec` | `GradualVolumeDurationSec` |
| `autoDismissMin` | `AutoDismissMin` |
| `nextFireTime` | `NextFireTime` |
| `deletedAt` | `DeletedAt` |
| `createdAt` | `CreatedAt` |
| `updatedAt` | `UpdatedAt` |
| `fileName` | `FileName` |
| `alarmId` | `AlarmId` |
| `firedAt` | `FiredAt` |
| `dismissedAt` | `DismissedAt` |
| `snoozeCount` | `SnoozeCount` |
| `challengeType` | `ChallengeType` |
| `challengeSolveTimeSec` | `ChallengeSolveTimeSec` |
| `sleepQuality` | `SleepQuality` |

---

## NV-005: Rust Struct Serialized Keys Will Be snake_case

**Severity:** 🔴 Critical  
**Location:** `01-fundamentals/01-data-model.md` (Rust struct section)  
**Rule Violated:** Rust serde default is snake_case; spec doesn't specify `#[serde(rename_all = "PascalCase")]`  
**Status:** ✅ Resolved — `#[serde(rename_all = "PascalCase")]` added to `AlarmRow` struct, `from_row()` string literals updated

**Impact:** When Tauri serializes Rust → JSON → TypeScript, all keys will be `snake_case` unless `serde` rename is specified. The spec has no mention of serde attributes.

---

## NV-006: Migration File Names Use snake_case

**Severity:** 🟡 Medium  
**Location:** `01-fundamentals/01-data-model.md` (line 426–428)  
**Status:** ✅ Resolved — **Exempt** (external convention)

| Current | Note |
|---------|------|
| `V1__initial_schema.sql` | `refinery` crate convention — **declared exempt** |
| `V3__add_alarm_label_cache.sql` | Same |

**Resolution:** Refinery crate requires `V{N}__{description}.sql` format. This is an external tool convention and cannot be changed. Added to exemptions table (CG-005).

---

## NV-007: Primary Key Uses Generic `id` Instead of `{TableName}Id`

**Severity:** 🔴 Critical  
**Location:** `01-fundamentals/01-data-model.md` (lines 223, 248, 266)  
**Rule Violated:** `10-database-conventions/01-naming-conventions.md` §PK — "Primary key MUST be named `{TableName}Id`"  
**Status:** ✅ Resolved — PKs renamed: `id` → `AlarmId`, `AlarmGroupId`, `AlarmEventId`

| Table | Current PK | Required PK |
|-------|-----------|-------------|
| `alarms` | `id TEXT PRIMARY KEY` | `AlarmId TEXT PRIMARY KEY` |
| `alarm_groups` | `id TEXT PRIMARY KEY` | `AlarmGroupId TEXT PRIMARY KEY` |
| `alarm_events` | `id TEXT PRIMARY KEY` | `AlarmEventId TEXT PRIMARY KEY` |
| `settings` | `key TEXT PRIMARY KEY` | (key-value table — may be exemption) |

---

## NV-008: Boolean Columns Missing `Is`/`Has` Prefix

**Severity:** 🔴 Critical  
**Location:** `01-fundamentals/01-data-model.md` (lines 227–237, 251)  
**Rule Violated:** `10-database-conventions/01-naming-conventions.md` §Boolean — "Every boolean column MUST start with `Is` or `Has`"  
**Status:** ✅ Resolved — `enabled` → `IsEnabled`, `previous_enabled` → `IsPreviousEnabled`, `vibration_enabled` → `IsVibrationEnabled`

| Current | Required | Table |
|---------|----------|-------|
| `enabled INTEGER` | `IsEnabled INTEGER` | `alarms` |
| `previous_enabled INTEGER` | `IsPreviousEnabled INTEGER` or `PreviousIsEnabled` | `alarms` |
| `vibration_enabled INTEGER` | `IsVibrationEnabled INTEGER` | `alarms` |
| `enabled INTEGER` | `IsEnabled INTEGER` | `alarm_groups` |

---

## NV-009: Tauri IPC Commands Use snake_case

**Severity:** 🟡 Medium  
**Location:** `02-features/01-alarm-crud.md`, `06-tauri-architecture-and-framework-comparison.md`  
**Status:** ✅ Resolved — **Exempt** (external convention)

**Resolution:** Tauri convention requires snake_case for IPC commands. This is an external framework convention and cannot be changed without fighting the framework. Added to exemptions table (CG-005).

| Current | If PascalCase applied |
|---------|----------------------|
| `create_alarm` | `CreateAlarm` |
| `update_alarm` | `UpdateAlarm` |
| `delete_alarm` | `DeleteAlarm` |
| `snooze_alarm` | `SnoozeAlarm` |
| `dismiss_alarm` | `DismissAlarm` |
| `get_settings` | `GetSettings` |

---

## NV-010: CSV Export Columns Use snake_case

**Severity:** 🟡 Medium  
**Location:** `02-features/10-export-import.md` (line 60)  
**Status:** 🔴 Open

**Current:** `id, time, date, label, enabled, repeat_type, repeat_days, group_name, sound_file, snooze_duration, max_snooze_count`  
**Required:** PascalCase per key naming standard (these are serialized keys)

---

## NV-011: JSON Export Keys Use camelCase

**Severity:** 🔴 Critical  
**Location:** `02-features/10-export-import.md` (line 59)  
**Status:** 🔴 Open

**Current:** `{ alarms: Alarm[], groups: AlarmGroup[], exportedAt: string, version: string }`  
**Required:** `{ Alarms: Alarm[], Groups: AlarmGroup[], ExportedAt: string, Version: string }`

---

## NV-012: CSV Export snake_case Also a Logic Consistency Issue

**Severity:** 🟡 Medium  
**Location:** `02-features/10-export-import.md` (line 60)  
**Cross-ref:** LC-011 in `06-logic-consistency.md`  
**Status:** 🔴 Open

**Problem:** CSV columns `repeat_type, repeat_days, group_name, sound_file, snooze_duration, max_snooze_count` are serialized data keys — PascalCase mandate applies. This is both a naming violation and a data flow logic issue.

---

## NV-013: TS HistoryFilter Uses camelCase Keys

**Severity:** 🟡 Medium  
**Location:** `02-features/13-analytics.md` (lines 48–56)  
**Rule Violated:** `11-key-naming-pascalcase.md` §1  
**Cross-ref:** UX-005 in `07-ui-ux-consistency.md`  
**Status:** 🔴 Open

| Current (camelCase) | Required (PascalCase) |
|---------------------|-----------------------|
| `startDate` | `StartDate` |
| `endDate` | `EndDate` |
| `groupId` | `GroupId` |
| `alarmId` | `AlarmId` |
| `eventType` | `EventType` |
| `sortBy` | `SortBy` |
| `sortOrder` | `SortOrder` |

---

## NV-014: ImportResult Uses camelCase Keys

**Severity:** 🟡 Medium  
**Location:** `02-features/10-export-import.md` (lines 96–101)  
**Rule Violated:** `11-key-naming-pascalcase.md` §1  
**Cross-ref:** UX-006 in `07-ui-ux-consistency.md`  
**Status:** 🔴 Open

| Current | Required |
|---------|----------|
| `imported` | `Imported` |
| `skipped` | `Skipped` |
| `overwritten` | `Overwritten` |
| `errors` | `Errors` |

---

## NV-015: UndoEntry Interface Uses camelCase

**Severity:** 🟡 Medium  
**Location:** `02-features/01-alarm-crud.md` (lines 215–220)  
**Rule Violated:** `11-key-naming-pascalcase.md` §1  
**Cross-ref:** UX-007 in `07-ui-ux-consistency.md`  
**Status:** 🔴 Open

| Current | Required |
|---------|----------|
| `token` | `Token` |
| `alarmId` | `AlarmId` |
| `label` | `Label` |
| `expiresAt` | `ExpiresAt` |
| `timerId` | `TimerId` |

---

## Issues Found So Far: 15
## Open: 6 | Resolved: 9
