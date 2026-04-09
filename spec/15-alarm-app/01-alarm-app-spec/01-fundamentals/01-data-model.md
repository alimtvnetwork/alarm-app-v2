# Data Model

**Version:** 1.6.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** None  
**Resolves:** DB-MIGRATE-001, BE-CONCUR-001, DB-GROWTH-001, FE-STATE-001, DB-SERIAL-001, BE-CRON-001, DB-ORPHAN-001, DB-SETTINGS-001

---

## Keywords

`data-model`, `types`, `interfaces`, `storage`, `validation`, `sqlite`, `repeat-pattern`

---

## Purpose

Defines all TypeScript interfaces, SQLite schema, and validation rules for the Alarm App.

---

## Interfaces

### Alarm

```typescript
interface Alarm {
  id: string;                      // UUID v4
  time: string;                    // "HH:MM" 24-hour format
  date: string | null;             // "YYYY-MM-DD" for date-specific alarms, null for recurring/daily
  label: string;                   // User-defined label, max 50 chars
  enabled: boolean;                // Toggle state
  repeat: RepeatPattern;           // Scheduling pattern (replaces recurringDays)
  groupId: string | null;          // Reference to AlarmGroup.id
  snoozeDurationMin: number;       // 1–30, default 5
  maxSnoozeCount: number;          // 1–10, default 3 (0 = snooze disabled)
  soundFile: string;               // Built-in key OR custom file path
  vibrationEnabled: boolean;       // Independent vibration toggle
  gradualVolume: boolean;          // Fade-in volume enabled
  gradualVolumeDurationSec: number; // 15, 30, or 60 seconds
  autoDismissMin: number;          // 0 = disabled, 1–60 = auto-stop after N minutes
  nextFireTime: string | null;     // ISO 8601 — precomputed next fire time
  deletedAt: string | null;        // ISO 8601 — soft-delete timestamp (null = active)
  createdAt: string;               // ISO 8601 timestamp
  updatedAt: string;               // ISO 8601 timestamp
}
```

### RepeatPattern

**Cron Parsing Library (Rust):** `croner` crate v2.0 — MIT licensed, lightweight, supports standard 5-field cron + extensions. Pinned in `Cargo.toml`.

> **Resolves BE-CRON-001.** Without specifying the crate, AI may choose deprecated `cron` or incompatible `saffron`.

```typescript
interface RepeatPattern {
  type: "once" | "daily" | "weekly" | "interval" | "cron";
  daysOfWeek: number[];       // 0=Sun..6=Sat (for "weekly" type)
  intervalMinutes: number;    // For "interval" type (e.g., every 120 min)
  cronExpression: string;     // For "cron" type — parsed by `croner` crate
}
```

### Rust Data Mapping (Resolves DB-SERIAL-001)

> Without explicit Rust struct examples, AI will get `serde_json` deserialization wrong for JSON columns stored as TEXT.

```rust
use serde::{Deserialize, Serialize};

/// Rust struct mapping the `alarms` SQLite table row.
/// JSON fields are stored as TEXT in SQLite and must be manually deserialized.
#[derive(Debug, Clone)]
pub struct AlarmRow {
    pub id: String,
    pub time: String,                     // "HH:MM"
    pub date: Option<String>,            // "YYYY-MM-DD" or NULL
    pub label: String,
    pub enabled: bool,                    // SQLite INTEGER → bool
    pub previous_enabled: Option<bool>,
    pub repeat_type: String,              // "once"|"daily"|"weekly"|"interval"|"cron"
    pub repeat_days_of_week: String,      // JSON TEXT: "[0,3,5]"
    pub repeat_interval_minutes: i32,
    pub repeat_cron_expression: String,
    pub group_id: Option<String>,
    pub snooze_duration_min: i32,
    pub max_snooze_count: i32,
    pub sound_file: String,
    pub vibration_enabled: bool,
    pub gradual_volume: bool,
    pub gradual_volume_duration_sec: i32,
    pub auto_dismiss_min: i32,
    pub next_fire_time: Option<String>,   // ISO 8601
    pub deleted_at: Option<String>,       // ISO 8601
    pub created_at: String,
    pub updated_at: String,
}

impl AlarmRow {
    /// Deserialize JSON array from TEXT column
    pub fn days_of_week(&self) -> Vec<u8> {
        serde_json::from_str(&self.repeat_days_of_week).unwrap_or_default()
    }

    /// Convert to RepeatPattern for scheduling logic
    pub fn repeat_pattern(&self) -> RepeatPattern {
        RepeatPattern {
            r#type: self.repeat_type.parse().unwrap_or(RepeatType::Once),
            days_of_week: self.days_of_week(),
            interval_minutes: self.repeat_interval_minutes as u32,
            cron_expression: self.repeat_cron_expression.clone(),
        }
    }

    /// Convert from rusqlite::Row
    pub fn from_row(row: &rusqlite::Row) -> rusqlite::Result<Self> {
        Ok(Self {
            id: row.get("id")?,
            time: row.get("time")?,
            date: row.get("date")?,
            label: row.get("label")?,
            enabled: row.get::<_, i32>("enabled")? != 0,
            previous_enabled: row.get::<_, Option<i32>>("previous_enabled")?.map(|v| v != 0),
            repeat_type: row.get("repeat_type")?,
            repeat_days_of_week: row.get("repeat_days_of_week")?,
            repeat_interval_minutes: row.get("repeat_interval_minutes")?,
            repeat_cron_expression: row.get("repeat_cron_expression")?,
            group_id: row.get("group_id")?,
            snooze_duration_min: row.get("snooze_duration_min")?,
            max_snooze_count: row.get("max_snooze_count")?,
            sound_file: row.get("sound_file")?,
            vibration_enabled: row.get::<_, i32>("vibration_enabled")? != 0,
            gradual_volume: row.get::<_, i32>("gradual_volume")? != 0,
            gradual_volume_duration_sec: row.get("gradual_volume_duration_sec")?,
            auto_dismiss_min: row.get("auto_dismiss_min")?,
            next_fire_time: row.get("next_fire_time")?,
            deleted_at: row.get("deleted_at")?,
            created_at: row.get("created_at")?,
            updated_at: row.get("updated_at")?,
        })
    }
}

/// Rust enum matching RepeatPattern.type for type-safe matching
#[derive(Debug, Clone, PartialEq)]
pub enum RepeatType {
    Once,
    Daily,
    Weekly,
    Interval,
    Cron,
}

impl std::str::FromStr for RepeatType {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "once" => Ok(Self::Once),
            "daily" => Ok(Self::Daily),
            "weekly" => Ok(Self::Weekly),
            "interval" => Ok(Self::Interval),
            "cron" => Ok(Self::Cron),
            _ => Err(format!("Unknown repeat type: {s}")),
        }
    }
}
```

**Key patterns:**
- SQLite `INTEGER` booleans → Rust `bool` via `row.get::<_, i32>() != 0`
- JSON TEXT columns → `serde_json::from_str()` with `unwrap_or_default()` (never panic)
- `Option<String>` for nullable TEXT columns

### AlarmGroup

```typescript
interface AlarmGroup {
  id: string;       // UUID v4
  name: string;     // Group name, max 30 chars
  color: string;    // Hex color for visual coding (e.g., "#FF5733")
  enabled: boolean; // Master toggle — disabling disables all member alarms
}
```

### AlarmSound

```typescript
interface AlarmSound {
  id: string;       // Unique identifier
  name: string;     // Display name
  fileName: string; // Audio file reference (built-in path)
  category: 'classic' | 'gentle' | 'nature' | 'digital';
}
```

### AlarmEvent

```typescript
interface AlarmEvent {
  id: string;
  alarmId: string;
  type: "fired" | "snoozed" | "dismissed" | "missed";
  firedAt: string;               // ISO 8601
  dismissedAt: string | null;    // ISO 8601
  snoozeCount: number;
  challengeType?: string;
  challengeSolveTimeSec?: number;
  sleepQuality?: number;         // 1-5
  mood?: string;
  timestamp: string;             // ISO 8601 — when this event occurred
}
```

---

## SQLite Schema

### Tables

```sql
CREATE TABLE alarms (
  id TEXT PRIMARY KEY,
  time TEXT NOT NULL,
  date TEXT,                                        -- YYYY-MM-DD or NULL
  label TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1,
  previous_enabled INTEGER,                          -- Saved state for group toggle (FE-STATE-001)
  repeat_type TEXT NOT NULL DEFAULT 'once',          -- once|daily|weekly|interval|cron
  repeat_days_of_week TEXT NOT NULL DEFAULT '[]',    -- JSON array
  repeat_interval_minutes INTEGER NOT NULL DEFAULT 0,
  repeat_cron_expression TEXT NOT NULL DEFAULT '',
  group_id TEXT REFERENCES alarm_groups(id) ON DELETE SET NULL,
  snooze_duration_min INTEGER NOT NULL DEFAULT 5,
  max_snooze_count INTEGER NOT NULL DEFAULT 3,
  sound_file TEXT NOT NULL DEFAULT 'classic-beep',
  vibration_enabled INTEGER NOT NULL DEFAULT 0,
  gradual_volume INTEGER NOT NULL DEFAULT 0,
  gradual_volume_duration_sec INTEGER NOT NULL DEFAULT 30,
  auto_dismiss_min INTEGER NOT NULL DEFAULT 0,
  next_fire_time TEXT,                               -- ISO 8601 precomputed
  deleted_at TEXT,                                   -- soft-delete timestamp
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE alarm_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366F1',
  enabled INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE snooze_state (
  alarm_id TEXT PRIMARY KEY REFERENCES alarms(id) ON DELETE CASCADE,
  snooze_until TEXT NOT NULL,  -- ISO 8601 timestamp
  snooze_count INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE alarm_events (
  id TEXT PRIMARY KEY,
  alarm_id TEXT REFERENCES alarms(id) ON DELETE SET NULL,
  type TEXT NOT NULL,           -- fired|snoozed|dismissed|missed
  fired_at TEXT NOT NULL,
  dismissed_at TEXT,
  snooze_count INTEGER NOT NULL DEFAULT 0,
  challenge_type TEXT,
  challenge_solve_time_sec REAL,
  sleep_quality INTEGER,
  mood TEXT,
  timestamp TEXT NOT NULL
);
```

### SQLite WAL Mode (Resolves BE-CONCUR-001)

The alarm engine writes `alarm_events` and updates `nextFireTime` while the user may be saving edits. Without WAL, single-writer SQLite queues writes and causes UI lag.

```sql
-- Run at startup Step 4 (after migrations)
PRAGMA journal_mode=WAL;
PRAGMA busy_timeout=5000;  -- Wait up to 5s for locks instead of failing immediately
```

**Why WAL?** Write-Ahead Logging allows concurrent reads during writes. The alarm engine and UI can operate simultaneously without blocking.

### Event Retention Policy (Resolves DB-GROWTH-001)

The `alarm_events` table grows unbounded. A retention policy purges old events on startup.

```rust
// Run at startup Step 8 (after missed alarm check)
pub async fn purge_old_events(pool: &SqlitePool) {
    let retention_days: i64 = get_setting(pool, "event_retention_days")
        .await
        .and_then(|v| v.parse().ok())
        .unwrap_or(90);

    let cutoff = Utc::now() - chrono::Duration::days(retention_days);

    let result = sqlx::query("DELETE FROM alarm_events WHERE timestamp < ?")
        .bind(cutoff.to_rfc3339())
        .execute(pool).await;

    if let Ok(r) = result {
        tracing::info!(deleted = r.rows_affected(), retention_days, "Purged old alarm events");
    }
}
```

**Settings key:** `event_retention_days` (default: `90`). Configurable in Settings UI.

### Settings Keys

| Key | Type | Description |
|-----|------|-------------|
| `theme` | `"light" \| "dark" \| "system"` | Theme preference |
| `time_format` | `"12h" \| "24h"` | Clock display format |
| `default_snooze_duration` | `number` | Default snooze minutes for new alarms |
| `default_sound` | `string` | Default sound for new alarms |
| `auto_launch` | `"true" \| "false"` | Start on system boot |
| `minimize_to_tray` | `"true" \| "false"` | Keep running when window closed |
| `language` | `string` | i18n locale code (default: "en") |
| `event_retention_days` | `number` | Days to keep alarm_events (default: 90) |

---

## Validation Rules

| Field | Rule |
|-------|------|
| `time` | Must match `HH:MM` format, 00:00–23:59 |
| `date` | Must match `YYYY-MM-DD` or be null |
| `label` | String, 0–50 characters, trimmed |
| `repeat.type` | One of: `once`, `daily`, `weekly`, `interval`, `cron` |
| `repeat.daysOfWeek` | Array of 0–6, no duplicates, sorted ascending (weekly only) |
| `repeat.intervalMinutes` | Positive integer (interval only) |
| `repeat.cronExpression` | Valid cron syntax (cron only) |
| `snoozeDurationMin` | Integer, 1–30 |
| `maxSnoozeCount` | Integer, 0–10 |
| `autoDismissMin` | Integer, 0–60 |
| `groupId` | Must reference existing group or be null |
| `soundFile` | Must reference built-in sound key or valid file path |
| `nextFireTime` | Valid ISO 8601 or null |

---

## One-Time Alarm Behavior

When `repeat.type` is `"once"` and `date` is null, the alarm fires once at the next occurrence of `time` and auto-disables (`enabled: false`). When `date` is set, it fires on that specific date at `time`.

---

## Soft-Delete Behavior

- Deleting an alarm sets `deletedAt` to current ISO 8601 timestamp
- A 5-second undo toast appears; if undone, `deletedAt` is set back to null
- After undo window expires, a background job permanently removes the row
- All queries filter `WHERE deleted_at IS NULL` by default

---

## nextFireTime Computation

The `nextFireTime` field is precomputed by the Rust backend whenever an alarm is created, edited, fired, or snoozed. This enables efficient missed-alarm detection:

1. On create/edit: compute based on `time`, `date`, and `repeat` pattern
2. On fire: advance to next occurrence (or set null if one-time)
3. On app launch / system wake: query `WHERE next_fire_time < now AND enabled = 1 AND deleted_at IS NULL`

---

## DST & Timezone Handling Rules

Alarms store **local time** (`HH:MM`) as the user-facing value. `nextFireTime` is computed as an absolute UTC timestamp for comparison. The following rules apply:

### DST Transition — Spring Forward

If the target local time is **skipped** during DST (e.g., 2:30 AM when clocks jump from 2:00 → 3:00):
- Fire at the **next valid minute** after the transition (i.e., 3:00 AM)
- Log the adjustment in `alarm_events` with a note

### DST Transition — Fall Back

If the target local time **occurs twice** during fall-back:
- Fire on the **first occurrence only**
- Do not fire again at the repeated hour

### Timezone Change (Travel)

When the system timezone changes:
1. Listen for OS timezone change event
2. Recalculate `nextFireTime` for **all enabled alarms** using the new timezone
3. Alarms always fire at the configured **local time** in the user's current timezone

### Implementation

- Use `chrono-tz` crate for IANA timezone resolution
- Store system timezone in `settings` table (key: `system_timezone`, value: IANA string e.g. `"Asia/Kuala_Lumpur"`)
- On each 30s alarm check, compare `nextFireTime` (UTC) against `Utc::now()`

---

## Migration Strategy (refinery)

> **Resolves DB-MIGRATE-001.** Defines the migration tool, file format, versioning, rollback plan, and startup integration.

### Tool Choice: `refinery` crate

| Criterion | Value |
|-----------|-------|
| **Crate** | `refinery` v0.8 with `rusqlite` feature |
| **License** | MIT |
| **Why** | Embeddable (no CLI required), SQLite-native, uses numbered SQL files, auto-creates `refinery_schema_history` tracking table |
| **Alternatives rejected** | `diesel` (too heavy, ORM not needed), `sqlx` (async-only, complex setup), manual `PRAGMA user_version` (no rollback tracking) |

### Migration File Format

```
src-tauri/migrations/
  V1__initial_schema.sql       — Core tables: alarms, alarm_groups, settings, snooze_state, alarm_events
  V2__add_event_retention.sql  — Add event_retention_days to settings defaults
  V3__add_alarm_label_cache.sql — Denormalized label on alarm_events (for DB-ORPHAN-001)
  ...
```

**Naming convention:** `V{N}__{description}.sql` — sequential integer, double underscore, snake_case description.

### Migration Runner (Rust)

```rust
use refinery::embed_migrations;

// Embed migration SQL files at compile time
embed_migrations!("migrations");

pub async fn run_migrations(conn: &mut Connection) -> Result<(), AlarmAppError> {
    migrations::runner()
        .run(conn)
        .map_err(|e| AlarmAppError::Migration(e.to_string()))?;

    tracing::info!(
        "Migrations complete. Current version: {}",
        get_current_version(conn)?
    );
    Ok(())
}

fn get_current_version(conn: &Connection) -> Result<i64, rusqlite::Error> {
    conn.query_row(
        "SELECT MAX(version) FROM refinery_schema_history",
        [],
        |row| row.get(0),
    )
}
```

### Startup Integration

Migrations run at **Step 3** of the startup sequence (see `07-startup-sequence.md`):

1. Open SQLite connection (Step 2)
2. **Run migrations** (Step 3) — `refinery` checks `refinery_schema_history`, runs only new migrations
3. Enable WAL mode (Step 4) — must be after migrations

### Rollback Plan

`refinery` does not support automatic rollbacks. Instead:

| Scenario | Strategy |
|----------|----------|
| Bad migration in dev | Fix SQL, reset dev DB, re-run |
| Bad migration in production | Ship a **new forward migration** (V{N+1}) that reverts the change |
| Corrupt DB after migration | Startup error handler backs up DB file, creates fresh (see `04-platform-constraints.md` → E7) |

### Version Tracking Table

`refinery` auto-creates this table — do NOT create manually:

```sql
-- Auto-created by refinery
CREATE TABLE refinery_schema_history (
    version INTEGER PRIMARY KEY,
    name TEXT,
    applied_on TEXT,
    checksum TEXT
);
```

### Initial Migration (V1)

The `V1__initial_schema.sql` file must contain ALL tables from the SQLite Schema section above, plus:

```sql
-- Indexes for alarm engine performance
CREATE INDEX idx_alarms_next_fire ON alarms(next_fire_time) WHERE enabled = 1 AND deleted_at IS NULL;
CREATE INDEX idx_alarms_group ON alarms(group_id);
CREATE INDEX idx_events_alarm ON alarm_events(alarm_id);
CREATE INDEX idx_events_timestamp ON alarm_events(timestamp);

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('theme', 'system'),
  ('time_format', '12h'),
  ('default_snooze_duration', '5'),
  ('default_sound', 'classic-beep'),
  ('auto_launch', 'false'),
  ('minimize_to_tray', 'true'),
  ('language', 'en'),
  ('event_retention_days', '90'),
  ('system_timezone', '');
```

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Platform Strategy | `./05-platform-strategy.md` |
| Platform Constraints | `./04-platform-constraints.md` |
| Startup Sequence | `./07-startup-sequence.md` |
| File Structure | `./03-file-structure.md` |
| Export/Import Feature | `../02-features/10-export-import.md` |
| Alarm Firing | `../02-features/03-alarm-firing.md` |
| Snooze System | `../02-features/04-snooze-system.md` |
| App Issues | `../03-app-issues/04-database-issues.md` → DB-MIGRATE-001 |
