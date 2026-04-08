# Theme System

**Version:** 1.1.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 — Must Have

---

## Keywords

`theme`, `dark-mode`, `light-mode`, `toggle`, `system-preference`

---

## Description

Full dark/light theme toggle with system preference auto-detection. The dark mode uses warm charcoal tones (no pure black) for a cozy nighttime experience.

---

## Modes

| Mode | Behavior |
|------|----------|
| `light` | Warm cream palette |
| `dark` | Warm charcoal palette |
| `system` | Follow OS appearance setting |

---

## Implementation

- `useTheme` hook manages state
- Theme stored in `settings` SQLite table under key `theme`
- Applies `.dark` class to root element
- CSS variables in `index.css` swap between palettes
- System mode listens to OS appearance change events (e.g., `prefers-color-scheme` in WebView, or Tauri window theme event)

---

## UI

- Sun/moon icon button (`ThemeToggle` component)
- Positioned in top-right corner of the main layout
- Cycles: light → dark → system → light
- Tooltip shows current mode

---

## Acceptance Criteria

- [ ] Theme toggle switches between light, dark, system
- [ ] System mode follows OS preference
- [ ] Theme persists across app restarts
- [ ] All components properly themed (no hardcoded colors)
- [ ] Smooth transition between themes (150ms)

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Design System | `../01-fundamentals/02-design-system.md` |
| Clock Display | `./08-clock-display.md` |
