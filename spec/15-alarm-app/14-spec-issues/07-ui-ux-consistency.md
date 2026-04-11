# UI/UX + Frontend State Consistency

**Version:** 1.0.0  
**Updated:** 2026-04-09

---

## Summary

Issues with frontend state management patterns, component lifecycle, cross-component data flow, and Tauri IPC event naming consistency.

---

## UX-001: No React State Management Pattern Defined

**Severity:** 🔴 Critical  
**Status:** ✅ Resolved — Zustand store architecture defined in Fix Phase 18

**Resolution:** Added complete Zustand store architecture to `06-tauri-architecture.md`: `useAlarmStore` (CRUD + groups), `useOverlayStore` (active alarm + queue mirror), `useSettingsStore` (theme + preferences). Includes store interfaces, IPC event → store update flow, and architecture diagram. `zustand ^4.5` added to package table. `stores/` directory added to file structure.

---

## UX-002: AlarmOverlay Lifecycle Not Specified

**Severity:** 🔴 Critical  
**Status:** ✅ Resolved — full lifecycle state machine and ownership rules defined in Fix Phase 18

**Resolution:** Added AlarmOverlay Lifecycle section to `03-alarm-firing.md` with: state machine diagram (Hidden → Creating → Visible → Transitioning/Closing), 7 lifecycle steps, ownership table (Rust owns queue/audio/window/timer, frontend owns rendering), and IPC sync protocol sequence diagram.

---

## UX-003: Alarm Queue State Ownership Ambiguous

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved — ownership explicitly assigned in Fix Phase 18

**Resolution:** Rust backend (`AlarmEngine`) is the authoritative queue owner. Frontend `useOverlayStore` is a read-only mirror synced via IPC events. Added ownership section to Queue System in `03-alarm-firing.md` and ownership table to AlarmOverlay Lifecycle.

---

## UX-004: IPC Event Names Use kebab-case

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved — **Exempt** (external convention)

**Problem:** Tauri event names use kebab-case (`alarm-fired`) while IPC commands use snake_case (`create_alarm`, `toggle_alarm`). Neither follows PascalCase mandate.

**Resolution:** Both Tauri IPC commands (snake_case) and events (kebab-case) are external framework conventions. Declared exempt alongside NV-009. Added to exemptions table (CG-005).

---

## Issues Found So Far: 4
## Open: 0 | Resolved: 4
