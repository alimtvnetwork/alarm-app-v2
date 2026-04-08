# Alarm CRUD

**Version:** 1.1.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 — Must Have

---

## Keywords

`alarm`, `create`, `read`, `update`, `delete`, `toggle`

---

## Description

Users can create new alarms by setting a time (hour and minute), edit existing alarms, view a list of all saved alarms with their status (on/off), and delete alarms. Each alarm has an individual toggle switch to enable or disable it without deleting.

---

## Acceptance Criteria

- [ ] User can create an alarm with time, label, recurring days, snooze duration, sound, and group
- [ ] User can edit any field of an existing alarm
- [ ] User can delete an alarm with confirmation
- [ ] User can toggle an alarm on/off without opening the edit form
- [ ] Alarm list shows all alarms sorted by time within each group
- [ ] All changes persist to SQLite immediately via Tauri IPC commands
- [ ] Empty state shown when no alarms exist

---

## UI Components

| Component | Description |
|-----------|-------------|
| `AlarmList` | Displays all alarms grouped by AlarmGroup, with toggle switches |
| `AlarmForm` | Dialog for create/edit — time picker, label input, day pills, sound selector, group dropdown |

---

## Hook

`useAlarms` — Provides CRUD operations, toggle, SQLite sync via Tauri `invoke()` commands.

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Data Model | `../01-fundamentals/01-data-model.md` |
| Alarm Groups | `./07-alarm-groups.md` |
| Sound Selection | `./05-sound-and-vibration.md` |
