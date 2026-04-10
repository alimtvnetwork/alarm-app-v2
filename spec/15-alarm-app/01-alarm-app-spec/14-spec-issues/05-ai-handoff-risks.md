# AI Handoff Risks

**Version:** 1.1.0  
**Updated:** 2026-04-10

---

## Summary

Issues specifically rated by their likelihood to cause AI execution failure during blind handoff.

---

## AH-001: No Single Source of Truth for DB Driver

**Severity:** 🔴 Critical — Guaranteed compilation failure  
**Root cause:** IC-001 (sqlx vs rusqlite contradiction)  
**Status:** ✅ Resolved — all code samples converted to `rusqlite` synchronous API

**Resolution:** See IC-001. All `sqlx` references replaced with `rusqlite` across 5 files.

**Note:** IC-009 (`tauri-plugin-sql` in architecture overview) is a related but separate issue — the dependency list still references the wrong crate.

---

## AH-002: PascalCase Mandate vs All Example Code

**Severity:** 🔴 Critical — AI will follow examples, not guidelines  
**Root cause:** NV-001 through NV-005  
**Status:** ✅ Resolved — all code examples converted to PascalCase across Fix Phases 3–14

**Resolution:** Data model fixed in Phases 3–4, feature files fixed in Phases 8–9 and 14. All code samples now use PascalCase for DB columns, TS keys, and serialized fields.

---

## AH-003: Contradictory Task Lists

**Severity:** 🟡 Medium — AI may follow wrong task order  
**Root cause:** IC-002  
**Status:** ✅ Resolved — root cause IC-002 resolved in Fix Phase 17 (94-task list marked superseded, 62-task authoritative)

---

## AH-004: Missing Serde Configuration

**Severity:** 🔴 Critical — Silent data mismatch between Rust ↔ TS  
**Root cause:** CG-004  
**Status:** ✅ Resolved — `#[serde(rename_all = "PascalCase")]` added to Rust structs in data model

**Resolution:** See NV-005. Serde rename attribute now specified on `AlarmRow` struct.

---

## Issues Found So Far: 4
## Open: 0 | Resolved: 4

---

## Overall Issue Count (All Categories)

| Category | File | Count |
|----------|------|:-----:|
| Naming Violations | `01-naming-violations.md` | 18 |
| Internal Contradictions | `02-internal-contradictions.md` | 11 |
| Structural Issues | `03-structural-issues.md` | 5 |
| Content Gaps | `04-content-gaps.md` | 12 |
| AI Handoff Risks | `05-ai-handoff-risks.md` | 4 |
| Logic Consistency | `06-logic-consistency.md` | 11 |
| UI/UX Consistency | `07-ui-ux-consistency.md` | 4 |
| Guideline Compliance | `08-guideline-compliance.md` | 12 |
| **Total Found So Far** | | **77** |

**Discovery status:** Phase 6 complete. Post-fix regression scan and deep compliance scan done.
