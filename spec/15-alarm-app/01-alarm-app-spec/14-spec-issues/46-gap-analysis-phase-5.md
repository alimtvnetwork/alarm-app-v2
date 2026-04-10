# Gap Analysis — Phase 5: Atomic Fix Tasks & Prioritization

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Scope:** Group all ~90 unique findings from Phases 1–4 into atomic, actionable fix tasks. Each task is self-contained, sized for one work session, and prioritized by AI failure risk reduction.  
**Status:** Planning complete — ready for execution.

---

## Methodology

1. Deduplicated all findings across Phases 1–4 (some issues tracked across phases)
2. Grouped by fix locality (same file or same concern = one task)
3. Estimated effort in minutes
4. Prioritized by: Critical severity first, then by number of specs affected, then by AI failure risk reduction
5. Tasks are ordered so each can be executed independently (no dependencies between tasks)

---

## Deduplication Summary

| Source | Raw Issues | Resolved by Phase 3 Cross-Check | Duplicates Across Phases | Unique Open |
|--------|:---------:|:-------------------------------:|:------------------------:|:-----------:|
| Phase 1 | 29 | 0 | 3 (GA1-001/GA2-001, GA1-002/GA2-002, GA1-005/GA4-001) | 26 |
| Phase 2 | 38 | 8 (resolved by Phase 3) | 2 (GA2-001/GA1-001, GA2-002/GA1-002) | 28 |
| Phase 3 | 31 | — | 0 | 31 |
| Phase 4 | 27 | — | 3 (GA4-001/GA1-005, GA4-002/GA1-006, GA4-011/GA1-026) | 24 |
| **Total** | **125** | **8** | **8** | **~90** |

---

## Fix Tasks — Priority Order

### Tier 1: Critical — AI Will Break Without These (🔴)

> These tasks prevent the highest-impact AI failures. Each resolves 1+ Critical findings.

---

#### Task 1: Define `CreateAlarmPayload` and `UpdateAlarmPayload` interfaces

**Resolves:** GA1-001, GA1-002, GA2-001, GA2-002  
**Files:** `01-alarm-crud.md`, `01-data-model.md`  
**Effort:** 20 min  
**AI Risk Reduction:** ~8% → Eliminates the #1 AI guessing failure (which of 26 fields are client-supplied)

**What to do:**
1. Add a `### Payload Interfaces` section to `01-alarm-crud.md` after the IPC Commands table
2. Define `CreateAlarmPayload` — list all client-supplied fields, explicitly mark server-generated fields (`AlarmId`, `NextFireTime`, `CreatedAt`, `UpdatedAt`, `DeletedAt`) as excluded
3. Define `UpdateAlarmPayload` — specify partial update semantics (PATCH: only changed fields sent) or full replacement (PUT: all fields required)
4. Cross-reference from `06-tauri-architecture.md` IPC registry

---

#### Task 2: Add input validation rules for Alarm fields

**Resolves:** GA2-004, GA2-005  
**Files:** `01-alarm-crud.md` or `01-data-model.md`  
**Effort:** 15 min  
**AI Risk Reduction:** ~5% → Prevents AI from skipping validation or guessing limits

**What to do:**
1. Add a `### Input Validation Rules` table to `01-alarm-crud.md`
2. Define rules for: `Time` (HH:MM, 00:00–23:59), `Label` (max 100 chars, trimmed, optional), `SnoozeDurationMin` (1–60), `IntervalMinutes` (1–1440), `CronExpression` (valid cron syntax), `DaysOfWeek` (≥1 when RepeatType=Weekly)
3. Specify where validation runs: Rust backend (authoritative) + frontend (UX convenience)

---

#### Task 3: Fix `.ok()` error swallowing in code samples

**Resolves:** GA1-005, GA1-006, GA4-001, GA4-002  
**Files:** `01-alarm-crud.md`, `01-data-model.md`  
**Effort:** 5 min  
**AI Risk Reduction:** ~3% → Prevents AI from replicating error-swallowing across entire codebase

**What to do:**
1. In `01-alarm-crud.md` L90: Replace `.ok();` with `if let Err(e) = ... { tracing::warn!("cleanup_stale_soft_deletes failed: {e}"); }`
2. In `01-data-model.md` L611: Same pattern for `purge_old_events`
3. In `01-alarm-crud.md` L79: Replace `_ => {}` with `_ => { tracing::debug!("schedule_permanent_delete: no rows affected"); }`

---

#### Task 4: Resolve `toggle_alarm` return type contradiction

**Resolves:** GA3-001  
**Files:** `01-alarm-crud.md`, `06-tauri-architecture.md`  
**Effort:** 5 min  
**AI Risk Reduction:** ~2% → Eliminates contradictory spec that produces two different implementations

**What to do:**
1. Decide: return `Alarm` (preferred — frontend needs updated `NextFireTime` after toggle) or `void`
2. Update the conflicting spec to match
3. Verify `06-tauri-architecture.md` IPC registry matches `01-alarm-crud.md` IPC table

---

#### Task 5: Resolve `snooze_alarm` payload key contradiction

**Resolves:** GA3-002  
**Files:** `04-snooze-system.md`, `03-alarm-firing.md`  
**Effort:** 5 min  
**AI Risk Reduction:** ~2% → Prevents deserialization failure from mismatched field names

**What to do:**
1. Canonical key is `DurationMin` (matches `SnoozeDurationMin` column naming pattern)
2. Find and replace `Duration` → `DurationMin` in `03-alarm-firing.md` prose
3. Verify `06-tauri-architecture.md` IPC registry uses `DurationMin`

---

#### Task 6: Fix `AlarmEvent` TypeScript interface (missing 2 fields)

**Resolves:** GA3-003  
**Files:** `01-data-model.md`  
**Effort:** 5 min  
**AI Risk Reduction:** ~2% → Prevents AI from creating a TS type that doesn't match the DB schema

**What to do:**
1. Add `AlarmLabelSnapshot: string | null` and `AlarmTimeSnapshot: string | null` to the TypeScript `AlarmEvent` interface in `01-data-model.md`
2. Verify the field count matches the SQLite schema (should be 13 fields total)

---

#### Task 7: Complete the IPC registry in `06-tauri-architecture.md`

**Resolves:** GA3-007, GA3-004, GA3-016  
**Files:** `06-tauri-architecture.md`  
**Effort:** 20 min  
**AI Risk Reduction:** ~5% → Single source of truth for all IPC commands prevents AI from missing commands

**What to do:**
1. Add all missing commands to the IPC registry: `duplicate_alarm`, `move_alarm_to_group`, `undo_delete_alarm`, `list_sounds`, `set_custom_sound`, `get_challenge`, `submit_challenge_answer`, `play_ambient`, `stop_ambient`, `log_sleep_quality`, `get_daily_quote`, `save_favorite_quote`, `add_custom_quote`, `set_custom_background`, `clear_custom_background`, `get_streak_data`, `get_streak_calendar`, `register_shortcuts`, `unregister_shortcuts`, `log_from_frontend`
2. Include payload type and return type for each
3. Group by feature area with section headers

---

### Tier 2: High — Significant AI Ambiguity (🟠)

> These tasks resolve High-severity findings that cause AI to guess wrong in 15–50% of implementations.

---

#### Task 8: Add routing table and navigation model

**Resolves:** GA2-012 (revised), GA3-010  
**Files:** `03-file-structure.md` or new `08-navigation.md` in fundamentals  
**Effort:** 20 min  
**AI Risk Reduction:** ~8% → Eliminates the highest failure-risk area (50% for App Shell)

**What to do:**
1. Define all routes: `/` (clock + alarm list), `/settings`, `/analytics`, `/sleep`, `/personalization`
2. Define navigation method: bottom tab bar (mobile-first) or sidebar
3. Specify which features are pages vs sections within Settings
4. Add route → component mapping table

---

#### Task 9: Add missing components to `03-file-structure.md`

**Resolves:** GA3-012, GA3-013, GA3-014, GA3-015  
**Files:** `03-file-structure.md`  
**Effort:** 15 min  
**AI Risk Reduction:** ~6% → Prevents AI from inventing 12+ component names

**What to do:**
1. Add Sleep & Wellness components: `SleepWellness.tsx`, `BedtimeReminder.tsx`, `SleepCalculator.tsx`, `AmbientPlayer.tsx`, `MoodLogger.tsx`
2. Add Personalization components: `StreakCalendar.tsx`, `QuoteDisplay.tsx`, `AccentColorPicker.tsx`, `BackgroundPicker.tsx`
3. Add Analytics components: `HistoryList.tsx`, `AnalyticsChart.tsx`, `HistoryFilter.tsx`
4. Add Challenge component: `ChallengePanel.tsx` (rendered inside `AlarmOverlay.tsx`)

---

#### Task 10: Add IPC Commands tables to 6 feature specs

**Resolves:** GA1-019, GA1-020, GA1-021, GA1-022, GA1-023, GA2-009, GA2-010  
**Files:** `02-alarm-scheduling.md`, `03-alarm-firing.md`, `05-sound-and-vibration.md`, `11-sleep-wellness.md`, `12-smart-features.md`  
**Effort:** 30 min  
**AI Risk Reduction:** ~5% → Consistent IPC tables across all specs

**What to do:**
1. For `02-alarm-scheduling.md`: Add note "Scheduling is handled by `create_alarm` and `update_alarm` IPC commands — see `01-alarm-crud.md`"
2. For `03-alarm-firing.md`: Add formal IPC Commands table (currently has inline calls)
3. For `05-sound-and-vibration.md`: Add formal IPC Commands table for `list_sounds`, `set_custom_sound`, `validate_custom_sound`
4. For `11-sleep-wellness.md`: Add full IPC Commands table for `log_sleep_quality`, `play_ambient`, `stop_ambient`, `get_bedtime_reminder`
5. For `12-smart-features.md`: Add IPC Commands table for webhook operations

---

#### Task 11: Define `CreateGroupPayload` and `UpdateGroupPayload`

**Resolves:** GA1-003, GA1-004  
**Files:** `07-alarm-groups.md`  
**Effort:** 10 min  
**AI Risk Reduction:** ~2%

**What to do:**
1. Define `CreateGroupPayload`: `{ Name: string, SortOrder: number }`
2. Define `UpdateGroupPayload`: `{ Name?: string, SortOrder?: number }` (partial update)
3. Add to the IPC Commands section

---

#### Task 12: Define overlay + challenge interaction

**Resolves:** GA2-021, GA2-022  
**Files:** `06-dismissal-challenges.md`  
**Effort:** 10 min  
**AI Risk Reduction:** ~3%

**What to do:**
1. Specify that the challenge replaces the "Dismiss" button on the overlay
2. Define the flow: Dismiss pressed → challenge appears → correct answer → alarm dismissed
3. Clarify: missed alarms with challenges — challenge is skipped for missed alarms (they auto-resolve)

---

#### Task 13: Define import end-to-end flow and iCal mapping

**Resolves:** GA2-006, GA2-023, GA2-024, GA2-007, GA3-025  
**Files:** `10-export-import.md`  
**Effort:** 15 min  
**AI Risk Reduction:** ~4%

**What to do:**
1. Add step-by-step import flow: click → file dialog → parse → preview → select strategy → confirm → toast
2. Add iCal RRULE → RepeatType mapping table (unmappable rules → `RepeatType::None`)
3. Specify CSV import: headers required, column order doesn't matter, extra columns ignored, missing required columns → error
4. Add `cancel_import` IPC or clarify that preview state is GC'd after timeout

---

#### Task 14: Add `AlarmOverlay` window config to spec

**Resolves:** GA3-030, GA3-031  
**Files:** `06-tauri-architecture.md`  
**Effort:** 10 min  
**AI Risk Reduction:** ~3%

**What to do:**
1. Add `tauri.conf.json` snippet for overlay window: `always_on_top: true`, `decorations: false`, `fullscreen: true`
2. Add Rust `WindowBuilder` sample for creating the overlay window
3. Clarify that `AlarmOverlay.tsx` is a separate entry point (not a component in the main window)

---

#### Task 15: Add Rust command handler sample for under-specified features

**Resolves:** GA2-003  
**Files:** `07-alarm-groups.md` (as canonical example)  
**Effort:** 10 min  
**AI Risk Reduction:** ~3%

**What to do:**
1. Add one Rust handler sample to `07-alarm-groups.md` showing the pattern: `#[tauri::command]` → validate → DB query → map result → return
2. Reference `02-design-system.md` `safeInvoke` for the frontend call pattern
3. Other under-specified features can reference this sample

---

#### Task 16: Define Search and Select All behaviors

**Resolves:** GA2-036, GA2-037  
**Files:** `15-keyboard-shortcuts.md`, `01-alarm-crud.md`  
**Effort:** 10 min  
**AI Risk Reduction:** ~2%

**What to do:**
1. Define search: filters alarm list by label substring match, case-insensitive, no IPC needed (frontend filter)
2. Define Select All: enables bulk operations (delete, toggle, move to group); adds `selectedAlarmIds` to `useAlarmStore`
3. Define keyboard shortcuts for bulk actions or clarify that Select All is P3/deferred

---

### Tier 3: Medium — Clarity Improvements (🟡)

> These tasks improve spec quality but AI can work around them with reasonable defaults.

---

#### Task 17: Replace magic values with named constants in code samples

**Resolves:** GA4-019, GA4-020, GA4-022  
**Files:** `01-alarm-crud.md`, `03-alarm-firing.md`, `04-platform-constraints.md`  
**Effort:** 10 min

**What to do:**
1. Replace `Duration::from_secs(5)` → `Duration::from_secs(UNDO_TIMEOUT_SECS)`
2. Replace `0..120` → `0..MAX_DST_ADVANCE_MINUTES`
3. Replace `5000` → `IPC_TIMEOUT_MS`
4. Define constants in a `### Constants` section in each file

---

#### Task 18: Add `tracing::` logging to under-logged code samples

**Resolves:** GA1-009 through GA1-018, GA4-027, GA4-028, GA4-030, GA4-032  
**Files:** Multiple feature specs  
**Effort:** 20 min

**What to do:**
1. Add `tracing::debug!` entry log to `compute_next_fire_time` and `validate_custom_sound`
2. Add `console.debug` to `onDeleteAlarm` and `onUndo` TS samples
3. For feature specs with no code samples (groups, clock, theme, etc.): add a note in Cross-References pointing to the logging guideline

---

#### Task 19: Refactor oversized functions in code samples

**Resolves:** GA4-004, GA4-005, GA4-007, GA4-009  
**Files:** `01-alarm-crud.md`, `03-alarm-firing.md`, `06-tauri-architecture.md`  
**Effort:** 25 min

**What to do:**
1. `LinuxWakeListener::start` (48 lines) → extract `parse_event`, `handle_wake_event`, `setup_listener` helpers
2. `handle_spring_forward` (20 lines) → flatten nested `match` with early continue
3. `onDeleteAlarm` (19 lines) → extract `manageUndoStack` helper
4. `useAlarmEvents` (17 lines) → borderline, add comment acknowledging it's at the limit

---

#### Task 20: Flatten nested control flow in code samples

**Resolves:** GA4-011, GA4-012, GA1-026  
**Files:** `03-alarm-firing.md`  
**Effort:** 10 min

**What to do:**
1. `compute_weekly` L120-121: flatten nested `if let` with early `continue`
2. `handle_spring_forward` L168-176: extract inner `match` to a helper function

---

#### Task 21: Introduce `AlarmContext` struct to reduce parameter counts

**Resolves:** GA4-015, GA4-016, GA4-018  
**Files:** `03-alarm-firing.md`  
**Effort:** 15 min

**What to do:**
1. Define `struct AlarmContext { now: DateTime<Utc>, now_local: NaiveDateTime, timezone: Tz }`
2. Refactor `compute_next_fire_time(alarm_time, alarm_date, repeat, ctx)` — 4 params → 3
3. Refactor `compute_weekly(alarm_time, repeat, ctx)` — 5 params → 3
4. Refactor `compute_daily(alarm_time, ctx)` — 4 params → 2

---

#### Task 22: Add cross-references to coding guidelines and design system

**Resolves:** GA1-025, GA3-005, GA3-006, GA3-008, GA3-009  
**Files:** 14 feature specs  
**Effort:** 15 min

**What to do:**
1. Add `02-design-system.md` to Cross-References in all 14 feature specs missing it
2. Add coding guidelines reference to all 12 feature specs missing it
3. Add `03-file-structure.md` cross-reference where Zustand stores are used

---

#### Task 23: Resolve remaining ambiguous directives

**Resolves:** GA3-018, GA3-020, GA3-021, GA3-022, GA3-023  
**Files:** Various  
**Effort:** 15 min

**What to do:**
1. Weekly validation: "Backend enforces ≥1 day; frontend prevents Save button"
2. Theme cycling: "SettingsPanel shows 3-option radio group (Light/Dark/System), not cycle"
3. Custom background filename: "UUID-based: `{uuid}.{ext}`"
4. Streak reset threshold: "`SnoozeCount > MaxSnoozeCount` (strictly greater)"
5. `AutoDismissMin = 0`: "0 is a sentinel value meaning manual dismiss only — not nullable"

---

#### Task 24: Define edge case behaviors

**Resolves:** GA2-019, GA2-020, GA2-025, GA2-026  
**Files:** Various  
**Effort:** 10 min

**What to do:**
1. Concurrent edit: "Single-user desktop app — no optimistic locking needed. Last write wins."
2. Group delete + active snooze: "Snooze survives — it references AlarmId, not GroupId"
3. Gradual volume after snooze: "Restarts from 10% — same as initial fire"
4. Auto-dismiss + snooze count: "Auto-dismiss clears snooze state; counted as AutoDismissed event type"

---

### Tier 4: Low — Cosmetic & Minor (🟢)

---

#### Task 25: Minor cosmetic fixes

**Resolves:** GA1-008, GA1-017, GA1-018, GA1-024, GA2-014, GA2-015, GA2-016, GA2-017, GA2-032, GA2-033, GA2-034, GA2-035, GA2-038, GA3-011, GA3-017, GA3-019, GA3-027, GA3-028, GA3-029, GA4-010, GA4-013, GA4-021  
**Files:** Various  
**Effort:** 30 min total

**What to do:**
1. Replace `"Interval"` / `"Cron"` strings with enum references in `02-alarm-scheduling.md`
2. Define ambient sound IDs in `11-sleep-wellness.md`
3. Fix duplicate `ExportImport` in `03-file-structure.md` component hierarchy
4. Add alarm sort secondary sort rule (by `AlarmId` for stability)
5. Define alarm countdown boundary display ("0 minutes" → hide minutes, no seconds)
6. Define `ExportImport` rendering context (button in Settings that opens modal dialog)
7. All other Low-severity items

---

## Effort Summary

| Tier | Tasks | Total Effort | Issues Resolved | AI Risk Reduction |
|------|:-----:|:------------:|:---------------:|:-----------------:|
| 🔴 Tier 1 (Critical) | 7 | ~65 min | 22 | ~27% |
| 🟠 Tier 2 (High) | 9 | ~130 min | 30 | ~36% |
| 🟡 Tier 3 (Medium) | 8 | ~120 min | 28 | ~25% |
| 🟢 Tier 4 (Low) | 1 | ~30 min | 22 | ~12% |
| **Total** | **25** | **~345 min (~5.75 hrs)** | **~90** | **100%** |

---

## Execution Plan

| Session | Tasks | Time | Cumulative Risk Reduction |
|---------|-------|------|:-------------------------:|
| Session 1 | Tasks 1–7 (all Critical) | ~65 min | 27% |
| Session 2 | Tasks 8–11 (High — structural) | ~75 min | 48% |
| Session 3 | Tasks 12–16 (High — features) | ~55 min | 63% |
| Session 4 | Tasks 17–21 (Medium — code quality) | ~80 min | 81% |
| Session 5 | Tasks 22–25 (Medium/Low — polish) | ~70 min | 100% |

**Recommended approach:** Execute Sessions 1–3 first (3.25 hrs) to eliminate all Critical and High issues, reducing AI failure rate from ~25% to ~8%.

---

## Post-Fix Verification

After each session, run:

1. **Cross-reference check:** `grep -rn "CreateAlarmPayload\|UpdateAlarmPayload"` — verify all references match the new definitions
2. **IPC registry completeness:** Count commands in `06-tauri-architecture.md` vs sum of all feature spec IPC tables
3. **Error swallowing check:** `grep -rn "\.ok();\|_ => {}"` — should return only documented exemptions
4. **Consistency report update:** Regenerate `99-consistency-report.md` for both folders

---

## Cumulative Gap Analysis Summary

| Phase | Scope | Issues | Status |
|-------|-------|:------:|--------|
| Phase 1 | Structural & Foundational Alignment | 29 | ✅ Complete |
| Phase 2 | Content Completeness | 38 (30 after Phase 3 revisions) | ✅ Complete |
| Phase 3 | AI Failure Risk | 31 | ✅ Complete |
| Phase 4 | Deep Code Sample Audit | 27 | ✅ Complete |
| Phase 5 | Atomic Fix Tasks & Prioritization | 25 tasks covering ~90 issues | ✅ Complete (this document) |
| **Total unique issues** | | **~90** | **All categorized into 25 fix tasks** |

---

*Gap Analysis Phase 5 — created: 2026-04-10*
