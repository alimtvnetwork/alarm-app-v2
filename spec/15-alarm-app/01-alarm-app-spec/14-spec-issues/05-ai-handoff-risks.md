# AI Handoff Risks

**Version:** 1.0.0  
**Updated:** 2026-04-09

---

## Summary

Issues specifically rated by their likelihood to cause AI execution failure during blind handoff.

---

## AH-001: No Single Source of Truth for DB Driver

**Severity:** 🔴 Critical — Guaranteed compilation failure  
**Root cause:** IC-001 (sqlx vs rusqlite contradiction)  
**Status:** 🔴 Open

---

## AH-002: PascalCase Mandate vs All Example Code

**Severity:** 🔴 Critical — AI will follow examples, not guidelines  
**Root cause:** NV-001 through NV-005  
**Status:** 🔴 Open

**Problem:** Every single code example in the spec uses snake_case for DB columns and camelCase for TS. The coding guidelines say PascalCase. AI will copy examples verbatim → inconsistent with guidelines.

---

## AH-003: Contradictory Task Lists

**Severity:** 🟡 Medium — AI may follow wrong task order  
**Root cause:** IC-002  
**Status:** 🔴 Open

---

## AH-004: Missing Serde Configuration

**Severity:** 🔴 Critical — Silent data mismatch between Rust ↔ TS  
**Root cause:** CG-004  
**Status:** 🔴 Open

---

## Issues Found So Far: 4
## Open: 4 | Resolved: 0

---

## Overall Issue Count (All Categories)

| Category | File | Count |
|----------|------|:-----:|
| Naming Violations | `01-naming-violations.md` | 6 |
| Internal Contradictions | `02-internal-contradictions.md` | 4 |
| Structural Issues | `03-structural-issues.md` | 5 |
| Content Gaps | `04-content-gaps.md` | 4 |
| AI Handoff Risks | `05-ai-handoff-risks.md` | 4 |
| **Total Found So Far** | | **23** |

**Discovery status:** Phase 1 complete. Phases 2–4 pending (deep feature scan, cross-file logic, full coding guideline compliance).
