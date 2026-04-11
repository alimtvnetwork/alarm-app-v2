# Frontend Issues

**Version:** 1.0.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** Low  
**Source:** AI Feasibility Analysis v1.0.0

---

## Keywords

`frontend`, `state`, `dnd`, `accessibility`, `overlay`, `webview`, `i18n`

---

## Issue Registry

### FE-STATE-001 — Group toggle does not preserve individual alarm states

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 70% → 0% |
| **Status** | ✅ Resolved |

**Description:** Toggling a group off disables all alarms. Toggling back on enables ALL alarms, even those the user had manually disabled.

**Root Cause:** Missing `previousEnabled` field or separate tracking mechanism.

**Resolution:** Added `IsPreviousEnabled` column to `Alarms` table in `01-fundamentals/01-data-model.md` v1.5.0. Defined complete disable/enable group flow with edge cases in `02-features/07-alarm-groups.md` v1.2.0.

---

### FE-STATE-002 — Rapid delete + undo race condition

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 60% → 0% |
| **Status** | ✅ Resolved |

**Description:** If user deletes alarm A, then alarm B within 5 seconds, undoing alarm A while B's timer is active creates conflicting undo tokens.

**Root Cause:** No undo queue or token management strategy in spec.

**Resolution:** Added "Undo Stack" section to `02-features/01-alarm-crud.md` v1.6.0 with max 5 entries, independent timers per delete, stacking toasts (max 3 visible), and undo-any capability. Includes full TypeScript implementation.

---

### FE-DND-001 — No drag-and-drop library specified

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 50% → 0% |
| **Status** | ✅ Resolved |

**Description:** React DnD requires a library (`dnd-kit`, `react-beautiful-dnd`, etc.). Each has different API patterns. AI may choose a deprecated library.

**Root Cause:** Missing technology decision.

**Resolution:** Specified `@dnd-kit/core` v6.x + `@dnd-kit/sortable` + `@dnd-kit/utilities` in `01-fundamentals/03-file-structure.md` (package.json dependencies). `dnd-kit` is actively maintained, tree-shakeable, accessible (built-in `KeyboardSensor`), and works with `SortableContext` for alarm reordering. `react-beautiful-dnd` is deprecated — do NOT use. Already integrated with keyboard accessibility in FE-A11Y-001 resolution.

---

### FE-A11Y-001 — Drag-and-drop inaccessible to screen readers

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 80% → 0% |
| **Status** | ✅ Resolved |

**Description:** DnD is inherently inaccessible. Spec requires WCAG 2.1 AA but doesn't specify keyboard alternative for reordering.

**Root Cause:** Conflicting requirements (DnD + a11y).

**Resolution:** Added "Keyboard & Screen Reader Accessibility" section to `02-features/01-alarm-crud.md` v1.4.0 with full keyboard shortcut table (Space to grab, arrows to move, Ctrl+arrows for cross-group, Escape to cancel), `dnd-kit` KeyboardSensor config, ARIA attributes (`role`, `aria-roledescription`, `aria-describedby`), live region announcements, and 7 accessibility acceptance criteria.

---

### FE-OVERLAY-001 — Alarm overlay on multi-monitor setup undefined

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 60% → 0% |
| **Status** | ✅ Resolved |

**Description:** "Full-screen overlay" doesn't specify which monitor. If app window is on secondary display, overlay may appear on wrong screen.

**Root Cause:** Missing multi-monitor spec.

**Resolution:** Added multi-monitor rule to `02-features/03-alarm-firing.md` overlay section. Overlay uses Tauri `WebviewWindow::current_monitor()` to determine the monitor containing the app window. If app is minimized to tray, overlay shows on the primary monitor (`Monitor::primary()`). Overlay window created with `fullscreen: true` on the target monitor's bounds.

---

### FE-RENDER-001 — WebView rendering inconsistency across platforms

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 70% → 0% |
| **Status** | ✅ Resolved |

**Description:** CSS features (`backdrop-filter`, `grid`, custom properties) behave differently on Safari WebKit (macOS) vs WebView2 (Windows) vs WebKitGTK (Linux).

**Root Cause:** No browser compatibility testing matrix specified.

**Resolution:** Added "WebView CSS Compatibility" section to `01-fundamentals/04-platform-constraints.md` v1.3.0 with WebView engine matrix, `@supports` feature detection rules, safe/unsafe CSS feature lists, `platform.css` fallback strategy, and updated Platform Support Matrix with `backdrop-filter` row.

---

### FE-I18N-001 — i18n string extraction not enforced

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 75% → 0% |
| **Status** | ✅ Resolved |

**Description:** Spec mentions i18n support but no enforcement mechanism to prevent hardcoded strings in JSX components.

**Root Cause:** Missing linting rule.

**Resolution:** Added i18n enforcement section to `01-fundamentals/03-file-structure.md` v1.4.0 with `react-i18next` setup, `eslint-plugin-i18next` config (`no-literal-string` rule), locale file structure (`en.json` with full key inventory), and `src/i18n/` directory in file structure.

---

*Frontend issues — created: 2026-04-08*
