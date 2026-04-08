# Data Model

**Version:** 1.1.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`data-model`, `types`, `interfaces`, `storage`, `validation`, `sqlite`

---

## Purpose

Defines all TypeScript interfaces, SQLite schema, and validation rules for the Alarm App.

---

## Interfaces

### Alarm

```typescript
interface Alarm {
  id: string;               // UUID v4
  time: string;             // "HH:MM" 24-hour format
  label: string;            // User-defined label, max 50 chars
  enabled: boolean;         // Toggle state
  recurringDays: number[];  // 0=Sun, 1=Mon ... 6=Sat; empty = one-time
  groupId: string | null;   // Reference to AlarmGroup.id
  snoozeDurationMin: number; // 1–30, default 5
  soundId: string;          // Reference to built-in sound library
  vibrationEnabled: boolean; // Independent vibration toggle
  gradualVolume: boolean;   // Fade-in volume enabled
  gradualVolumeDurationSec: number; // 15, 30, or 60 seconds
  createdAt: string;        // ISO 8601 timestamp
  updatedAt: string;        // ISO 8601 timestamp
}
```

### AlarmGroup

```typescript
interface AlarmGroup {
  id: string;       // UUID v4
  name: string;     // Group name, max 30 chars
  enabled: boolean; // Master toggle — disabling disables all member alarms
}
```

### AlarmSound

```typescript
interface AlarmSound {
  id: string;       // Unique identifier
  name: string;     // Display name
  fileName: string; // Audio file reference
  category: 'classic' | 'gentle' | 'nature' | 'digital';
}
```

---

## SQLite Schema

### Tables

```sql
CREATE TABLE alarms (
  id TEXT PRIMARY KEY,
  time TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1,
  recurring_days TEXT NOT NULL DEFAULT '[]',  -- JSON array
  group_id TEXT REFERENCES alarm_groups(id) ON DELETE SET NULL,
  snooze_duration_min INTEGER NOT NULL DEFAULT 5,
  sound_id TEXT NOT NULL DEFAULT 'default',
  vibration_enabled INTEGER NOT NULL DEFAULT 0,
  gradual_volume INTEGER NOT NULL DEFAULT 0,
  gradual_volume_duration_sec INTEGER NOT NULL DEFAULT 30,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE alarm_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
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
```

### Settings Keys

| Key | Type | Description |
|-----|------|-------------|
| `theme` | `"light" \| "dark" \| "system"` | Theme preference |

---

## Validation Rules

| Field | Rule |
|-------|------|
| `time` | Must match `HH:MM` format, 00:00–23:59 |
| `label` | String, 0–50 characters, trimmed |
| `recurringDays` | Array of 0–6, no duplicates, sorted ascending |
| `snoozeDurationMin` | Integer, 1–30 |
| `groupId` | Must reference existing group or be null |
| `soundId` | Must reference existing sound in library |

---

## One-Time Alarm Behavior

When `recurringDays` is empty, the alarm fires once and auto-disables (`enabled: false`) after firing.

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Platform Strategy | `./05-platform-strategy.md` |
| Platform Constraints | `./04-platform-constraints.md` |
| Export/Import Feature | `../02-features/10-export-import.md` |
