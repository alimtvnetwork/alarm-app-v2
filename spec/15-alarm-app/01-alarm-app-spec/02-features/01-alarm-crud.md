# Alarm CRUD

**Version:** 1.6.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 — Must Have  
**Resolves:** FE-A11Y-001, BE-DELETE-001, FE-STATE-002

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

> **Resolves BE-DELETE-001.** Defines the timer mechanism and crash recovery for permanent deletion.

- Sets `DeletedAt` timestamp instead of hard-deleting immediately
- Shows a 5-second undo toast in the UI
- If undone: clears `DeletedAt` back to null
- **Timer mechanism:** `tokio::spawn` with `tokio::time::sleep(Duration::from_secs(5))`, then `DELETE FROM alarms WHERE AlarmId = ? AND DeletedAt IS NOT NULL`
- **Crash recovery:** On app startup, purge all rows where `DeletedAt < now - 5 seconds` (cleanup pass)
- IPC command: `invoke("delete_alarm", { alarmId })` → returns `{ undoToken }`
- Undo IPC: `invoke("undo_delete_alarm", { undoToken })`

```rust
// Soft-delete timer
pub fn schedule_permanent_delete(conn: Arc<Mutex<Connection>>, alarm_id: String, undo_token: String) {
    tokio::spawn(async move {
        tokio::time::sleep(Duration::from_secs(5)).await;

        // Only delete if still soft-deleted (not undone)
        let db = conn.lock().expect("DB lock poisoned");
        match db.execute(
            "DELETE FROM alarms WHERE AlarmId = ?1 AND DeletedAt IS NOT NULL",
            params![&alarm_id],
        ) {
            Ok(rows) if rows > 0 => {
                tracing::info!(alarm_id = %alarm_id, "Permanently deleted alarm");
            }
            _ => {}
        }
    });
}

// Startup cleanup (in startup sequence Step 8)
pub fn cleanup_stale_soft_deletes(conn: &Connection) {
    let cutoff = Utc::now() - chrono::Duration::seconds(5);
    conn.execute(
        "DELETE FROM alarms WHERE DeletedAt IS NOT NULL AND DeletedAt < ?1",
        params![cutoff.to_rfc3339()],
    ).ok();
}
```

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
- Null `GroupId` = "Ungrouped" section

### Keyboard & Screen Reader Accessibility (WCAG 2.1 AA)

> **Resolves FE-A11Y-001.** Drag-and-drop is inherently inaccessible. This section defines the keyboard alternative.

#### Keyboard Controls

| Action | Shortcut | Behavior |
|--------|----------|----------|
| Focus alarm item | `Tab` / `Shift+Tab` | Standard focus navigation through alarm list |
| Pick up alarm | `Space` or `Enter` | Enters "reorder mode" — item visually lifts, screen reader announces "Grabbed {label}. Use arrow keys to move." |
| Move within group | `↑` / `↓` | Reorders alarm position within current group |
| Move between groups | `Ctrl+↑` / `Ctrl+↓` | Moves alarm to previous/next group, placing it at the end |
| Drop alarm | `Space` or `Enter` | Confirms new position. Screen reader announces "Dropped {label} in {group name}, position {n} of {total}" |
| Cancel reorder | `Escape` | Returns alarm to original position. Screen reader announces "Reorder cancelled" |

#### `dnd-kit` Keyboard Sensor Configuration

```tsx
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);

// In JSX:
<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
  {/* AlarmList with SortableContext per group */}
</DndContext>
```

#### ARIA Attributes

```tsx
// Each alarm item in the list
<div
  role="listitem"
  aria-roledescription="sortable alarm"
  aria-label={`${alarm.label}, ${alarm.time}, ${alarm.enabled ? 'enabled' : 'disabled'}`}
  aria-describedby="dnd-instructions"
  tabIndex={0}
>
  {/* alarm content */}
</div>

// Hidden instructions for screen readers
<div id="dnd-instructions" className="sr-only">
  Press Space to pick up. Use arrow keys to move within a group.
  Use Ctrl+Arrow to move between groups. Press Space to drop, Escape to cancel.
</div>
```

#### Live Region for Announcements

```tsx
// Announce drag state changes to screen readers
<div role="status" aria-live="polite" aria-atomic className="sr-only">
  {dragAnnouncement}
</div>

// Set dragAnnouncement to:
// On grab: "Grabbed Morning Alarm. Use arrow keys to move."
// On move: "Morning Alarm moved to Work group, position 2 of 5"
// On drop: "Dropped Morning Alarm in Work group, position 2 of 5"
// On cancel: "Reorder cancelled. Morning Alarm returned to original position."
```

#### Acceptance Criteria (Accessibility)

- [ ] All alarm items are focusable via keyboard (`Tab`)
- [ ] `Space` enters reorder mode with visual + audible feedback
- [ ] Arrow keys move items; `Ctrl+Arrow` crosses group boundaries
- [ ] `Escape` cancels reorder and restores original position
- [ ] Screen reader announces all state changes via `aria-live` region
- [ ] No drag-only interactions — every action has a keyboard equivalent
- [ ] Focus indicator visible on all interactive elements (2px outline min)

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

## Undo Stack (Resolves FE-STATE-002)

> Without an undo stack, rapid delete+undo of multiple alarms creates conflicting undo tokens.

### Problem

User deletes alarm A, then alarm B within 5 seconds. Undoing alarm A while B's timer is active creates race conditions with a single undo token.

### Solution: Undo Stack (Max 5)

```typescript
interface UndoEntry {
  Token: string;         // UUID — matches backend undo_token
  AlarmId: string;
  Label: string;         // For toast display
  ExpiresAt: number;     // Date.now() + 5000
  TimerId: ReturnType<typeof setTimeout>;
}

// Frontend state
const undoStack: UndoEntry[] = [];  // Max 5 entries
const MAX_UNDO_STACK = 5;

function onDeleteAlarm(alarmId: string, undoToken: string, label: string) {
  // If stack is full, oldest entry expires immediately
  if (undoStack.length >= MAX_UNDO_STACK) {
    const oldest = undoStack.shift()!;
    clearTimeout(oldest.timerId);
    // oldest is permanently deleted (timer already fired on backend)
  }

  const timerId = setTimeout(() => {
    // Remove from stack after 5s (backend has already hard-deleted)
    const idx = undoStack.findIndex(e => e.token === undoToken);
    if (idx !== -1) undoStack.splice(idx, 1);
    // Remove toast for this entry
  }, 5000);

  undoStack.push({ token: undoToken, alarmId, label, expiresAt: Date.now() + 5000, timerId });

  // Show toast: "Deleted {label} — Undo"
}

async function onUndo(token: string) {
  const idx = undoStack.findIndex(e => e.token === token);
  if (idx === -1) return; // Already expired

  const entry = undoStack.splice(idx, 1)[0];
  clearTimeout(entry.timerId);

  await safeInvoke("undo_delete_alarm", { undoToken: token });
}
```

### UI Behavior

- **Multiple toasts:** Each delete shows its own toast with alarm label. Toasts stack vertically (newest on top, max 3 visible)
- **Independent timers:** Each toast has its own 5s countdown, independent of others
- **Undo any:** User can undo any visible toast, not just the most recent
- **Toast auto-dismiss:** Toast disappears after 5s or on undo

---

## UI Components

| Component | Description |
|-----------|-------------|
| `AlarmList` | Displays all alarms grouped by AlarmGroup, with toggle switches, drag handles |
| `AlarmForm` | Dialog for create/edit — time picker, date picker, label, repeat pattern, sound, group, snooze, auto-dismiss |
| `UndoToast` | 5-second toast with "Undo" button after soft-delete. Supports stacking (max 3 visible) |

---

## IPC Commands

| Command | Payload | Returns |
|---------|---------|---------|
| `create_alarm` | `CreateAlarmPayload` | `Alarm` |
| `update_alarm` | `UpdateAlarmPayload` | `Alarm` |
| `delete_alarm` | `{ AlarmId: string }` | `{ UndoToken: string }` |
| `undo_delete_alarm` | `{ UndoToken: string }` | `Alarm` |
| `toggle_alarm` | `{ AlarmId: string, IsEnabled: boolean }` | `Alarm` |
| `duplicate_alarm` | `{ AlarmId: string }` | `Alarm` |
| `move_alarm_to_group` | `{ AlarmId: string, GroupId: string \| null }` | `void` |
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
