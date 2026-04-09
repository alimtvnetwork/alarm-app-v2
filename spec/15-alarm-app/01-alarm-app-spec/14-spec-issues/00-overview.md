# Spec Issues — Overview

**Version:** 1.2.0  
**Updated:** 2026-04-09

---

## Purpose

This folder tracks all specification quality issues found during the deep audit of the Alarm App spec. Issues are categorized, prioritized, and resolved phase-by-phase.

---

## Issue Categories

| # | File | Category | Issue Count | Status |
|---|------|----------|:-----------:|--------|
| 1 | `01-naming-violations.md` | Naming & Convention Violations | 15 | 🔴 Open |
| 2 | `02-internal-contradictions.md` | Contradictions Between Files | 7 | 🔴 Open |
| 3 | `03-structural-issues.md` | Folder/File Structure Problems | 5 | 🔴 Open |
| 4 | `04-content-gaps.md` | Missing Content & Incomplete Specs | 11 | 🔴 Open |
| 5 | `05-ai-handoff-risks.md` | Issues That Will Cause AI Failure | 4 | 🔴 Open |
| 6 | `06-logic-consistency.md` | Cross-File Logic Consistency | 10 | 🔴 Open |
| 7 | `07-ui-ux-consistency.md` | UI/UX + Frontend State Consistency | 4 | 🔴 Open |

---

## Totals

| Severity | Count |
|----------|:-----:|
| 🔴 Critical | 22 |
| 🟡 Medium | 31 |
| 🟢 Low | 3 |
| **Grand Total** | **56** |

---

## Audit Progress

| Phase | Description | Status |
|-------|-------------|--------|
| Discovery Phase 1 | Initial structural + cross-reference scan | ✅ Done (23 issues) |
| Discovery Phase 2 | Deep feature file scan | ✅ Done (+10 issues = 33 total) |
| Discovery Phase 3 | Cross-file logic consistency | ✅ Done (+12 issues = 45 total) |
| Discovery Phase 4 | UI/UX + frontend state consistency | ✅ Done (+11 issues = 56 total) |
| Discovery Phase 5 | Coding guideline compliance check | 🔴 Pending |
| Fix phases | TBD after all discovery complete | 🔴 Pending |

---

## Key Insights

1. The `sqlx` vs `rusqlite` contradiction (IC-001) infects **8+ code samples** across critical paths: startup, soft-delete, DST timezone change, event purge, optimistic locking, and connection pooling.

2. **State management is the #1 frontend risk.** No React state architecture specified — AI will create inconsistent patterns.

3. **Every TS interface in every feature file uses camelCase.** The PascalCase mandate means ALL interfaces across all 16 feature files need conversion. This is systemic.

4. **`02-alarm-scheduling.md` is severely outdated** (v1.0.0) and contradicts the data model's `RepeatPattern` system.

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Naming Conventions | `spec/01-spec-authoring-guide/02-naming-conventions.md` |
| PascalCase Key Standard | `spec/02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/11-key-naming-pascalcase.md` |
| Database Conventions | `spec/02-coding-guidelines/03-coding-guidelines-spec/10-database-conventions/01-naming-conventions.md` |
| Boolean Principles | `spec/02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/02-boolean-principles/01-naming-prefixes.md` |

---

*Spec Issues — updated: 2026-04-09*
