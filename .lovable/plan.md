

# Discovery Phase 4: UI/UX + Frontend State Consistency Audit

## Audit Scope
Deep scan of all UI components, frontend state patterns, React hooks, Tauri IPC naming, event flow, and cross-file UI behavior consistency.

---

## New Issues Found: 11

### UI State Issues

**UX-001: No React State Management Pattern Defined** (Critical)
- Multiple hooks mentioned (`useAlarms`, `useTheme`, `useAlarmFiring`, `useClock`) but NO state management architecture specified
- Is it React Context? Zustand? Redux? Just local state?
- `useAlarms` holds CRUD + toggle + group toggle + drag-drop + SQLite sync — massive hook with no guidance on state sharing
- AI will either create a monolithic context or duplicate state across components
- `AlarmOverlay` needs access to alarm data from `useAlarms`, snooze state, and audio state — how does it get them?
- No specification for how `listen("alarm-fired")` event from Rust triggers UI state updates across components

**UX-002: AlarmOverlay Lifecycle Not Specified** (Critical)
- `AlarmOverlay` is "conditional — shown when alarm fires" but:
  - No spec for which component owns the overlay state (`isOverlayVisible`, `activeAlarm`)
  - No spec for how overlay interacts with the main window (does it replace the page? Is it a portal? A separate Tauri window?)
  - `03-alarm-firing.md` says "full-screen overlay blocks all other interaction" — but how? CSS z-index? Window fullscreen? Separate window?
  - The overlay needs alarm data, snooze state, challenge data, auto-dismiss timer, queue state — no prop/state flow defined
  - Multi-alarm queue: who manages the queue? Frontend or backend? Both files mention it but neither assigns ownership

**UX-003: Alarm Queue State Ownership Ambiguous** (Medium)
- `03-alarm-firing.md` defines queue rules (FIFO, max 10, badge)
- Queue is managed by Rust `AlarmEngine.currently_firing` but overlay is React
- No spec for how frontend knows about queue size, order, or transitions between queued alarms
- IPC event `alarm-fired` sends one alarm at a time — does the frontend maintain its own queue mirror?

### Naming Violations (Frontend)

**UX-004: IPC Event Names Use kebab-case** (Medium)
- `alarm-fired` event in `03-alarm-firing.md` — Tauri events use kebab-case by convention
- But all IPC command names use `snake_case` (e.g., `create_alarm`, `toggle_alarm`)
- Inconsistency between event naming (kebab) and command naming (snake) — neither is PascalCase
- Need exemption decision: are Tauri events/commands exempt from PascalCase?

**UX-005: TS HistoryFilter Uses camelCase Keys** (Medium)
- `13-analytics.md` line 48-56: `HistoryFilter` interface uses `startDate`, `endDate`, `groupId`, `alarmId`, `eventType`, `sortBy`, `sortOrder`
- All should be PascalCase per coding guidelines: `StartDate`, `EndDate`, `GroupId`, etc.

**UX-006: ImportResult Uses camelCase Keys** (Medium)
- `10-export-import.md` line 96-101: `imported`, `skipped`, `overwritten`, `errors` — all lowercase
- Should be PascalCase: `Imported`, `Skipped`, `Overwritten`, `Errors`

**UX-007: UndoEntry Interface Uses camelCase** (Medium)
- `01-alarm-crud.md` line 215-220: `token`, `alarmId`, `label`, `expiresAt`, `timerId`
- Should be PascalCase: `Token`, `AlarmId`, `Label`, `ExpiresAt`, `TimerId`

### Cross-File UI Inconsistencies

**UX-008: Scheduling Spec Uses Stale `recurringDays` Term** (Medium)
- `02-alarm-scheduling.md` line 27: `recurringDays` — this term was replaced by `RepeatPattern` in the data model
- "One-time alarms (empty `recurringDays`) auto-disable" contradicts the `repeat.type = "once"` pattern defined in `01-data-model.md`
- AI will be confused about which pattern to implement

**UX-009: Settings Page Component Not Specified** (Medium)
- Multiple features reference "Settings page" (theme, i18n, retention days, shortcut reference, bedtime)
- No `Settings.tsx` or settings page component exists in the file structure (`03-file-structure.md`)
- The component hierarchy shows `Index.tsx` with all components — no routing or page navigation defined
- How does the user navigate to Settings? A dialog? A page? A drawer?

**UX-010: No Error Toast Component in File Structure** (Low)
- `04-platform-constraints.md` references `toast.error()` extensively
- `01-alarm-crud.md` references `UndoToast` component
- No toast library specified (Sonner? react-hot-toast? Custom?)
- File structure doesn't list a toast component

**UX-011: `02-alarm-scheduling.md` Severely Outdated** (Medium)
- Version 1.0.0 vs all other feature files at 1.1.0–1.6.0
- Still references `recurringDays` (deprecated)
- Doesn't mention `interval` or `cron` repeat types (added in data model)
- Quick Alarm / Holiday features mentioned but no IPC commands, no Rust logic, no data model integration
- AI will find contradictory scheduling information between this file and data model

---

## Updated Totals

| Category | Previous | New | Total |
|----------|:--------:|:---:|:-----:|
| Naming Violations | 12 | 3 | 15 |
| Internal Contradictions | 7 | 0 | 7 |
| Structural Issues | 5 | 0 | 5 |
| Content Gaps | 7 | 4 | 11 |
| AI Handoff Risks | 4 | 0 | 4 |
| Logic Consistency | 10 | 0 | 10 |
| **UI/UX Consistency (NEW)** | 0 | 4 | **4** |
| **Grand Total** | **45** | **11** | **56** |

## Severity Breakdown (All 56 Issues)

| Severity | Count |
|----------|:-----:|
| Critical | 22 |
| Medium | 31 |
| Low | 3 |

---

## Implementation Plan

1. **Create** `14-spec-issues/07-ui-ux-consistency.md` with UX-001 through UX-004
2. **Update** `14-spec-issues/01-naming-violations.md` — add UX-005, UX-006, UX-007
3. **Update** `14-spec-issues/04-content-gaps.md` — add UX-008, UX-009, UX-010, UX-011
4. **Update** `14-spec-issues/00-overview.md` — add category 7, update totals to 56, mark Phase 4 done
5. **Update** `mem://feature/alarm-app-spec-issues` — sync with new totals and phase status

---

## Key Insights

1. **State management is the #1 frontend risk.** Without specifying React Context, Zustand, or similar, AI will create inconsistent state patterns. The alarm overlay alone needs data from 4+ sources (alarm data, snooze state, challenge config, queue state, auto-dismiss timer).

2. **The scheduling spec is dangerously outdated.** It still uses `recurringDays` which was replaced by `RepeatPattern` with 5 types. An AI reading files in order will hit `02-alarm-scheduling.md` before `01-data-model.md` and implement the wrong model.

3. **Every TS interface in every feature file uses camelCase.** The PascalCase mandate for serialized keys means ALL interfaces across all 16 feature files need conversion. This is systemic, not isolated.

