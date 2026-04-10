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

## IC-008: Alarm Engine Check Interval Contradiction

**Severity:** 🟡 Medium  
**Status:** 🔴 Open

**The contradiction:**

| File | Stated Interval |
|------|----------------|
| `06-tauri-architecture.md` line 56 | 1-second interval timer |
| `03-alarm-firing.md` | 30-second check interval |
| `07-startup-sequence.md` | 30-second check interval |
| `12-platform-and-concurrency-guide.md` | 30-second check interval |

**Impact:** AI will implement either 1s or 30s depending on which file it reads first. 1s vs 30s has significant CPU and battery implications.

---

## IC-009: `tauri-plugin-sql` vs `rusqlite` — Second Driver Conflict

**Severity:** 🔴 Critical  
**Status:** 🔴 Open

**Location:** `01-fundamentals/06-tauri-architecture-and-framework-comparison.md` (line 59)

**Problem:** Storage module lists `tauri-plugin-sql` (SQLite) as a dependency. The entire project uses `rusqlite` directly (confirmed by IC-001 resolution). AI will install `tauri-plugin-sql` from `Cargo.toml` dependencies and get a completely different API.

**Note:** This is distinct from IC-001 (which was `sqlx` in code samples). IC-009 is about the dependency list in the architecture overview.

---

## IC-010: `delete_alarm` Return Type Contradicts Between Files

**Severity:** 🟡 Medium  
**Status:** 🔴 Open

| File | Return Type |
|------|-------------|
| `06-tauri-architecture.md` line 76 | `void` |
| `01-alarm-crud.md` line 285 | `{ UndoToken: string }` |

**Impact:** AI will implement one or the other. The CRUD spec is more detailed and authoritative, but the architecture overview is typically read first.

---

## IC-011: `export_data` IPC Payload Contradicts Between Files

**Severity:** 🟡 Medium  
**Status:** 🔴 Open

| File | Payload |
|------|---------|
| `06-tauri-architecture.md` line 105 | `void` (no parameters) |
| `10-export-import.md` line 46 | `{ Format, Scope, AlarmIds? }` |

**Impact:** AI won't know if `export_data` takes parameters or not. The export spec is more detailed.

---

## Issues Found So Far: 11
## Open: 9 | Resolved: 2
