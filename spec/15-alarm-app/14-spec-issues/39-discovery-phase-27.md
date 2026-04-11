# Discovery Phase 27 — Post-Fix Regression Scan

**Version:** 1.0.0  
**Created:** 2026-04-10  
**Phase Type:** Regression verification after 69-issue fix cycle (Phases 22–26)  
**Issues Found:** 12 (2 Critical, 7 Medium, 3 Low)

---

## Summary

Regression scan after the user reported fixing all 69 open issues from Discovery Phases 22–26. Found that **stale metrics were not updated** across 4 root-level files, and **several Phase 22–26 issues remain unfixed** in the actual spec files. The `14-spec-issues/00-overview.md` itself still shows 69 open.

---

## Issues

### P27-001 — Stale "315" Metrics Across Root Files (Critical)

- **Files:** `00-overview.md`, `10-ai-handoff-readiness-report.md`, `99-consistency-report.md`
- **Problem:** All three files still reference "315 issues" when the true total is 384. The readiness report claims "21 discovery phases and 40 fix phases" — actual is 26 discovery phases.
- **Occurrences:**
  - `00-overview.md:4` — "All 315 Spec Quality Issues Resolved"
  - `00-overview.md:118` — "315/315 issues resolved"
  - `00-overview.md:122` — "315/315 issues resolved across 21 discovery + 40 fix phases"
  - `10-ai-handoff-readiness-report.md:7,19,26,27,62,69,167,213` — all say 315
  - `99-consistency-report.md:17,50` — says 315/315
- **Severity:** 🔴 Critical — AI will read wrong total, believe no further issues exist
- **Status:** ⬜ Open

### P27-002 — Spec Issues Overview Still Shows 69 Open (Critical)

- **File:** `14-spec-issues/00-overview.md`
- **Problem:** Lines 50–54 still show Phases 22–26 with open counts (18, 11, 13, 15, 12). Lines 66–67 show "Open: 69, Resolved: 315". If user fixed all 69, this file should show 384/384 resolved with 0 open.
- **Severity:** 🔴 Critical — contradicts the claim that all issues are resolved
- **Status:** ⬜ Open

### P27-003 — `is_day_excluded` Negative Boolean Still Present (Medium)

- **File:** `02-features/03-alarm-firing.md:120`
- **Problem:** Code sample still uses `repeat.is_day_excluded(weekday_num as u8)`. This was flagged as P25-002 (negative boolean violates coding guidelines). Should be `is_day_included` with inverted logic, or `is_active_day`.
- **Severity:** 🟡 Medium
- **Status:** ⬜ Open

### P27-004 — IPC Name Mismatch: `get_next_alarm` vs `get_next_alarm_time` (Medium)

- **Files:** `06-tauri-architecture.md:118` vs `02-features/08-clock-display.md:88`
- **Problem:** Architecture says `get_next_alarm` → `NextAlarmInfo | null`. Feature spec says `get_next_alarm_time` → `{ NextFireTime, AlarmLabel }`. Different name AND different return type. Was flagged as P26-004.
- **Severity:** 🟡 Medium
- **Status:** ⬜ Open

### P27-005 — Orphaned `cancel_snooze` and `reorderAlarms` Still Present (Medium)

- **File:** `06-tauri-architecture.md:107,186`
- **Problem:** `cancel_snooze` IPC command defined in architecture but no feature spec specifies it. `reorderAlarms` in AlarmStore has no backend IPC. Were flagged as P26-010, P26-011.
- **Severity:** 🟡 Medium
- **Status:** ⬜ Open

### P27-006 — Magic Strings in Acceptance Criteria (Medium)

- **Files:** `02-alarm-scheduling.md:68,134`, `02-features/97-acceptance-criteria.md:36`
- **Problem:** Acceptance criteria use `Type = "once"`, `Type = "weekly"` instead of `Type = RepeatType.Once`, `Type = RepeatType.Weekly`. Were flagged as P25-003.
- **Severity:** 🟡 Medium
- **Status:** ⬜ Open

### P27-007 — Magic String Comments in Data Model (Medium)

- **File:** `01-data-model.md:328-330`
- **Problem:** Comments say `// for "weekly" type`, `// For "interval" type`, `// For "cron" type` — should reference enum variants.
- **Severity:** 🟡 Medium
- **Status:** ⬜ Open

### P27-008 — Magic String "missed" in i18n Keys (Low)

- **File:** `03-file-structure.md:184`
- **Problem:** i18n translation key `"missed": "Missed Alarm"`. This is a JSON key, not a code comparison, so likely exempt. Documenting for completeness.
- **Severity:** 🟢 Low — i18n keys are string-by-nature
- **Status:** ⬜ Open (likely exempt)

### P27-009 — Changelog Missing v2.6.0 Entry (Medium)

- **File:** `98-changelog.md`
- **Problem:** No v2.6.0 entry documenting the fix of 69 issues from Phases 22–26. Changelog header still says v2.5.0.
- **Severity:** 🟡 Medium
- **Status:** ⬜ Open

### P27-010 — Readiness Report Phase/Fix Counts Stale (Medium)

- **File:** `10-ai-handoff-readiness-report.md`
- **Problem:** Says "21 discovery phases and 40 fix phases (1–20, A–S)". Actual: 26 discovery phases. Fix phases for 22–26 not listed. Severity counts (72 Critical, 196 Medium, 43 Low = 311) don't add to 315 or 384.
- **Severity:** 🟡 Medium — already captured in P27-001 but scope is broader
- **Status:** ⬜ Open

### P27-011 — Cheat Sheet Alarms Column Count May Be Stale (Low)

- **File:** `13-ai-cheat-sheet.md:209`
- **Problem:** Says "Alarms (22 columns)". Was flagged in P25-010 as possibly wrong (should be 26). Needs verification against actual data model schema.
- **Severity:** 🟢 Low
- **Status:** ⬜ Open

### P27-012 — Test Strategy Magic String in Test Description (Low)

- **File:** `09-test-strategy.md:230`
- **Problem:** Test comment says `check for "fired" + "dismissed" events` — these are test descriptions, not code comparisons. Likely exempt.
- **Severity:** 🟢 Low — test descriptions are prose
- **Status:** ⬜ Open (likely exempt)

---

## Tally

| Severity | Count |
|----------|:-----:|
| 🔴 Critical | 2 |
| 🟡 Medium | 7 |
| 🟢 Low | 3 |
| **Total** | **12** |

---

## Root Cause Analysis

**Why are these issues still present?** The user reported fixing all 69 issues from Phases 22–26, but:

1. **Stale metrics files were not updated** — the most common recurring pattern. Every time issues are resolved, `00-overview.md`, `10-ai-handoff-readiness-report.md`, `99-consistency-report.md`, and `14-spec-issues/00-overview.md` must all be updated simultaneously.

2. **Some Phase 22–26 issues may not have been actually fixed** — `is_day_excluded`, IPC name mismatch, orphaned commands, and magic strings in acceptance criteria are still present in the files, suggesting either:
   - The fixes were applied to different files than expected
   - The issues were marked resolved but the underlying code wasn't changed
   - The fixes were partial

3. **No verification step** — after claiming fixes complete, no grep/search was run to confirm the issues no longer exist in the actual files.

---

*Discovery Phase 27 — Regression Scan — 2026-04-10*
