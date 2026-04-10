# Data Model

**Version:** 1.9.0  
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

## Domain Enums

> **Resolves P14-003–P14-011.** All domain types that were previously magic string unions are now proper enums. Both TypeScript and Rust definitions are provided. AI agents MUST use these enum types — raw string comparisons are forbidden per `05-magic-strings-and-organization.md` §8.2.

### TypeScript Enums

```typescript
enum RepeatType {
  Once = "Once",
  Daily = "Daily",
  Weekly = "Weekly",
  Interval = "Interval",
  Cron = "Cron",
}

enum ChallengeType {
  Math = "Math",
  Memory = "Memory",
  Shake = "Shake",
  Typing = "Typing",
  Qr = "Qr",
  Steps = "Steps",
}

enum ChallengeDifficulty {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
}

enum AlarmEventType {
  Fired = "Fired",
  Snoozed = "Snoozed",
  Dismissed = "Dismissed",
  Missed = "Missed",
}

enum SoundCategory {
  Classic = "Classic",
  Gentle = "Gentle",
  Nature = "Nature",
  Digital = "Digital",
}

enum SettingsValueType {
  String = "String",
  Integer = "Integer",
  Boolean = "Boolean",
  Json = "Json",
}

enum ThemeMode {
  Light = "Light",
  Dark = "Dark",
  System = "System",
}

enum ExportFormat {
  Json = "Json",
  Csv = "Csv",
  Ics = "Ics",
}

enum ExportScope {
  All = "All",
  Selected = "Selected",
}

enum DuplicateAction {
  Skip = "Skip",
  Overwrite = "Overwrite",
  Rename = "Rename",
}

enum ImportMode {
  Merge = "Merge",
  Replace = "Replace",
}

enum SortField {
  Date = "Date",
  Label = "Label",
  SnoozeCount = "SnoozeCount",
}

enum SortOrder {
  Asc = "Asc",
  Desc = "Desc",
}
```

### Rust Enums

```rust
use serde::{Deserialize, Serialize};

/// All domain enums use PascalCase variants and serialize to PascalCase strings.
/// SQLite stores the PascalCase string value in TEXT columns.

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum RepeatType {
    Once,
    Daily,
    Weekly,
    Interval,
    Cron,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum ChallengeType {
    Math,
    Memory,
    Shake,
    Typing,
    Qr,
    Steps,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum ChallengeDifficulty {
    Easy,
    Medium,
    Hard,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum AlarmEventType {
    Fired,
    Snoozed,
    Dismissed,
    Missed,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum SoundCategory {
    Classic,
    Gentle,
    Nature,
    Digital,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum SettingsValueType {
    String,
    Integer,
    Boolean,
    Json,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum ThemeMode {
    Light,
    Dark,
    System,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum ExportFormat {
    Json,
    Csv,
    Ics,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum ExportScope {
    All,
    Selected,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum DuplicateAction {
    Skip,
    Overwrite,
    Rename,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum ImportMode {
    Merge,
    Replace,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum SortField {
    Date,
    Label,
    SnoozeCount,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum SortOrder {
    Asc,
    Desc,
}

/// FromStr implementations for all enums that are stored as TEXT in SQLite.
/// Parse from PascalCase string values.
impl std::str::FromStr for RepeatType {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Once" => Ok(Self::Once),
            "Daily" => Ok(Self::Daily),
            "Weekly" => Ok(Self::Weekly),
            "Interval" => Ok(Self::Interval),
            "Cron" => Ok(Self::Cron),
            _ => Err(format!("Unknown RepeatType: {s}")),
        }
    }
}

impl std::str::FromStr for ChallengeType {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Math" => Ok(Self::Math),
            "Memory" => Ok(Self::Memory),
            "Shake" => Ok(Self::Shake),
            "Typing" => Ok(Self::Typing),
            "Qr" => Ok(Self::Qr),
            "Steps" => Ok(Self::Steps),
            _ => Err(format!("Unknown ChallengeType: {s}")),
        }
    }
}

impl std::str::FromStr for AlarmEventType {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Fired" => Ok(Self::Fired),
            "Snoozed" => Ok(Self::Snoozed),
            "Dismissed" => Ok(Self::Dismissed),
            "Missed" => Ok(Self::Missed),
            _ => Err(format!("Unknown AlarmEventType: {s}")),
        }
    }
}
```

### Enum Conventions

| Rule | Detail |
|------|--------|
| **Variants** | PascalCase (e.g., `RepeatType::Daily`, not `"daily"`) |
| **SQLite storage** | TEXT column stores PascalCase string (e.g., `"Daily"`) |
| **Serde** | Default derive — variants serialize as `"Daily"`, `"Fired"`, etc. |
| **TypeScript values** | String enums with PascalCase values matching Rust |
| **Comparison** | Always `alarm.ChallengeType === ChallengeType.Math`, never `=== "math"` |
| **Null** | Use `Option<ChallengeType>` (Rust) / `ChallengeType | null` (TS) for optional fields |

---

## Interfaces

### Alarm

```typescript
interface Alarm {
  AlarmId: string;                 // UUID v4
  Time: string;                    // "HH:MM" 24-hour format
  Date: string | null;             // "YYYY-MM-DD" for date-specific alarms, null for recurring/daily
  Label: string;                   // User-defined label, max 50 chars
  IsEnabled: boolean;              // Toggle state
  IsPreviousEnabled: boolean | null; // Saved state for group toggle restore (null = no saved state)
  Repeat: RepeatPattern;           // Scheduling pattern (replaces recurringDays)
  GroupId: string | null;          // Reference to AlarmGroup.AlarmGroupId
  SnoozeDurationMin: number;       // 1–30, default 5
  MaxSnoozeCount: number;          // 1–10, default 3 (0 = dismiss only, no snooze)
  SoundFile: string;               // Built-in key OR custom file path
  IsVibrationEnabled: boolean;     // Independent vibration toggle
  IsGradualVolume: boolean;        // Fade-in volume enabled
  GradualVolumeDurationSec: number; // 15, 30, or 60 seconds
  AutoDismissMin: number;          // 0 = manual dismiss only, 1–60 = auto-stop after N minutes
  ChallengeType: ChallengeType | null;    // null = no challenge
  ChallengeDifficulty: ChallengeDifficulty | null; // Math only
  ChallengeShakeCount: number | null; // shake only
  ChallengeStepCount: number | null;  // steps only
  NextFireTime: string | null;     // ISO 8601 — precomputed next fire time
  DeletedAt: string | null;        // ISO 8601 — soft-delete timestamp (null = active)
  CreatedAt: string;               // ISO 8601 timestamp
  UpdatedAt: string;               // ISO 8601 timestamp
}
```

### RepeatPattern

**Cron Parsing Library (Rust):** `croner` crate v2.0 — MIT licensed, lightweight, supports standard 5-field cron + extensions. Pinned in `Cargo.toml`.

> **Resolves BE-CRON-001.** Without specifying the crate, AI may choose deprecated `cron` or incompatible `saffron`.

```typescript
interface RepeatPattern {
  Type: RepeatType;
  DaysOfWeek: number[];       // 0=Sun..6=Sat (for "weekly" type)
  IntervalMinutes: number;    // For "interval" type (e.g., every 120 min)
  CronExpression: string;     // For "cron" type — parsed by `croner` crate
}
```

### SnoozeState

```typescript
interface SnoozeState {
  AlarmId: string;             // References Alarm.AlarmId
  SnoozeUntil: string;         // ISO 8601 — when snooze expires (matches SQL column name)
  SnoozeCount: number;         // Number of times snoozed this session (1-based)
}
```

> **⚠️ Field name:** The field is `SnoozeUntil`, NOT `NextFireTime`. The `NextFireTime` field exists on `Alarm` (next scheduled alarm time) — do not confuse the two.

### Rust Data Mapping (Resolves DB-SERIAL-001)

> Without explicit Rust struct examples, AI will get `serde_json` deserialization wrong for JSON columns stored as TEXT.

```rust
use serde::{Deserialize, Serialize};

/// Rust struct mapping the `Alarms` SQLite table row.
/// JSON fields are stored as TEXT in SQLite and must be manually deserialized.
/// Uses `#[serde(rename_all = "PascalCase")]` so Tauri IPC serializes to PascalCase JSON keys.
#[derive(Debug, Clone, Serialize, Deserialize)]
/// NOTE: Struct definitions and field-per-line `from_row` mappers are EXEMPT from the
/// 15-line function limit — they contain no logic, only field declarations.
#[serde(rename_all = "PascalCase")]
pub struct AlarmRow {
    pub alarm_id: String,
    pub time: String,                     // "HH:MM"
    pub date: Option<String>,            // "YYYY-MM-DD" or NULL
    pub label: String,
    pub is_enabled: bool,                 // SQLite INTEGER → bool
    pub is_previous_enabled: Option<bool>,
    pub repeat_type: RepeatType,          // Enum — stored as PascalCase TEXT in SQLite
    pub repeat_days_of_week: String,      // JSON TEXT: "[0,3,5]"
    pub repeat_interval_minutes: i32,
    pub repeat_cron_expression: String,
    pub group_id: Option<String>,
    pub snooze_duration_min: i32,
    pub max_snooze_count: i32,
    pub sound_file: String,
    pub is_vibration_enabled: bool,
    pub is_gradual_volume: bool,
    pub gradual_volume_duration_sec: i32,
    pub auto_dismiss_min: i32,
    pub challenge_type: Option<ChallengeType>,       // None = no challenge
    pub challenge_difficulty: Option<ChallengeDifficulty>,  // Math only
    pub challenge_shake_count: Option<i32>,    // shake only
    pub challenge_step_count: Option<i32>,     // steps only
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
            r#type: self.repeat_type.clone(),
            days_of_week: self.days_of_week(),
            interval_minutes: self.repeat_interval_minutes as u32,
            cron_expression: self.repeat_cron_expression.clone(),
        }
    }

    /// Convert from rusqlite::Row — EXEMPT from 15-line limit (field-per-line mapping, no logic)
    /// Enum fields use `.parse()` to convert PascalCase TEXT → enum variant.
    pub fn from_row(row: &rusqlite::Row) -> rusqlite::Result<Self> {
        Ok(Self {
            alarm_id: row.get("AlarmId")?,
            time: row.get("Time")?,
            date: row.get("Date")?,
            label: row.get("Label")?,
            is_enabled: row.get::<_, i32>("IsEnabled")? != 0,
            is_previous_enabled: row.get::<_, Option<i32>>("IsPreviousEnabled")?.map(|v| v != 0),
            repeat_type: row.get::<_, String>("RepeatType")?.parse().unwrap_or(RepeatType::Once),
            repeat_days_of_week: row.get("RepeatDaysOfWeek")?,
            repeat_interval_minutes: row.get("RepeatIntervalMinutes")?,
            repeat_cron_expression: row.get("RepeatCronExpression")?,
            group_id: row.get("GroupId")?,
            snooze_duration_min: row.get("SnoozeDurationMin")?,
            max_snooze_count: row.get("MaxSnoozeCount")?,
            sound_file: row.get("SoundFile")?,
            is_vibration_enabled: row.get::<_, i32>("IsVibrationEnabled")? != 0,
            is_gradual_volume: row.get::<_, i32>("IsGradualVolume")? != 0,
            gradual_volume_duration_sec: row.get("GradualVolumeDurationSec")?,
            auto_dismiss_min: row.get("AutoDismissMin")?,
            challenge_type: row.get::<_, Option<String>>("ChallengeType")?.and_then(|s| s.parse().ok()),
            challenge_difficulty: row.get::<_, Option<String>>("ChallengeDifficulty")?.and_then(|s| s.parse().ok()),
            challenge_shake_count: row.get("ChallengeShakeCount")?,
            challenge_step_count: row.get("ChallengeStepCount")?,
            next_fire_time: row.get("NextFireTime")?,
            deleted_at: row.get("DeletedAt")?,
            created_at: row.get("CreatedAt")?,
            updated_at: row.get("UpdatedAt")?,
        })
    }
}
// NOTE: RepeatType, ChallengeType, AlarmEventType, and all other domain enums
// are defined in the "Domain Enums" section above. Do NOT duplicate here.
```

**Key patterns:**
- SQLite `INTEGER` booleans → Rust `bool` via `row.get::<_, i32>() != 0` (**exempt** from no-negation rule — see `04-platform-constraints.md` § Code Pattern Exemptions)
- SQLite `TEXT` enums → Rust enum via `row.get::<_, String>()?.parse()`
- JSON TEXT columns → `serde_json::from_str()` with `unwrap_or_default()` (never panic)
- `Option<EnumType>` for nullable enum columns — use `.and_then(|s| s.parse().ok())`

### AlarmGroup

```typescript
interface AlarmGroup {
  AlarmGroupId: string;  // UUID v4
  Name: string;          // Group name, max 30 chars
  Color: string;         // Hex color for visual coding (e.g., "#FF5733")
  IsEnabled: boolean;    // Master toggle — disabling disables all member alarms
}
```

### AlarmSound

```typescript
interface AlarmSound {
  AlarmSoundId: string;  // Unique identifier
  Name: string;          // Display name
  FileName: string;      // Audio file reference (built-in path)
  Category: SoundCategory;
}
```

### AlarmEvent

```typescript
interface AlarmEvent {
  AlarmEventId: string;
  AlarmId: string;
  Type: AlarmEventType;
  FiredAt: string;               // ISO 8601
  DismissedAt: string | null;    // ISO 8601
  SnoozeCount: number;
  ChallengeType?: ChallengeType;
  ChallengeSolveTimeSec?: number;
  SleepQuality?: number;         // 1-5
  Mood?: string;
  Timestamp: string;             // ISO 8601 — when this event occurred
}
```

---

## SQLite Schema

### Tables

```sql
CREATE TABLE Alarms (
  AlarmId TEXT PRIMARY KEY,
  Time TEXT NOT NULL,
  Date TEXT,                                        -- YYYY-MM-DD or NULL
  Label TEXT NOT NULL DEFAULT '',
  IsEnabled INTEGER NOT NULL DEFAULT 1,
  IsPreviousEnabled INTEGER,                        -- Saved state for group toggle (FE-STATE-001)
  RepeatType TEXT NOT NULL DEFAULT 'once',           -- once|daily|weekly|interval|cron
  RepeatDaysOfWeek TEXT NOT NULL DEFAULT '[]',       -- JSON array
  RepeatIntervalMinutes INTEGER NOT NULL DEFAULT 0,
  RepeatCronExpression TEXT NOT NULL DEFAULT '',
  GroupId TEXT REFERENCES AlarmGroups(AlarmGroupId) ON DELETE SET NULL,
  SnoozeDurationMin INTEGER NOT NULL DEFAULT 5,
  MaxSnoozeCount INTEGER NOT NULL DEFAULT 3,
  SoundFile TEXT NOT NULL DEFAULT 'classic-beep',
  IsVibrationEnabled INTEGER NOT NULL DEFAULT 0,
  IsGradualVolume INTEGER NOT NULL DEFAULT 0,
  GradualVolumeDurationSec INTEGER NOT NULL DEFAULT 30,
  AutoDismissMin INTEGER NOT NULL DEFAULT 0,
  ChallengeType TEXT,                                -- null = no challenge
  ChallengeDifficulty TEXT,                          -- easy|medium|hard (math only)
  ChallengeShakeCount INTEGER,                       -- shake only
  ChallengeStepCount INTEGER,                        -- steps only
  NextFireTime TEXT,                                 -- ISO 8601 precomputed
  DeletedAt TEXT,                                    -- soft-delete timestamp
  CreatedAt TEXT NOT NULL,
  UpdatedAt TEXT NOT NULL
);

CREATE TABLE AlarmGroups (
  AlarmGroupId TEXT PRIMARY KEY,
  Name TEXT NOT NULL,
  Color TEXT NOT NULL DEFAULT '#6366F1',
  IsEnabled INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE Settings (
  Key TEXT PRIMARY KEY,
  Value TEXT NOT NULL,
  ValueType TEXT NOT NULL DEFAULT 'string'  -- 'string' | 'integer' | 'boolean' | 'json'
);

CREATE TABLE SnoozeState (
  AlarmId TEXT PRIMARY KEY REFERENCES Alarms(AlarmId) ON DELETE CASCADE,
  SnoozeUntil TEXT NOT NULL,  -- ISO 8601 timestamp
  SnoozeCount INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE AlarmEvents (
  AlarmEventId TEXT PRIMARY KEY,
  AlarmId TEXT REFERENCES Alarms(AlarmId) ON DELETE SET NULL,
  Type TEXT NOT NULL,           -- fired|snoozed|dismissed|missed
  FiredAt TEXT NOT NULL,
  DismissedAt TEXT,
  SnoozeCount INTEGER NOT NULL DEFAULT 0,
  ChallengeType TEXT,
  ChallengeSolveTimeSec REAL,
  SleepQuality INTEGER,
  Mood TEXT,
  AlarmLabelSnapshot TEXT NOT NULL DEFAULT '',  -- Preserves label after alarm deletion (DB-ORPHAN-001)
  AlarmTimeSnapshot TEXT NOT NULL DEFAULT '',   -- Preserves time after alarm deletion (DB-ORPHAN-001)
  Timestamp TEXT NOT NULL
);
```

### SQLite WAL Mode (Resolves BE-CONCUR-001)

The alarm engine writes `AlarmEvents` and updates `NextFireTime` while the user may be saving edits. Without WAL, single-writer SQLite queues writes and causes UI lag.

```sql
-- Run at startup Step 4 (after migrations)
PRAGMA journal_mode=WAL;
PRAGMA busy_timeout=5000;  -- Wait up to 5s for locks instead of failing immediately
```

**Why WAL?** Write-Ahead Logging allows concurrent reads during writes. The alarm engine and UI can operate simultaneously without blocking.

### Event Retention Policy (Resolves DB-GROWTH-001)

The `AlarmEvents` table grows unbounded. A retention policy purges old events on startup.

```rust
const DEFAULT_EVENT_RETENTION_DAYS: i64 = 90;

// Run at startup Step 8 (after missed alarm check)
pub fn purge_old_events(conn: &Connection) {
    let retention_days: i64 = get_setting(conn, "EventRetentionDays")
        .and_then(|v| v.parse().ok())
        .unwrap_or(DEFAULT_EVENT_RETENTION_DAYS);

    let cutoff = Utc::now() - chrono::Duration::days(retention_days);
    conn.execute(
        "DELETE FROM AlarmEvents WHERE Timestamp < ?1",
        params![cutoff.to_rfc3339()],
    ).ok();

    tracing::info!(
        retention_days = retention_days,
        cutoff = %cutoff,
        "Purged old alarm events"
    );
}
```

**Settings key:** `EventRetentionDays` (default: `90`). Configurable in Settings UI.

### Settings Keys

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `Theme` | `ThemeMode` | `"System"` | Theme preference (use `ThemeMode` enum) |
| `TimeFormat` | `string` | `"12h"` | Clock display format (`"12h"` or `"24h"`) |
| `DefaultSnoozeDuration` | `number` | `"5"` | Default snooze minutes for new alarms |
| `DefaultSound` | `string` | `"classic-beep"` | Default sound for new alarms |
| `AutoLaunch` | `boolean` | `"false"` | Start on system boot |
| `MinimizeToTray` | `boolean` | `"true"` | Keep running when window closed |
| `Language` | `string` | `"en"` | i18n locale code |
| `EventRetentionDays` | `number` | `"90"` | Days to keep `AlarmEvents` |
| `SystemTimezone` | `string` | `""` | IANA timezone string (auto-detected at startup) |

---

### Settings Seeding Strategy

> **Resolves P14-016 (settings seeding) and P14-017 (config version tracking).**

#### Seeding Mechanism

All default settings are seeded via **SQL INSERT statements in the V1 migration** (`V1__initial_schema.sql`). This approach was chosen over runtime Rust seeding because:

1. **Atomicity** — migrations run inside a transaction; either all defaults exist or none do
2. **Idempotency** — `refinery` tracks which migrations have run; V1 executes exactly once
3. **Auditability** — the seed values are visible in version-controlled SQL files

#### First Launch Behavior

On first launch, the startup sequence runs:
1. Step 2: Open SQLite connection → creates `alarm-app.db` if absent
2. Step 3: Run migrations → V1 creates all tables AND inserts all default settings
3. Step 4: Enable WAL mode
4. Step 5: Load settings into `ConfigManager` (all defaults now present)

**Result:** No `NULL` lookups are possible — every key in the Settings Keys table has a row after V1.

#### Adding New Settings (Version-Based Migration)

When a new app version introduces a new setting key:

1. Create a new migration: `V{N}__add_{setting_name}_setting.sql`
2. Use `INSERT OR IGNORE` to avoid duplicating if the key somehow exists:

```sql
-- V4__add_notification_sound_setting.sql
INSERT OR IGNORE INTO Settings (Key, Value, ValueType)
  VALUES ('NotificationSound', 'default', 'String');
```

3. The migration runs on next app launch — existing users get the new setting with its default value
4. Users who have NOT modified the setting get the default; users cannot have modified a setting that didn't exist yet

#### Why Not Seedable Config Architecture?

The [Seedable Config Architecture](../../05-seedable-config-architecture/00-overview.md) defines a `config.seed.json` + version-gated re-seeding pattern with `IsUserModified` tracking. This pattern is designed for **server-side CLI tools** where:
- Multiple config sources may conflict (file, DB, environment)
- Config versions evolve independently of app versions
- User-modified values must survive re-seeding

The alarm app uses a **simpler model** because:
- Settings only come from one source (SQLite)
- App version = config version (migrations are tied to releases)
- `INSERT OR IGNORE` achieves the same "don't overwrite existing" behavior without `IsUserModified` tracking
- The `refinery_schema_history` table provides equivalent version tracking

This is a deliberate design decision, not an oversight.

---

## Validation Rules

| Field | Rule |
|-------|------|
| `Time` | Must match `HH:MM` format, 00:00–23:59 |
| `Date` | Must match `YYYY-MM-DD` or be null |
| `Label` | String, 0–50 characters, trimmed |
| `Repeat.Type` | Must be a valid `RepeatType` enum variant |
| `Repeat.DaysOfWeek` | Array of 0–6, no duplicates, sorted ascending (weekly only) |
| `Repeat.IntervalMinutes` | Positive integer (interval only) |
| `Repeat.CronExpression` | Valid cron syntax (cron only) |
| `SnoozeDurationMin` | Integer, 1–30 |
| `MaxSnoozeCount` | Integer, 0–10 |
| `AutoDismissMin` | Integer, 0–60 |
| `GroupId` | Must reference existing group or be null |
| `SoundFile` | Must reference built-in sound key or valid file path |
| `NextFireTime` | Valid ISO 8601 or null |

---

## One-Time Alarm Behavior

When `Repeat.Type` is `RepeatType.Once` and `Date` is null, the alarm fires once at the next occurrence of `Time` and auto-disables (`IsEnabled: false`). When `Date` is set, it fires on that specific date at `Time`.

---

## Soft-Delete Behavior

- Deleting an alarm sets `DeletedAt` to current ISO 8601 timestamp
- A 5-second undo toast appears; if undone, `DeletedAt` is set back to null
- After undo window expires, a background job permanently removes the row
- All queries filter `WHERE DeletedAt IS NULL` by default

---

## NextFireTime Computation

The `NextFireTime` field is precomputed by the Rust backend whenever an alarm is created, edited, fired, or snoozed. This enables efficient missed-alarm detection:

1. On create/edit: compute based on `Time`, `Date`, and `repeat` pattern
2. On fire: advance to next occurrence (or set null if one-time)
3. On app launch / system wake: query `WHERE NextFireTime < now AND IsEnabled = 1 AND DeletedAt IS NULL`

---

## DST & Timezone Handling Rules

Alarms store **local time** (`HH:MM`) as the user-facing value. `NextFireTime` is computed as an absolute UTC timestamp for comparison. The following rules apply:

### DST Transition — Spring Forward

If the target local time is **skipped** during DST (e.g., 2:30 AM in the US when clocks jump 2:00→3:00, or 1:30 AM in the EU when clocks jump 1:00→2:00):
- Walk forward minute-by-minute from the skipped time until the first valid local time is found (timezone-agnostic — works for any DST offset)
- Log the adjustment in `AlarmEvents` with a note

### DST Transition — Fall Back

If the target local time **occurs twice** during fall-back:
- Fire on the **first occurrence only**
- Do not fire again at the repeated hour

### Timezone Change (Travel)

When the system timezone changes:
1. Listen for OS timezone change event
2. Recalculate `NextFireTime` for **all enabled alarms** using the new timezone
3. Alarms always fire at the configured **local time** in the user's current timezone

### Implementation

- Use `chrono-tz` crate for IANA timezone resolution
- Store system timezone in Settings table (key: `SystemTimezone`, value: IANA string e.g. `"Asia/Kuala_Lumpur"`)
- On each 30s alarm check, compare `NextFireTime` (UTC) against `Utc::now()`

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
  V2__add_event_retention.sql  — Add EventRetentionDays to Settings defaults
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
CREATE INDEX IdxAlarmsNextFire ON Alarms(NextFireTime) WHERE IsEnabled = 1 AND DeletedAt IS NULL;
CREATE INDEX IdxAlarmsGroup ON Alarms(GroupId);
CREATE INDEX IdxEventsAlarm ON AlarmEvents(AlarmId);
CREATE INDEX IdxEventsTimestamp ON AlarmEvents(Timestamp);

-- Default settings (seeded once via V1 migration — see "Settings Seeding Strategy")
INSERT INTO Settings (Key, Value, ValueType) VALUES
  ('Theme', 'System', 'String'),
  ('TimeFormat', '12h', 'String'),
  ('DefaultSnoozeDuration', '5', 'Integer'),
  ('DefaultSound', 'classic-beep', 'String'),
  ('AutoLaunch', 'false', 'Boolean'),
  ('MinimizeToTray', 'true', 'Boolean'),
  ('Language', 'en', 'String'),
  ('EventRetentionDays', '90', 'Integer'),
  ('SystemTimezone', '', 'String');
```

---

## Boolean Semantic Inverses

> **Resolves P14-014.** Per `12-no-negatives.md`, every boolean field on domain objects must have a named semantic inverse. AI agents MUST use these instead of raw `!` negation.

### Alarm

| Boolean Field | Positive Guard | Semantic Inverse | Use Instead Of |
|--------------|---------------|------------------|---------------|
| `IsEnabled` | `alarm.IsEnabled` | `alarm.isDisabled()` | `!alarm.IsEnabled` |
| `IsVibrationEnabled` | `alarm.IsVibrationEnabled` | `alarm.isVibrationOff()` | `!alarm.IsVibrationEnabled` |
| `IsGradualVolume` | `alarm.IsGradualVolume` | `alarm.isFixedVolume()` | `!alarm.IsGradualVolume` |

### Rust Implementation

```rust
impl AlarmRow {
    pub fn is_disabled(&self) -> bool { !self.is_enabled }
    pub fn is_vibration_off(&self) -> bool { !self.is_vibration_enabled }
    pub fn is_fixed_volume(&self) -> bool { !self.is_gradual_volume }
}
```

### TypeScript Implementation

```typescript
// Add to Alarm type utilities (e.g., lib/alarm-utils.ts)
const isDisabled = (alarm: Alarm): boolean => !alarm.IsEnabled;
const isVibrationOff = (alarm: Alarm): boolean => !alarm.IsVibrationEnabled;
const isFixedVolume = (alarm: Alarm): boolean => !alarm.IsGradualVolume;
```

### AlarmGroup

| Boolean Field | Positive Guard | Semantic Inverse |
|--------------|---------------|------------------|
| `IsEnabled` | `group.IsEnabled` | `group.isDisabled()` |

**Rule:** The `!` operator is only used INSIDE the semantic inverse implementation. All call sites use the named method.

---

## Single Database Decision

> **Resolves P14-015.** Documents why the alarm app uses a single SQLite file instead of the [Split DB Architecture](../../04-split-db-architecture/00-overview.md).

### Decision

The alarm app uses a **single `alarm-app.db` SQLite file** for all tables (Alarms, AlarmGroups, Settings, SnoozeState, AlarmEvents).

### Rationale

| Factor | Split DB | Single DB (chosen) |
|--------|----------|-------------------|
| **Complexity** | 3-4 connection pools, cross-DB joins impossible | One connection, simple queries |
| **Data volume** | Justified at 10K+ rows/table | Alarm app: <1000 alarms, <100K events |
| **Migration** | Separate migration tracks per DB | Single `refinery` migration chain |
| **Backup** | Must coordinate across files | Single file copy |
| **WAL mode** | Per-DB WAL files | One WAL file |
| **Atomic cross-table ops** | Requires distributed transactions | Native SQLite transactions |

### When to Reconsider

If the app ever adds: cloud sync (separate sync queue DB), multi-user support (separate auth DB), or analytics growing beyond 1M rows (separate analytics DB). None of these are in scope for v1.

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
| Split DB Architecture | `../../04-split-db-architecture/00-overview.md` |
| Seedable Config Architecture | `../../05-seedable-config-architecture/00-overview.md` |
| Coding Guidelines | `../../02-coding-guidelines/03-coding-guidelines-spec/` |
