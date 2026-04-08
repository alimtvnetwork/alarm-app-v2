# Export / Import

**Version:** 1.0.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P1 — Should Have

---

## Keywords

`export`, `import`, `json`, `backup`, `merge`, `replace`

---

## Description

Users can export all alarms and groups as a JSON file for backup, and import from a JSON file to restore or transfer data.

---

## Export

- Single button downloads a `.json` file
- File contains: `{ alarms: Alarm[], groups: AlarmGroup[], exportedAt: string, version: string }`
- Filename: `alarm-backup-YYYY-MM-DD.json`

---

## Import

- File picker accepts `.json` files only
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

- [ ] Export downloads valid JSON with all alarms and groups
- [ ] Import validates file structure before applying
- [ ] Merge mode adds new alarms, skips existing by ID
- [ ] Replace mode clears existing data before loading
- [ ] Invalid files show descriptive error toast
- [ ] Import preserves all alarm settings

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Data Model | `../01-fundamentals/01-data-model.md` |
| Alarm CRUD | `./01-alarm-crud.md` |
| Alarm Groups | `./07-alarm-groups.md` |
