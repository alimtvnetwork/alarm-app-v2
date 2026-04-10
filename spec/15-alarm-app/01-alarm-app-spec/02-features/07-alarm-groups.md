# Alarm Groups

**Version:** 1.4.0  
**Updated:** 2026-04-10
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P1 — Should Have  
**Resolves:** FE-STATE-001

---

## Keywords

`groups`, `organize`, `batch`, `toggle`, `categories`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ✅ |


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

### Column: `IsPreviousEnabled`

Add `IsPreviousEnabled INTEGER` column to the `Alarms` table. This stores each alarm's `IsEnabled` state before a group toggle-off.

### Disable Group Flow

1. For each alarm in the group: save `IsEnabled` → `IsPreviousEnabled`
2. Set all member alarms to `IsEnabled = 0`
3. Set group `IsEnabled = 0`
4. Recompute `NextFireTime` (all become NULL)

### Enable Group Flow

1. For each alarm in the group: restore `IsEnabled` from `IsPreviousEnabled`
2. Set `IsPreviousEnabled = NULL` (clear)
3. Set group `IsEnabled = 1`
4. Recompute `NextFireTime` for restored-enabled alarms

### IPC Commands

| Command | Payload | Returns |
|---------|---------|---------|
| `create_group` | `{ Name: string }` | `AlarmGroup` |
| `update_group` | `{ AlarmGroupId: string, Name: string }` | `AlarmGroup` |
| `delete_group` | `{ AlarmGroupId: string }` | `void` |
| `list_groups` | `void` | `AlarmGroup[]` |
| `toggle_group` | `{ AlarmGroupId: string, IsEnabled: boolean }` | `void` |

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| User manually toggles alarm while group is off | Writes to `IsEnabled` directly; `IsPreviousEnabled` unchanged |
| Group deleted while disabled | Alarms moved to ungrouped with `IsEnabled = IsPreviousEnabled` (restore before move) |
| `IsPreviousEnabled` is NULL when re-enabling | Treat as `IsEnabled = 1` (default on) |

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
