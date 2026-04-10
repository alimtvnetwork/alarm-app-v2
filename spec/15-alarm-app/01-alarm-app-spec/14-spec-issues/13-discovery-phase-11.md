# Discovery Phase 11 — Feature Specs & Fundamentals Deep Audit

**Generated:** 2026-04-10  
**Scope:** All 17 feature specs, design system, overviews — logic gaps, contradictions, missing content, AI handoff risks  
**Approach:** Read every feature and fundamental file not deeply audited in previous phases. Focus on cross-file logic, missing IPC definitions, schema mismatches, acceptance criteria gaps.

---

## Summary

**Total new issues found:** 14  
- **Content gaps / missing spec:** 5  
- **Cross-file contradictions:** 4  
- **AI handoff risks / ambiguity:** 3  
- **Structural issues:** 2  

---

## Category A: Content Gaps / Missing Spec

### D11-001: ~~`16-accessibility-and-nfr.md` line 60 — Memory budget contradicts `04-platform-constraints.md`~~ ✅ FIXED (Fix 47)
**Severity:** 🔴 Critical  
**Problem:** NFR spec says "Idle memory usage: < 150 MB" (line 60). But `04-platform-constraints.md` defines memory budget as 200 MB. AI will see conflicting targets.  
**Fix:** Aligned to < 200 MB in NFR spec (the platform-constraints value was the deliberate revision per PERF-MEMORY-001).

### D11-002: ~~`16-accessibility-and-nfr.md` line 59 — Startup budget contradicts `07-startup-sequence.md`~~ ✅ FIXED (Fix 47)
**Severity:** 🔴 Critical  
**Problem:** NFR spec says "Startup to window visible: < 2 seconds" (line 59). But `07-startup-sequence.md` defines startup budget as <750ms. AI will target 2s instead of the tighter 750ms goal.  
**Fix:** Aligned to < 750ms (the startup-sequence value was the deliberate target per PERF-STARTUP-001).

### D11-003: ~~`16-accessibility-and-nfr.md` lines 91+97 — i18n locale path contradicts `03-file-structure.md`~~ ✅ FIXED (Fix 48)
**Severity:** 🟡 Medium  
**Problem:** NFR spec line 91 says locale files at `src/locales/{locale}.json` and line 97 shows `src/locales/`. But `03-file-structure.md` defines the path as `src/i18n/locales/`. AI will create files in the wrong directory.  
**Fix:** Updated NFR spec to use `src/i18n/locales/`.

### D11-004: `06-dismissal-challenges.md` — No IPC command definitions
**Severity:** 🟡 Medium  
**Problem:** The dismissal challenges spec defines 6 challenge types with configuration but has zero IPC command definitions. AI needs to know what Tauri commands to implement (e.g., `validate_challenge_answer`, `get_math_problem`).  
**Fix:** Add IPC Commands section with at minimum `get_challenge`, `submit_challenge_answer`.

### D11-005: `08-clock-display.md` — No IPC command or hook definitions
**Severity:** 🟡 Medium  
**Problem:** Clock display mentions `useClock` hook (line 64 of scheduling spec references it) but `08-clock-display.md` doesn't define it. Also no IPC for getting next alarm time for countdown display.  
**Fix:** Add `useClock` hook specification and reference `get_next_alarm_time` IPC.

---

## Category B: Cross-File Contradictions

### D11-006: ~~`13-analytics.md` line 93 — AlarmEvents column count says 11, actual schema has 13~~ ✅ FIXED (Fix 49)
**Severity:** 🔴 Critical  
**Problem:** Analytics spec says "Key columns: AlarmEventId, AlarmId, Type, FiredAt, DismissedAt, SnoozeCount, ChallengeType, ChallengeSolveTimeSec, SleepQuality, Mood, Timestamp" (11 columns). But `01-data-model.md` AlarmEvents table has 13 columns (adds `AlarmLabelSnapshot` and `AlarmTimeSnapshot` from DB-ORPHAN-001).  
**Fix:** Updated analytics column list to include `AlarmLabelSnapshot` and `AlarmTimeSnapshot`, updated count to 13.

### D11-007: ~~`00-overview.md` (root) line 88 — Data model overview says "Storage: SQLite database" with only 5 tables~~ ✅ FIXED (Fix 49)
**Severity:** 🟡 Medium  
**Problem:** The root overview's Data Model section lists tables as: `Alarms`, `AlarmGroups`, `Settings`, `SnoozeState`, `AlarmEvents`. This matches but the Settings description says "Key-value config" — doesn't mention `ValueType` column which was added in Fix 43. Minor but AI reading overview first gets incomplete picture.  
**Fix:** Added `with ValueType` to Settings description in overview.

### D11-008: `02-features/00-overview.md` line 6 — Updated date still says 2026-04-08
**Severity:** 🟢 Low  
**Problem:** Features overview hasn't been updated since original creation despite multiple feature spec updates in April 9-10.  
**Fix:** Update to 2026-04-10.

### D11-009: `01-fundamentals/00-overview.md` line 43 — `05-platform-strategy.md` description doesn't mention SUPERSEDED
**Severity:** 🟡 Medium  
**Problem:** Fundamentals overview describes `05-platform-strategy.md` as "Legacy platform strategy (superseded by ...)" but doesn't match the new SUPERSEDED banner we just added. Should be consistent.  
**Fix:** Update description to include "⚠️ SUPERSEDED" to match the file's banner.

---

## Category C: AI Handoff Risks / Ambiguity

### D11-010: `09-theme-system.md` — No IPC commands defined
**Severity:** 🟡 Medium  
**Problem:** Theme system describes `useTheme` hook and Settings storage but defines zero IPC commands. AI needs `get_theme`, `set_theme` IPC commands to communicate with Rust backend.  
**Fix:** Add IPC Commands section: `get_theme` → `string`, `set_theme` → `{ Theme: string }`.

### D11-011: `14-personalization.md` lines 49 — IPC commands listed inline without types
**Severity:** 🟢 Low  
**Problem:** Personalization lists `get_daily_quote`, `save_favorite_quote`, `add_custom_quote` inline without payload/return type definitions. All other feature specs use a table format for IPC commands.  
**Fix:** Add IPC Commands table with payload and return types.

### D11-012: `02-design-system.md` — Missing `destructive` token for dark mode
**Severity:** 🟡 Medium  
**Problem:** Light mode palette defines `--destructive: #c0392b` but dark mode palette has no destructive token. AI will either use the light mode red in dark mode (poor contrast) or invent one.  
**Fix:** Add `--destructive` to dark mode palette (e.g., `#e74c3c` for better visibility on dark backgrounds).

---

## Category D: Structural Issues

### D11-013: `06-dismissal-challenges.md` line 83 — `AlarmChallenge` interface not in data model
**Severity:** 🟡 Medium  
**Problem:** Dismissal challenges defines an `AlarmChallenge` interface (Type, Difficulty, ShakeCount, StepCount) that is not referenced in `01-data-model.md`. The data model uses flat fields on Alarm (`ChallengeType`, `ChallengeDifficulty`, `ChallengeShakeCount`, `ChallengeStepCount`). The interface in the challenges spec implies a nested object, but the actual schema is flat.  
**Fix:** Either remove the interface and reference the flat Alarm fields, or add a note: "This interface is a convenience wrapper — the data is stored as flat columns on the Alarms table."

### D11-014: `02-alarm-scheduling.md` line 41 — Deprecation warning for `recurringDays` field
**Severity:** 🟢 Low  
**Problem:** Deprecation notice says "The `recurringDays` field from v1.0.0 is fully replaced by `RepeatPattern`. Do not use `recurringDays`." This is good for humans but may confuse AI into thinking `recurringDays` exists somewhere and needs migration handling. Since v1.0.0 was spec-only (no code exists), the deprecation note is unnecessary noise.  
**Fix:** Replace with a simpler note: "Note: scheduling uses `RepeatPattern` exclusively. There is no legacy field."

---

## Updated Totals (Including Discovery Phase 11)

| Status | Previous | New | Total |
|--------|:--------:|:---:|:-----:|
| Total issues | 154 | 14 | **168** |
| Open | 0 | 9 | **9** |
| Resolved | 154 | 5 | **159** |

---

## Proposed Fix Phases

| Phase | Issues | Files | Description |
|-------|--------|-------|-------------|
| ~~**Fix 47**~~ | ~~D11-001, D11-002~~ | ~~`16-accessibility-and-nfr.md`~~ | ~~Align memory and startup budgets to authoritative values~~ ✅ |
| ~~**Fix 48**~~ | ~~D11-003~~ | ~~`16-accessibility-and-nfr.md`~~ | ~~Fix i18n locale path to match file-structure~~ ✅ |
| ~~**Fix 49**~~ | ~~D11-006, D11-007~~ | ~~`13-analytics.md`, `00-overview.md`~~ | ~~Fix AlarmEvents column count, Settings description~~ ✅ |
| **Fix 50** | D11-004, D11-005, D11-010 | `06-dismissal-challenges.md`, `08-clock-display.md`, `09-theme-system.md` | Add missing IPC command definitions |
| **Fix 51** | D11-008, D11-009 | `02-features/00-overview.md`, `01-fundamentals/00-overview.md` | Update stale dates and descriptions |
| **Fix 52** | D11-012, D11-013, D11-014 | `02-design-system.md`, `06-dismissal-challenges.md`, `02-alarm-scheduling.md` | Dark mode destructive token, challenge interface note, deprecation cleanup |
| **Fix 53** | D11-011 | `14-personalization.md` | Format IPC commands as standard table |
