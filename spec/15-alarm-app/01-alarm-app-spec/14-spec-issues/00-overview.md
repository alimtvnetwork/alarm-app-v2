# Spec Issues — Overview

**Version:** 1.22.0  
**Updated:** 2026-04-10

---

## Purpose

This folder tracks all specification quality issues found during the deep audit of the Alarm App spec. Issues are categorized, prioritized, and resolved phase-by-phase.

---

## Issue Categories

| # | File | Category | Issue Count | Open | Resolved |
|---|------|----------|:-----------:|:----:|:--------:|
| 1 | `01-naming-violations.md` | Naming & Convention Violations | 18 | 0 | 18 |
| 2 | `02-internal-contradictions.md` | Contradictions Between Files | 11 | 0 | 11 |
| 3 | `03-structural-issues.md` | Folder/File Structure Problems | 5 | 0 | 5 |
| 4 | `04-content-gaps.md` | Missing Content & Incomplete Specs | 12 | 0 | 12 |
| 5 | `05-ai-handoff-risks.md` | Issues That Will Cause AI Failure | 4 | 0 | 4 |
| 6 | `06-logic-consistency.md` | Cross-File Logic Consistency | 11 | 0 | 11 |
| 7 | `07-ui-ux-consistency.md` | UI/UX + Frontend State Consistency | 4 | 0 | 4 |
| 8 | `08-guideline-compliance.md` | Coding Guideline Compliance | 12 | 0 | 12 |
| 9 | `09-discovery-phase-7.md` | Discovery Phase 7 — Regression Scan | 18 | 0 | 18 |
| 10 | `10-discovery-phase-8.md` | Discovery Phase 8 — Remaining Files | 11 | 0 | 11 |
| 11 | `11-discovery-phase-9.md` | Discovery Phase 9 — Full Grep Scan | 30 | 0 | 30 |
| 12 | `12-discovery-phase-10.md` | Discovery Phase 10 — Deep Cross-File Audit | 18 | 0 | 18 |
| 13 | `13-discovery-phase-11.md` | Discovery Phase 11 — Feature Specs Deep Audit | 14 | 0 | 14 |
| 14 | `14-discovery-phase-12.md` | Discovery Phase 12 — Root-Level Docs Audit | 9 | 0 | 9 |
| 15 | `15-discovery-phase-13.md` | Discovery Phase 13 — App Issues & Reference Audit | 3 | 0 | 3 |
| 16 | `16-discovery-phase-14.md` | Discovery Phase 14 — Foundational Alignment Audit | 29 | 0 | 29 |
| 17 | `17-discovery-phase-15.md` | Discovery Phase 15 — Deep Boolean, Negation & Code Sample Audit | 13 | 0 | 13 |
| 18 | `18-discovery-phase-16.md` | Discovery Phase 16 — Test Fixtures, Cheat Sheet & Cross-Reference Audit | 12 | 0 | 12 |
| 19 | `19-discovery-phase-17.md` | Discovery Phase 17 — Execution Guides, Handoff Reports & Concurrency Audit | 12 | 0 | 12 |
| 20 | `20-discovery-phase-18.md` | Discovery Phase 18 — Changelog, Consistency Reports, Overview & Staleness Audit | 10 | 0 | 10 |
| 21 | `21-fix-phase-a-domain-enums.md` | Fix Phase A — Domain Enum Definitions | 11 resolved | 0 | 11 |
| 22 | `22-fix-phase-b-error-enums.md` | Fix Phase B — Error Enum Definitions & IPC Error Format | 2 resolved | 0 | 2 |
| 23 | `23-fix-phase-d-test-fixtures.md` | Fix Phase D — Test Fixtures & Cheat Sheet | 6 resolved | 0 | 6 |
| 24 | `24-fix-phase-c-acceptance-criteria.md` | Fix Phase C — Acceptance Criteria & IPC Key Fixes | 6 resolved | 0 | 6 |
| 25 | `25-fix-phase-g-code-patterns.md` | Fix Phase G — Code Sample Patterns & Exemptions | 12 resolved | 0 | 12 |
| 26 | `26-fix-phase-h-stale-metrics.md` | Fix Phase H — Stale Metrics Update | 15 resolved | 0 | 15 |
| 27 | `27-fix-phase-e-settings-ui-states.md` | Fix Phase E — Settings Seeding & UI States | 4 resolved | 0 | 4 |
| 28 | `28-fix-phase-f-remaining.md` | Fix Phase F — PascalCase, Atomic Tasks, Semantic Inverses & Cross-References | 13 resolved | 0 | 13 |
| 30 | `30-fix-phase-j-final-7.md` | Fix Phase J — Final 7 Issues (ARIA, 0=disabled, IPC, magic strings, exemption) | 7 resolved | 0 | 7 |
| 31 | `31-discovery-phase-19.md` | Discovery Phase 19 — Post-Completion Regression Audit | 34 | 0 | 34 |

---

## Totals

| Severity | Count |
|----------|:-----:|
| 🔴 Critical | 69 |
| 🟡 Medium | 138 |
| 🟢 Low | 41 |
| **Grand Total** | **290** |
| **Open** | **0** |
| **Resolved** | **290** |

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
| **Discovery Phase 7** | **Post-fix regression scan (Phases 16–20)** | **✅ Done (+18 = 95)** |
| **Discovery Phase 8** | **Remaining files scan** | **✅ Done (+11 = 106)** |
| **Discovery Phase 9** | **Full grep scan** | **✅ Done (+30 = 136)** |
| **Discovery Phase 10** | **Deep cross-file audit (post-naming)** | **✅ Done (+18 = 154)** |
| **Discovery Phase 11** | **Feature specs & fundamentals deep audit** | **✅ Done (+14 = 168, all fixed)** |
| **Discovery Phase 12** | **Root-level docs & execution guides audit** | **✅ Done (+9 = 177, all fixed)** |
| **Discovery Phase 13** | **App issues & reference docs audit** | **✅ Done (+3 = 180, all fixed)** |
| **Discovery Phase 14** | **Foundational alignment audit (coding guidelines, booleans, enums, split-db, seedable config)** | **✅ Done (+29 = 209, 29 open)** |
| **Discovery Phase 15** | **Deep boolean, negation & code sample audit** | **✅ Done (+13 = 222, 42 open)** |
| **Discovery Phase 16** | **Test fixtures, cheat sheet & cross-reference audit** | **✅ Done (+12 = 234, 54 open)** |
| **Discovery Phase 17** | **Execution guides, handoff reports & concurrency audit** | **✅ Done (+12 = 246, 66 open)** |
| **Discovery Phase 18** | **Changelog, consistency reports, overview & staleness audit** | **✅ Done (+10 = 256, 76 open)** |
| **Fix Phase 1** | **Exemptions & decisions** | **✅ Done (4 resolved)** |
| **Fix Phase 2** | **sqlx → rusqlite** | **✅ Done (7 resolved)** |
| **Fix Phase 3** | **DB naming PascalCase** | **✅ Done (5 resolved)** |
| **Fix Phase 4** | **TS/Rust serialization keys PascalCase** | **✅ Done (9 resolved)** |
| **Fix Phase 5** | **`alarms` → `Alarms`, `settings` → `Settings` tables** | **✅ Done (2 resolved)** |
| **Fix Phase 6** | **Analytics schema + cheat sheet regressions** | **✅ Done (3 resolved)** |
| **Fix Phase 7** | **Concurrency guide regressions** | **✅ Done (2 resolved)** |
| **Fix Phase 8** | **Firing + snooze prose snake_case** | **✅ Done (1 resolved + CG-006 partial)** |
| **Fix Phase 9** | **Groups + sound prose snake_case** | **✅ Done (CG-006 partial)** |
| **Fix Phase 10** | **Architecture contradictions** | **✅ Done (4 resolved)** |
| **Fix Phase 11** | **`get_alarms` → `list_alarms`** | **✅ Done (1 resolved)** |
| **Fix Phase 12** | **Settings keys → PascalCase** | **✅ Done (1 resolved)** |
| **Fix Phase 13** | **AlarmChallenge schema gaps** | **✅ Done (3 resolved)** |
| **Fix Phase 14** | **All remaining prose snake_case** | **✅ Done (CG-006 resolved)** |
| **Fix Phase 15** | **Function length decomposition** | **✅ Done (GC-001 resolved)** |
| **Fix Phase 16–20** | **DST, thread safety, Zustand, scheduling, structural, snooze recovery** | **✅ Done (13 resolved)** |
| **Fix Phase A** | **Domain enum definitions — replace 9 magic string union types** | **✅ Done (11 resolved, 65 open)** |
| **Fix Phase B** | **Error enum definitions — WebhookError + IPC error response format** | **✅ Done (2 resolved, 63 open)** |
| **Fix Phase D** | **Test fixtures PascalCase + cheat sheet fixes** | **✅ Done (6 resolved, 57 open)** |
| **Fix Phase C** | **Acceptance criteria + IPC key fixes for 4 feature files** | **✅ Done (6 resolved, 51 open)** |
| **Fix Phase G** | **Code sample patterns: expect(), raw negation, exemptions** | **✅ Done (12 resolved, 39 open)** |
| **Fix Phase H** | **Stale metrics: overview, readiness, consistency, changelog** | **✅ Done (15 resolved, 24 open)** |
| **Fix Phase E** | **Settings seeding strategy + UI states specification** | **✅ Done (4 resolved, 20 open)** |
| **Fix Phase F** | **PascalCase, atomic tasks, semantic inverses, cross-references** | **✅ Done (13 resolved, 7 open)** |
| **Fix Phase I** | **Acceptance criteria rollups for features/ and fundamentals/** | **✅ Done (2 resolved, 0 open)** |
| **Fix Phase J** | **Final 7: ARIA, 0=disabled framing, personalization IPC, magic strings, exemption** | **✅ Done (7 resolved, 0 open)** |

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
2. ~~Database columns/tables/indexes/PKs snake_case~~ **✅ FIXED**
3. ~~22 functions exceed 15-line limit~~ **✅ FIXED**
4. ~~Feature files snake_case/camelCase in prose~~ **✅ FIXED**
5. ~~`06-tauri-architecture.md` contradictions~~ **✅ FIXED**
6. ~~`02-alarm-scheduling.md` severely outdated~~ **✅ FIXED**
7. ~~Root `00-overview.md` Data Model section camelCase~~ **✅ FIXED (Fix 21)**
8. ~~`04-snooze-system.md` SnoozeState interface contradicts data model~~ **✅ FIXED (Fix 22)**
9. ~~Error enum incomplete — `RestrictedPath` variant missing~~ **✅ FIXED (Fix 26)**
10. ~~AI cheat sheet broken markdown — unclosed code fence~~ **✅ FIXED (Fix 27)**

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