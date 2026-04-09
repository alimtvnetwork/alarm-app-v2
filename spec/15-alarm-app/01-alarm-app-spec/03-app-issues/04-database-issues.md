# Database Issues

**Version:** 1.1.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** None  
**Source:** AI Feasibility Analysis v1.0.0, AI Handoff Reliability Report v1.0.0

---

## Keywords

`database`, `sqlite`, `migration`, `events`, `settings`, `orphan`, `serialization`, `json`

---

## Issue Registry

### DB-MIGRATE-001 — No migration tool or versioning strategy

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 65% → 0% |
| **Status** | ✅ Resolved |

**Description:** `migrations/` folder exists but no tool (`sqlx`, `refinery`, `diesel`) specified. No rollback plan. No version tracking table.

**Root Cause:** Missing technology decision.

**Resolution:** Added complete "Migration Strategy (refinery)" section to `01-fundamentals/01-data-model.md` v1.4.0 with tool choice rationale, file naming convention (`V{N}__{desc}.sql`), Rust runner code, startup integration (Step 3), rollback plan, and V1 initial migration with indexes and default settings.

---

### DB-GROWTH-001 — alarm_events table grows unbounded

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 80% → 0% |
| **Status** | ✅ Resolved |

**Description:** Every fire, snooze, dismiss, and miss creates a row. No retention policy, no archival, no purge command.

**Root Cause:** Missing data lifecycle management.

**Resolution:** Added event retention policy to `01-fundamentals/01-data-model.md` v1.5.0 with `event_retention_days` setting (default 90), startup purge function in Rust, and `idx_events_timestamp` index for efficient deletion.

---

### DB-ORPHAN-001 — Orphaned alarm_events after alarm deletion

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 50% → 0% |
| **Status** | ✅ Resolved |

**Description:** `ON DELETE SET NULL` means `alarm_id` becomes null. Events lose alarm context (which alarm?) permanently.

**Root Cause:** Intentional design but poor for analytics.

**Resolution:** Added `alarm_label_snapshot` (TEXT) and `alarm_time_snapshot` (TEXT) denormalized columns to `alarm_events` table in `01-fundamentals/01-data-model.md`. On every event insert, copy the alarm's current label and time to these columns. When `alarm_id` becomes NULL (alarm deleted), the snapshot columns preserve context for history/analytics views. Migration: `ALTER TABLE alarm_events ADD COLUMN alarm_label_snapshot TEXT DEFAULT ''; ALTER TABLE alarm_events ADD COLUMN alarm_time_snapshot TEXT DEFAULT '';`.

---

### DB-SETTINGS-001 — Settings table has no type safety

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 90% → 0% |
| **Status** | ✅ Resolved |

**Description:** All values stored as TEXT. Reading `auto_launch` returns string `"true"` not boolean. Every consumer must parse.

**Root Cause:** Key-value design pattern limitation.

**Resolution:** Added `value_type` column (TEXT, one of: `boolean`, `integer`, `string`, `json`) to `settings` table in `01-fundamentals/01-data-model.md` and a typed Rust helper:

```rust
pub fn get_setting<T: FromSettingValue>(conn: &Connection, key: &str) -> Result<T, AlarmAppError> {
    let row = conn.query_row(
        "SELECT value, value_type FROM settings WHERE key = ?", [key],
        |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?))
    )?;
    T::from_setting(&row.0, &row.1)
}
```

Validates type on write. `FromSettingValue` trait implemented for `bool`, `i64`, `String`, and `serde_json::Value`.

---

### DB-SERIAL-001 — RepeatPattern JSON serialization in SQLite ambiguous

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 70% → 0% |
| **Status** | ✅ Resolved |
| **Fail %** | 55% → 5% |

**Description:** `repeat_days_of_week` stored as JSON string (`"[0,3,5]"`) in a TEXT column. The spec shows TypeScript interfaces but not the Rust serialization/deserialization strategy.

**Root Cause:** Missing Rust-side data mapping examples.

**Resolution:** Added complete `AlarmRow` Rust struct to `01-fundamentals/01-data-model.md` v1.6.0 with `from_row()` constructor, `days_of_week()` JSON deserializer, `repeat_pattern()` converter, `RepeatType` enum with `FromStr`, and key patterns for SQLite INTEGER→bool, JSON TEXT, and nullable columns.

---

*Database issues — updated: 2026-04-09*
