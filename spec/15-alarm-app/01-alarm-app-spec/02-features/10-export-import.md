# Export / Import

**Version:** 1.5.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P1 — Should Have  
**Resolves:** SEC-EXPORT-001

---

## Keywords

`export`, `import`, `json`, `csv`, `ical`, `ics`, `backup`, `merge`, `replace`, `native`, `file-dialog`, `duplicate-handling`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ✅ |


## Description

Users can export alarms and groups in multiple formats (JSON, CSV, iCal) and import from any supported format. Uses native file dialogs via Tauri. Includes duplicate handling, schema validation, and import preview.

---

## Supported Formats

| Format | Import | Export | Notes |
|--------|--------|--------|-------|
| JSON | ✅ | ✅ | Primary format. Full fidelity — all fields preserved. |
| CSV | ✅ | ✅ | Flat format for spreadsheet users. One row per alarm. |
| iCal (.ics) | ✅ | ✅ | Interop with Google Calendar, Apple Calendar, Outlook. |

---

## Native Implementation

| Aspect | Implementation |
|--------|---------------|
| Export | `tauri-plugin-dialog` save dialog → Rust serializes & writes file |
| Import | `tauri-plugin-dialog` open dialog → Rust reads, validates & applies |
| Data source | SQLite database |

### IPC Commands

| Command | Payload | Returns |
|---------|---------|---------|
| `export_data` | `{ Format: ExportFormat, Scope: ExportScope, AlarmIds?: string[] }` | `string` (saved file path) |
| `import_data` | `{ Mode: ImportMode }` | `ImportPreview` |
| `confirm_import` | `{ PreviewId: string, Mode: ImportMode, DuplicateAction: DuplicateAction }` | `ImportResult` |

---

## Export

- Export scope: individual alarms, selected group, or "Export All"
- Default filenames:
  - JSON: `alarm-backup-YYYY-MM-DD.json`
  - CSV: `alarm-export-YYYY-MM-DD.csv`
  - iCal: `alarms-YYYY-MM-DD.ics`
- JSON file contains: `{ Alarms: Alarm[], Groups: AlarmGroup[], ExportedAt: string, Version: string }`
- CSV columns: `AlarmId, Time, Date, Label, IsEnabled, RepeatType, RepeatDaysOfWeek, GroupName, SoundFile, SnoozeDurationMin, MaxSnoozeCount`
- iCal: each alarm becomes a `VEVENT` with `RRULE` for repeat patterns

---

## Import

> **Resolves GA2-006, GA2-023, GA3-025.** Full end-to-end import flow.

### End-to-End User Flow

```
1. Click "Import"     → Native file dialog opens (filtered by format)
2. Select file        → Rust reads & validates file
3. Parse              → Rust returns ImportPreview to frontend
4. Preview            → Frontend shows preview table: alarm count, group count, duplicates, errors
5. Choose strategy    → User selects duplicate action (Skip / Overwrite / Rename)
6. Confirm            → Frontend calls confirm_import with PreviewId + strategy
7. Result             → Success toast: "Imported 5 alarms, skipped 2 duplicates"
                        Error toast: "Import failed: 3 validation errors"
```

### Step 1: File Selection & Validation

- "Import" button in `ExportImport` component (rendered on Index page, also accessible via `Ctrl+I`)
- Opens native file picker via `tauri-plugin-dialog` (filter: `.json`, `.csv`, `.ics`)
- Rust reads and validates file against expected schema
- On invalid file: return `ImportPreview` with `Errors` array populated; frontend shows error toast

### Step 2: Import Preview

- Frontend receives `ImportPreview` and shows a modal dialog:
  - Total alarms / groups to import
  - List of duplicates (matched by `AlarmId`)
  - Any validation warnings
- User reviews and decides whether to proceed

### Step 3: Duplicate Handling

| Action | Behavior |
|--------|----------|
| **Skip** | Keep existing alarm, ignore imported duplicate |
| **Overwrite** | Replace existing alarm with imported version |
| **Rename** | Import as new alarm with "(Imported)" appended to label |

### Step 4: Apply

- **Merge** — Add imported alarms alongside existing (handle duplicates per user choice)
- **Replace** — Clear all existing data, load from file (with confirmation dialog: "This will delete all existing alarms. Continue?")

### Cancel / Timeout

- User can close the preview modal to cancel import — no IPC call needed
- Backend garbage-collects preview state after 5 minutes if `confirm_import` is never called
- Preview state is stored in Rust memory (not SQLite) — keyed by `PreviewId`

---

## Import Preview

```typescript
interface ImportPreview {
  PreviewId: string;       // UUID — reference for confirm_import
  AlarmCount: number;      // Total alarms in file
  GroupCount: number;      // Total groups in file
  DuplicateCount: number;  // Alarms that already exist (matched by AlarmId)
  Alarms: Alarm[];         // Preview of alarms to import
  Groups: AlarmGroup[];    // Preview of groups to import
  Errors: string[];        // Validation errors (if any)
}
```

---

## Import Result

```typescript
interface ImportResult {
  Imported: number;
  Skipped: number;
  Overwritten: number;
  Errors: string[];
}
```

---

## iCal RRULE Mapping

> **Resolves GA2-024, GA3-025.** Maps iCal `RRULE` to `RepeatPattern` on import.

| iCal RRULE | RepeatType | Mapping Notes |
|-----------|------------|---------------|
| (no RRULE) | `Once` | Single occurrence |
| `FREQ=DAILY` | `Daily` | Direct mapping |
| `FREQ=WEEKLY;BYDAY=MO,WE,FR` | `Weekly` | `BYDAY` → `DaysOfWeek` (MO=1, TU=2, ..., SU=0) |
| `FREQ=MINUTELY;INTERVAL=90` | `Interval` | `INTERVAL` → `IntervalMinutes` |
| `FREQ=HOURLY;INTERVAL=2` | `Interval` | Convert to minutes: `INTERVAL * 60` |
| `FREQ=MONTHLY`, `FREQ=YEARLY` | `Once` | **Unmappable** — import as one-time with warning |
| Complex RRULE (BYMONTHDAY, BYSETPOS, etc.) | `Once` | **Unmappable** — import as one-time with warning in `ImportPreview.Errors` |

### CSV Import Rules

- **Headers required** — first row must contain column names
- **Column order** — does not matter; matched by header name
- **Extra columns** — ignored silently
- **Missing required columns** — error: "Missing required column: {name}"
- **Required columns:** `Time`, `Label`
- **Optional columns:** all others (defaults applied from data model)

---

## Validation

| Check | Rule |
|-------|------|
| File format | Valid JSON / CSV / iCal syntax |
| Required fields | Alarms have all required fields from data model |
| Group references | `GroupId` values reference valid groups in the file |
| Time format | Valid `HH:MM` format |
| Repeat pattern | Valid `RepeatPattern` type and fields |

---

## Export Privacy Warning (Resolves SEC-EXPORT-001)

> Alarm labels may contain personal information. Export files are unencrypted.

**Before export**, show confirmation dialog:

> ⚠️ **Export file is not encrypted**
> Anyone with access to this file can read your alarm labels and settings.
> 
> ☐ Don't show this warning again
> 
> [Cancel] [Export]

- "Don't show again" preference stored in `Settings` table (`ExportWarningDismissed`)
- **P2+ enhancement:** Offer optional password-protected ZIP export using `zip` crate with AES-256 encryption

---

## Acceptance Criteria

- [ ] Export supports JSON, CSV, and iCal formats
- [ ] Export allows selecting individual alarms, groups, or all
- [ ] Export shows privacy warning dialog before writing file
- [ ] Import supports JSON, CSV, and iCal formats
- [ ] Import shows preview before applying
- [ ] Duplicate handling: skip, overwrite, or rename
- [ ] Merge mode adds new alarms alongside existing
- [ ] Replace mode clears existing data (with confirmation)
- [ ] Invalid files show descriptive error toast
- [ ] Import preserves all alarm settings
- [ ] iCal export generates valid `VEVENT`s with `RRULE`
- [ ] Works offline (no network dependency)

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Data Model | `../01-fundamentals/01-data-model.md` |
| Alarm CRUD | `./01-alarm-crud.md` |
| Alarm Groups | `./07-alarm-groups.md` |
| Tauri Architecture | `../01-fundamentals/06-tauri-architecture-and-framework-comparison.md` |
| Domain Enums | `../01-fundamentals/01-data-model.md` → Domain Enums (`ExportFormat`, `ExportScope`, `DuplicateAction`, `ImportMode`) |
| Coding Guidelines | `../../02-coding-guidelines/03-coding-guidelines-spec/` |
