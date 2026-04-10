# Logic Consistency Issues

**Version:** 1.0.0  
**Updated:** 2026-04-09

---

## Summary

Cross-file logic inconsistencies found during Discovery Phase 3. These are issues where two or more spec files contradict each other in logic flow, data types, or expected behavior.

---

## LC-001: AlarmChallenge Not in Data Model or Alarms Table

**Severity:** 🔴 Critical  
**Location:** `02-features/06-dismissal-challenges.md` vs `01-fundamentals/01-data-model.md`  
**Status:** 🔴 Open

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

**Problem:** `sqlx::query(...)` used in the delete timer and cleanup functions. These are the ONLY code samples for soft-delete/undo behavior — AI will copy them verbatim and get compile errors.

---

## LC-004: on_timezone_change Uses SqlitePool (sqlx) with async But rusqlite Is Sync

**Severity:** 🔴 Critical  
**Location:** `02-features/03-alarm-firing.md` (line 155)  
**Extends:** IC-001  
**Status:** ✅ Resolved — changed to `fn on_timezone_change(conn: &Connection, new_tz: &Tz)`, removed `.await`

**Problem:** `fn on_timezone_change(pool: &SqlitePool, new_tz: &Tz)` used `.await` inside. `rusqlite` is synchronous — no `SqlitePool`, no `.await`.

---

## LC-005: Startup Step 2 Uses SqlitePool::connect (sqlx API)

**Severity:** 🔴 Critical  
**Location:** `01-fundamentals/07-startup-sequence.md` (line 117)  
**Extends:** IC-001  
**Status:** ✅ Resolved — changed to `Connection::open(&db_path)`

**Problem:** Was using `SqlitePool::connect(...)` (sqlx API). Now uses `Connection::open()` (rusqlite).

---

## LC-006: Spring-Forward DST Hardcoded to 3:00 AM

**Severity:** 🔴 Critical  
**Location:** `02-features/03-alarm-firing.md` (line 135), `01-fundamentals/13-ai-cheat-sheet.md` (line 79)  
**Status:** 🔴 Open

**Problem:** DST fallback is hardcoded to `NaiveTime::from_hms_opt(3, 0, 0)`. DST transitions vary globally: EU = 2:00→3:00, Lord Howe Island = 2:00→2:30, Brazil (historical) = 0:00→1:00. Correct approach: iterate forward minute-by-minute from skipped time until a valid local time is found. AI will copy the hardcoded value and produce incorrect behavior for ~30% of world timezones.

---

## LC-007: purge_old_events Uses sqlx in Data Model

**Severity:** 🟡 Medium  
**Location:** `01-fundamentals/01-data-model.md` (line 306)  
**Extends:** IC-001  
**Status:** ✅ Resolved — converted to `conn.execute()` with `rusqlite` API

**Problem:** Was using `sqlx::query(...)`. Now uses `conn.execute(..., params![...])` (rusqlite).

---

## LC-008: currently_firing HashSet Not Thread-Safe

**Severity:** 🔴 Critical  
**Location:** `01-fundamentals/12-platform-and-concurrency-guide.md` (line 219)  
**Status:** 🔴 Open

**Problem:** `currently_firing: HashSet<String>` in `AlarmEngine` is not `Send + Sync` — cannot be shared across async tasks without `Arc<Mutex<>>`. Engine runs in `tokio::spawn` — needs `Arc<Mutex<HashSet<String>>>` or `DashSet`. AI will get a compile error on the `Sync` bound.

---

## LC-009: Race 2 Optimistic Locking Uses sqlx

**Severity:** 🟡 Medium  
**Location:** `01-fundamentals/12-platform-and-concurrency-guide.md` (line 181)  
**Extends:** IC-001  
**Status:** ✅ Resolved — converted to `conn.execute()` with `params![]`

**Problem:** Was using `sqlx::query(...)`. Now uses `conn.execute(..., params![...])` (rusqlite).

---

## LC-010: Snooze Crash Recovery Not in Startup Sequence

**Severity:** 🟡 Medium  
**Location:** `02-features/04-snooze-system.md` (line 82) vs `01-fundamentals/07-startup-sequence.md` (Step 8)  
**Status:** 🔴 Open

**Problem:** `04-snooze-system.md` says "On startup, query `snooze_state` table for active snoozes." But `07-startup-sequence.md` Step 8 only checks missed alarms from the `alarms` table. Active snoozes from previous session are never recovered — snoozed alarms silently disappear after crash/restart.

---

## Issues Found: 10
## Open: 5 | Resolved: 5
