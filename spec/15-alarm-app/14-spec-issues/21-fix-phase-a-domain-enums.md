# Fix Phase A — Domain Enum Definitions

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Scope:** Replace all 9 magic string union types with proper TypeScript and Rust enum definitions

---

## Issues Resolved

| Issue | Description | File Changed |
|-------|-------------|-------------|
| P14-003 | `ChallengeType` magic strings → enum | `01-data-model.md` |
| P14-004 | `ChallengeDifficulty` magic strings → enum | `01-data-model.md` |
| P14-005 | `AlarmEventType` magic strings → enum | `01-data-model.md` |
| P14-006 | `RepeatType` TS string union → enum | `01-data-model.md` |
| P14-007 | `SoundCategory` magic strings → enum | `01-data-model.md` |
| P14-008 | `SettingsValueType` magic strings → enum | `01-data-model.md` |
| P14-009 | `ThemeMode` magic strings → enum | `01-data-model.md`, `09-theme-system.md` |
| P14-010 | `ExportFormat/ExportScope/DuplicateAction/ImportMode` magic strings → enums | `01-data-model.md`, `10-export-import.md` |
| P14-011 | `SortField` mixed casing → enum | `01-data-model.md`, `13-analytics.md` |
| P14-024 | `HistoryFilter.SortBy` lowercase values → enum | `13-analytics.md` |
| P14-025 | Export IPC lowercase keys → PascalCase + enums | `10-export-import.md` |

---

## Changes Made

### `01-fundamentals/01-data-model.md` (v1.7.0 → v1.8.0)

1. **Added "Domain Enums" section** with 13 TypeScript enums and 13 Rust enums:
   - `RepeatType`, `ChallengeType`, `ChallengeDifficulty`, `AlarmEventType`
   - `SoundCategory`, `SettingsValueType`, `ThemeMode`
   - `ExportFormat`, `ExportScope`, `DuplicateAction`, `ImportMode`
   - `SortField`, `SortOrder`

2. **Updated interfaces** to reference enum types instead of string unions:
   - `Alarm.ChallengeType`: `string | null` → `ChallengeType | null`
   - `Alarm.ChallengeDifficulty`: `string | null` → `ChallengeDifficulty | null`
   - `RepeatPattern.Type`: `"once" | "daily" | ...` → `RepeatType`
   - `AlarmSound.Category`: `'classic' | ...` → `SoundCategory`
   - `AlarmEvent.Type`: `"fired" | ...` → `AlarmEventType`
   - `AlarmEvent.ChallengeType`: `string` → `ChallengeType`

3. **Updated Rust `AlarmRow` struct** to use enum types:
   - `repeat_type: String` → `repeat_type: RepeatType`
   - `challenge_type: Option<String>` → `challenge_type: Option<ChallengeType>`
   - `challenge_difficulty: Option<String>` → `challenge_difficulty: Option<ChallengeDifficulty>`

4. **Updated `from_row`** to parse TEXT → enum via `.parse()`

5. **Removed duplicate** `RepeatType` enum + `FromStr` impl (now in Domain Enums section)

6. **Added Rust `FromStr` implementations** for `RepeatType`, `ChallengeType`, `AlarmEventType` with PascalCase match arms

7. **Fixed "disabled" language** in comments:
   - `0 = snooze disabled` → `0 = dismiss only, no snooze`
   - `0 = disabled` → `0 = manual dismiss only`

8. **Updated Settings Keys table** to use `ThemeMode` and `SettingsValueType` enums

9. **Updated validation rules** to reference `RepeatType` enum

### `02-features/09-theme-system.md`

- IPC payload: `"light" | "dark" | "system"` → `ThemeMode`
- Default: `"system"` → `ThemeMode.System`

### `02-features/10-export-import.md`

- IPC keys: `format`, `scope`, `mode`, `alarmIds`, `previewId`, `duplicateAction` → `Format`, `Scope`, `Mode`, `AlarmIds`, `PreviewId`, `DuplicateAction`
- String unions → `ExportFormat`, `ExportScope`, `ImportMode`, `DuplicateAction` enums

### `02-features/13-analytics.md`

- `HistoryFilter.EventType`: `"fired" | ...` → `AlarmEventType`
- `HistoryFilter.SortBy`: `"date" | "label" | "SnoozeCount"` → `SortField`
- `HistoryFilter.SortOrder`: `"asc" | "desc"` → `SortOrder`

---

## Issues Resolved: 11
## Running Total: 256 total, 191 resolved, 65 open

---

*Fix Phase A — updated: 2026-04-10*
