# Keyboard Shortcuts

**Version:** 1.1.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P1 — Should Have

---

## Keywords

`keyboard`, `shortcuts`, `hotkeys`, `accessibility`, `keybindings`

---
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

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Alarm CRUD | `./01-alarm-crud.md` |
| Alarm Firing | `./03-alarm-firing.md` |
| Accessibility & NFR | `./16-accessibility-and-nfr.md` |
| Platform Constraints | `../01-fundamentals/04-platform-constraints.md` |
