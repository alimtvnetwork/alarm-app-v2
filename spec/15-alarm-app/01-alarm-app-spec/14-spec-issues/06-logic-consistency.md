# Logic Consistency Issues

**Version:** 1.1.0  
**Updated:** 2026-04-10

---

## Summary

Cross-file logic inconsistencies found during Discovery Phase 3 and Phase 6. These are issues where two or more spec files contradict each other in logic flow, data types, or expected behavior.

---

## LC-001: AlarmChallenge Not in Data Model or Alarms Table

**Severity:** 🔴 Critical  
**Location:** `02-features/06-dismissal-challenges.md` vs `01-fundamentals/01-data-model.md`  
**Status:** ✅ Resolved — added challenge columns to Alarms SQL table, TS Alarm interface, and Rust AlarmRow struct. See CG-007 resolution.

**Problem:** `06-dismissal-challenges.md` defines an `AlarmChallenge` interface with fields `type`, `difficulty`, `shakeCount`, `stepCount`. Neither the TS `Alarm` interface nor the SQL `alarms` table has a `challenge` or `ChallengeType` column. The `ChallengeType` column exists only in `alarm_events` (logging), not in `alarms` (configuration). AI cannot implement challenge-per-alarm without schema support.

---

## LC-002: Snooze State TS Interface Uses NextFireTime But Table Uses SnoozeUntil

**Severity:** 🟡 Medium  
**Location:** `02-features/04-snooze-system.md` (line 43) vs `01-fundamentals/01-data-model.md` (line 261)  
**Status:** 🔴 Open

**Problem:** TS `SnoozeState.nextFireTime` maps to SQL column `snooze_until`. Field name mismatch will cause silent serialization bugs. AI will map the wrong field name.

---

## LC-003: Soft-Delete Timer Uses sqlx While Project Chose rusqlite

**Severity:** 🔴 Critical  
**Location:** `02-features/01-alarm-crud.md` (lines 61, 76)  
**Extends:** IC-001  
**Status:** ✅ Resolved — converted to `conn.execute()` with `rusqlite` API

---

## LC-004: on_timezone_change Uses SqlitePool (sqlx) with async But rusqlite Is Sync

**Severity:** 🔴 Critical  
**Location:** `02-features/03-alarm-firing.md` (line 155)  
**Extends:** IC-001  
**Status:** ✅ Resolved — changed to `fn on_timezone_change(conn: &Connection, new_tz: &Tz)`, removed `.await`

---

## LC-005: Startup Step 2 Uses SqlitePool::connect (sqlx API)

**Severity:** 🔴 Critical  
**Location:** `01-fundamentals/07-startup-sequence.md` (line 117)  
**Extends:** IC-001  
**Status:** ✅ Resolved — changed to `Connection::open(&db_path)`

---

## LC-006: Spring-Forward DST Hardcoded to 3:00 AM

**Severity:** 🔴 Critical  
**Location:** `02-features/03-alarm-firing.md` (line 135), `01-fundamentals/13-ai-cheat-sheet.md` (line 79)  
**Status:** ✅ Resolved — replaced hardcoded `NaiveTime::from_hms_opt(3,0,0)` with timezone-agnostic minute-by-minute walk-forward algorithm in Fix Phase 16

**Resolution:** Both `03-alarm-firing.md` and `13-ai-cheat-sheet.md` now iterate forward from the skipped time until a valid local time is found. Test table expanded with EU and no-DST scenarios.

---

## LC-007: purge_old_events Uses sqlx in Data Model

**Severity:** 🟡 Medium  
**Location:** `01-fundamentals/01-data-model.md` (line 306)  
**Extends:** IC-001  
**Status:** ✅ Resolved — converted to `conn.execute()` with `rusqlite` API

---

## LC-008: currently_firing HashSet Not Thread-Safe

**Severity:** 🔴 Critical  
**Location:** `01-fundamentals/12-platform-and-concurrency-guide.md` (line 219)  
**Status:** ✅ Resolved — wrapped in `Arc<Mutex<HashSet<String>>>` with proper lock/drop pattern in Fix Phase 17

**Resolution:** `AlarmEngine.currently_firing` changed from `HashSet<String>` to `Arc<Mutex<HashSet<String>>>`. Lock is acquired, checked, inserted, then dropped before processing. Re-acquired for removal. Uses `.expect()` for poisoned mutex (acceptable — unrecoverable).

---

## LC-009: Race 2 Optimistic Locking Uses sqlx

**Severity:** 🟡 Medium  
**Location:** `01-fundamentals/12-platform-and-concurrency-guide.md` (line 181)  
**Extends:** IC-001  
**Status:** ✅ Resolved — converted to `conn.execute()` with `params![]`

---

## LC-010: Snooze Crash Recovery Not in Startup Sequence

**Severity:** 🟡 Medium  
**Location:** `02-features/04-snooze-system.md` (line 82) vs `01-fundamentals/07-startup-sequence.md` (Step 8)  
**Status:** 🔴 Open

**Problem:** `04-snooze-system.md` says "On startup, query `snooze_state` table for active snoozes." But `07-startup-sequence.md` Step 8 only checks missed alarms from the `alarms` table. Active snoozes from previous session are never recovered — snoozed alarms silently disappear after crash/restart.

---

## LC-011: Missed Alarm Query Uses snake_case and Invalid Event Type

**Severity:** 🔴 Critical  
**Location:** `02-features/03-alarm-firing.md` (line 192)  
**Status:** ✅ Resolved — query updated to PascalCase columns, removed invalid `'acknowledged'` event type

**Resolution:** Line 191 rewritten to: `NextFireTime < now AND IsEnabled = 1 AND DeletedAt IS NULL`. Removed `AND type != 'acknowledged'` — not a valid `AlarmEventType` value. Queue rules (lines 485–487) also updated to PascalCase.

---

## Issues Found: 11
## Open: 2 | Resolved: 9
