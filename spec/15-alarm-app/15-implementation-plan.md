# Alarm App — Hybrid Implementation Plan

**Version:** 1.0.0  
**Updated:** 2026-04-11  
**Status:** Approved  
**Approach:** Hybrid — React UI in Lovable + Rust/Tauri backend handoff spec

---

## Keywords

`implementation`, `plan`, `phases`, `atomic-tasks`, `frontend`, `backend`, `handoff`

---

## Approach

- **Frontend (Lovable):** Build all React UI components, pages, Zustand stores, hooks, design system, and mock data layer. Uses `localStorage` as a temporary persistence layer until Tauri backend is connected.
- **Backend (External Handoff):** Generate a Rust/Tauri implementation task spec document for the backend — SQLite, IPC commands, audio engine, notifications, OS service layer.

---

## Phase 1: Foundation (Design System + Project Setup)

> Establishes design tokens, fonts, routing, and base layout before any feature work.

| # | Task | Scope |
|---|------|-------|
| 1.1 | Set up design system tokens in `index.css` — light/dark color palette from `02-design-system.md` (warm cream/charcoal) | Frontend |
| 1.2 | Configure Tailwind + import Outfit & Figtree fonts | Frontend |
| 1.3 | Set up React Router with 5 pages: Index, Settings, Analytics, Sleep, Personalization | Frontend |
| 1.4 | Create base layout shell — header bar with clock, [+] and [⚙] icons, page container | Frontend |
| 1.5 | Install shadcn/ui components: Button, Dialog, Switch, Input, Toast (sonner), Tabs, DropdownMenu, Slider | Frontend |

---

## Phase 2: Core Data Layer (Types + Stores + Mock Backend)

> All TypeScript types, Zustand stores, and a mock IPC layer so UI can function without Rust.

| # | Task | Scope |
|---|------|-------|
| 2.1 | Define all 13 TypeScript enums from `01-data-model.md` (RepeatType, ChallengeType, ThemeMode, etc.) | Frontend |
| 2.2 | Define all TypeScript interfaces: Alarm (26 fields), AlarmGroup, AlarmSound, RepeatPattern, SnoozeState, AlarmEvent, Settings | Frontend |
| 2.3 | Create mock IPC layer (`lib/mock-backend.ts`) — CRUD operations using localStorage, simulating Tauri invoke() | Frontend |
| 2.4 | Create `useAlarmStore` (Zustand) — alarm CRUD, groups, loading/error state, soft-delete with undo | Frontend |
| 2.5 | Create `useSettingsStore` (Zustand) — theme, time format, language, snooze defaults | Frontend |
| 2.6 | Create `useOverlayStore` (Zustand) — active alarm, queue, overlay visibility | Frontend |

---

## Phase 3: P0 Features — Clock Display + Theme System

> The home screen centerpiece: live clock and theme toggle.

| # | Task | Scope |
|---|------|-------|
| 3.1 | Build `AnalogClock.tsx` — SVG clock face with animated hour/minute/second hands, warm styling | Frontend |
| 3.2 | Build `DigitalClock.tsx` — HH:MM:SS with Outfit font, date/day below in Figtree, 12/24h toggle | Frontend |
| 3.3 | Create `useClock` hook — current time state updated every second | Frontend |
| 3.4 | Build `ThemeToggle.tsx` — sun/moon icon, dark/light/system modes | Frontend |
| 3.5 | Implement `useTheme` hook — theme persistence, `.dark` class toggle, system preference detection | Frontend |
| 3.6 | Compose Index page — clock display + alarm list placeholder + countdown | Frontend |

---

## Phase 4: P0 Features — Alarm CRUD

> Create, edit, duplicate, delete alarms with full form and list UI.

| # | Task | Scope |
|---|------|-------|
| 4.1 | Build `AlarmForm.tsx` — time picker (hour/minute scrollers), label, repeat pattern selector, sound, snooze config | Frontend |
| 4.2 | Build repeat pattern UI — segmented control (Once/Daily/Weekdays/Weekends/Custom/Interval/Cron), day pill toggles, shortcut buttons | Frontend |
| 4.3 | Build `AlarmCard.tsx` — time display, label, repeat summary, toggle switch, swipe/context menu for edit/duplicate/delete | Frontend |
| 4.4 | Build `AlarmList.tsx` — grouped alarm list with expand/collapse, ungrouped section at bottom | Frontend |
| 4.5 | Implement soft-delete with undo toast (5-second timer, undo action) | Frontend |
| 4.6 | Build `AlarmCountdown.tsx` — "Alarm in X hours Y minutes" below clock, updates every second | Frontend |
| 4.7 | Add alarm form validation — time required, label max 100 chars, at least 1 day for weekly | Frontend |

---

## Phase 5: P0 Features — Alarm Firing + Snooze

> The alarm overlay, dismiss/snooze flow, and sound playback (Web Audio fallback).

| # | Task | Scope |
|---|------|-------|
| 5.1 | Build `AlarmOverlay.tsx` — full-screen overlay with time, label, dismiss + snooze buttons | Frontend |
| 5.2 | Implement `useAlarmFiring` hook — checks alarms every 30s against current time, triggers overlay | Frontend |
| 5.3 | Implement snooze logic — countdown timer, snooze count tracking, max snooze enforcement | Frontend |
| 5.4 | Add Web Audio sound playback — play built-in tones on alarm fire (gradual volume ramp) | Frontend |
| 5.5 | Handle missed alarms — on app load, detect alarms that should have fired, show missed notification | Frontend |
| 5.6 | Auto-dismiss timer — configurable per-alarm, dismiss after N minutes if no interaction | Frontend |
| 5.7 | Post-fire behavior — disable once-type alarms, compute next fire time for recurring | Frontend |

---

## Phase 6: P1 Features — Groups, Export/Import, Keyboard Shortcuts, Sound Library

> Secondary features that enhance usability.

| # | Task | Scope |
|---|------|-------|
| 6.1 | Build `AlarmGroupForm.tsx` — create/rename group dialog | Frontend |
| 6.2 | Implement group master toggle logic — track individual alarm states, restore on re-enable | Frontend |
| 6.3 | Add drag-and-drop reorder within groups (dnd-kit) | Frontend |
| 6.4 | Build `ExportImport.tsx` — export to JSON/CSV, import with preview and duplicate handling | Frontend |
| 6.5 | Build sound library picker — grid of 10 built-in sounds with preview play button | Frontend |
| 6.6 | Implement keyboard shortcuts — Cmd/Ctrl+N (new), Cmd/Ctrl+, (settings), arrow navigation | Frontend |
| 6.7 | Build `ChallengePanel.tsx` — math problem challenge (Easy/Medium/Hard difficulty) | Frontend |

---

## Phase 7: P1/P0 Features — Settings + Accessibility

> Settings panel, a11y compliance, i18n setup.

| # | Task | Scope |
|---|------|-------|
| 7.1 | Build `SettingsPanel.tsx` — theme, time format, default snooze duration, language selector | Frontend |
| 7.2 | Compose Settings page with all settings sections | Frontend |
| 7.3 | Set up i18n (i18next) — English + Malay locale files, language detection | Frontend |
| 7.4 | Add WCAG 2.1 AA compliance — focus rings, aria-labels, skip-to-content, screen reader announcements | Frontend |
| 7.5 | Add keyboard navigation — Tab order, Enter/Space actions, Escape to close dialogs | Frontend |

---

## Phase 8: P2 Features — Sleep & Wellness, Analytics

> Nice-to-have features for engagement.

| # | Task | Scope |
|---|------|-------|
| 8.1 | Build `SleepCalculator.tsx` — optimal bedtime/wake time based on 90-min sleep cycles | Frontend |
| 8.2 | Build `BedtimeReminder.tsx` — reminder configuration form with time picker | Frontend |
| 8.3 | Build `MoodLogger.tsx` — post-dismissal mood + sleep quality prompt (emoji scale) | Frontend |
| 8.4 | Build `AmbientPlayer.tsx` — ambient sound player with auto-stop timer (Web Audio) | Frontend |
| 8.5 | Compose Sleep page with all wellness components | Frontend |
| 8.6 | Build `HistoryList.tsx` + `HistoryFilter.tsx` — alarm event log with date/type/label filters | Frontend |
| 8.7 | Build `AnalyticsChart.tsx` — bar/line charts for wake-up patterns, snooze trends | Frontend |
| 8.8 | Compose Analytics page with history list + charts | Frontend |

---

## Phase 9: P2/P3 Features — Personalization + Smart Features

> Visual customization and future-oriented features.

| # | Task | Scope |
|---|------|-------|
| 9.1 | Build `StreakCalendar.tsx` — calendar heatmap of alarm dismissal streak | Frontend |
| 9.2 | Build `QuoteDisplay.tsx` — daily motivational quote on home screen | Frontend |
| 9.3 | Build `AccentColorPicker.tsx` — accent color customization | Frontend |
| 9.4 | Build `BackgroundPicker.tsx` — custom background image selection | Frontend |
| 9.5 | Compose Personalization page with all customization components | Frontend |
| 9.6 | Add typing challenge to ChallengePanel (P2) | Frontend |

---

## Phase 10: Backend Handoff Spec

> Generate Rust/Tauri implementation task document for external AI or developer.

| # | Task | Scope |
|---|------|-------|
| 10.1 | Generate `16-rust-backend-implementation-plan.md` — all IPC commands, SQLite schema, migrations, alarm engine, audio, notifications | Spec |
| 10.2 | Document mock-to-Tauri migration guide — how to swap `mock-backend.ts` with real `tauri-commands.ts` | Spec |
| 10.3 | Document OS service layer tasks — auto-start, tray icon, wake/sleep recovery | Spec |

---

## Execution Order

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8 → Phase 9 → Phase 10
```

Each phase is independently testable. Phases 1–5 deliver a working MVP (P0). Phases 6–7 add P1 polish. Phases 8–9 add engagement features. Phase 10 generates the Rust handoff.

---

## Summary

| Category | Tasks | Coverage |
|----------|-------|----------|
| Foundation | 5 | Design system, routing, layout |
| Data Layer | 6 | Types, stores, mock backend |
| P0 Features | 17 | Clock, theme, CRUD, firing, snooze |
| P1 Features | 12 | Groups, export, shortcuts, challenges, settings |
| P2/P3 Features | 14 | Sleep, analytics, personalization |
| Backend Spec | 3 | Rust handoff documents |
| **Total** | **57** | — |

---

## Deferred (Tauri-Only, Not Buildable in Lovable)

These features require native OS APIs and will be documented in the Phase 10 backend handoff spec:

- QR code scan challenge (native camera — P2)
- Steps challenge (native pedometer — P2)
- Shake challenge (native accelerometer — P2)
- Location-based alarms (P3)
- Webhook integrations (P3)
- Weather briefing (P3, requires API key)
- Voice commands (P3)
- System tray icon + menu (P3)
- Native file dialog for custom sounds (P1, uses Web file input as fallback)

---

*Implementation Plan v1.0.0 — 2026-04-11*
