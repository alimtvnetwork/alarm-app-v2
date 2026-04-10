# Discovery Phase 20 — Post-Fix-N Fresh Audit

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Scope:** Fresh audit after 290/290 resolution — checking for surviving violations, regressions, stale metrics, and foundational alignment gaps

---

## Audit Checklist Applied

Checked against: PascalCase key naming, boolean principles, no magic strings, serde rename_all, DB naming conventions, enum standards, seedable config alignment, split DB awareness, IPC naming consistency, metadata completeness (Keywords, Scoring, Cross-References), stale metric references.

---

## Issues Found

### Category 1: Stale Metrics — Overview & Reports Still Say "256" Instead of "290"

> **Severity: 🟡 Medium.** The root overview, readiness report, and consistency report all reference 256 issues. The actual count is 290 (34 more from Discovery Phase 19 + Fix Phases K–N). AI reading these files will see contradictory totals.

| # | Issue ID | File | Line(s) | Problem | Fix |
|---|----------|------|---------|---------|-----|
| 1 | P20-001 | `00-overview.md` | 4 | Status says "All 256 Spec Quality Issues Resolved" | Update to 290 |
| 2 | P20-002 | `00-overview.md` | 118 | "256/256 issues resolved" in readiness report link | Update to 290/290 |
| 3 | P20-003 | `00-overview.md` | 122 | "256/256 issues resolved across 18 discovery + 29 fix phases" | Update to 290/290 across 20 discovery + 33 fix phases |
| 4 | P20-004 | `10-ai-handoff-readiness-report.md` | 7, 19, 26-27, 62, 69, 167, 203 | Multiple references to "256" throughout | Update all to 290 |
| 5 | P20-005 | `99-consistency-report.md` | 17, 38, 50 | References to "256/256" | Update to 290/290 |

---

### Category 2: IPC Command Naming Inconsistency — `get_` vs `list_`

> **Severity: 🟡 Medium.** The convention established is `list_` for collection retrieval and `get_` for single-item or settings. Two IPC commands use `get_` for collection returns, contradicting the pattern.

| # | Issue ID | File | Line | Problem | Fix |
|---|----------|------|------|---------|-----|
| 6 | P20-006 | `01-fundamentals/02-design-system.md` | 126 | `get_alarm_events` — returns collection | Change to `list_alarm_events` |
| 7 | P20-007 | `02-features/13-analytics.md` | 41 | `get_alarm_history` — returns `AlarmEvent[]` | Change to `list_alarm_history` or `list_alarm_events` |

---

### Category 3: Surviving camelCase in TypeScript Function Parameters

> **Severity: 🟢 Low.** TypeScript function parameters use camelCase per language convention (exempted). However, some inline code mixes camelCase params with PascalCase object keys in a way that could confuse AI about which convention to use where.

| # | Issue ID | File | Line | Problem | Fix |
|---|----------|------|------|---------|-----|
| 8 | P20-008 | `02-features/01-alarm-crud.md` | 229 | `function onDeleteAlarm(alarmId: string, undoToken: string, label: string)` — params are camelCase (OK per exemption) but this function directly constructs PascalCase objects. Add comment clarifying the boundary | Add `// TS params are camelCase; serialized keys are PascalCase` comment |
| 9 | P20-009 | `01-fundamentals/06-tauri-architecture*.md` | 170-173 | `deleteAlarm: (alarmId: string)` — TS interface params are camelCase (OK) but not consistently commented as exempt | Add clarifying comment once |

---

### Category 4: Missing `## Scoring` Table on 30+ Files

> **Severity: 🟡 Medium.** The `00-overview.md` files have Scoring tables, but none of the 11 fundamental specs or 16 feature specs include them. The spec authoring guide recommends Scoring tables.

| # | Issue ID | File(s) | Problem | Fix |
|---|----------|---------|---------|-----|
| 10 | P20-010 | All 11 files in `01-fundamentals/` (01–11) | Missing `## Scoring` table | Add Scoring table to each |
| 11 | P20-011 | All 16 files in `02-features/` (01–16) | Missing `## Scoring` table | Add Scoring table to each |

---

### Category 5: Missing `## Scoring` / `## Keywords` / `## Cross-References` on Utility Files

> **Severity: 🟢 Low.** Reserved files (97, 99) are utility/tracking files and may be exempt, but consistency is better.

| # | Issue ID | File | Problem | Fix |
|---|----------|------|---------|-----|
| 12 | P20-012 | `01-fundamentals/97-acceptance-criteria.md` | Missing Keywords section | Add Keywords |
| 13 | P20-013 | `01-fundamentals/99-consistency-report.md` | Missing Keywords, Cross-References | Add both |
| 14 | P20-014 | `02-features/97-acceptance-criteria.md` | Missing Keywords, Cross-References | Add both |
| 15 | P20-015 | `02-features/99-consistency-report.md` | Missing Keywords, Cross-References | Add both |

---

### Category 6: Magic Number `5000` in Undo Timer Code

> **Severity: 🟡 Medium.** The number `5000` appears 3 times in `01-alarm-crud.md` for the undo timer duration without a named constant. Per `26-magic-values-and-immutability.md`, all magic numbers must be named.

| # | Issue ID | File | Line(s) | Problem | Fix |
|---|----------|------|---------|---------|-----|
| 16 | P20-016 | `02-features/01-alarm-crud.md` | 221, 242, 244 | `5000` used 3 times for undo timeout | Define `const UNDO_TIMEOUT_MS = 5000` and reference it |

---

### Category 7: Surviving Magic String `'missed'` in Startup Sequence

> **Severity: 🔴 Critical.** One magic string literal survived all fix phases.

| # | Issue ID | File | Line | Problem | Fix |
|---|----------|------|------|---------|-----|
| 17 | P20-017 | `01-fundamentals/07-startup-sequence.md` | 270 | `Type = 'missed'` — should use `AlarmEventType::Missed` | Change to enum reference |

---

### Category 8: Missing `#[serde(rename_all = "PascalCase")]` on Platform Structs

> **Severity: 🟡 Medium.** Several Rust structs in feature specs lack serde annotations. While these may be internal-only (not serialized to frontend), the coding guidelines require serde on ALL structs.

| # | Issue ID | File | Line | Problem | Fix |
|---|----------|------|------|---------|-----|
| 18 | P20-018 | `02-features/03-alarm-firing.md` | 260 | `pub struct MacOsWakeListener` — no serde | Add if serialized, or mark `// Internal — not serialized` |
| 19 | P20-019 | `02-features/03-alarm-firing.md` | 311 | `pub struct WindowsWakeListener` — no serde | Same as above |
| 20 | P20-020 | `01-fundamentals/04-platform-constraints.md` | 197 | `pub struct IpcErrorResponse` — uses per-field rename, not rename_all | Already correct (per-field rename needed for non-PascalCase source) — EXEMPT |

---

### Category 9: Seedable Config Alignment Gap

> **Severity: 🟡 Medium.** The alarm app's Settings table uses a SQL INSERT seeding approach (documented and justified). However, it does not reference or align with the Seedable Config Architecture's `config.seed.json` pattern. While the deviation is documented with rationale, the seedable config spec's concepts (versioned config, changelog tracking, merge-on-upgrade) are not fully adopted.

| # | Issue ID | File | Problem | Fix |
|---|----------|------|---------|-----|
| 21 | P20-021 | `01-fundamentals/01-data-model.md` | Settings seeding uses SQL INSERT but doesn't implement config versioning or merge-on-upgrade from seedable config spec | Add a note explaining which seedable config concepts apply and which don't (with rationale) |

---

### Category 10: Split DB Awareness — Documented but Could Be Stronger

> **Severity: 🟢 Low.** The data model already documents why single DB was chosen over split DB. No action needed — this is informational.

| # | Issue ID | File | Problem | Status |
|---|----------|------|---------|--------|
| 22 | P20-022 | `01-fundamentals/01-data-model.md` | Split DB decision documented at line 892 | ✅ Already addressed — NO FIX NEEDED |

---

## Summary

| Severity | Count |
|----------|:-----:|
| 🔴 Critical | 1 |
| 🟡 Medium | 13 |
| 🟢 Low | 7 |
| ✅ Already OK | 1 |
| **Total (actionable)** | **21** |

---

## AI Failure Risk Assessment

| Category | Risk Level | Impact |
|----------|-----------|--------|
| Stale "256" metrics (5 issues) | **MEDIUM** | AI reads contradictory issue counts — may think spec is outdated |
| IPC naming `get_` vs `list_` (2) | **MEDIUM** | AI may use wrong command name for collections |
| Magic string `'missed'` (1) | **HIGH** | AI uses raw string instead of enum |
| Magic number `5000` (1) | **MEDIUM** | AI hardcodes 5000 in multiple places instead of constant |
| Missing Scoring tables (27 files) | **LOW** | Structural completeness — no functional impact |
| Missing serde on platform structs (2) | **LOW** | Internal structs — may not need serialization |
| Seedable config partial alignment (1) | **LOW** | Already justified — informational gap only |

---

## Fix Plan (Proposed Phases)

### Fix Phase O — Stale Metrics Update (5 issues)
**P20-001 to P20-005** (update 256→290 across overview, readiness report, consistency report)  
Files: `00-overview.md`, `10-ai-handoff-readiness-report.md`, `99-consistency-report.md`

### Fix Phase P — IPC Naming + Magic String + Magic Number (4 issues)
**P20-006, P20-007, P20-016, P20-017** (collection commands → `list_`, constant for 5000, enum for 'missed')  
Files: `02-design-system.md`, `13-analytics.md`, `01-alarm-crud.md`, `07-startup-sequence.md`

### Fix Phase Q — Scoring Tables + Utility File Metadata (31 issues)
**P20-010 to P20-015** (add Scoring tables to all 27 spec files + metadata to utility files)  
Files: All files in `01-fundamentals/` and `02-features/`

### Fix Phase R — Clarifying Comments + Serde Annotations (4 issues)
**P20-008, P20-009, P20-018, P20-019** (add boundary comments, mark internal structs)  
Files: `01-alarm-crud.md`, `06-tauri-architecture*.md`, `03-alarm-firing.md`

### Fix Phase S — Seedable Config Cross-Reference (1 issue)
**P20-021** (document which seedable config concepts apply)  
Files: `01-data-model.md`

---

*Discovery Phase 20 — created: 2026-04-10*
