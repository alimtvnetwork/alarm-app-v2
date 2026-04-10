# Internal Contradictions

**Version:** 1.1.0  
**Updated:** 2026-04-10

---

## Summary

Issues where different spec files contradict each other — the most dangerous category for AI handoff because the AI has no way to resolve ambiguity.

---

## IC-001: sqlx vs rusqlite — Database Driver Conflict

**Severity:** 🔴 Critical  
**Status:** ✅ Resolved

**The contradiction:** Multiple files used `sqlx` APIs (`SqlitePool`, `sqlx::query()`, `.await`) while the project chose `rusqlite` (sync).

**Resolution:** All code samples converted to `rusqlite` synchronous API:
- `SqlitePool` → `Connection` or `Arc<Mutex<Connection>>`
- `sqlx::query(...).bind(...).execute(pool).await` → `conn.execute(..., params![...])`
- Removed `.await` from all DB operations
- Files fixed: `01-data-model.md`, `01-alarm-crud.md`, `03-alarm-firing.md`, `07-startup-sequence.md`, `12-platform-and-concurrency-guide.md`

---

## IC-002: Task Count Contradictions

**Severity:** 🔴 Critical  
**Status:** ✅ Resolved — reliability report's 94-task list marked as superseded, `11-atomic-task-breakdown.md` (62 tasks) is authoritative

**Resolution:** Added deprecation notice to `09-ai-handoff-reliability-report.md` §Atomic Task Breakdown pointing AI to `11-atomic-task-breakdown.md` as the canonical task list.

---

## IC-003: TypeScript Interface Missing Fields Present in Rust

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved — added `IsPreviousEnabled: boolean | null` to TS `Alarm` interface in Fix Phase 17

**Resolution:** Field added to `01-data-model.md` TS interface with comment: "Saved state for group toggle restore (null = no saved state)". Already present in Rust `AlarmRow` struct and SQLite schema.

---

## IC-004: alarm_events Schema Missing Resolved Columns

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved — added `AlarmLabelSnapshot` and `AlarmTimeSnapshot` columns to `AlarmEvents` schema in Fix Phase 17

**Resolution:** Added two columns to `AlarmEvents` CREATE TABLE in `01-data-model.md`: `AlarmLabelSnapshot TEXT NOT NULL DEFAULT ''` and `AlarmTimeSnapshot TEXT NOT NULL DEFAULT ''`. Also fixed `AlarmId` foreign key reference from `alarms` to `Alarms`.

---

## IC-005: Duplicate `alarm_events` Schema Definition

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved — duplicate schema removed from `13-analytics.md`, replaced with cross-reference

**Resolution:** See GC-009. The analytics spec now references the canonical schema in `01-data-model.md` instead of duplicating it.

---

## IC-006: IPC Command Names Inconsistent Between Files

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved — standardized to `list_alarms` in all files

**Resolution:** Renamed `get_alarms` → `list_alarms` in `06-tauri-architecture.md` and `11-atomic-task-breakdown.md` to match the canonical name in `01-alarm-crud.md`.

---

## IC-007: `sqlx` Used in Resolved Issues (01-alarm-crud.md)

**Severity:** 🔴 Critical  
**Status:** ✅ Resolved

**Resolution:** Converted `01-alarm-crud.md` soft-delete and cleanup code from `sqlx::query()` to `conn.execute()` with `rusqlite` API. See IC-001 resolution.

---

## IC-008: Alarm Engine Check Interval Contradiction

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved — architecture overview updated from "1-second" to "30-second" to match all other files

**Resolution:** `06-tauri-architecture.md` line 56 changed from "1-second interval timer" to "30-second interval timer". Three other files already said 30s — now all 4 are consistent.

---

## IC-009: `tauri-plugin-sql` vs `rusqlite` — Second Driver Conflict

**Severity:** 🔴 Critical  
**Status:** ✅ Resolved — all `tauri-plugin-sql` references replaced with `rusqlite` + `refinery`

**Resolution:** Updated 6 files:
- `06-tauri-architecture.md` — storage module crate + plugin table
- `03-file-structure.md` — Cargo.toml dependencies + permissions table (removed SQL plugin permissions since rusqlite doesn't use Tauri plugin system)
- `reference/alarm-app-features.md` — tech stack table
- `03-app-issues/01-web-to-native-migration.md` — migration comparison table
- `09-ai-handoff-reliability-report.md` — task 1.5 crate list

---

## IC-010: `delete_alarm` Return Type Contradicts Between Files

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved — architecture overview updated to return `{ UndoToken: string }` matching CRUD spec

---

## IC-011: `export_data` IPC Payload Contradicts Between Files

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved — architecture overview updated to `{ Format: string, Scope: string, AlarmIds?: string[] }` matching export spec. Also fixed `update_setting` and `import_data` payload keys to PascalCase.

---

## Issues Found So Far: 11
## Open: 0 | Resolved: 11
