# Accessibility & Non-Functional Requirements

**Version:** 1.3.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** Low  
**Priority:** P1 (Accessibility) / P2 (i18n) / P0 (Performance)

---

## Keywords

`accessibility`, `a11y`, `wcag`, `performance`, `memory`, `startup`, `i18n`, `internationalization`, `keyboard`, `screen-reader`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ✅ |


## Description

Defines accessibility standards (WCAG 2.1 AA), performance budgets, and internationalization readiness for the Alarm App across all desktop platforms.

---

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation

- All interactive elements reachable via Tab order
- Focus ring visible on all focusable elements
- Skip-to-content link for main alarm list
- See [Keyboard Shortcuts](./15-keyboard-shortcuts.md) for full shortcut reference

### Screen Reader Support

- All UI elements have proper ARIA labels
- Alarm list uses `role="list"` / `role="listitem"`
- Toggle switches announce state: "Alarm [label] enabled/disabled"
- Alarm overlay announces: "Alarm firing: [label]"
- Dynamic content changes use `aria-live="polite"` or `aria-live="assertive"` (for firing)

### Color & Contrast

- Minimum 4.5:1 contrast ratio for normal text
- Minimum 3:1 contrast ratio for large text and UI components
- Color is never the sole indicator of state (always paired with icon or text)
- All themes (light, dark, system) must meet contrast requirements

### Motion & Animation

- Respect `prefers-reduced-motion` OS setting
- Disable non-essential animations when reduced motion is preferred
- No flashing content (< 3 flashes per second)

---

## Performance Budgets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Startup to window visible | < 750ms | Cold start on HDD (see `07-startup-sequence.md` PERF-STARTUP-001) |
| Idle memory usage | < 200 MB | After app fully loaded (see `04-platform-constraints.md` PERF-MEMORY-001) |
| Idle CPU usage | ~0% | No busy-wait loops; sleep between checks |
| Alarm check interval overhead | < 1ms per check | 30-second timer, not continuous polling |
| SQLite query latency | < 10ms | For CRUD operations |
| App bundle size | < 50 MB | Compressed installer |

### Performance Implementation

- Rust backend uses `tokio` async runtime — no blocking main thread
- Alarm check uses `tokio::time::interval(Duration::from_secs(ALARM_CHECK_INTERVAL_SECS))` where `ALARM_CHECK_INTERVAL_SECS = 30`
- SQLite connection pooled (single writer, multiple readers)
- Frontend lazy-loads analytics/history views
- Audio files bundled but loaded on-demand

---

## Offline-First

- 100% functional without internet connection
- All data stored locally in SQLite
- No external API dependencies for core features
- Network only used for: auto-update checks (future), weather briefing (P3)

---

## Internationalization (i18n)

### Structure

- All user-facing strings extracted to locale files
- Default locale: `en` (English)
- Locale files: `src/i18n/locales/{locale}.json`
- Date/time formatting respects locale settings

### i18n-Ready Architecture

```
src/i18n/locales/
  en.json          # English (default)
  ms.json          # Malay
  zh.json          # Chinese
  ja.json          # Japanese
```

### Implementation

- Use `i18next` + `react-i18next` for frontend string management
- Settings page: language selector dropdown
- Selected locale stored in `Settings` SQLite table (`Key = 'Language'`)
- Tauri IPC passes locale to Rust backend for notification strings

### Phase Plan

| Phase | Scope |
|-------|-------|
| v1.0 | English only, all strings extracted to locale file |
| v1.1 | Add 2-3 additional languages |
| v2.0 | Community translation support |

---

## Acceptance Criteria

- [ ] Full keyboard navigation for all features
- [ ] Screen reader announces alarm states and events
- [ ] 4.5:1 contrast ratio on all text (both themes)
- [ ] `prefers-reduced-motion` respected
- [ ] Startup < 750ms on target hardware
- [ ] Idle memory < 200 MB
- [ ] Idle CPU ~0%
- [ ] App bundle < 50 MB
- [ ] 100% offline functionality
- [ ] All strings extracted to locale files (i18n-ready)

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Screen reader active during alarm firing overlay | Overlay announces alarm label and action buttons immediately via `aria-live="assertive"` region |
| High contrast mode enabled (OS-level) | All UI elements remain visible; no color-only indicators — icons/text accompany every status |
| Keyboard focus trapped in alarm firing overlay | Focus cycles between Snooze and Dismiss buttons only; Escape does NOT dismiss (prevents accidental dismissal) |
| User navigates alarm list with 100+ items via keyboard | Virtual scrolling maintains focus position; `aria-rowcount` and `aria-rowindex` reflect true list size |
| Reduced motion enabled (OS `prefers-reduced-motion`) | All animations disabled — no fade, slide, or pulse. Transitions are instant. |
| Screen reader announces snooze countdown | `aria-live="polite"` region updates every 60 seconds with remaining time, not every second |
| Font size scaled to 200% (browser zoom) | Layout remains single-column; no horizontal overflow; all tap targets remain ≥ 44×44px |
| Voice control user tries to dismiss alarm | All interactive elements have visible labels matching `aria-label` for voice targeting |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Keyboard Shortcuts | `./15-keyboard-shortcuts.md` |
| Theme System | `./09-theme-system.md` |
| Design System | `../01-fundamentals/02-design-system.md` |
| Platform Constraints | `../01-fundamentals/04-platform-constraints.md` |
