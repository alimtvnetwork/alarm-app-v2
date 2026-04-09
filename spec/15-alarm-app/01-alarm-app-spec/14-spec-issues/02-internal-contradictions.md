# Internal Contradictions

**Version:** 1.0.0  
**Updated:** 2026-04-09

---

## Summary

Issues where different spec files contradict each other — the most dangerous category for AI handoff because the AI has no way to resolve ambiguity.

---

## IC-001: sqlx vs rusqlite — Database Driver Conflict

**Severity:** 🔴 Critical  
**Status:** 🔴 Open

**The contradiction:**

| File | Uses | Evidence |
|------|------|----------|
| `01-data-model.md` line 420 | **Rejects** `sqlx` | "Alternatives rejected: `sqlx` (async-only, complex setup)" |
| `01-data-model.md` line 116–117 | `rusqlite` | `fn from_row(row: &rusqlite::Row)` |
| `01-data-model.md` line 306 | `sqlx` | `sqlx::query("DELETE FROM alarm_events...")` |
| `03-file-structure.md` line 305 | `rusqlite` | `rusqlite = { version = "0.31", features = ["bundled"] }` |
| `04-platform-constraints.md` line 133 | `rusqlite` | `Database(#[from] rusqlite::Error)` |
| `01-alarm-crud.md` lines 61, 76 | `sqlx` | `sqlx::query("DELETE FROM alarms...")` |
| `12-platform-and-concurrency-guide.md` line 151 | `rusqlite` | Table says "rusqlite" |
| `12-platform-and-concurrency-guide.md` line 181 | `sqlx` | `sqlx::query(...)` in code |
| `12-platform-and-concurrency-guide.md` line 267 | `sqlx` | "`sqlx::SqlitePool`" |
| `13-ai-cheat-sheet.md` line 16 | `rusqlite` | "SQLite (bundled, via `rusqlite`)" |

**Impact:** AI will fail at compilation. These are incompatible APIs.

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

## Issues Found So Far: 4
## Open: 4 | Resolved: 0
