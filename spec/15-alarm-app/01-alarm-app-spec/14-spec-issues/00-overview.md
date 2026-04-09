# Spec Issues — Overview

**Version:** 1.0.0  
**Updated:** 2026-04-09

---

## Purpose

This folder tracks all specification quality issues found during the deep audit of the Alarm App spec. Issues are categorized, prioritized, and resolved phase-by-phase.

---

## Issue Categories

| # | File | Category | Issue Count | Status |
|---|------|----------|:-----------:|--------|
| 1 | `01-naming-violations.md` | Naming & Convention Violations | 11 | 🔴 Open |
| 2 | `02-internal-contradictions.md` | Contradictions Between Files | 7 | 🔴 Open |
| 3 | `03-structural-issues.md` | Folder/File Structure Problems | 5 | 🔴 Open |
| 4 | `04-content-gaps.md` | Missing Content & Incomplete Specs | 6 | 🔴 Open |
| 5 | `05-ai-handoff-risks.md` | Issues That Will Cause AI Failure | 4 | 🔴 Open |

---

## Audit Progress

| Phase | Description | Status |
|-------|-------------|--------|
| Discovery Phase 1 | Initial structural + cross-reference scan | ✅ Done (23 issues) |
| Discovery Phase 2 | Deep feature file scan | ✅ Done (+10 issues = 33 total) |
| Discovery Phase 3 | Cross-file logic consistency | 🔴 Pending |
| Discovery Phase 4 | Coding guideline compliance check | 🔴 Pending |
| Fix phases | TBD after all discovery complete | 🔴 Pending |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Naming Conventions | `spec/01-spec-authoring-guide/02-naming-conventions.md` |
| PascalCase Key Standard | `spec/02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/11-key-naming-pascalcase.md` |
| Database Conventions | `spec/02-coding-guidelines/03-coding-guidelines-spec/10-database-conventions/01-naming-conventions.md` |
| Boolean Principles | `spec/02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/02-boolean-principles/01-naming-prefixes.md` |
