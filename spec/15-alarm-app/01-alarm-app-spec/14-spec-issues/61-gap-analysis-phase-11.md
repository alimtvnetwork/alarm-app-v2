# Gap Analysis — Phase 11

**Version:** 1.0.0  
**Date:** 2026-04-11  
**Auditor:** AI  
**Scope:** Post-v3.0.0 RC verification — structural consistency, broken refs, version drift, content gaps  
**Previous:** Phase 10 (14 issues, 14 resolved)

---

## Audit Summary

| Dimension | Score | Notes |
|-----------|-------|-------|
| Structural Consistency | 97/100 | 11 broken cross-references to short filename |
| Foundational Alignment | 99/100 | All patterns correct post-Phase 10 |
| Content Completeness | 98/100 | 2 missing `from_row`, 1 missing Edge Cases section |
| AI Failure Risk | ~3% | Unchanged from Phase 10 |

**Overall Assessment:** The specification is in excellent shape at v3.0.0 RC. This Phase 11 audit identifies **10 remaining issues** (0 Critical, 2 Medium, 8 Low). The most impactful finding is **11 broken cross-references** using the short filename `06-tauri-architecture.md` instead of the actual `06-tauri-architecture-and-framework-comparison.md`. These won't break AI implementation (AI reads spec content, not links) but violate the consistency standard.

---

## Phase Plan

| Phase | Scope | Issue Count |
|-------|-------|:-----------:|
| **Phase 11A** (this document) | Findings and classification | 10 |
| **Phase 11B** (on "next") | Execute all fixes | 10 |

---

## Findings

### Category 1: Broken Cross-References (1 issue, 11 occurrences)

#### GA11-001 — 11 references use short filename `06-tauri-architecture.md` instead of actual `06-tauri-architecture-and-framework-comparison.md`
- **Severity:** Medium
- **Finding:** The file was renamed to `06-tauri-architecture-and-framework-comparison.md` but 11 references across 4 files still use the old short name:
  - `10-ai-handoff-readiness-report.md` (2 refs, lines 86, 150)
  - `11-atomic-task-breakdown.md` (5 refs, lines 30, 36, 53, 164, 165)
  - `13-ai-cheat-sheet.md` (1 ref, line 232)
  - `98-changelog.md` (3 refs — historical, lines 111, 123, 583)
- **Risk:** Medium — an AI agent following links to read spec files would fail to find the file. The content is still correct, but navigation breaks.
- **Fix:** Update all 11 references to use `06-tauri-architecture-and-framework-comparison.md`. For changelog entries (historical), update to the current filename since the changelog should be navigable.

---

### Category 2: Version Drift After Phase 10 Edits (4 issues)

#### GA11-002 — `01-data-model.md` still at v1.15.0 after Phase 10 edits
- **Severity:** Low
- **Finding:** Phase 10 added 4 `FromStr` implementations, `CreatedAt` to Quotes, boolean semantic inverses for Quote + StreakCalendarDay, and IPC enum convention clarification. The version was not bumped.
- **Fix:** Bump to v1.16.0.

#### GA11-003 — `04-platform-constraints.md` still at v1.7.0 after Phase 10 edit
- **Severity:** Low
- **Finding:** Phase 10 changed `safeInvoke` signature from `Record<string, unknown>` to typed generic. Version not bumped.
- **Fix:** Bump to v1.8.0.

#### GA11-004 — `06-dismissal-challenges.md` still at v1.7.0 after Phase 10 edit
- **Severity:** Low
- **Finding:** Phase 10 added serde serialization note to `ChallengeResult.correct`. Version not bumped.
- **Fix:** Bump to v1.8.0.

#### GA11-005 — `12-smart-features.md` still at v1.5.0 after Phase 10 edits
- **Severity:** Low
- **Finding:** Phase 10 added `JsonSafeValue` type, replaced `Record<string, unknown>`, added `WebhookConfig::from_row`. Version not bumped.
- **Fix:** Bump to v1.6.0.

---

### Category 3: Missing `from_row` Implementations (2 issues)

#### GA11-006 — `Quote` struct missing `from_row` implementation
- **Severity:** Medium
- **Finding:** `AlarmRow`, `AlarmGroupRow`, `SnoozeStateRow`, `AlarmEventRow`, and `WebhookConfig` all have `from_row` implementations. `Quote` has a Rust struct but no `from_row`. Since `Quotes` is a real SQLite table (not in-memory like `AlarmSound`), AI agents implementing quote CRUD will have to invent the mapping.
- **Risk:** Medium — same issue as GA10-013 (WebhookConfig) which was fixed. Quote has 6 columns including 2 INTEGER booleans.
- **Fix:** Add `Quote::from_row` in `01-data-model.md`.

#### GA11-007 — `StreakCalendarDay` and `StreakData` have no `from_row` — clarify they're computed structs
- **Severity:** Low
- **Finding:** `StreakData` and `StreakCalendarDay` are computed from `AlarmEvents` queries, not direct table mappings. This is already noted for `StreakData` ("Computed struct — not a direct DB row") but `StreakCalendarDay` has no such note. An AI agent may wonder why there's no `from_row`.
- **Fix:** Add clarifying note to `StreakCalendarDay` Rust struct: "Computed from AlarmEvents query — no direct table, no `from_row` needed."

---

### Category 4: Missing Edge Cases Section (1 issue)

#### GA11-008 — `16-accessibility-and-nfr.md` missing Edge Cases section
- **Severity:** Low
- **Finding:** All other feature specs (including P2/P3 specs like 11-sleep-wellness, 14-personalization, 15-keyboard-shortcuts) have an Edge Cases section. `16-accessibility-and-nfr.md` does not.
- **Risk:** Low — accessibility edge cases (screen reader announcement timing, high contrast mode conflicts, keyboard trap in modals) would help AI agents implement robust a11y.
- **Fix:** Add Edge Cases table with a11y-specific scenarios.

---

### Category 5: Feature Consistency Report Version Drift (2 issues)

#### GA11-009 — Feature consistency report `02-features/99-consistency-report.md` version still v2.1.0
- **Severity:** Low
- **Finding:** The feature consistency report hasn't been bumped since Phase 6. File versions within it were updated in Phase 10 but the report's own version is stale.
- **Fix:** Bump to v2.2.0.

#### GA11-010 — Fundamentals consistency report `01-fundamentals/99-consistency-report.md` version check needed
- **Severity:** Low
- **Finding:** The fundamentals consistency report may have stale file version numbers after Phase 10 edits to `01-data-model.md` and `04-platform-constraints.md`.
- **Fix:** Verify and update file versions in the fundamentals consistency report.

---

## AI Failure Risk Assessment

| Risk Area | Current State | Estimated Failure Probability |
|-----------|--------------|------------------------------|
| Core CRUD + Scheduling | Fully specified | <1% |
| File navigation via cross-refs | 11 broken short-name refs | ~5% (if AI follows links) |
| Quote CRUD implementation | Missing `from_row` | ~8% (AI will guess correctly ~92%) |
| Accessibility implementation | Missing edge cases | ~3% |
| All other areas | Fully specified | <2% |
| **Overall weighted** | | **~3%** |

---

## Issue Summary Table

| ID | Severity | Category | Description |
|----|----------|----------|-------------|
| GA11-001 | Medium | Cross-refs | 11 broken refs to `06-tauri-architecture.md` (actual: `...and-framework-comparison.md`) |
| GA11-002 | Low | Version | `01-data-model.md` not bumped after Phase 10 edits |
| GA11-003 | Low | Version | `04-platform-constraints.md` not bumped after Phase 10 edit |
| GA11-004 | Low | Version | `06-dismissal-challenges.md` not bumped after Phase 10 edit |
| GA11-005 | Low | Version | `12-smart-features.md` not bumped after Phase 10 edits |
| GA11-006 | Medium | Completeness | `Quote` struct missing `from_row` implementation |
| GA11-007 | Low | Completeness | `StreakCalendarDay` missing "computed struct" clarification |
| GA11-008 | Low | Completeness | `16-accessibility-and-nfr.md` missing Edge Cases section |
| GA11-009 | Low | Version | Feature consistency report version stale (v2.1.0) |
| GA11-010 | Low | Version | Fundamentals consistency report file versions need refresh |

---

## Remaining Tasks

When you say **next**, Phase 11B will execute all 10 fixes:

1. Fix 11 broken `06-tauri-architecture.md` references (GA11-001)
2. Bump `01-data-model.md` to v1.16.0 (GA11-002)
3. Bump `04-platform-constraints.md` to v1.8.0 (GA11-003)
4. Bump `06-dismissal-challenges.md` to v1.8.0 (GA11-004)
5. Bump `12-smart-features.md` to v1.6.0 (GA11-005)
6. Add `Quote::from_row` implementation (GA11-006)
7. Add computed struct note to `StreakCalendarDay` (GA11-007)
8. Add Edge Cases table to `16-accessibility-and-nfr.md` (GA11-008)
9. Bump feature consistency report to v2.2.0 + refresh versions (GA11-009)
10. Refresh fundamentals consistency report versions (GA11-010)

```
Do you understand? Can you please do that?
```

---

*Gap Analysis Phase 11 — 2026-04-11*
