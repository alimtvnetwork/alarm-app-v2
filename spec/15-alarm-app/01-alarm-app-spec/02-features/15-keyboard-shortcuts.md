# Keyboard Shortcuts

**Version:** 1.2.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P1 — Should Have

---

## Keywords

`keyboard`, `shortcuts`, `hotkeys`, `accessibility`, `keybindings`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ✅ |


## Description

Full keyboard navigation and shortcut system for efficient alarm management. All primary actions are accessible without a mouse. Shortcuts follow platform conventions (Cmd on macOS, Ctrl on Windows/Linux).

---

## Global Shortcuts

| Action | macOS | Windows / Linux |
|--------|-------|-----------------|
| New alarm | `⌘ + N` | `Ctrl + N` |
| Open settings | `⌘ + ,` | `Ctrl + ,` |
| Import alarms | `⌘ + I` | `Ctrl + I` |
| Export alarms | `⌘ + E` | `Ctrl + E` |
| Search alarms | `⌘ + F` | `Ctrl + F` |

---

## Alarm List Shortcuts

| Action | Key |
|--------|-----|
| Toggle selected alarm on/off | `Space` |
| Delete selected alarm | `Delete` / `Backspace` |
| Duplicate selected alarm | `⌘/Ctrl + D` |
| Edit selected alarm | `Enter` |
| Move selection up | `↑` |
| Move selection down | `↓` |
| Select all | `⌘/Ctrl + A` |

---

## Active Alarm Overlay Shortcuts

| Action | Key |
|--------|-----|
| Snooze active alarm | `S` |
| Dismiss active alarm | `Enter` or `Esc` |

---

## Implementation

- Use `tauri-plugin-global-shortcut` for system-wide shortcuts (when app is in tray)
- In-app shortcuts handled by React keyboard event listeners
- Platform detection: `navigator.platform` or Tauri `os` API to choose `⌘` vs `Ctrl`
- Shortcuts must not conflict with OS-level shortcuts

### IPC Commands

| Command | Payload | Returns |
|---------|---------|---------|
| `register_shortcuts` | `void` | `void` |
| `unregister_shortcuts` | `void` | `void` |

---

## Search Behavior

> **Resolves GA2-036.** Defines what `⌘/Ctrl + F` does.

- Opens a search input bar at the top of the alarm list
- **Filter type:** Client-side substring match on `alarm.Label`, case-insensitive
- **No IPC needed** — filtering happens in the frontend Zustand store
- **Empty query:** shows all alarms (search bar stays open until `Esc`)
- **No results:** shows empty state: "No alarms matching '{query}'"
- `Esc` closes the search bar and restores the full list

### Implementation

```typescript
// In useAlarmStore
filteredAlarms: (query: string) => Alarm[] = (query) => {
  const q = query.trim().toLowerCase();
  if (!q) return get().alarms;
  return get().alarms.filter(a => a.Label.toLowerCase().includes(q));
};
```

---

## Select All & Bulk Operations

> **Resolves GA2-037.** Defines what `⌘/Ctrl + A` does.

- **Behavior:** Selects all visible alarms in the current view (respects active search filter)
- **State:** Adds `selectedAlarmIds: Set<string>` to `useAlarmStore`
- **Visual:** Selected alarms show a checkbox indicator
- **Click to select:** Individual alarms can be selected/deselected by clicking a checkbox (visible when ≥1 alarm is selected or on long-press/right-click)

### Bulk Actions (available when ≥1 alarm selected)

| Action | Shortcut | Behavior |
|--------|----------|----------|
| Delete selected | `Delete` / `Backspace` | Soft-delete all selected alarms (each gets its own undo toast, max 3 visible) |
| Toggle selected | `Space` | Toggle all selected alarms to the opposite of the majority state |
| Move to group | — | Dropdown to select target group; moves all selected alarms |
| Deselect all | `Esc` | Clears selection |

### Priority

Select All and bulk operations are **P1** — implemented after core CRUD. The shortcut `⌘/Ctrl + A` is registered but shows a "Coming soon" toast if bulk operations are not yet implemented.

---

## Discoverability

- Keyboard shortcut hint shown as tooltip on buttons (e.g., "New Alarm (⌘N)")
- Settings page includes full shortcut reference table
- First-launch onboarding mentions key shortcuts

---

## Acceptance Criteria

- [ ] All listed shortcuts functional on macOS, Windows, and Linux
- [ ] Platform-appropriate modifier key displayed (⌘ vs Ctrl)
- [ ] Shortcuts work when alarm list is focused
- [ ] Overlay shortcuts (S, Enter, Esc) only active when overlay is visible
- [ ] Tooltips show shortcut hints on buttons
- [ ] No conflicts with OS-level shortcuts
- [ ] Shortcuts disabled when a text input field is focused
- [ ] Search filters alarm list by label substring (case-insensitive, client-side)
- [ ] Select All selects all visible alarms; Esc deselects
- [ ] Bulk delete triggers individual undo toasts per alarm

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Alarm CRUD | `./01-alarm-crud.md` |
| Alarm Firing | `./03-alarm-firing.md` |
| Design System (UI States) | `../01-fundamentals/02-design-system.md` |
| File Structure (Zustand Stores) | `../01-fundamentals/03-file-structure.md` |
| Accessibility & NFR | `./16-accessibility-and-nfr.md` |
| Platform Constraints | `../01-fundamentals/04-platform-constraints.md` |
