# Alarm Groups

**Version:** 1.6.0  
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
| `create_group` | `CreateGroupPayload` | `AlarmGroup` |
| `update_group` | `UpdateGroupPayload` | `AlarmGroup` |
| `delete_group` | `{ AlarmGroupId: string }` | `void` |
| `list_groups` | `void` | `AlarmGroup[]` |
| `toggle_group` | `{ AlarmGroupId: string, IsEnabled: boolean }` | `void` |

### Payload Interfaces

> **Resolves GA1-003, GA1-004.** Defines exactly which fields the frontend sends for group operations.

```typescript
interface CreateGroupPayload {
  Name: string;       // Max 50 chars, trimmed, required
  Color?: string;     // Hex color (e.g., "#FF5733"). Defaults to '#6366F1' if omitted
  Position?: number;  // Position in list (0-based). Backend assigns next available if omitted
}

interface UpdateGroupPayload {
  AlarmGroupId: string;  // Required — identifies the group to update
  Name?: string;         // Max 50 chars, trimmed
  Color?: string;        // Hex color
  Position?: number;     // New position in list
}
```

### Rust Structs

```rust
#[derive(Debug, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct CreateGroupPayload {
    pub name: String,
    pub color: Option<String>,
    pub position: Option<i32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct UpdateGroupPayload {
    pub alarm_group_id: String,
    pub name: Option<String>,
    pub color: Option<String>,
    pub position: Option<i32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct DeleteGroupPayload {
    pub alarm_group_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct ToggleGroupPayload {
    pub alarm_group_id: String,
    pub is_enabled: bool,
}
```

### Rust Command Handler Pattern

> **Resolves GA2-003.** Canonical example of a Tauri IPC command handler. Other under-specified features should reference this pattern.

```rust
#[tauri::command]
pub fn create_group(
    state: tauri::State<'_, AppState>,
    payload: CreateGroupPayload,
) -> Result<AlarmGroup, AlarmAppError> {
    tracing::debug!(name = %payload.name, "create_group called");

    // 1. Validate
    let name = payload.name.trim();
    if name.is_empty() || name.len() > 50 {
        return Err(AlarmAppError::Validation(
            "Group name must be 1–50 characters".into(),
        ));
    }

    // 2. DB insert
    let db = state.db.lock().expect("DB lock");
    let group_id = uuid::Uuid::new_v4().to_string();
    db.execute(
        "INSERT INTO AlarmGroups (AlarmGroupId, Name, Color, Position) VALUES (?1, ?2, ?3, ?4)",
        params![&group_id, name, &payload.color.unwrap_or_default(), &payload.position.unwrap_or(0)],
    )?;

    // 3. Return created group
    let group = AlarmGroup { /* ... fields from DB ... */ };
    tracing::info!(group_id = %group_id, "Group created");
    Ok(group)
}
```

**Frontend call pattern:** Use `safeInvoke` from `04-platform-constraints.md`:

```typescript
const group = await safeInvoke<AlarmGroup>("create_group", { Name: "Workday", Color: "#FF5733", Position: 0 });
```

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
| Design System (UI States) | `../01-fundamentals/02-design-system.md` |
| File Structure (Zustand Stores) | `../01-fundamentals/03-file-structure.md` |
| Export/Import | `./10-export-import.md` |
