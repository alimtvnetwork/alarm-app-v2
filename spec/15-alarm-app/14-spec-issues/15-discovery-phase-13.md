# Discovery Phase 13 — App Issues & Reference Docs Audit

**Generated:** 2026-04-10  
**Scope:** `03-app-issues/` (10 files), `15-reference/` (3 files)  
**Approach:** Cross-file consistency, stale references, naming violations, absolute paths

---

## Summary

**Total new issues found:** 3  
- **Stale references:** 1  
- **Absolute paths:** 1  
- **Incorrect count:** 1  

These folders are in good overall shape — app issues are historical records with correct resolutions, and reference docs are non-prescriptive.

---

## Issues

### D13-001: ~~`03-app-issues/00-overview.md` line 91 — Absolute local path `/mnt/documents/`~~ ✅ FIXED (Fix 59)
**Severity:** 🟡 Medium  
**Problem:** Cross-references section contains `[AI Feasibility Analysis](/mnt/documents/alarm-app-ai-feasibility-analysis.md)` — an absolute local filesystem path. Won't resolve for AI agents or anyone without access to that specific filesystem.  
**Fix:** Changed to note that it's an external document not included in the spec repo.

### D13-002: ~~`07-ux-ui-issues.md` line 69 — References `AlarmEvents.Metadata` JSON which doesn't exist~~ ✅ FIXED (Fix 59)
**Severity:** 🟡 Medium  
**Problem:** UX-CHALLENGE-001 resolution says "Solve time logged in `AlarmEvents.Metadata` JSON" but the `Metadata` column was never added to the schema. The actual column is `ChallengeSolveTimeSec` (REAL, stored in seconds).  
**Fix:** Updated to reference `AlarmEvents.ChallengeSolveTimeSec`.

### D13-003: ~~`15-reference/alarm-app-features.md` line 244 — Total says "~190+" but listed features sum to ~69~~ ✅ FIXED (Fix 59)
**Severity:** 🟢 Low  
**Problem:** Summary table lists 9 categories totaling 69 features, but the "Total" row says "~190+". This is misleading — the document only explicitly lists ~69 features.  
**Fix:** Updated total to match actual listed count.

---

## Updated Totals (Including Discovery Phase 13)

| Status | Previous | New | Total |
|--------|:--------:|:---:|:-----:|
| Total issues | 177 | 3 | **180** |
| Open | 0 | 0 | **0** |
| Resolved | 177 | 3 | **180** |

---

## Proposed Fix Phases

| Phase | Issues | Files | Description |
|-------|--------|-------|-------------|
| ~~**Fix 59**~~ | ~~D13-001, D13-002, D13-003~~ | ~~`00-overview.md`, `07-ux-ui-issues.md`, `alarm-app-features.md`~~ | ~~Fix absolute path, stale column ref, incorrect count~~ ✅ |
