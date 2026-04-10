# Spec Issues — Overview

**Version:** 1.7.0  
**Updated:** 2026-04-10

---

## Purpose

This folder tracks all specification quality issues found during the deep audit of the Alarm App spec. Issues are categorized, prioritized, and resolved phase-by-phase.

---

## Issue Categories

| # | File | Category | Issue Count | Open | Resolved |
|---|------|----------|:-----------:|:----:|:--------:|
| 1 | `01-naming-violations.md` | Naming & Convention Violations | 18 | 0 | 18 |
| 2 | `02-internal-contradictions.md` | Contradictions Between Files | 11 | 3 | 8 |
| 3 | `03-structural-issues.md` | Folder/File Structure Problems | 5 | 5 | 0 |
| 4 | `04-content-gaps.md` | Missing Content & Incomplete Specs | 12 | 7 | 5 |
| 5 | `05-ai-handoff-risks.md` | Issues That Will Cause AI Failure | 4 | 1 | 3 |
| 6 | `06-logic-consistency.md` | Cross-File Logic Consistency | 11 | 4 | 7 |
| 7 | `07-ui-ux-consistency.md` | UI/UX + Frontend State Consistency | 4 | 3 | 1 |
| 8 | `08-guideline-compliance.md` | Coding Guideline Compliance | 12 | 2 | 10 |

---

## Totals

| Severity | Count |
|----------|:-----:|
| 🔴 Critical | 30 |
| 🟡 Medium | 40 |
| 🟢 Low | 7 |
| **Grand Total** | **77** |
| **Open** | **25** |
| **Resolved** | **52** |

---

## Audit Progress

| Phase | Description | Status |
|-------|-------------|--------|
| Discovery Phase 1 | Initial structural + cross-reference scan | ✅ Done (23 issues) |
| Discovery Phase 2 | Deep feature file scan | ✅ Done (+10 = 33) |
| Discovery Phase 3 | Cross-file logic consistency | ✅ Done (+12 = 45) |
| Discovery Phase 4 | UI/UX + frontend state consistency | ✅ Done (+11 = 56) |
| Discovery Phase 5 | Coding guideline compliance check | ✅ Done (+8 = 64) |
| Discovery Phase 6 | Post-fix regression + deep compliance scan | ✅ Done (+13 = 77) |
| **Fix Phase 1** | **Exemptions & decisions** | **✅ Done (4 resolved)** |
| **Fix Phase 2** | **sqlx → rusqlite** | **✅ Done (7 resolved)** |
| **Fix Phase 3** | **DB naming PascalCase** | **✅ Done (5 resolved)** |
| **Fix Phase 4** | **TS/Rust serialization keys PascalCase** | **✅ Done (9 resolved)** |
| **Fix Phase 5** | **`alarms` → `Alarms`, `settings` → `Settings` tables** | **✅ Done (2 resolved)** |
| **Fix Phase 6** | **Analytics schema + cheat sheet regressions** | **✅ Done (3 resolved)** |
| **Fix Phase 7** | **Concurrency guide regressions** | **✅ Done (2 resolved)** |
| **Fix Phase 8** | **Firing + snooze prose snake_case** | **✅ Done (1 resolved + CG-006 partial)** |
| **Fix Phase 9** | **Groups + sound prose snake_case** | **✅ Done (CG-006 partial)** |
| **Fix Phase 10** | **Architecture contradictions (`tauri-plugin-sql`, intervals, return types)** | **✅ Done (4 resolved)** |
| **Fix Phase 11** | **`get_alarms` → `list_alarms` standardization** | **✅ Done (1 resolved)** |
| **Fix Phase 12** | **Settings keys → PascalCase** | **✅ Done (1 resolved)** |
| **Fix Phase 13** | **AlarmChallenge schema gaps** | **✅ Done (3 resolved: CG-007, CG-012, LC-001)** |
| **Fix Phase 14** | **All remaining prose snake_case** | **✅ Done (CG-006 resolved)** |
| **Fix Phase 15** | **Function length decomposition** | **✅ Done (GC-001 resolved)** |

---

## Exemptions (Decided in Fix Phase 1)

| Exemption | Convention | Reason |
|-----------|-----------|--------|
| Refinery migration filenames | `V{N}__{snake_case}.sql` | Required by `refinery` crate |
| Tauri IPC command names | `snake_case` | Tauri framework convention |
| Tauri IPC event names | `kebab-case` | Tauri framework convention |
| Rust struct field names | `snake_case` | Rust language convention (serde handles serialization) |
| TS/JS function names | `camelCase` | Language convention — PascalCase for serialized keys only |

---

## Key Insights

1. ~~The `sqlx` vs `rusqlite` contradiction~~ **✅ FIXED**
2. ~~Database columns/tables/indexes/PKs snake_case~~ **✅ FIXED — all PascalCase with Is/Has booleans**
3. **22 functions exceed the 15-line limit** — linter will reject on first run.
4. **Feature files still contain snake_case/camelCase** in prose, code samples, and duplicate schemas (GC-009–012, CG-006).
5. **`06-tauri-architecture.md` has 4 contradictions** — wrong driver, wrong interval, wrong return types (IC-008–011).
6. **`02-alarm-scheduling.md` severely outdated** (v1.0.0), contradicts data model.

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Naming Conventions | `spec/01-spec-authoring-guide/02-naming-conventions.md` |
| PascalCase Key Standard | `spec/02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/11-key-naming-pascalcase.md` |
| Database Conventions | `spec/02-coding-guidelines/03-coding-guidelines-spec/10-database-conventions/01-naming-conventions.md` |
| Boolean Principles | `spec/02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/02-boolean-principles/01-naming-prefixes.md` |
| Function Length Limit | Linter CODE RED rules (max 15 lines/function) |

---

*Spec Issues — updated: 2026-04-10*
