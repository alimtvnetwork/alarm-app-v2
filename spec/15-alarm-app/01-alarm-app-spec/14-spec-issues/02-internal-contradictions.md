# Internal Contradictions

**Version:** 1.0.0  
**Updated:** 2026-04-09

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
**Status:** 🔴 Open

| File | Claimed Count |
|------|:-------------:|
| `09-ai-handoff-reliability-report.md` line 22 | **94 tasks** |
| `10-ai-handoff-readiness-report.md` line 31 | **62 tasks** |
| `11-atomic-task-breakdown.md` | **62 tasks** (actual content) |

**Impact:** AI won't know which task list is authoritative.

---

## IC-003: TypeScript Interface Missing Fields Present in Rust

**Severity:** 🟡 Medium  
**Status:** 🔴 Open

**Missing from TS `Alarm` interface but present in Rust struct:**
- `previousEnabled` (Rust: `previous_enabled: Option<bool>`)

**Impact:** Frontend won't handle group toggle state restoration.

---

## IC-004: alarm_events Schema Missing Resolved Columns

**Severity:** 🟡 Medium  
**Status:** 🔴 Open

**Context:** Issue `DB-ORPHAN-001` was marked resolved, claiming migration `V3__add_alarm_label_cache.sql` adds `alarm_label_snapshot` to `alarm_events`. But the actual schema in `01-data-model.md` does NOT include this column.

---

---

## IC-005: Duplicate `alarm_events` Schema Definition

**Severity:** 🟡 Medium  
**Status:** 🔴 Open

**Locations:**
- `01-fundamentals/01-data-model.md` line 265 — canonical definition
- `02-features/13-analytics.md` line 91 — duplicate definition

**Risk:** If one is updated and the other isn't, AI will get conflicting schemas. Single source of truth needed.

---

## IC-006: IPC Command Names Inconsistent Between Files

**Severity:** 🟡 Medium  
**Status:** 🔴 Open

| File | Commands listed |
|------|----------------|
| `06-tauri-architecture.md` | `get_alarms` |
| `01-alarm-crud.md` | `list_alarms` |

**Same operation, different name.** AI will implement both or pick wrong one.

---

## IC-007: `sqlx` Used in Resolved Issues (01-alarm-crud.md)

**Severity:** 🔴 Critical  
**Status:** ✅ Resolved

**Resolution:** Converted `01-alarm-crud.md` soft-delete and cleanup code from `sqlx::query()` to `conn.execute()` with `rusqlite` API. See IC-001 resolution.

---

## Issues Found So Far: 7
## Open: 5 | Resolved: 2
