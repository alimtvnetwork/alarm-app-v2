# Data Model

**Version:** 1.2.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None

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

```typescript
interface RepeatPattern {
  type: "once" | "daily" | "weekly" | "interval" | "cron";
  daysOfWeek: number[];       // 0=Sun..6=Sat (for "weekly" type)
  intervalMinutes: number;    // For "interval" type (e.g., every 120 min)
  cronExpression: string;     // For "cron" type (advanced users)
}
```

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

## Cross-References

| Reference | Location |
|-----------|----------|
| Platform Strategy | `./05-platform-strategy.md` |
| Platform Constraints | `./04-platform-constraints.md` |
| Export/Import Feature | `../02-features/10-export-import.md` |
| Alarm Firing | `../02-features/03-alarm-firing.md` |
| Snooze System | `../02-features/04-snooze-system.md` |
