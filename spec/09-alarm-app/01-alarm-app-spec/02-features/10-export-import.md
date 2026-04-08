# Export / Import

**Version:** 1.1.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P1 — Should Have

---

## Keywords

`export`, `import`, `json`, `backup`, `merge`, `replace`, `native`, `file-dialog`

---

## Description

Users can export all alarms and groups as a JSON file for backup, and import from a JSON file to restore or transfer data. Uses native file dialogs via Tauri (not browser download/upload).

---

## Native Implementation

| Aspect | Web (Previous) | Native (Tauri) |
|--------|---------------|----------------|
| Export | Blob download via anchor tag | `tauri-plugin-dialog` save dialog → Rust writes file |
| Import | `<input type="file">` | `tauri-plugin-dialog` open dialog → Rust reads & validates |
| Data source | localStorage | SQLite database |

### IPC Commands

| Command | Payload | Returns |
|---------|---------|---------|
| `export_data` | `void` | `string` (saved file path) |
| `import_data` | `{ mode: "merge" \| "replace" }` | `ImportResult` |

### Rust Backend Flow

**Export:**
1. Query all rows from `alarms` and `alarm_groups` tables
2. Serialize to JSON with `serde_json`
3. Open native save dialog (`tauri-plugin-dialog`)
4. Write file to user-selected path
5. Return file path to frontend

**Import:**
1. Open native file dialog (filter: `*.json`)
2. Read and parse file with `serde_json`
3. Validate against expected schema
4. On valid: apply merge or replace mode
5. Return `ImportResult { imported: usize, skipped: usize, errors: Vec<String> }`

---

## Export

- Single button opens native save dialog
- Default filename: `alarm-backup-YYYY-MM-DD.json`
- File contains: `{ alarms: Alarm[], groups: AlarmGroup[], exportedAt: string, version: string }`

---

## Import

- Button opens native file picker (`.json` filter)
- Validates structure against expected schema
- On valid file, prompt user:
  - **Merge** — Add imported alarms alongside existing (skip duplicates by `id`)
  - **Replace** — Clear all existing data, load from file
- On invalid file: show error toast with specific issue

---

## Validation

| Check | Rule |
|-------|------|
| File format | Valid JSON |
| Required fields | `alarms` array, `groups` array |
| Alarm structure | Each alarm has required fields from data model |
| Group references | `groupId` values reference valid groups in the file |

---

## Acceptance Criteria

- [ ] Export opens native save dialog and writes valid JSON
- [ ] Import opens native file picker with `.json` filter
- [ ] Import validates file structure before applying
- [ ] Merge mode adds new alarms, skips existing by ID
- [ ] Replace mode clears existing data before loading
- [ ] Invalid files show descriptive error toast
- [ ] Import preserves all alarm settings
- [ ] Works offline (no network dependency)

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Data Model | `../01-fundamentals/01-data-model.md` |
| Alarm CRUD | `./01-alarm-crud.md` |
| Alarm Groups | `./07-alarm-groups.md` |
| Tauri Architecture | `../01-fundamentals/06-tauri-architecture-and-framework-comparison.md` |
