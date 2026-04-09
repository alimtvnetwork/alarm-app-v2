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

**Resolution:** Added `previous_enabled` column to `alarms` table in `01-fundamentals/01-data-model.md` v1.5.0. Defined complete disable/enable group flow with edge cases in `02-features/07-alarm-groups.md` v1.2.0.

---

### FE-STATE-002 — Rapid delete + undo race condition

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 60% |
| **Status** | Open |

**Description:** If user deletes alarm A, then alarm B within 5 seconds, undoing alarm A while B's timer is active creates conflicting undo tokens.

**Root Cause:** No undo queue or token management strategy in spec.

**Suggested Fix:** Implement an undo stack (max 5 items) instead of single undo token. Each entry has `{ token, alarmId, expiresAt }`. Timer cancels individually.

---

### FE-DND-001 — No drag-and-drop library specified

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 50% |
| **Status** | Open |

**Description:** React DnD requires a library (`dnd-kit`, `react-beautiful-dnd`, etc.). Each has different API patterns. AI may choose a deprecated library.

**Root Cause:** Missing technology decision.

**Suggested Fix:** Specify `@dnd-kit/core` + `@dnd-kit/sortable` — actively maintained, accessible, lightweight.

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
| **Likelihood** | 60% |
| **Status** | Open |

**Description:** "Full-screen overlay" doesn't specify which monitor. If app window is on secondary display, overlay may appear on wrong screen.

**Root Cause:** Missing multi-monitor spec.

**Suggested Fix:** Use Tauri window API to get current monitor bounds. Show overlay on the monitor containing the app window.

---

### FE-RENDER-001 — WebView rendering inconsistency across platforms

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 70% |
| **Status** | Open |

**Description:** CSS features (`backdrop-filter`, `grid`, custom properties) behave differently on Safari WebKit (macOS) vs WebView2 (Windows) vs WebKitGTK (Linux).

**Root Cause:** No browser compatibility testing matrix specified.

**Suggested Fix:** Add CSS feature detection via `@supports`. Create a `platform.css` with fallbacks. Test on all 3 WebView engines in CI.

---

### FE-I18N-001 — i18n string extraction not enforced

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 75% |
| **Status** | Open |

**Description:** Spec mentions i18n support but no enforcement mechanism to prevent hardcoded strings in JSX components.

**Root Cause:** Missing linting rule.

**Suggested Fix:** Add `eslint-plugin-i18next` to enforce no hardcoded strings in JSX. CI fails if violation detected.

---

*Frontend issues — created: 2026-04-08*
