# Naming Violations

**Version:** 1.0.0  
**Updated:** 2026-04-09

---

## Summary

Issues where the alarm app spec violates its own coding guidelines — primarily the PascalCase key naming standard (`spec/02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/11-key-naming-pascalcase.md`).

---

## NV-001: Database Column Names Use snake_case

**Severity:** 🔴 Critical  
**Location:** `01-fundamentals/01-data-model.md` (lines 222–275)  
**Rule Violated:** `11-key-naming-pascalcase.md` §1 — "Database column names: `user_id` → `UserId`"  
**Status:** 🔴 Open

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
**Status:** 🔴 Open

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
**Status:** 🔴 Open

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
**Status:** 🔴 Open

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
**Status:** 🔴 Open

**Impact:** When Tauri serializes Rust → JSON → TypeScript, all keys will be `snake_case` unless `serde` rename is specified. The spec has no mention of serde attributes.

---

## NV-006: Migration File Names Use snake_case

**Severity:** 🟡 Medium  
**Location:** `01-fundamentals/01-data-model.md` (line 426–428)  
**Status:** 🔴 Open

| Current | Note |
|---------|------|
| `V1__initial_schema.sql` | `refinery` crate convention — may be an acceptable exemption |
| `V3__add_alarm_label_cache.sql` | Same |

**Decision needed:** Is this an exemption (external tool convention) or violation?

---

## Issues Found So Far: 6
## Open: 6 | Resolved: 0
