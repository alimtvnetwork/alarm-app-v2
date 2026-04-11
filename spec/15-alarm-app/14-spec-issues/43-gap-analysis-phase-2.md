# Gap Analysis — Phase 2: Content Completeness Audit

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Scope:** Audit all 16 feature specs for completeness of backend behavior, frontend flows, edge cases, error handling, state management, and missing details that would force an AI to guess.  
**Status:** Discovery only — no fixes applied.

---

## Audit Summary

| Metric | Value |
|--------|-------|
| Issues found | 38 |
| 🔴 Critical (will break AI implementation) | 5 |
| 🟠 High (ambiguity / wrong implementation) | 14 |
| 🟡 Medium (weakens clarity) | 13 |
| 🟢 Low (cosmetic / secondary) | 6 |

---

## Phase 2 Findings

### Category A: Missing Backend Behavior (🔴 Critical / 🟠 High)

| # | ID | Issue | Location | Severity |
|---|-----|-------|----------|----------|
| 1 | GA2-001 | **`CreateAlarmPayload` undefined** — no field list tells AI which of 26 Alarm columns are client-supplied vs server-generated (`AlarmId`, `NextFireTime`, `CreatedAt`, `UpdatedAt`, `DeletedAt` are server-gen). Carried forward from Phase 1 GA1-001, now assessed for content completeness impact. | `01-alarm-crud.md` | 🔴 Critical |
| 2 | GA2-002 | **`UpdateAlarmPayload` undefined** — AI doesn't know if partial updates are allowed or if ALL fields must be sent. No PATCH vs PUT semantics defined. | `01-alarm-crud.md` | 🔴 Critical |
| 3 | GA2-003 | **No Rust command handler samples** for 6 feature specs (Groups, Clock, Theme, Export, Personalization, Keyboard). Only IPC tables exist — AI must guess the handler pattern (error handling, response wrapping, DB access). | `07`, `08`, `09`, `10`, `14`, `15` | 🟠 High |
| 4 | GA2-004 | **No validation rules for Alarm fields** — what happens when `Time` is `"25:99"`, `Label` exceeds max length, `SnoozeDurationMin` is 0, or `IntervalMinutes` is 0? No input validation spec. | `01-alarm-crud.md`, `01-data-model.md` | 🔴 Critical |
| 5 | GA2-005 | **Label max length undefined** — `AlarmGroup.Name` is capped at 30 chars, but `Alarm.Label` has no stated max. AI will either omit validation or guess a limit. | `01-data-model.md` | 🟠 High |
| 6 | GA2-006 | **`import_data` workflow unclear** — does `import_data` open the file dialog AND parse, or does the frontend open the dialog first? Two-step vs one-step ambiguity. | `10-export-import.md` | 🟠 High |
| 7 | GA2-007 | **No `confirm_import` cancellation** — `ImportPreview` is returned, but what if the user cancels? No `cancel_import` IPC to clean up the preview state. Preview data leaks in memory. | `10-export-import.md` | 🟡 Medium |
| 8 | GA2-008 | **Webhook retry logic undefined** — spec says "1 retry after 2s" but no code sample shows the retry implementation (exponential backoff? simple delay? which errors trigger retry?). | `12-smart-features.md` | 🟡 Medium |
| 9 | GA2-009 | **`log_sleep_quality` IPC payload not in formal table** — defined inline as prose `{ AlarmId, Quality, Mood, Notes }` but never in a standard IPC Commands table. | `11-sleep-wellness.md` | 🟠 High |
| 10 | GA2-010 | **`play_ambient` / `stop_ambient` IPC payloads not in formal table** — defined inline as prose. | `11-sleep-wellness.md` | 🟠 High |

### Category B: Missing Frontend Flows (🟠 High / 🟡 Medium)

| # | ID | Issue | Location | Severity |
|---|-----|-------|----------|----------|
| 11 | GA2-011 | **AlarmForm field layout undefined** — the form has 10+ fields (time, label, date, repeat, sound, snooze, challenge, group, gradual volume, auto-dismiss) but no mockup, field ordering, or UX grouping is specified. AI must guess the form layout. | `01-alarm-crud.md` | 🟠 High |
| 12 | GA2-012 | **No navigation model** — no spec describes how users navigate between Clock view, Alarm List, Analytics, Settings, Sleep. No mention of tabs, sidebar, bottom nav, or routing. | All feature specs | 🔴 Critical |
| 13 | GA2-013 | **Settings page undefined** — multiple features reference storing values in the `Settings` table (theme, 12/24h format, language, bedtime, export warning), but no spec describes the Settings UI page layout, sections, or navigation. | `09-theme-system.md`, `08-clock-display.md`, `16-accessibility-and-nfr.md` | 🔴 Critical |
| 14 | GA2-014 | **AlarmForm repeat pattern UI incomplete** — `02-alarm-scheduling.md` defines pill toggles and shortcuts for Weekly but doesn't specify the UI for Interval (just "numeric input") or Cron (just "text input"). No validation feedback UX. | `02-alarm-scheduling.md` L68-69 | 🟡 Medium |
| 15 | GA2-015 | **Analytics/History page layout undefined** — spec defines data and filters but no UI wireframe: where do filters go? Sidebar? Top bar? Modal? How does the calendar view look? | `13-analytics.md` | 🟡 Medium |
| 16 | GA2-016 | **Sleep & Wellness page layout undefined** — 4 sub-features (bedtime, calculator, mood, ambient) but no page layout or navigation between them. | `11-sleep-wellness.md` | 🟡 Medium |
| 17 | GA2-017 | **Personalization page layout undefined** — 5 sub-features (themes, quotes, streak, background, music) but no page structure. | `14-personalization.md` | 🟡 Medium |
| 18 | GA2-018 | **Empty states for secondary views missing** — Alarm list has empty state defined, but Analytics (no events), Groups (no groups), Sleep (no data) have no empty state descriptions. | Multiple | 🟡 Medium |

### Category C: Missing Edge Cases & Error Handling (🟠 High / 🟡 Medium)

| # | ID | Issue | Location | Severity |
|---|-----|-------|----------|----------|
| 19 | GA2-019 | **Concurrent alarm edit race condition** — if two windows/instances edit the same alarm simultaneously (theoretical for desktop), no optimistic locking or `UpdatedAt` check is specified. | `01-alarm-crud.md` | 🟡 Medium |
| 20 | GA2-020 | **Group delete with active snooze** — what happens if a group is deleted while one of its alarms has an active snooze? Spec says alarms move to ungrouped, but does the snooze survive? | `07-alarm-groups.md` | 🟡 Medium |
| 21 | GA2-021 | **Overlay + Challenge interaction undefined** — when a challenge is configured, does the challenge replace the dismiss button or appear as a pre-step? No overlay layout variant showing the challenge UI integrated into the firing overlay. | `06-dismissal-challenges.md`, `03-alarm-firing.md` | 🟠 High |
| 22 | GA2-022 | **Missed alarm + challenge** — if an alarm is missed and has a challenge configured, does the missed alarm still require the challenge? Or is the challenge skipped for missed alarms? | `06-dismissal-challenges.md`, `03-alarm-firing.md` | 🟠 High |
| 23 | GA2-023 | **iCal import edge cases** — how to handle iCal events with RRULE patterns that don't map to the app's 5 `RepeatType` values (e.g., "every 3rd Tuesday")? No mapping table. | `10-export-import.md` | 🟠 High |
| 24 | GA2-024 | **CSV import column mapping** — CSV export defines 11 columns, but import doesn't specify whether column order matters, whether headers are required, or how to handle extra/missing columns. | `10-export-import.md` | 🟡 Medium |
| 25 | GA2-025 | **Gradual volume + snooze interaction** — when a snoozed alarm re-fires, does gradual volume restart from 10% or resume at full volume? | `05-sound-and-vibration.md`, `04-snooze-system.md` | 🟡 Medium |
| 26 | GA2-026 | **Auto-dismiss + snooze count** — if an alarm auto-dismisses, does it count as a "dismiss" (clearing snooze state) or does the snooze count persist for analytics? | `03-alarm-firing.md`, `04-snooze-system.md` | 🟡 Medium |

### Category D: Missing State Management Details (🟠 High / 🟡 Medium)

| # | ID | Issue | Location | Severity |
|---|-----|-------|----------|----------|
| 27 | GA2-027 | **Frontend state architecture undefined** — no spec describes whether to use React Context, Zustand, Jotai, or Redux. `useOverlayStore` implies Zustand but it's never stated. Other hooks (`useAlarms`, `useClock`, `useTheme`) don't specify their state backing. | All feature specs | 🟠 High |
| 28 | GA2-028 | **Data refetch strategy undefined** — when an alarm is created/edited/deleted, how does the alarm list refresh? Polling? Event-driven? Manual refetch? `useAlarms` mentions "SQLite sync via Tauri invoke" but no cache invalidation strategy. | `01-alarm-crud.md` | 🟠 High |
| 29 | GA2-029 | **Optimistic updates not specified** — should the UI immediately reflect changes (optimistic) or wait for IPC response? For toggle and delete, this significantly affects perceived performance. | `01-alarm-crud.md` | 🟡 Medium |
| 30 | GA2-030 | **Frontend error display strategy undefined** — when an IPC call fails, what does the user see? Toast? Inline error? Modal? No global error handling pattern specified. | All feature specs | 🟠 High |

### Category E: Missing Operational Details (🟡 Medium / 🟢 Low)

| # | ID | Issue | Location | Severity |
|---|-----|-------|----------|----------|
| 31 | GA2-031 | **No loading states specified** — which IPC calls should show loading spinners? Alarm list on initial load? Export in progress? Import processing? | All feature specs | 🟡 Medium |
| 32 | GA2-032 | **Alarm sort order not fully defined** — spec says "sorted by time within each group" but doesn't specify: ascending or descending? What about alarms with the same time? Secondary sort? Disabled alarms at bottom? | `01-alarm-crud.md` L209 | 🟡 Medium |
| 33 | GA2-033 | **`get_next_alarm_time` cache behavior undefined** — spec says "called on mount and after any alarm CRUD operation" but doesn't say whether the Clock component subscribes to events or polls. | `08-clock-display.md` L92 | 🟢 Low |
| 34 | GA2-034 | **Theme transition mechanism undefined** — spec says "150ms smooth transition" but doesn't say CSS transition on which property (`background-color`? `color`? all?), or whether it uses `transition` or `animation`. | `09-theme-system.md` L81 | 🟢 Low |
| 35 | GA2-035 | **Keyboard shortcut registration timing** — `register_shortcuts` is called, but when? On app start? After first render? What if registration fails (e.g., shortcut already taken by OS)? | `15-keyboard-shortcuts.md` | 🟢 Low |
| 36 | GA2-036 | **Search alarms feature undefined** — `15-keyboard-shortcuts.md` lists `Ctrl+F` as "Search alarms" but no feature spec defines alarm search behavior, matching rules, or UI. | `15-keyboard-shortcuts.md` L41 | 🟠 High |
| 37 | GA2-037 | **Select all shortcut behavior undefined** — `Ctrl+A` is "Select all" but multi-select is never defined in Alarm CRUD. What can be done with multiple selected alarms? Bulk delete? Bulk toggle? | `15-keyboard-shortcuts.md` L55, `01-alarm-crud.md` | 🟠 High |
| 38 | GA2-038 | **Ambient sound library not listed** — spec says "rain, ocean, forest, white noise, brown noise, fan, fireplace" but no IDs, file names, or formal list like the alarm sound library in `05-sound-and-vibration.md`. | `11-sleep-wellness.md` L74 | 🟢 Low |

---

## Content Completeness Scorecard (Per Feature)

| # | Feature Spec | Backend | Frontend | Edge Cases | State Mgmt | Error Handling | Score |
|---|-------------|---------|----------|------------|------------|----------------|-------|
| 01 | Alarm CRUD | 🟡 Missing payloads, validation | 🟡 No form layout | ✅ Well covered | 🟡 Refetch undefined | 🟡 No error display | 60% |
| 02 | Scheduling | ✅ Complete (delegates to CRUD) | 🟡 Interval/Cron UI sparse | ✅ | N/A | N/A | 80% |
| 03 | Firing | ✅ Excellent | ✅ Overlay well defined | ✅ Queue, missed, auto-dismiss | ✅ Ownership clear | ✅ | 95% |
| 04 | Snooze | ✅ Complete | ✅ | ✅ Crash recovery | ✅ | ✅ | 95% |
| 05 | Sound | ✅ Validation, fallback | ✅ | ✅ Missing sound handled | N/A | ✅ | 90% |
| 06 | Challenges | ✅ Math spec good | 🟡 Overlay integration unclear | 🟡 Missed + challenge? | N/A | ✅ | 75% |
| 07 | Groups | ✅ Master toggle detailed | 🟡 No UI wireframe | ✅ Edge cases covered | N/A | ✅ | 85% |
| 08 | Clock | ✅ IPC defined | 🟡 Basic description only | N/A | 🟢 | 🟢 | 80% |
| 09 | Theme | ✅ IPC defined | ✅ Simple and clear | N/A | ✅ | 🟢 | 90% |
| 10 | Export/Import | ✅ Well structured | 🟡 No cancel flow | 🟡 iCal mapping gaps | N/A | 🟡 | 75% |
| 11 | Sleep | 🟡 No IPC table | 🟡 No page layout | 🟡 | 🟡 | 🟡 | 55% |
| 12 | Smart Features | ✅ SSRF detailed | 🟡 | 🟡 | N/A | ✅ | 80% |
| 13 | Analytics | ✅ IPC defined | 🟡 No page layout | N/A | N/A | 🟡 | 70% |
| 14 | Personalization | 🟡 IPC scattered | 🟡 No page layout | 🟡 | 🟡 | 🟡 | 55% |
| 15 | Keyboard | ✅ | 🟡 Search/SelectAll undefined | 🟡 | N/A | 🟢 | 70% |
| 16 | Accessibility | ✅ Clear standards | ✅ | N/A | N/A | N/A | 90% |

**Overall Content Completeness: ~77%**

---

## Top 5 AI Failure Risks from Phase 2

| Rank | Risk | Impact | Specs Affected |
|------|------|--------|----------------|
| 1 | **No navigation model / app shell** | AI will invent random routing — tabs? sidebar? drawer? Every AI will choose differently | All 16 |
| 2 | **No Settings page spec** | 6+ features store values in Settings but no UI exists to manage them | 08, 09, 10, 11, 16 |
| 3 | **Missing Create/Update payloads** | AI will include server-generated fields in payloads, causing insert failures | 01 |
| 4 | **No input validation rules** | AI will skip validation entirely or guess limits, causing bad data in SQLite | 01 |
| 5 | **No frontend state architecture** | AI will mix Context, Zustand, useState, and Redux across components | All 16 |

---

## Cumulative Gap Analysis Summary

| Phase | Issues | Critical | High | Medium | Low |
|-------|--------|----------|------|--------|-----|
| Phase 1 (Structural) | 29 | 6 | 10 | 9 | 4 |
| Phase 2 (Content) | 38 | 5 | 14 | 13 | 6 |
| **Total** | **67** | **11** | **24** | **22** | **10** |

**Estimated AI Blind Execution Failure Rate (cumulative):**

| Scenario | Phase 1 Estimate | Phase 2 Revised Estimate |
|----------|-----------------|-------------------------|
| AI given ONLY the App spec folder | ~25-30% | **~35-40%** (navigation + settings gap raises it) |
| AI given App spec + fundamentals + coding guidelines | ~10-15% | **~15-20%** |
| After all gap analysis fixes applied | ~3-5% | **~5-8%** (some gaps like page layouts are inherently design-dependent) |

---

## Remaining Phases

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 1** | Structural & Foundational Alignment | ✅ Complete |
| **Phase 2** | Content Completeness | ✅ Complete (this document) |
| **Phase 3** | AI Failure Risk — forced guesses, conflicting instructions, missing sequences | ⬜ Pending |
| **Phase 4** | Deep Code Sample Audit — every code block checked against coding guidelines | ⬜ Pending |
| **Phase 5** | Issue Grouping — atomic fixable tasks, effort estimates | ⬜ Pending |

---

*Gap Analysis Phase 2 — created: 2026-04-10*
