# Discovery Phase 12 — Root-Level Docs & Execution Guides Audit

**Generated:** 2026-04-10  
**Scope:** `11-atomic-task-breakdown.md`, `12-platform-and-concurrency-guide.md`, `13-ai-cheat-sheet.md`, `10-ai-handoff-readiness-report.md`, `09-ai-handoff-reliability-report.md`, `99-consistency-report.md` (root)  
**Approach:** Cross-file consistency, stale data, naming violations, AI handoff risks

---

## Summary

**Total new issues found:** 9  
- **Stale data / out-of-sync:** 4  
- **Naming violations:** 2  
- **Structural gaps:** 2  
- **Cross-file contradiction:** 1  

---

## Category A: Stale Data / Out-of-Sync

### D12-001: ~~`13-ai-cheat-sheet.md` line 161 — AlarmEvents column count says 11, should be 13~~ ✅ FIXED (Fix 54)
**Severity:** 🟡 Medium  
**Problem:** Database summary line says `AlarmEvents (11)`. Actual schema has 13 columns (includes `AlarmLabelSnapshot` and `AlarmTimeSnapshot` added per DB-ORPHAN-001).  
**Fix:** Updated to `AlarmEvents (13)`.

### D12-002: ~~`10-ai-handoff-readiness-report.md` — Multiple version numbers stale after Fix Phases 47–53~~ ✅ FIXED (Fix 55)
**Severity:** 🟡 Medium  
**Problem:** Spec Coverage Matrix lists outdated versions for 7 files that were updated in Fix Phases 47–53.  
**Fix:** Updated all 7 version numbers in the coverage matrix.

### D12-003: ~~`10-ai-handoff-readiness-report.md` line 197 — Spec Issues reference says "154 issues found, 136 resolved"~~ ✅ FIXED (Fix 55)
**Severity:** 🟡 Medium  
**Problem:** Cross-references section says `14-spec-issues/00-overview.md (154 issues found, 136 resolved)`. Actual: 177 found, 177 resolved.  
**Fix:** Updated to `(177 issues found, 177 resolved)`.

### D12-004: ~~`09-ai-handoff-reliability-report.md` lines 222–251 — "Spec Improvements Needed" lists resolved gaps as still needed~~ ✅ FIXED (Fix 56)
**Severity:** 🟡 Medium  
**Problem:** The "Spec Improvements Needed" section lists 14 gaps (6 Critical, 5 Medium, 3 Minor) — ALL of which have been addressed in spec updates.  
**Fix:** Added resolved banner: "ALL RESOLVED: Every gap listed below has been addressed in subsequent spec updates."

---

## Category B: Naming Violations

### D12-005: ~~`12-platform-and-concurrency-guide.md` lines 259, 262 — Race 5 SQL uses lowercase `alarms` table name~~ ✅ FIXED (Fix 54)
**Severity:** 🟡 Medium  
**Problem:** `UPDATE alarms SET...` — table name should be `Alarms` per PascalCase naming standard.  
**Fix:** Changed `alarms` → `Alarms` in both SQL statements.

### D12-006: ~~`12-platform-and-concurrency-guide.md` lines 419, 429 — Test code uses `alarm.id` instead of `alarm.alarm_id`~~ ✅ FIXED (Fix 54)
**Severity:** 🟡 Medium  
**Problem:** Race condition test code references `alarm.id` but the Rust struct field is `alarm_id`.  
**Fix:** Changed `alarm.id` → `alarm.alarm_id` in both test functions.

---

## Category C: Structural Gaps

### D12-007: ~~`99-consistency-report.md` (root) — Doesn't inventory all root-level files~~ ✅ FIXED (Fix 57)
**Severity:** 🟢 Low  
**Problem:** Root consistency report only inventories 2 files and 3 subfolders. Missing 5 root docs + 2 folders.  
**Fix:** Rewrote consistency report with full inventory of 7 root docs, reference folder, and 4 subfolders.

### D12-008: ~~`09-ai-handoff-reliability-report.md` — Superseded section still contains snake_case field names~~ ✅ FIXED (Fix 56)
**Severity:** 🟢 Low  
**Problem:** Though the 94-task breakdown is marked SUPERSEDED, code examples use outdated naming conventions.  
**Fix:** Added note: "Code examples below use outdated naming conventions — do not copy them."

---

## Category D: Cross-File Contradiction

### D12-009: `11-atomic-task-breakdown.md` line 7 vs `10-ai-handoff-readiness-report.md` line 186 — Estimated days differ
**Severity:** 🟢 Low  
**Problem:** Task breakdown says "20–26 days". Readiness report says "18–24 days". Minor discrepancy.  
**Fix:** Align to the task breakdown's "20–26 days" as the authoritative estimate (it has the detailed per-task breakdown).

---

## Updated Totals (Including Discovery Phase 12)

| Status | Previous | New | Total |
|--------|:--------:|:---:|:-----:|
| Total issues | 168 | 9 | **177** |
| Open | 0 | 9 | **9** |
| Resolved | 168 | 0 | **168** |

---

## Proposed Fix Phases

| Phase | Issues | Files | Description |
|-------|--------|-------|-------------|
| **Fix 54** | D12-001, D12-005, D12-006 | `13-ai-cheat-sheet.md`, `12-platform-and-concurrency-guide.md` | Fix AlarmEvents count, table name, and field name in cheat sheet + concurrency guide |
| **Fix 55** | D12-002, D12-003 | `10-ai-handoff-readiness-report.md` | Update stale version numbers and issue counts |
| **Fix 56** | D12-004, D12-008 | `09-ai-handoff-reliability-report.md` | Add resolved banners to stale sections |
| **Fix 57** | D12-007 | `99-consistency-report.md` (root) | Add full root-level file inventory |
| **Fix 58** | D12-009 | `10-ai-handoff-readiness-report.md` | Align estimated days to task breakdown |
