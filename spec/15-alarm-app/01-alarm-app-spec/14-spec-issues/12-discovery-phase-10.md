# Discovery Phase 10 — Deep Cross-File Audit (Post-Naming Fixes)

**Generated:** 2026-04-10  
**Scope:** Full cross-file consistency, stale data, schema contradictions, AI handoff risks  
**Approach:** Read every file in `03-app-issues/`, `01-fundamentals/`, `02-features/`, and root-level docs. Focus on issues beyond naming (logic, staleness, contradictions, missing content).

---

## Summary

**Total new issues found:** 18  
- **Stale data / version mismatches:** 5  
- **Schema contradictions:** 3  
- **Cross-reference issues:** 2  
- **Remaining naming violations (app-issues):** 3  
- **AI handoff risks / ambiguity:** 5  

---

## Category A: Stale Data & Version Mismatches (Critical for AI)

### D10-001: `00-overview.md` line 122 — Spec Issues count is stale
**Severity:** 🔴 Critical  
**Problem:** Module Inventory says `14 | [Spec Issues] ... 95 issues found, 77 resolved` — actual count is **136 found, 136 resolved (0 open)**.  
**Impact:** AI reads overview first. Stale count gives false impression spec has unresolved problems.

### D10-002: `10-ai-handoff-readiness-report.md` line 87 — `01-data-model.md` version listed as 1.6.0
**Severity:** 🟡 Medium  
**Problem:** Actual file version is **1.7.0**. Version mismatch in the readiness report coverage matrix.

### D10-003: `10-ai-handoff-readiness-report.md` line 103 — `03-alarm-firing.md` version listed as 1.5.0
**Severity:** 🟡 Medium  
**Problem:** Actual file version is **1.7.0**. Two major versions behind in the readiness report.

### D10-004: `10-ai-handoff-readiness-report.md` line 89 — `03-file-structure.md` version listed as 1.4.0
**Severity:** 🟡 Medium  
**Problem:** Actual file version is **1.5.0**. Version mismatch.

### D10-005: `10-ai-handoff-readiness-report.md` — Does not reference 136 spec issues
**Severity:** 🟡 Medium  
**Problem:** Report only references the 43 app-issues as the total issue count. The 136 spec-quality issues (naming, contradictions, logic) in `14-spec-issues/` are not mentioned. Gives an incomplete picture of spec maturity.

---

## Category B: Schema Contradictions (Will Cause Build Failures)

### D10-006: `03-file-structure.md` lines 294+312, 295+313 — Duplicate Cargo.toml dependencies
**Severity:** 🔴 Critical  
**Problem:** `rusqlite` declared on line 294 AND line 313. `refinery` declared on line 295 AND line 312. Cargo.toml with duplicate `[dependencies]` keys causes a build error.  
**Fix:** Remove duplicate entries (lines 312-313).

### D10-007: `01-data-model.md` lines 287-290 — Settings table missing `ValueType` column
**Severity:** 🔴 Critical  
**Problem:** The SQL schema for `Settings` only defines `Key TEXT PRIMARY KEY` and `Value TEXT NOT NULL`. But DB-SETTINGS-001 resolution (in `04-database-issues.md`) explicitly added a `ValueType` column. The canonical schema contradicts the fix.  
**Impact:** AI will create the table without `ValueType`, breaking the `get_setting<T>()` typed helper that depends on it.

### D10-008: `01-data-model.md` line 89 — Rust struct comment says `alarms` table (lowercase)
**Severity:** 🟡 Medium  
**Problem:** `/// Rust struct mapping the \`alarms\` SQLite table row.` — should be `Alarms` table (PascalCase per naming convention).

---

## Category C: Cross-Reference Issues (Broken Links for AI)

### D10-009: `03-app-issues/00-overview.md` line 91 — Absolute filesystem path
**Severity:** 🟡 Medium  
**Problem:** `[AI Feasibility Analysis](/mnt/documents/alarm-app-ai-feasibility-analysis.md)` — this is a local sandbox filesystem path. Will not resolve when spec is handed off to another AI.  
**Fix:** Either include the feasibility analysis in the spec repo or note it as an external document.

### D10-010: `10-ai-handoff-readiness-report.md` line 201 — Same absolute path
**Severity:** 🟡 Medium  
**Problem:** Same `/mnt/documents/alarm-app-ai-feasibility-analysis.md` reference.  
**Fix:** Same as D10-009.

---

## Category D: Remaining Naming Violations (App Issues Files)

### D10-011: `03-app-issues/02-frontend-issues.md` line 31 — `previous_enabled` snake_case
**Severity:** 🟡 Medium  
**Problem:** "Added `previous_enabled` column" in resolution text — should be `IsPreviousEnabled` (PascalCase column name per DB convention).

### D10-012: `03-app-issues/04-database-issues.md` line 59 — `alarm_id` lowercase
**Severity:** 🟡 Medium  
**Problem:** "`alarm_id` becomes null" in prose — should reference `AlarmId` column.

### D10-013: `03-app-issues/03-backend-issues.md` line 192 — SQL uses wrong column names
**Severity:** 🟡 Medium  
**Problem:** Suggested fix SQL: `WHERE next_fire_time < now AND enabled = 1` — actual schema uses `NextFireTime` and `IsEnabled`. Although the issue is marked resolved (fix applied elsewhere), the suggested fix text remains incorrect and could confuse AI.

---

## Category E: AI Handoff Risks & Ambiguity

### D10-014: `03-file-structure.md` line 59 — `db.ts` described as "Frontend DB query helpers"
**Severity:** 🟡 Medium  
**Problem:** The entire architecture uses IPC for all DB operations. "Frontend DB query helpers" suggests direct SQLite access from the frontend, contradicting the Tauri IPC architecture. Should be renamed or clarified as "IPC query wrappers" or removed (already covered by `tauri-commands.ts`).

### D10-015: `00-overview.md` line 117 — "superseded" AI Reliability Report still listed
**Severity:** 🟢 Low  
**Problem:** Module Inventory lists `09-ai-handoff-reliability-report.md` with note "(superseded by 62-task breakdown)". If superseded, an AI may ignore the entire document, but it still contains valuable failure probability data. Needs clearer guidance: "supplementary" vs "superseded".

### D10-016: `13-ai-cheat-sheet.md` line 161 — Settings table shows 2 columns
**Severity:** 🟡 Medium  
**Problem:** Database Tables section says `Settings (2, key-value)` — but if D10-007 is fixed and `ValueType` column is added, this should be `Settings (3)`.

### D10-017: `01-fundamentals/01-data-model.md` line 364 — `AutoLaunch` setting type is string boolean
**Severity:** 🟢 Low  
**Problem:** `AutoLaunch | "true" | "false"` stored as string. But the `get_setting<T>()` helper with `ValueType` column should handle this as actual boolean type `"boolean"`. The Settings Keys table shows string representations while the DB-SETTINGS-001 fix adds typed access. Potential confusion about which pattern to use.

### D10-018: `10-ai-handoff-readiness-report.md` line 91 — `05-platform-strategy.md` marked ⚠️ Legacy
**Severity:** 🟢 Low  
**Problem:** File is marked "Legacy — superseded by Tauri architecture doc" but still counted in the 10 fundamentals docs. AI may waste time reading a superseded document. Should either be archived or have a clear "SUPERSEDED" banner at the top.

---

## Updated Totals (Including Discovery Phase 10)

| Status | Previous | New | Total |
|--------|:--------:|:---:|:-----:|
| Total issues | 136 | 18 | **154** |
| Open | 0 | 10 | **10** |
| Resolved | 136 | 8 | **144** |

---

## Proposed Fix Phases

| Phase | Issues | Files | Description |
|-------|--------|-------|-------------|
| **Fix 40** | D10-001, D10-005 | `00-overview.md`, `10-ai-handoff-readiness-report.md` | Update stale counts and add spec-issues reference |
| **Fix 41** | D10-002–004 | `10-ai-handoff-readiness-report.md` | Update version numbers in readiness report |
| **Fix 42** | D10-006 | `03-file-structure.md` | Remove duplicate Cargo.toml entries |
| **Fix 43** | D10-007, D10-016 | `01-data-model.md`, `13-ai-cheat-sheet.md` | Add `ValueType` to Settings schema, update column count |
| **Fix 44** | D10-008, D10-011–013 | `01-data-model.md`, `02-frontend-issues.md`, `04-database-issues.md`, `03-backend-issues.md` | Fix remaining naming violations |
| **Fix 45** | D10-009–010 | `03-app-issues/00-overview.md`, `10-ai-handoff-readiness-report.md` | Fix broken cross-references |
| **Fix 46** | D10-014–015, D10-017–018 | `03-file-structure.md`, `00-overview.md`, `01-data-model.md`, `05-platform-strategy.md` | Resolve ambiguity and clarity issues |
