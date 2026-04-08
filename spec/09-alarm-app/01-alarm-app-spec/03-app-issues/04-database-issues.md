# Database Issues

**Version:** 1.0.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None  
**Source:** AI Feasibility Analysis v1.0.0

---

## Keywords

`database`, `sqlite`, `migration`, `events`, `settings`, `orphan`

---

## Issue Registry

### DB-MIGRATE-001 — No migration tool or versioning strategy

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 65% |
| **Status** | Open |

**Description:** `migrations/` folder exists but no tool (`sqlx`, `refinery`, `diesel`) specified. No rollback plan. No version tracking table.

**Root Cause:** Missing technology decision.

**Suggested Fix:** Use `refinery` crate — embeddable, SQLite-compatible, uses numbered SQL files. Add `refinery_migrations` table automatically. Run on app startup.

---

### DB-GROWTH-001 — alarm_events table grows unbounded

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 80% |
| **Status** | Open |

**Description:** Every fire, snooze, dismiss, and miss creates a row. No retention policy, no archival, no purge command.

**Root Cause:** Missing data lifecycle management.

**Suggested Fix:** Add `settings` key `event_retention_days` (default 90). Background cleanup task purges events older than retention period on app startup.

---

### DB-ORPHAN-001 — Orphaned alarm_events after alarm deletion

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 50% |
| **Status** | Open |

**Description:** `ON DELETE SET NULL` means `alarm_id` becomes null. Events lose alarm context (which alarm?) permanently.

**Root Cause:** Intentional design but poor for analytics.

**Suggested Fix:** Before setting null, copy `alarm_label` and `alarm_time` to denormalized columns on `alarm_events`. Preserves context for history view.

---

### DB-SETTINGS-001 — Settings table has no type safety

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 90% |
| **Status** | Open |

**Description:** All values stored as TEXT. Reading `auto_launch` returns string `"true"` not boolean. Every consumer must parse.

**Root Cause:** Key-value design pattern limitation.

**Suggested Fix:** Add a `value_type` column (`boolean`, `integer`, `string`, `json`). Create a Rust helper `get_setting<T>()` that deserializes based on type. Validate on write.

---

*Database issues — created: 2026-04-08*
