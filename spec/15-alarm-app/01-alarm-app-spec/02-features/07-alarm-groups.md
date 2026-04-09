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

> **Resolves FE-STATE-001.** Without per-alarm state tracking, re-enabling a group would enable ALL alarms — even those the user had manually disabled.

### Column: `previous_enabled`

Add `previous_enabled INTEGER` column to the `alarms` table. This stores each alarm's `enabled` state before a group toggle-off.

### Disable Group Flow

1. For each alarm in the group: save `enabled` → `previous_enabled`
2. Set all member alarms to `enabled = 0`
3. Set group `enabled = 0`
4. Recompute `nextFireTime` (all become NULL)

### Enable Group Flow

1. For each alarm in the group: restore `enabled` from `previous_enabled`
2. Set `previous_enabled = NULL` (clear)
3. Set group `enabled = 1`
4. Recompute `nextFireTime` for restored-enabled alarms

### IPC Commands

| Command | Payload | Returns |
|---------|---------|---------|
| `toggle_group` | `{ groupId: string, enabled: boolean }` | `void` |

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| User manually toggles alarm while group is off | Writes to `enabled` directly; `previous_enabled` unchanged |
| Group deleted while disabled | Alarms moved to ungrouped with `enabled = previous_enabled` (restore before move) |
| `previous_enabled` is NULL when re-enabling | Treat as `enabled = 1` (default on) |

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
