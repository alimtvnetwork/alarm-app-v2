# Alarm Groups

**Version:** 1.1.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P1 — Should Have

---

## Keywords

`groups`, `organize`, `batch`, `toggle`, `categories`

---

## Description

Alarms can be organized into named groups (e.g., "Workday", "Weekend", "Gym"). Groups have a master toggle and can be created, renamed, and deleted.

---

## Behavior

| Action | Result |
|--------|--------|
| Create group | New named group appears in alarm list |
| Rename group | Group name updated, alarm assignments preserved |
| Delete group | Alarms moved to "Ungrouped" (not deleted) |
| Disable group | All member alarms disabled; individual states saved |
| Enable group | Each alarm restored to its individual enabled state |
| Assign alarm to group | Alarm appears under that group in the list |

---

## Master Toggle Logic

When a group is disabled:
1. Save each alarm's current `enabled` state to a map: `{ [alarmId]: boolean }`
2. Set all member alarms to `enabled = 0` in SQLite

When a group is re-enabled:
1. Restore each alarm's `enabled` state from the saved map
2. Clear the saved map

Toggle state saved in the `settings` SQLite table under key `group-toggle-state`.

---

## UI

- Groups shown as collapsible sections in `AlarmList`
- "Ungrouped" / "Other" section for alarms without a group
- Group header: name + master toggle + edit/delete actions
- `AlarmGroupForm` dialog for create/rename

---

## Acceptance Criteria

- [ ] Create, rename, delete groups
- [ ] Assign alarms to groups during create/edit
- [ ] Master toggle disables/enables all group alarms
- [ ] Deleting group preserves alarms (moved to ungrouped)
- [ ] Groups persist in SQLite database

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Alarm CRUD | `./01-alarm-crud.md` |
| Data Model | `../01-fundamentals/01-data-model.md` |
| Export/Import | `./10-export-import.md` |
