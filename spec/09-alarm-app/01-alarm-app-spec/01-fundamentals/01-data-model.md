# Data Model

**Version:** 1.0.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`data-model`, `types`, `interfaces`, `storage`, `validation`

---

## Purpose

Defines all TypeScript interfaces, localStorage keys, and validation rules for the Alarm App.

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

## Storage Keys

| Key | Type | Description |
|-----|------|-------------|
| `alarms` | `Alarm[]` | All saved alarms |
| `alarm-groups` | `AlarmGroup[]` | All alarm groups |
| `theme` | `"light" \| "dark" \| "system"` | Theme preference |
| `snooze-state` | `SnoozeState \| null` | Active snooze tracking |

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
| Web API Constraints | `./04-web-api-constraints.md` |
| Export/Import Feature | `../02-features/10-export-import.md` |
