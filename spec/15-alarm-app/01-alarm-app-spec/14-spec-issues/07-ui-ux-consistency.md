# UI/UX + Frontend State Consistency

**Version:** 1.0.0  
**Updated:** 2026-04-09

---

## Summary

Issues with frontend state management patterns, component lifecycle, cross-component data flow, and Tauri IPC event naming consistency.

---

## UX-001: No React State Management Pattern Defined

**Severity:** 🔴 Critical  
**Status:** 🔴 Open

**Problem:** Multiple hooks mentioned (`useAlarms`, `useTheme`, `useAlarmFiring`, `useClock`) but NO state management architecture specified — React Context? Zustand? Redux? Local state?

**Impact:**
- `useAlarms` holds CRUD + toggle + group toggle + drag-drop + SQLite sync — massive hook with no guidance on state sharing
- `AlarmOverlay` needs alarm data, snooze state, audio state, and challenge config — no prop/state flow defined
- No specification for how `listen("alarm-fired")` event from Rust triggers UI state updates across components
- AI will either create a monolithic context or duplicate state across components

---

## UX-002: AlarmOverlay Lifecycle Not Specified

**Severity:** 🔴 Critical  
**Status:** 🔴 Open

**Problem:** `AlarmOverlay` is "conditional — shown when alarm fires" but critical details missing:
- Which component owns overlay state (`isOverlayVisible`, `activeAlarm`)?
- How does overlay interact with main window — CSS z-index? Portal? Separate Tauri window?
- `03-alarm-firing.md` says "full-screen overlay blocks all other interaction" — implementation undefined
- Overlay needs alarm data, snooze state, challenge data, auto-dismiss timer, queue state — no prop/state flow defined
- Multi-alarm queue: who manages the queue? Frontend or backend? Both files mention it but neither assigns ownership

---

## UX-003: Alarm Queue State Ownership Ambiguous

**Severity:** 🟡 Medium  
**Status:** 🔴 Open

**Problem:** Queue rules defined in `03-alarm-firing.md` (FIFO, max 10, badge) but ownership split:
- Queue managed by Rust `AlarmEngine.currently_firing` (backend)
- Overlay rendered by React (frontend)
- No spec for how frontend knows about queue size, order, or transitions
- IPC event `alarm-fired` sends one alarm at a time — does frontend maintain its own queue mirror?

---

## UX-004: IPC Event Names Use kebab-case

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved — **Exempt** (external convention)

**Problem:** Tauri event names use kebab-case (`alarm-fired`) while IPC commands use snake_case (`create_alarm`, `toggle_alarm`). Neither follows PascalCase mandate.

**Resolution:** Both Tauri IPC commands (snake_case) and events (kebab-case) are external framework conventions. Declared exempt alongside NV-009. Added to exemptions table (CG-005).

---

## Issues Found So Far: 4
## Open: 2 | Resolved: 2
