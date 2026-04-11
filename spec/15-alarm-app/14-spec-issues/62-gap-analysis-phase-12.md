# Gap Analysis — Phase 12

**Version:** 1.0.0  
**Date:** 2026-04-11  
**Auditor:** AI  
**Scope:** Post-Phase 11B + OS Service Layer integration — structural consistency, field/column contradictions, polling interval conflicts, missing sections, registration gaps  
**Previous:** Phase 11 (10 issues, 10 resolved)

---

## Audit Summary

| Dimension | Score | Notes |
|-----------|-------|-------|
| Structural Consistency | 93/100 | OS service layer missing from indexes, cheat sheet, consistency report |
| Foundational Alignment | 88/100 | 13-os-service-layer.md contradicts data model on 3 column names + introduces undefined terms |
| Content Completeness | 95/100 | OS service layer missing Keywords/Scoring sections; 2 feature specs missing Edge Cases |
| AI Failure Risk | ~12% | Up from ~3% in Phase 11 — OS service layer field mismatches are high-risk |

**Overall Assessment:** The v3.0.0 RC feature specs (01–17) remain in excellent shape. However, the newly added `13-os-service-layer.md` introduces **critical contradictions** with the canonical data model. The OS service layer uses `Status`, `DueTime`, and `RecurrenceRule` — none of which exist in the Alarms table. It also specifies an 800ms polling interval while `03-alarm-firing.md` specifies 30 seconds. These will cause direct AI implementation failure if not resolved.

---

## Phase Plan

| Phase | Scope | Issue Count |
|-------|-------|:-----------:|
| **Phase 12A** (this document) | Findings and classification | 16 |
| **Phase 12B** (on "next") | Execute all fixes | 16 |

---

## Findings

### Category 1: OS Service Layer vs Data Model Contradictions (3 issues)

#### GA12-001 — OS service layer uses `Status` column — does not exist in Alarms table
- **Severity:** 🔴 Critical
- **Finding:** `13-os-service-layer.md` uses `Status = 'Pending'`, `Status = 'Dismissed'` in SQL queries (lines 342, 360, 462, 463, 464, 544, 577) and the index `IdxAlarmsStatusDue ON Alarms(Status, DueTime)`. The canonical Alarms table in `01-data-model.md` has **no `Status` column**. Alarms use `IsEnabled` (boolean) + `NextFireTime` (timestamp) + `DeletedAt` (soft delete) for state management.
- **Risk:** 🔴 Critical — AI will generate SQL with a non-existent column, causing runtime crashes.
- **Fix:** Replace all `Status = 'Pending'` references with `IsEnabled = 1 AND NextFireTime <= ?1 AND DeletedAt IS NULL`. Replace `Status = 'Dismissed'` with soft-delete pattern. Update the index to match `IdxAlarms_NextFireTime` from data model.

#### GA12-002 — OS service layer uses `DueTime` column — actual column is `NextFireTime`
- **Severity:** 🔴 Critical
- **Finding:** `13-os-service-layer.md` references `DueTime` 9 times (lines 343, 344, 359, 360, 376, 382, 462, 544, 577, 822). The canonical Alarms table uses `NextFireTime`. The data model explicitly documents `NextFireTime` computation rules (lines 1102–1139).
- **Risk:** 🔴 Critical — same as GA12-001. Column doesn't exist.
- **Fix:** Replace all `DueTime` references with `NextFireTime` throughout `13-os-service-layer.md`.

#### GA12-003 — OS service layer uses `RecurrenceRule` — undefined term
- **Severity:** 🟡 Medium
- **Finding:** Line 359: "Compute next DueTime from RecurrenceRule". The data model uses `RepeatType` + `RepeatDaysOfWeek` + `RepeatIntervalMinutes` + `RepeatCronExpression` — there is no single `RecurrenceRule` field or struct.
- **Risk:** Medium — AI will search for a `RecurrenceRule` type that doesn't exist.
- **Fix:** Replace with "Compute next `NextFireTime` from `RepeatType` + repeat fields (see `02-alarm-scheduling.md`)".

---

### Category 2: Polling Interval Contradiction (1 issue)

#### GA12-004 — OS service layer says 800ms polling; firing spec says 30-second interval
- **Severity:** 🔴 Critical
- **Finding:** `13-os-service-layer.md` specifies 800ms polling interval with detailed justification table. `03-alarm-firing.md` specifies 30-second check interval (lines 96, 308, 681, 689, 693). The 30s interval was already standardized across the spec in earlier phases (Phase 7 fixed this from 1s to 30s).
- **Risk:** 🔴 Critical — AI will implement conflicting intervals depending on which spec it reads first.
- **Fix:** Align `13-os-service-layer.md` to use 30-second interval, matching `03-alarm-firing.md`. Update the justification table. Add a cross-reference note.

---

### Category 3: OS Service Layer Missing Standard Sections (2 issues)

#### GA12-005 — `13-os-service-layer.md` missing Keywords section
- **Severity:** 🟡 Medium
- **Finding:** All 13 fundamentals and 17 feature specs have a `## Keywords` section. The new `13-os-service-layer.md` does not.
- **Fix:** Add Keywords section: `background-service`, `polling-engine`, `tray-icon`, `notifications`, `auto-start`, `wake-sleep`, `launchagent`, `daemon`

#### GA12-006 — `13-os-service-layer.md` missing Scoring section
- **Severity:** 🟡 Medium
- **Finding:** All other spec files have a `## Scoring` table with standardized criteria (Version present, Keywords present, Cross-References present, etc.). The new OS service layer does not.
- **Fix:** Add Scoring table matching the standard format.

---

### Category 4: Registration / Index Gaps (4 issues)

#### GA12-007 — `13-os-service-layer.md` not listed in fundamentals `00-overview.md`
- **Severity:** 🟡 Medium
- **Finding:** The fundamentals overview lists files 01–12 but not the new file 13. AI agents using the overview as a reading guide will miss the OS service layer entirely.
- **Fix:** Add entry: `| 13 | 13-os-service-layer.md | 2.0.0 | Background service behavior — auto-start, polling engine, tray, notifications, wake/sleep |`

#### GA12-008 — `13-os-service-layer.md` not listed in fundamentals `99-consistency-report.md`
- **Severity:** 🟡 Medium
- **Finding:** The consistency report file inventory lists 14 files (00–12 + 97) but not file 13.
- **Fix:** Add to File Inventory table and update sequential numbering check.

#### GA12-009 — `13-os-service-layer.md` not referenced in `13-ai-cheat-sheet.md`
- **Severity:** 🟡 Medium
- **Finding:** The cheat sheet's "Spec File Quick Reference" table doesn't include the OS service layer. This is the primary navigation document for AI agents.
- **Fix:** Add row: `| OS service layer, polling, tray, notifications | 01-fundamentals/13-os-service-layer.md |`

#### GA12-010 — `13-os-service-layer.md` not referenced in `11-atomic-task-breakdown.md`
- **Severity:** 🟡 Medium
- **Finding:** The atomic task breakdown references `06-tauri-architecture-and-framework-comparison.md` for system tray (task 51) and notifications (task 52) but not `13-os-service-layer.md`, which is now the authoritative spec for both.
- **Fix:** Update tasks 51 and 52 to reference `13-os-service-layer.md` as the primary spec.

---

### Category 5: OS Service Layer Internal Issues (3 issues)

#### GA12-011 — `get_auto_start_status` IPC command not in IPC registry
- **Severity:** 🟡 Medium
- **Finding:** `13-os-service-layer.md` defines `set_auto_start` and `get_auto_start_status` commands (lines 503, 514) but these are not registered in the IPC command table in `06-tauri-architecture-and-framework-comparison.md`.
- **Fix:** Add both commands to the IPC registry.

#### GA12-012 — OS service layer says "no snooze limit" contradicting data model's `MaxSnoozeCount`
- **Severity:** 🟡 Medium
- **Finding:** Line 775: "User snoozes 100 times — `SnoozeCount` increments; no limit enforced (v1)". But `01-data-model.md` defines `MaxSnoozeCount` (0–10, default 3) and `04-snooze-system.md` enforces snooze limits.
- **Risk:** AI will implement conflicting snooze limit logic.
- **Fix:** Update edge case to: "User snoozes up to `MaxSnoozeCount` times — enforced by snooze system (see `04-snooze-system.md`)".

#### GA12-013 — OS service layer uses `SnoozeDuration` instead of `SnoozeDurationMin`
- **Severity:** 🟢 Low
- **Finding:** Line 462: `DueTime += SnoozeDuration`. The canonical field name is `SnoozeDurationMin` (data model line 353).
- **Fix:** Update to `SnoozeDurationMin`.

---

### Category 6: Feature Spec Gaps (3 issues)

#### GA12-014 — `03-alarm-firing.md` missing Edge Cases section header
- **Severity:** 🟢 Low
- **Finding:** `03-alarm-firing.md` has edge case content inline (auto-dismiss, multi-alarm queue) but no formal `## Edge Cases` section header. The consistency report marks it as having edge cases, but the `grep` for `## Edge Cases` returns 0.
- **Risk:** Low — content exists but formatting is inconsistent.
- **Fix:** Add `## Edge Cases` section header above the existing edge case content, or consolidate into a table.

#### GA12-015 — `07-alarm-groups.md` missing Edge Cases section
- **Severity:** 🟢 Low
- **Finding:** `07-alarm-groups.md` has no `## Edge Cases` section. Group edge cases (delete group with active alarms, toggle group during alarm firing, nested groups) are not documented.
- **Fix:** Add Edge Cases table with group-specific scenarios.

#### GA12-016 — `02-features/99-consistency-report.md` says "Edge Cases tables in P0/P1 feature specs ✅ (10/17)" but `03-alarm-firing.md` and `07-alarm-groups.md` are missing
- **Severity:** 🟢 Low
- **Finding:** The consistency report claims 10/17 feature specs have Edge Cases tables. But `03-alarm-firing.md` (P0) and `07-alarm-groups.md` (P1) don't have formal `## Edge Cases` sections, which means the count may be inaccurate.
- **Fix:** After adding Edge Cases to 03 and 07, update count to 12/17.

---

## AI Failure Risk Assessment

| Risk Area | Current State | Estimated Failure Probability |
|-----------|--------------|------------------------------|
| Core CRUD + Scheduling | Fully specified | <1% |
| OS service layer SQL queries | 3 non-existent columns referenced | ~90% (will crash) |
| Polling interval | 800ms vs 30s contradiction | ~50% (depends on read order) |
| Snooze limit enforcement | Contradicts data model | ~30% |
| Service layer discovery | Missing from 4 indexes | ~15% (AI may skip spec) |
| All other areas | Fully specified | <2% |
| **Overall weighted** | | **~12%** |

---

## Issue Summary Table

| ID | Severity | Category | Description |
|----|----------|----------|-------------|
| GA12-001 | 🔴 Critical | Data model | `Status` column doesn't exist in Alarms — OS service layer references it 7 times |
| GA12-002 | 🔴 Critical | Data model | `DueTime` column doesn't exist — actual is `NextFireTime` (9 references) |
| GA12-003 | 🟡 Medium | Data model | `RecurrenceRule` undefined — actual fields are `RepeatType` + repeat columns |
| GA12-004 | 🔴 Critical | Contradiction | 800ms vs 30s polling interval between OS service layer and firing spec |
| GA12-005 | 🟡 Medium | Structure | Missing Keywords section in OS service layer |
| GA12-006 | 🟡 Medium | Structure | Missing Scoring section in OS service layer |
| GA12-007 | 🟡 Medium | Registration | Not in fundamentals overview |
| GA12-008 | 🟡 Medium | Registration | Not in fundamentals consistency report |
| GA12-009 | 🟡 Medium | Registration | Not in AI cheat sheet |
| GA12-010 | 🟡 Medium | Registration | Not in atomic task breakdown |
| GA12-011 | 🟡 Medium | IPC | `set_auto_start` and `get_auto_start_status` not in IPC registry |
| GA12-012 | 🟡 Medium | Contradiction | "No snooze limit" contradicts `MaxSnoozeCount` in data model |
| GA12-013 | 🟢 Low | Naming | `SnoozeDuration` should be `SnoozeDurationMin` |
| GA12-014 | 🟢 Low | Structure | `03-alarm-firing.md` missing formal `## Edge Cases` header |
| GA12-015 | 🟢 Low | Structure | `07-alarm-groups.md` missing Edge Cases section |
| GA12-016 | 🟢 Low | Accuracy | Consistency report edge case count needs update |

---

## Summary

| Severity | Count |
|----------|:-----:|
| 🔴 Critical | 3 |
| 🟡 Medium | 9 |
| 🟢 Low | 4 |
| **Total** | **16** |

---

## Remaining Tasks

When you say **next**, Phase 12B will execute all 16 fixes:

1. Replace `Status` with `IsEnabled`/`DeletedAt` pattern in OS service layer (GA12-001)
2. Replace `DueTime` with `NextFireTime` throughout OS service layer (GA12-002)
3. Replace `RecurrenceRule` with actual field references (GA12-003)
4. Align polling interval to 30 seconds (GA12-004)
5. Add Keywords section to OS service layer (GA12-005)
6. Add Scoring section to OS service layer (GA12-006)
7. Add OS service layer to fundamentals overview (GA12-007)
8. Add OS service layer to fundamentals consistency report (GA12-008)
9. Add OS service layer to AI cheat sheet (GA12-009)
10. Update atomic task breakdown references (GA12-010)
11. Add `set_auto_start` + `get_auto_start_status` to IPC registry (GA12-011)
12. Fix snooze limit contradiction (GA12-012)
13. Fix `SnoozeDuration` → `SnoozeDurationMin` (GA12-013)
14. Add Edge Cases header to `03-alarm-firing.md` (GA12-014)
15. Add Edge Cases table to `07-alarm-groups.md` (GA12-015)
16. Update consistency report edge case count (GA12-016)

```
Do you understand? Can you please do that?
```

---

*Gap Analysis Phase 12 — 2026-04-11*
