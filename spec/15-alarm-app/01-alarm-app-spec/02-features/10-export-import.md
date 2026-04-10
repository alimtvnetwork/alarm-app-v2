# Export / Import

**Version:** 1.3.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P1 — Should Have  
**Resolves:** SEC-EXPORT-001

---

## Keywords

`export`, `import`, `json`, `csv`, `ical`, `ics`, `backup`, `merge`, `replace`, `native`, `file-dialog`, `duplicate-handling`

---

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
| `export_data` | `{ format: "json" \| "csv" \| "ics", scope: "all" \| "selected", alarmIds?: string[] }` | `string` (saved file path) |
| `import_data` | `{ mode: "merge" \| "replace" }` | `ImportPreview` |
| `confirm_import` | `{ previewId: string, mode: "merge" \| "replace", duplicateAction: "skip" \| "overwrite" \| "rename" }` | `ImportResult` |

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

### Step 1: File Selection & Validation

- Button opens native file picker (filter by selected format)
- Rust reads and validates file against expected schema
- On invalid file: return errors immediately

### Step 2: Import Preview

- Show preview table of what will be imported: alarm count, group count, any issues
- Highlight duplicates (matched by `id`)

### Step 3: Duplicate Handling

| Action | Behavior |
|--------|----------|
| **Skip** | Keep existing alarm, ignore imported duplicate |
| **Overwrite** | Replace existing alarm with imported version |
| **Rename** | Import as new alarm with "(Imported)" appended to label |

### Step 4: Apply

- **Merge** — Add imported alarms alongside existing (handle duplicates per user choice)
- **Replace** — Clear all existing data, load from file (with confirmation dialog)

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
