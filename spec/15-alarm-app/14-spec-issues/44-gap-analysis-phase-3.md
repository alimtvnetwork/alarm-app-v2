# Gap Analysis — Phase 3: AI Failure Risk Audit

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Scope:** Identify every point where an AI implementing this spec would be forced to guess, encounter conflicting instructions, miss critical sequences, or misinterpret ambiguous directives. This phase focuses on **cross-spec coherence** — issues only visible when reading multiple specs together.  
**Status:** Discovery only — no fixes applied.

---

## Audit Summary

| Metric | Value |
|--------|-------|
| Issues found | 31 |
| 🔴 Critical (will break AI implementation) | 4 |
| 🟠 High (ambiguity / wrong implementation) | 12 |
| 🟡 Medium (weakens clarity) | 11 |
| 🟢 Low (cosmetic / secondary) | 4 |

---

## Phase 2 Corrections

Before listing Phase 3 findings, several Phase 2 issues are **downgraded or resolved** because the answers exist in `01-fundamentals/` specs that Phase 2 did not fully cross-check:

| Phase 2 ID | Original Issue | Resolution | New Status |
|------------|---------------|------------|------------|
| GA2-012 | No navigation model | `03-file-structure.md` defines `pages/Index.tsx` (route: /) and `pages/Settings.tsx` (route: /settings), plus `react-router-dom` in dependencies | 🟡 Downgraded — routing exists but only 2 pages; Analytics, Sleep, Personalization have no pages/routes |
| GA2-013 | No Settings page | `03-file-structure.md` L62-66 defines `SettingsPanel.tsx` component and `Settings.tsx` page | ✅ Resolved — Settings page exists |
| GA2-027 | Frontend state architecture undefined | `06-tauri-architecture.md` L144-200 explicitly chooses Zustand with full store definitions | ✅ Resolved — Zustand stores defined |
| GA2-028 | Data refetch strategy undefined | `02-design-system.md` L207-213 explicitly states no cache invalidation needed (local SQLite) | ✅ Resolved — cache strategy documented |
| GA2-029 | Optimistic updates not specified | `02-design-system.md` L198-205 explicitly rejects optimistic updates with rationale | ✅ Resolved — server-confirmed flow |
| GA2-030 | Frontend error display strategy undefined | `02-design-system.md` L164-195 defines `safeInvoke` → toast + inline error banner + retry | ✅ Resolved — error pattern documented |
| GA2-031 | No loading states | `02-design-system.md` L125-162 defines skeleton screens for all views | ✅ Resolved — skeleton pattern documented |
| GA2-018 | Empty states for secondary views | `02-design-system.md` L132-138 defines empty states for Alarm List, Groups, History, Settings | Partially resolved — Sleep/Personalization still missing |

**Phase 2 revised total: 38 → 30 open issues** (8 resolved by cross-checking fundamentals)

---

## Phase 3 Findings

### Category A: Cross-Spec Contradictions (🔴 Critical)

These are cases where two specs give conflicting instructions. An AI following one spec will violate the other.

| # | ID | Issue | Specs Involved | Severity |
|---|-----|-------|---------------|----------|
| 1 | GA3-001 | **`toggle_alarm` return type contradicts** — `01-alarm-crud.md` IPC table says returns `Alarm`, but `06-tauri-architecture.md` IPC registry says returns `void`. AI will implement one or the other. | `01-alarm-crud.md` L300, `06-tauri-architecture.md` L88 | 🔴 Critical |
| 2 | GA3-002 | **`snooze_alarm` payload key contradicts** — `04-snooze-system.md` uses `{ AlarmId, DurationMin }` but `03-alarm-firing.md` prose uses `{ AlarmId, Duration }` (no "Min" suffix). Different key name = broken deserialization. | `04-snooze-system.md` L65, `03-alarm-firing.md` L77 | 🔴 Critical |
| 3 | GA3-003 | **`AlarmEvent` interface missing 2 columns** — `01-data-model.md` TypeScript interface has 11 fields, but the SQLite schema and `13-analytics.md` reference 13 columns (`AlarmLabelSnapshot`, `AlarmTimeSnapshot` exist in schema but not in the TS interface). AI will create a TS type missing 2 fields. | `01-data-model.md` L494-507, `13-analytics.md` L103 | 🔴 Critical |
| 4 | GA3-004 | **`duplicate_alarm` return type contradicts** — `01-alarm-crud.md` IPC table says returns `Alarm`, but `06-tauri-architecture.md` IPC registry omits `duplicate_alarm` entirely. AI reading only the architecture doc will not implement duplicate. | `01-alarm-crud.md` L301, `06-tauri-architecture.md` L80-89 | 🟠 High |

### Category B: Missing Cross-References (AI Will Miss Critical Info) (🟠 High)

These are cases where critical implementation details exist in one spec but the spec that needs them doesn't cross-reference it. An AI processing specs one-at-a-time will miss the detail.

| # | ID | Issue | Severity |
|---|-----|-------|----------|
| 5 | GA3-005 | **Feature specs don't reference `02-design-system.md` UI States** — the design system now defines loading/empty/error states, skeleton screens, `safeInvoke` pattern, and optimistic update policy. But 14 of 16 feature specs don't cross-reference it. An AI implementing `07-alarm-groups.md` will never discover the `safeInvoke` error pattern. | 🟠 High |
| 6 | GA3-006 | **Feature specs don't reference `03-file-structure.md` Zustand stores** — `03-file-structure.md` defines `useAlarmStore`, `useOverlayStore`, `useSettingsStore` but feature specs reference hooks like `useAlarms`, `useTheme` without clarifying their relationship to stores. | 🟠 High |
| 7 | GA3-007 | **`06-tauri-architecture.md` IPC registry is incomplete** — it lists 19 commands but the feature specs collectively define 30+ commands. Missing: `duplicate_alarm`, `move_alarm_to_group`, `undo_delete_alarm`, `list_sounds`, `set_custom_sound`, `get_challenge`, `submit_challenge_answer`, `play_ambient`, `stop_ambient`, `log_sleep_quality`, `get_daily_quote`, `save_favorite_quote`, `add_custom_quote`, `set_custom_background`, `clear_custom_background`, `get_streak_data`, `get_streak_calendar`, `register_shortcuts`, `unregister_shortcuts`. | 🟠 High |
| 8 | GA3-008 | **`01-alarm-crud.md` doesn't reference `02-design-system.md` UI States** — the most critical feature spec doesn't know about skeleton screens, empty states, or error banners defined in the design system. | 🟠 High |
| 9 | GA3-009 | **`03-alarm-firing.md` overlay lifecycle references `useOverlayStore` but doesn't reference `03-file-structure.md`** where the store is defined and the overlay window architecture is clarified. | 🟡 Medium |

### Category C: Forced AI Guesses (🟠 High / 🟡 Medium)

Places where the spec is silent and the AI must invent an answer.

| # | ID | Issue | What AI Must Guess | Severity |
|---|-----|-------|-------------------|----------|
| 10 | GA3-010 | **No routing table** — `react-router-dom` is in dependencies, `Index.tsx` and `Settings.tsx` are pages, but no spec lists all routes, their paths, or how to navigate between them. Are Analytics, Sleep, and Personalization separate pages or sections within Settings? | Route paths, navigation structure | 🟠 High |
| 11 | GA3-011 | **`ExportImport.tsx` placement ambiguous** — listed in `components/` but also as a standalone section on the main page. Is it a button that opens a dialog? A page? A settings section? | Component rendering context | 🟡 Medium |
| 12 | GA3-012 | **Sleep & Wellness has no page or component listed in file structure** — `03-file-structure.md` has no `SleepWellness.tsx`, no `AmbientPlayer.tsx`, no `SleepCalculator.tsx`. AI must invent all component names and file locations. | 5+ component names and locations | 🟠 High |
| 13 | GA3-013 | **Personalization has no page or component listed in file structure** — no `StreakCalendar.tsx`, `QuoteDisplay.tsx`, `AccentColorPicker.tsx`. AI must invent all components. | 4+ component names and locations | 🟠 High |
| 14 | GA3-014 | **Analytics has no page or component listed in file structure** — no `HistoryList.tsx`, `AnalyticsChart.tsx`, `HistoryFilter.tsx`. AI must invent all components. | 3+ component names and locations | 🟠 High |
| 15 | GA3-015 | **Challenge UI component not in file structure** — `06-dismissal-challenges.md` defines math/shake/typing challenges but `03-file-structure.md` has no `ChallengePanel.tsx` or equivalent. Where does the challenge render inside `AlarmOverlay.tsx`? | Component name, rendering location | 🟡 Medium |
| 16 | GA3-016 | **`log_from_frontend` IPC defined in startup spec but not in architecture IPC registry** — `07-startup-sequence.md` L233 defines the command, but `06-tauri-architecture.md` IPC tables don't include it. AI reading only the architecture doc will skip frontend logging. | Whether to implement frontend→backend logging | 🟡 Medium |
| 17 | GA3-017 | **Ambient sound IDs not defined** — `11-sleep-wellness.md` lists "rain, ocean, forest, white noise, brown noise, fan, fireplace" but no IDs (like `rain-gentle` in the alarm sound library). No IPC command to list available ambient sounds. | Sound ID naming convention | 🟢 Low |

### Category D: Ambiguous Directives (🟡 Medium)

Specs where phrasing allows multiple valid interpretations.

| # | ID | Issue | Possible Interpretations | Severity |
|---|-----|-------|------------------------|----------|
| 18 | GA3-018 | **"At least one day must be selected when type is weekly"** — enforced where? Frontend validation only? Backend validation too? What if both fail? | FE-only vs FE+BE validation | 🟡 Medium |
| 19 | GA3-019 | **"Alarm in X hours Y minutes" countdown** — should it show "0 minutes" or hide the line when < 1 minute? Should it show seconds in the last minute? | Display format at boundaries | 🟢 Low |
| 20 | GA3-020 | **"Cycling: Light → Dark → System → Light"** — is this the only UX? Or can the user also select from a dropdown/radio? `SettingsPanel.tsx` is listed but its layout is unspecified. | Toggle cycle vs explicit selector | 🟡 Medium |
| 21 | GA3-021 | **"Custom background image copied to app data dir"** — what filename? Original name? Hash? UUID? What if two backgrounds have the same name? | File naming strategy | 🟡 Medium |
| 22 | GA3-022 | **"Streak resets if snooze limit exceeded"** — does "exceeded" mean `SnoozeCount > MaxSnoozeCount` or `SnoozeCount >= MaxSnoozeCount`? Off-by-one risk. | Exact threshold condition | 🟡 Medium |
| 23 | GA3-023 | **`AutoDismissMin = 0` meaning** — spec says "0 = manual dismiss only". But the `auto_dismiss_min` field is `i32` not `Option<i32>`. Is 0 a sentinel value or should it be `NULL`? This affects query logic. | Sentinel vs nullable | 🟡 Medium |

### Category E: Missing Sequences / Flow Gaps (🟠 High / 🟡 Medium)

Critical implementation flows that are never described step-by-step.

| # | ID | Issue | What's Missing | Severity |
|---|-----|-------|---------------|----------|
| 24 | GA3-024 | **AlarmForm create flow never sequenced** — no step-by-step: user clicks "+", form opens, user fills fields, user clicks "Save", IPC fires, form closes, list refreshes. The discrete steps and their error handling are never described. | End-to-end create flow | 🟡 Medium |
| 25 | GA3-025 | **Import workflow end-to-end never sequenced** — spec defines 4 steps conceptually but never shows the full user flow: click import → file dialog → parse → preview → select duplicate action → confirm → result toast. | 6-step import UX flow | 🟠 High |
| 26 | GA3-026 | **Settings page sections and navigation never defined** — `SettingsPanel.tsx` is listed as a component with description "Theme, Time Format, Snooze, Language, Keyboard Shortcuts ref" but no section ordering, toggle vs dropdown decisions, or back-navigation method is specified. | Settings page layout | 🟡 Medium |
| 27 | GA3-027 | **Bedtime reminder setup flow** — how does the user configure bedtime? In Settings? In Sleep page? As a special alarm type? No flow defined. | Configuration entry point | 🟡 Medium |
| 28 | GA3-028 | **Music service OAuth flow** — spec says "OAuth via system browser + deep link callback" but no deep link URL scheme is defined, no callback handler code, no token storage location (Settings table? Separate table?). | OAuth implementation details | 🟢 Low (P3 feature) |

### Category F: Architectural Boundary Ambiguities (🟠 High)

| # | ID | Issue | Severity |
|---|-----|-------|----------|
| 29 | GA3-029 | **Component hierarchy shows `ExportImport` twice** — `03-file-structure.md` L402 lists `ExportImport` as a child of `Index.tsx` twice. Likely a copy-paste error, but AI may create duplicate components. | 🟡 Medium |
| 30 | GA3-030 | **`AlarmOverlay.tsx` window vs component confusion** — `03-file-structure.md` says it's in `components/` folder but also says it's "rendered in a separate Tauri window." An AI scaffolding the project will put it in `components/` but it should probably be in `pages/` or a separate entry point for the overlay window. | 🟠 High |
| 31 | GA3-031 | **No Tauri `tauri.conf.json` window config for overlay** — the overlay is a separate window with `always_on_top: true`, `decorations: false`, etc. But no spec shows the `tauri.conf.json` multiwindow config or the Rust `WindowBuilder` call to register the overlay as a second window. | 🟠 High |

---

## AI Failure Probability Matrix

| Implementation Area | Failure Risk | Root Cause |
|---------------------|:---:|-----------|
| Alarm CRUD (create/edit/delete/toggle) | 🟡 15% | Missing payload interfaces, but behavior is clear |
| Alarm Firing + Overlay | 🟢 5% | Best-specified feature — queue, DST, missed, all covered |
| Snooze System | 🟢 5% | Well-specified, clear IPC, crash recovery defined |
| Sound & Vibration | 🟢 8% | Good validation, fallback logic, platform handling |
| Dismissal Challenges | 🟡 20% | Challenge-overlay integration undefined, missed+challenge undefined |
| Alarm Groups | 🟢 10% | Master toggle well-specified, edge cases covered |
| Clock Display | 🟢 5% | Simple, clear, well-defined |
| Theme System | 🟢 5% | Simple, explicit IPC, clear behavior |
| Export / Import | 🟡 25% | iCal mapping gaps, import cancel flow missing, end-to-end sequence unclear |
| Sleep & Wellness | 🔴 45% | No components in file structure, no IPC table, no page layout |
| Smart Features | 🟡 20% | P3 — intentionally vague, SSRF well-specified |
| Analytics & History | 🟡 30% | No components in file structure, no page layout, no routing |
| Personalization | 🔴 40% | No components in file structure, scattered IPC, no page layout |
| Keyboard Shortcuts | 🟡 15% | Search/SelectAll behaviors undefined |
| Accessibility & NFR | 🟢 8% | Clear standards, enforcement rules present |
| **App Shell / Navigation** | 🔴 50% | Only 2 pages defined, 4+ features need pages, no routing table |

---

## Cumulative Gap Analysis Summary

| Phase | Issues | Critical | High | Medium | Low |
|-------|--------|----------|------|--------|-----|
| Phase 1 (Structural) | 29 | 6 | 10 | 9 | 4 |
| Phase 2 (Content) — revised | 30 | 4 | 12 | 10 | 4 |
| Phase 3 (AI Failure Risk) | 31 | 4 | 12 | 11 | 4 |
| **Total unique** | **90** | **14** | **34** | **30** | **12** |

> Note: 8 Phase 2 issues were resolved by Phase 3 cross-checking. Some Phase 1 issues (GA1-001, GA1-002) are tracked across phases but counted only once.

**Revised AI Blind Execution Failure Rate:**

| Scenario | Estimate |
|----------|----------|
| AI given ONLY a single feature spec | ~40-50% failure |
| AI given full spec folder (fundamentals + features) | ~20-25% failure |
| After all gap analysis fixes applied | ~5-8% failure |

---

## Remaining Phases

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 1** | Structural & Foundational Alignment | ✅ Complete |
| **Phase 2** | Content Completeness | ✅ Complete (revised) |
| **Phase 3** | AI Failure Risk | ✅ Complete (this document) |
| **Phase 4** | Deep Code Sample Audit — every code block checked against coding guidelines | ⬜ Pending |
| **Phase 5** | Issue Grouping — atomic fixable tasks, effort estimates | ⬜ Pending |

---

*Gap Analysis Phase 3 — created: 2026-04-10*
