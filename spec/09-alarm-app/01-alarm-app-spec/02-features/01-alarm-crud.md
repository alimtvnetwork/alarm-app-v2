# Alarm CRUD

**Version:** 1.3.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 — Must Have

---

## Keywords

`alarm`, `create`, `read`, `update`, `delete`, `toggle`, `duplicate`, `soft-delete`, `undo`, `drag-drop`

---

## Description

Users can create new alarms by setting a time (hour and minute), optional date, repeat pattern, and per-alarm settings. They can edit, duplicate, soft-delete (with undo), toggle, and reorder alarms between groups via drag-and-drop.

---

## Operations

### Create

- Set time, label, date (optional), repeat pattern, sound, snooze duration, max snooze count, gradual volume, auto-dismiss
- Assign to a group (optional)
- Rust backend computes `nextFireTime` on save

### Edit

- Modify any field of an existing alarm
- Rust backend recomputes `nextFireTime` on save

### Duplicate

- One-click clone of any alarm: copies all fields, generates new UUID, appends "(Copy)" to label
- IPC command: `invoke("duplicate_alarm", { alarmId })`

### Delete (Soft-Delete with Undo)

- Sets `deletedAt` timestamp instead of hard-deleting immediately
- Shows a 5-second undo toast in the UI
- If undone: clears `deletedAt` back to null
- After 5 seconds: Rust backend permanently removes the row
- IPC command: `invoke("delete_alarm", { alarmId })` → returns `{ undoToken }`
- Undo IPC: `invoke("undo_delete_alarm", { undoToken })`

### Toggle

- Quick enable/disable without opening edit form
- IPC command: `invoke("toggle_alarm", { alarmId, enabled })`
- Rust recomputes `nextFireTime` when enabling

---

## Drag-and-Drop Between Groups

**Library:** `@dnd-kit/core` + `@dnd-kit/sortable` (actively maintained, accessible, lightweight)

- Alarms can be dragged between groups in the alarm list
- Drop target highlights the target group
- On drop: updates `groupId` in SQLite
- IPC command: `invoke("move_alarm_to_group", { alarmId, groupId })`
- Null `groupId` = "Ungrouped" section
- **Keyboard alternative:** `Ctrl+Shift+↑/↓` to move alarm between groups (WCAG 2.1 AA compliance via `dnd-kit` keyboard sensor)

---

## Acceptance Criteria

- [ ] User can create an alarm with time, label, date, repeat pattern, snooze, sound, and group
- [ ] User can edit any field of an existing alarm
- [ ] User can duplicate an alarm with one click
- [ ] User can soft-delete an alarm with 5-second undo toast
- [ ] Undo restores the alarm fully (all fields preserved)
- [ ] User can toggle an alarm on/off without opening the edit form
- [ ] User can drag-and-drop alarms between groups
- [ ] Alarm list shows all alarms sorted by time within each group
- [ ] All changes persist to SQLite immediately via Tauri IPC commands
- [ ] `nextFireTime` is recomputed on create, edit, toggle, and duplicate
- [ ] Empty state shown when no alarms exist

---

## UI Components

| Component | Description |
|-----------|-------------|
| `AlarmList` | Displays all alarms grouped by AlarmGroup, with toggle switches, drag handles |
| `AlarmForm` | Dialog for create/edit — time picker, date picker, label, repeat pattern, sound, group, snooze, auto-dismiss |
| `UndoToast` | 5-second toast with "Undo" button after soft-delete |

---

## IPC Commands

| Command | Payload | Returns |
|---------|---------|---------|
| `create_alarm` | `CreateAlarmPayload` | `Alarm` |
| `update_alarm` | `UpdateAlarmPayload` | `Alarm` |
| `delete_alarm` | `{ alarmId: string }` | `{ undoToken: string }` |
| `undo_delete_alarm` | `{ undoToken: string }` | `Alarm` |
| `toggle_alarm` | `{ alarmId: string, enabled: boolean }` | `Alarm` |
| `duplicate_alarm` | `{ alarmId: string }` | `Alarm` |
| `move_alarm_to_group` | `{ alarmId: string, groupId: string \| null }` | `void` |
| `list_alarms` | `void` | `Alarm[]` |

---

## Hook

`useAlarms` — Provides CRUD operations, toggle, duplicate, soft-delete/undo, drag-drop, SQLite sync via Tauri `invoke()` commands.

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Data Model | `../01-fundamentals/01-data-model.md` |
| Alarm Groups | `./07-alarm-groups.md` |
| Sound Selection | `./05-sound-and-vibration.md` |
| Alarm Firing | `./03-alarm-firing.md` |
