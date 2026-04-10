# Theme System

**Version:** 1.5.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 — Must Have

---

## Keywords

`theme`, `dark-mode`, `light-mode`, `toggle`, `system-preference`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ✅ |


## Description

Full dark/light theme toggle with system preference auto-detection. The dark mode uses warm charcoal tones (no pure black) for a cozy nighttime experience.

---

## Modes

| Mode | Behavior |
|------|----------|
| `ThemeMode.Light` | Warm cream palette |
| `ThemeMode.Dark` | Warm charcoal palette |
| `ThemeMode.System` | Follow OS appearance setting |

---

## Implementation

- `useTheme` hook manages state
- Theme stored in `Settings` SQLite table under key `Theme`
- Applies `.dark` class to root element
- CSS variables in `index.css` swap between palettes
- System mode listens to OS appearance change events (e.g., `prefers-color-scheme` in WebView, or Tauri window theme event)

---

## UI

- Sun/moon icon button (`ThemeToggle` component)
- Positioned in top-right corner of the main layout
- Cycles: `ThemeMode.Light` → `ThemeMode.Dark` → `ThemeMode.System` → `ThemeMode.Light`
- Tooltip shows current mode

---

## IPC Commands

| Command | Payload | Returns |
|---------|---------|---------|
| `get_theme` | `void` | `{ Theme: ThemeMode }` |
| `set_theme` | `{ Theme: ThemeMode }` | `void` |

**Behavior:**
- `get_theme` — Reads `Theme` key from `Settings` SQLite table. Defaults to `ThemeMode.System` if not set.
- `set_theme` — Writes `Theme` key to `Settings` table and emits `theme-changed` event to frontend.

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| OS theme changes while app is in background | Detect on `tauri://focus` event; apply if `ThemeMode.System` |
| `Settings` table missing `Theme` key | Default to `ThemeMode.System` |
| Theme transition during alarm overlay | No transition animation — overlay always uses current theme instantly |

---

## Acceptance Criteria

- [ ] Theme toggle switches between `ThemeMode.Light`, `ThemeMode.Dark`, `ThemeMode.System`
- [ ] `ThemeMode.System` follows OS preference
- [ ] Theme persists across app restarts
- [ ] All components properly themed (no hardcoded colors)
- [ ] Smooth transition between themes (150ms)

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Design System | `../01-fundamentals/02-design-system.md` |
| Clock Display | `./08-clock-display.md` |
