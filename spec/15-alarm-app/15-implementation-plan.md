# Alarm App — Hybrid Implementation Plan

**Version:** 1.1.0  
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

### Known Limitations (Web Preview)

- **No background execution:** Alarm firing only works while the tab is open. Real scheduling is handled by the Tauri backend.
- **Web Audio autoplay:** Browsers block audio without prior user interaction. A "Test Sound" button is provided as a workaround.
- **No native APIs:** File dialogs, notifications, tray icon, accelerometer are mocked or use web fallbacks.

---

## Phase 1: Foundation (Design System + Project Setup)

> Establishes design tokens, fonts, routing, dependencies, and base layout before any feature work.

| # | Task | Status |
|---|------|--------|
| 1.1 | Set up design system tokens in `index.css` — light/dark color palette from `02-design-system.md` (warm cream/charcoal) | ⬜ |
| 1.2 | Configure Tailwind + import Outfit & Figtree fonts | ⬜ |
| 1.3 | Install all dependencies upfront — Zustand, dnd-kit, i18next, recharts, date-fns | ⬜ |
| 1.4 | Install shadcn/ui components: Button, Dialog, Switch, Input, Toast (sonner), Tabs, DropdownMenu, Slider, Card, Sheet | ⬜ |
| 1.5 | Set up React Router with 5 pages: Index, Settings, Analytics, Sleep, Personalization | ⬜ |
| 1.6 | Create base layout shell — header bar with clock area, [+] and [⚙] icons, page container, bottom nav | ⬜ |

---

## Phase 2: Core Data Layer (Types + Stores + Mock Backend)

> All TypeScript types, Zustand stores, and a mock IPC layer so UI can function without Rust.

| # | Task | Status |
|---|------|--------|
| 2.1 | Define all 13 TypeScript enums (RepeatType, ChallengeType, ThemeMode, etc.) | ⬜ |
| 2.2 | Define all TypeScript interfaces: Alarm (26 fields), AlarmGroup, AlarmSound, RepeatPattern, SnoozeState, AlarmEvent, HistoryFilter, Settings | ⬜ |
| 2.3 | Create test fixtures + factory functions (`test/fixtures.ts`) for mock alarm data | ⬜ |
| 2.4 | Create mock IPC layer (`lib/mock-backend.ts`) — CRUD operations using localStorage, simulating Tauri invoke() | ⬜ |
| 2.5 | Create `useAlarmStore` (Zustand) — alarm CRUD, groups, loading/error state, soft-delete with undo | ⬜ |
| 2.6 | Create `useSettingsStore` (Zustand) — theme, time format, language, snooze defaults | ⬜ |
| 2.7 | Create `useOverlayStore` (Zustand) — active alarm, queue, overlay visibility | ⬜ |

---

## Phase 3: P0 — Clock Display + Theme + Settings

> The home screen centerpiece: live clock, theme toggle, and settings page.

| # | Task | Status |
|---|------|--------|
| 3.1 | Create `useClock` hook — current time state updated every second | ⬜ |
| 3.2 | Build `AnalogClock.tsx` — SVG clock face with animated hour/minute/second hands, warm styling | ⬜ |
| 3.3 | Build `DigitalClock.tsx` — HH:MM:SS (Outfit 4rem), date/day below (Figtree), 12/24h from settings | ⬜ |
| 3.4 | Implement `useTheme` hook — theme persistence, `.dark` class toggle, system preference detection | ⬜ |
| 3.5 | Build `ThemeToggle.tsx` — sun/moon icon, dark/light/system cycle | ⬜ |
| 3.6 | Build `SettingsPanel.tsx` — theme selector, time format toggle, default snooze duration slider, language dropdown | ⬜ |
| 3.7 | Compose Settings page wrapping SettingsPanel | ⬜ |

---

## Phase 4: P0 — Alarm CRUD + Index Page

> Create, edit, duplicate, delete alarms with full form and list UI. Compose the home page.

| # | Task | Status |
|---|------|--------|
| 4.1 | Build `AlarmForm.tsx` — time picker (hour/minute scrollers), label, repeat pattern selector, sound dropdown, snooze config (duration + max count) | ⬜ |
| 4.2 | Build repeat pattern UI — segmented control (Once/Daily/Weekdays/Weekends/Custom/Interval/Cron), day pill toggles, shortcut buttons | ⬜ |
| 4.3 | Add alarm form validation — time required, label max 100 chars, at least 1 day for weekly, interval 1–1440 | ⬜ |
| 4.4 | Build `AlarmCard.tsx` — time display (Outfit), label, repeat summary text, toggle switch, context menu (edit/duplicate/delete) | ⬜ |
| 4.5 | Build `AlarmList.tsx` — grouped alarm list with expand/collapse chevrons, ungrouped section at bottom | ⬜ |
| 4.6 | Implement soft-delete with undo toast (sonner, 5-second timer, undo action) | ⬜ |
| 4.7 | Build `AlarmCountdown.tsx` — "Alarm in X hours Y minutes" below clock, updates every second via `useClock` | ⬜ |
| 4.8 | Compose Index page — AnalogClock + DigitalClock + AlarmCountdown + AlarmList + [+] FAB | ⬜ |

---

## Phase 5A: P0 — Alarm Firing + Overlay + Challenges

> The alarm overlay, dismiss/snooze flow, and dismissal challenges.

| # | Task | Status |
|---|------|--------|
| 5A.1 | Build `AlarmOverlay.tsx` — full-screen overlay with time, label, pulsing animation, dismiss + snooze buttons | ⬜ |
| 5A.2 | Implement `useAlarmFiring` hook — checks alarms every 30s against current time, triggers overlay via `useOverlayStore` | ⬜ |
| 5A.3 | Implement snooze logic — countdown timer, snooze count tracking, max snooze enforcement, hide snooze button at max | ⬜ |
| 5A.4 | Post-fire behavior — disable once-type alarms, compute next fire time for recurring alarms | ⬜ |
| 5A.5 | Build `ChallengePanel.tsx` — math problem challenge (Easy/Medium/Hard), renders inside AlarmOverlay when ChallengeType is set | ⬜ |

---

## Phase 5B: P0 — Sound + Missed Alarms + Auto-Dismiss

> Sound playback, missed alarm detection, and auto-dismiss timer.

| # | Task | Status |
|---|------|--------|
| 5B.1 | Add Web Audio sound playback — play built-in tones on alarm fire, "Test Sound" button for autoplay workaround | ⬜ |
| 5B.2 | Implement gradual volume ramp — fade from 0% to target volume over configurable seconds | ⬜ |
| 5B.3 | Handle missed alarms — on app load, detect past-due alarms, show missed notification toast | ⬜ |
| 5B.4 | Auto-dismiss timer — configurable per-alarm, dismiss after N minutes if no user interaction | ⬜ |

---

## Phase 6: P1 — Groups, Export/Import, Sound Library, Shortcuts

> Secondary features that enhance usability.

| # | Task | Status |
|---|------|--------|
| 6.1 | Build `AlarmGroupForm.tsx` — create/rename group dialog | ⬜ |
| 6.2 | Implement group master toggle logic — track per-alarm `IsEnabledBeforeGroupDisable`, restore on re-enable | ⬜ |
| 6.3 | Add drag-and-drop alarm reorder within/between groups (dnd-kit) | ⬜ |
| 6.4 | Build sound library picker — grid of 10 built-in sounds with preview play button + category filter | ⬜ |
| 6.5 | Build `ExportImport.tsx` — export to JSON/CSV, import with preview dialog and duplicate handling (skip/overwrite/rename) | ⬜ |
| 6.6 | Implement keyboard shortcuts — Cmd/Ctrl+N (new), Cmd/Ctrl+, (settings), Cmd/Ctrl+E (export), arrow nav, Escape to close | ⬜ |

---

## Phase 7: P1 — Accessibility + i18n

> WCAG compliance and internationalization.

| # | Task | Status |
|---|------|--------|
| 7.1 | Add WCAG 2.1 AA — focus rings, aria-labels on all interactive elements, skip-to-content link | ⬜ |
| 7.2 | Add keyboard navigation — Tab order for all screens, Enter/Space to activate, Escape to close dialogs | ⬜ |
| 7.3 | Set up i18n (i18next) — English + Malay locale files, `useTranslation` hook, language detection | ⬜ |
| 7.4 | Extract all hardcoded strings to i18n keys across all components | ⬜ |

---

## Phase 8: P2 — Sleep & Wellness + Analytics

> Engagement features: sleep tools, alarm history, analytics charts.

| # | Task | Status |
|---|------|--------|
| 8.1 | Build `SleepCalculator.tsx` — optimal bedtime/wake time based on 90-min sleep cycles | ⬜ |
| 8.2 | Build `BedtimeReminder.tsx` — reminder config form with time picker and enable toggle | ⬜ |
| 8.3 | Build `MoodLogger.tsx` — post-dismissal mood (5-emoji scale) + sleep quality prompt | ⬜ |
| 8.4 | Build `AmbientPlayer.tsx` — ambient sound player with auto-stop timer (Web Audio) | ⬜ |
| 8.5 | Compose Sleep page with SleepCalculator + BedtimeReminder + AmbientPlayer tabs | ⬜ |
| 8.6 | Build `HistoryList.tsx` + `HistoryFilter.tsx` — alarm event log with date range, event type, label filters | ⬜ |
| 8.7 | Build `AnalyticsChart.tsx` — bar/line charts (recharts) for wake-up patterns, snooze trends, weekly summary | ⬜ |
| 8.8 | Compose Analytics page with HistoryList + AnalyticsChart tabs | ⬜ |

---

## Phase 9: P2/P3 — Personalization

> Visual customization, streaks, and motivational content.

| # | Task | Status |
|---|------|--------|
| 9.1 | Build `StreakCalendar.tsx` — calendar heatmap of alarm dismissal streak | ⬜ |
| 9.2 | Build `QuoteDisplay.tsx` — daily motivational quote on home screen (from bundled quotes list) | ⬜ |
| 9.3 | Build `AccentColorPicker.tsx` — accent color customization with preset palette + custom hex input | ⬜ |
| 9.4 | Build `BackgroundPicker.tsx` — custom background image selection via file input | ⬜ |
| 9.5 | Compose Personalization page with all customization components | ⬜ |
| 9.6 | Add typing challenge to ChallengePanel — type a displayed sentence to dismiss | ⬜ |

---

## Phase 10: Backend Handoff Spec

> Generate Rust/Tauri implementation task document for external AI or developer.

| # | Task | Status |
|---|------|--------|
| 10.1 | Generate `16-rust-backend-implementation-plan.md` — all 27+ IPC commands, SQLite schema (7 tables), migrations, alarm engine, audio (rodio), notifications | Spec ⬜ |
| 10.2 | Document mock-to-Tauri migration guide — how to swap `mock-backend.ts` with real `tauri-commands.ts`, type mapping | Spec ⬜ |
| 10.3 | Document OS service layer tasks — auto-start, tray icon, wake/sleep recovery, background polling | Spec ⬜ |

---

## Execution Order

```
Phase 1 → 2 → 3 → 4 → 5A → 5B → 6 → 7 → 8 → 9 → 10
```

Each phase is independently testable. Phases 1–5B deliver a working MVP (P0). Phases 6–7 add P1 polish. Phases 8–9 add engagement features. Phase 10 generates the Rust handoff.

---

## Task Summary

| Phase | Description | Tasks |
|-------|-------------|-------|
| 1 | Foundation | 6 |
| 2 | Data Layer | 7 |
| 3 | Clock + Theme + Settings | 7 |
| 4 | Alarm CRUD + Index | 8 |
| 5A | Firing + Overlay + Challenges | 5 |
| 5B | Sound + Missed + Auto-Dismiss | 4 |
| 6 | Groups + Export + Shortcuts | 6 |
| 7 | Accessibility + i18n | 4 |
| 8 | Sleep + Analytics | 8 |
| 9 | Personalization | 6 |
| 10 | Backend Handoff Spec | 3 |
| **Total** | | **64** |

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
- Native file dialog for custom sounds (P1, uses web file input as fallback)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-04-11 | Merged Settings into Phase 3, split Phase 5 into 5A/5B, moved ChallengePanel to 5A, added fixtures task, added dependency install task, added known limitations section |
| 1.0.0 | 2026-04-11 | Initial plan — 57 tasks across 10 phases |

---

*Implementation Plan v1.1.0 — 2026-04-11*
