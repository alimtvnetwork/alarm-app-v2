# Alarm CRUD

**Version:** 1.14.0  
**Updated:** 2026-04-11  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 — Must Have  
**Resolves:** FE-A11Y-001, BE-DELETE-001, FE-STATE-002

---

## Keywords

`alarm`, `create`, `read`, `update`, `delete`, `toggle`, `duplicate`, `soft-delete`, `undo`, `drag-drop`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ✅ |


## Description

Users can create new alarms by setting a time (hour and minute), optional date, repeat pattern, and per-alarm settings. They can edit, duplicate, soft-delete (with undo), toggle, and reorder alarms between groups via drag-and-drop.

---

## Operations

### Create

- Set time, label, date (optional), repeat pattern, sound, snooze duration, max snooze count, gradual volume, auto-dismiss
- Assign to a group (optional)
- Rust backend computes `NextFireTime` on save

### Edit

- Modify any field of an existing alarm
- Rust backend recomputes `NextFireTime` on save

### Duplicate

- One-click clone of any alarm: copies all fields, generates new UUID, appends "(Copy)" to label
- IPC command: `invoke("duplicate_alarm", { AlarmId })`

### Delete (Soft-Delete with Undo)

> **Resolves BE-DELETE-001.** Defines the timer mechanism and crash recovery for permanent deletion.

- Sets `DeletedAt` timestamp instead of hard-deleting immediately
- Shows a 5-second undo toast in the UI
- If undone: clears `DeletedAt` back to null
- **Timer mechanism:** `tokio::spawn` with `tokio::time::sleep(Duration::from_secs(5))`, then `DELETE FROM Alarms WHERE AlarmId = ? AND DeletedAt IS NOT NULL`
- **Crash recovery:** On app startup, purge all rows where `DeletedAt < now - 5 seconds` (cleanup pass)
- IPC command: `invoke("delete_alarm", { AlarmId })` → returns `{ UndoToken }`
- Undo IPC: `invoke("undo_delete_alarm", { UndoToken })`

```rust
const UNDO_TIMEOUT_SECS: u64 = 5;

// Soft-delete timer
pub fn schedule_permanent_delete(conn: Arc<Mutex<Connection>>, alarm_id: String, undo_token: String) {
    tokio::spawn(async move {
        tokio::time::sleep(Duration::from_secs(UNDO_TIMEOUT_SECS)).await;

        // Only delete if still soft-deleted (not undone)
        // EXEMPT: expect("mutex poisoned") — see 04-platform-constraints.md § Allowed Patterns
        let db = conn.lock().expect("DB lock poisoned");
        match db.execute(
            "DELETE FROM Alarms WHERE AlarmId = ?1 AND DeletedAt IS NOT NULL",
            params![&alarm_id],
        ) {
            Ok(rows) if rows > 0 => {
                tracing::info!(alarm_id = %alarm_id, "Permanently deleted alarm");
            }
            Ok(_) => {
                tracing::debug!(alarm_id = %alarm_id, "schedule_permanent_delete: no rows affected (alarm was undone or missing)");
            }
            Err(e) => {
                tracing::warn!(alarm_id = %alarm_id, error = %e, "schedule_permanent_delete: DELETE failed");
            }
        }
    });
}

// Startup cleanup (in startup sequence Step 8)
pub fn cleanup_stale_soft_deletes(conn: &Connection) {
    let cutoff = Utc::now() - chrono::Duration::seconds(UNDO_TIMEOUT_SECS as i64);
    match conn.execute(
        "DELETE FROM Alarms WHERE DeletedAt IS NOT NULL AND DeletedAt < ?1",
        params![cutoff.to_rfc3339()],
    ) {
        Ok(rows) => {
            tracing::info!(rows_purged = rows, "cleanup_stale_soft_deletes complete");
        }
        Err(e) => {
            tracing::warn!(error = %e, "cleanup_stale_soft_deletes failed");
        }
    }
}
```

### Toggle

- Quick enable/disable without opening edit form
- IPC command: `invoke("toggle_alarm", { AlarmId, IsEnabled })`
- Rust recomputes `NextFireTime` when enabling

---

## Drag-and-Drop Between Groups

**Library:** `@dnd-kit/core` + `@dnd-kit/sortable` (actively maintained, accessible, lightweight)

- Alarms can be dragged between groups in the alarm list
- Drop target highlights the target group
- On drop: updates `GroupId` in SQLite
- IPC command: `invoke("move_alarm_to_group", { AlarmId, GroupId })`
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
  aria-label={`${alarm.Label}, ${alarm.Time}, ${alarm.IsEnabled ? 'on' : 'off'}`}
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

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Create alarm with time in the past (today) | `NextFireTime` set to next day at that time |
| Edit alarm while it is currently firing | Queue update; apply after dismiss/snooze |
| Delete alarm while snooze is active | Cancel snooze timer, remove `SnoozeState` row |
| Duplicate alarm in a full group (if group limit exists) | Show validation error, do not create |
| Toggle off alarm that is currently snoozed | Cancel snooze, clear `SnoozeState`, set `IsEnabled = false` |
| Undo delete after 5-second window expires | Undo no longer available; alarm permanently deleted |
| Drag alarm to its own group | No-op — no IPC call made |
| Create alarm with label > 100 chars | Truncate to 100 chars with toast warning |

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
- [ ] `NextFireTime` is recomputed on create, edit, toggle, and duplicate
- [ ] Empty state shown when no alarms exist

---

## Undo Stack (Resolves FE-STATE-002)

> Without an undo stack, rapid delete+undo of multiple alarms creates conflicting undo tokens.

### Problem

User deletes alarm A, then alarm B within 5 seconds. Undoing alarm A while B's timer is active creates race conditions with a single undo token.

### Solution: Undo Stack (Max 5)

```typescript
const UNDO_TIMEOUT_MS = 5000;

interface UndoEntry {
  Token: string;         // UUID — matches backend undo_token
  AlarmId: string;
  Label: string;         // For toast display
  ExpiresAt: number;     // Date.now() + UNDO_TIMEOUT_MS
  TimerId: ReturnType<typeof setTimeout>;
}

// Frontend state
const undoStack: UndoEntry[] = [];  // Max 5 entries
const MAX_UNDO_STACK = 5;

// TS function params are camelCase per language convention; serialized keys are PascalCase
function onDeleteAlarm(alarmId: string, undoToken: string, label: string) {
  console.debug('onDeleteAlarm', { alarmId, undoToken, label });
  manageUndoStack(undoToken);
  const timerId = createUndoTimer(undoToken);
  undoStack.push({ Token: undoToken, AlarmId: alarmId, Label: label, ExpiresAt: Date.now() + UNDO_TIMEOUT_MS, TimerId: timerId });
  // Show toast: "Deleted {label} — Undo"
}

function manageUndoStack(undoToken: string) {
  if (undoStack.length >= MAX_UNDO_STACK) {
    const oldest = undoStack.shift()!;
    clearTimeout(oldest.TimerId);
  }
}

function createUndoTimer(undoToken: string): ReturnType<typeof setTimeout> {
  return setTimeout(() => {
    const idx = undoStack.findIndex(e => e.Token === undoToken);
    if (idx !== -1) undoStack.splice(idx, 1);
    // Remove toast for this entry
  }, UNDO_TIMEOUT_MS);
}

async function onUndo(token: string) {
  console.debug('onUndo', { token });
  const idx = undoStack.findIndex(e => e.Token === token);
  if (idx === -1) return; // Already expired

  const entry = undoStack.splice(idx, 1)[0];
  clearTimeout(entry.TimerId);

  await safeInvoke("undo_delete_alarm", { UndoToken: token });
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

## Payload Interfaces

> **Resolves GA1-001, GA1-002.** Defines exactly which fields the frontend sends. Server-generated fields (`AlarmId`, `NextFireTime`, `CreatedAt`, `UpdatedAt`, `DeletedAt`) are never client-supplied.

### `CreateAlarmPayload`

```typescript
interface CreateAlarmPayload {
  Time: string;                    // "HH:MM" (24h format, "00:00"–"23:59")
  Date: string | null;             // "YYYY-MM-DD" or null (null = today/tomorrow based on time)
  Label: string;                   // Max 100 chars, trimmed. Empty string = no label
  RepeatType: RepeatType;          // "Once" | "Daily" | "Weekly" | "Interval" | "Cron"
  RepeatDaysOfWeek: number[];      // [0=Sun..6=Sat] — required ≥1 when RepeatType=Weekly, else []
  RepeatIntervalMinutes: number;   // 1–1440, only used when RepeatType=Interval, else 0
  RepeatCronExpression: string;    // Valid cron, only used when RepeatType=Cron, else ""
  GroupId: string | null;          // AlarmGroupId or null (Ungrouped)
  SnoozeDurationMin: number;       // 1–30, default 5
  MaxSnoozeCount: number;          // 0–10, default 3. 0 = snooze disabled (dismiss only)
  SoundFile: string;               // Sound ID from list_sounds, default "classic-beep"
  IsVibrationEnabled: boolean;     // default false
  IsGradualVolume: boolean;        // default false
  GradualVolumeDurationSec: number;// 15, 30, or 60 seconds, default 30. Only used when IsGradualVolume=true
  AutoDismissMin: number;          // 0–60, default 0. 0 = manual dismiss only (sentinel, not null)
  ChallengeType: ChallengeType | null; // null = no challenge
  ChallengeDifficulty: ChallengeDifficulty | null; // "Easy"|"Medium"|"Hard" — math only
  ChallengeShakeCount: number | null;  // shake challenge only
  ChallengeStepCount: number | null;   // steps challenge only
}
```

### `UpdateAlarmPayload`

Uses **PATCH semantics** — only changed fields are sent. `AlarmId` is always required.

```typescript
interface UpdateAlarmPayload {
  AlarmId: string;                 // Required — identifies the alarm to update
  Time?: string;
  Date?: string | null;
  Label?: string;
  RepeatType?: RepeatType;
  RepeatDaysOfWeek?: number[];
  RepeatIntervalMinutes?: number;
  RepeatCronExpression?: string;
  GroupId?: string | null;
  SnoozeDurationMin?: number;
  MaxSnoozeCount?: number;
  SoundFile?: string;
  IsVibrationEnabled?: boolean;
  IsGradualVolume?: boolean;
  GradualVolumeDurationSec?: number;
  AutoDismissMin?: number;
  ChallengeType?: ChallengeType | null;
  ChallengeDifficulty?: ChallengeDifficulty | null;
  ChallengeShakeCount?: number | null;
  ChallengeStepCount?: number | null;
}
```

> **Resolves PY-001, PY-002.** Without Rust struct definitions, AI will invent field names or skip serde attributes for IPC deserialization.

#### Rust — `CreateAlarmPayload`

```rust
#[derive(Debug, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct CreateAlarmPayload {
    pub time: String,
    pub date: Option<String>,
    pub label: String,
    pub repeat_type: RepeatType,
    pub repeat_days_of_week: Vec<u8>,
    pub repeat_interval_minutes: u32,
    pub repeat_cron_expression: String,
    pub group_id: Option<String>,
    pub snooze_duration_min: u32,
    pub max_snooze_count: u32,
    pub sound_file: String,
    pub is_vibration_enabled: bool,
    pub is_gradual_volume: bool,
    pub gradual_volume_duration_sec: u32,
    pub auto_dismiss_min: u32,
    pub challenge_type: Option<ChallengeType>,
    pub challenge_difficulty: Option<ChallengeDifficulty>,
    pub challenge_shake_count: Option<u32>,
    pub challenge_step_count: Option<u32>,
}
```

#### Rust — `UpdateAlarmPayload`

> PATCH semantics — all fields except `AlarmId` are `Option`. Absent fields are not updated.

```rust
#[derive(Debug, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct UpdateAlarmPayload {
    pub alarm_id: String,
    pub time: Option<String>,
    pub date: Option<Option<String>>,
    pub label: Option<String>,
    pub repeat_type: Option<RepeatType>,
    pub repeat_days_of_week: Option<Vec<u8>>,
    pub repeat_interval_minutes: Option<u32>,
    pub repeat_cron_expression: Option<String>,
    pub group_id: Option<Option<String>>,
    pub snooze_duration_min: Option<u32>,
    pub max_snooze_count: Option<u32>,
    pub sound_file: Option<String>,
    pub is_vibration_enabled: Option<bool>,
    pub is_gradual_volume: Option<bool>,
    pub gradual_volume_duration_sec: Option<u32>,
    pub auto_dismiss_min: Option<u32>,
    pub challenge_type: Option<Option<ChallengeType>>,
    pub challenge_difficulty: Option<Option<ChallengeDifficulty>>,
    pub challenge_shake_count: Option<Option<u32>>,
    pub challenge_step_count: Option<Option<u32>>,
}
```

> **Note on `Option<Option<T>>`:** For nullable fields like `Date`, `GroupId`, `ChallengeType`, the outer `Option` represents "field was sent" and the inner `Option` represents "value is null". `None` = field not in payload (don't update). `Some(None)` = explicitly set to null. `Some(Some(value))` = set to value.

---

## Input Validation Rules

> **Resolves GA2-004, GA2-005.** Validation runs in both Rust backend (authoritative) and frontend (UX convenience). Backend rejects invalid data with a typed error; frontend prevents the Save button.

| Field | Rule | Error |
|-------|------|-------|
| `Time` | Regex `^([01]\d\|2[0-3]):[0-5]\d$` | "Invalid time format" |
| `Date` | ISO 8601 date or null; must be ≥ today if non-null | "Date cannot be in the past" |
| `Label` | Max 100 chars, trimmed, whitespace-collapsed | "Label exceeds 100 characters" |
| `RepeatDaysOfWeek` | When `RepeatType=Weekly`: length ≥ 1, values 0–6, no duplicates | "Select at least one day" |
| `RepeatIntervalMinutes` | When `RepeatType=Interval`: 1–1440 | "Interval must be 1–1440 minutes" |
| `RepeatCronExpression` | When `RepeatType=Cron`: valid 5-field cron syntax | "Invalid cron expression" |
| `SnoozeDurationMin` | 1–30 | "Snooze duration must be 1–30 minutes" |
| `MaxSnoozeCount` | 0–10 | "Max snooze count must be 0–10" |
| `SoundFile` | Must exist in `list_sounds` result | "Unknown sound file" |
| `GradualVolumeDurationSec` | Must be 15, 30, or 60 | "Gradual volume duration must be 15, 30, or 60 seconds" |
| `AutoDismissMin` | 0–60 | "Auto-dismiss must be 0–60 minutes" |
| `GroupId` | Must exist in AlarmGroups table or be null | "Unknown group" |

---

## Hook

`useAlarms` — Provides CRUD operations, toggle, duplicate, soft-delete/undo, drag-drop, SQLite sync via Tauri `invoke()` commands.

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Data Model | `../01-fundamentals/01-data-model.md` |
| Design System (UI States) | `../01-fundamentals/02-design-system.md` |
| File Structure (Zustand Stores) | `../01-fundamentals/03-file-structure.md` |
| Alarm Groups | `./07-alarm-groups.md` |
| Sound Selection | `./05-sound-and-vibration.md` |
| Alarm Firing | `./03-alarm-firing.md` |
