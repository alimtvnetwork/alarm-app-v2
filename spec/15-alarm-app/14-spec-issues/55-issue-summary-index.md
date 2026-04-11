# Spec Issues — Summary Index

**Version:** 1.0.0  
**Updated:** 2026-04-11  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`issues`, `summary`, `index`, `categories`, `phases`, `resolution`

---

## Purpose

Quick-reference index of all 484 spec quality issues found and resolved during the Alarm App spec audit. Organized by discovery phase with category breakdown and resolution status.

---

## Grand Totals

| Metric | Value |
|--------|-------|
| **Total Issues** | 484 |
| **Resolved** | 484 (100%) |
| **Open** | 0 |
| **Discovery Phases** | 36 |
| **Fix Phases** | 42 |
| **Severity: 🔴 Critical** | 104 |
| **Severity: 🟡 Medium** | 289 |
| **Severity: 🟢 Low** | 91 |

---

## Issues by Category

| # | Category | File | Issues | Severity Breakdown |
|---|----------|------|:------:|-------------------|
| 1 | Naming & Convention Violations | `01-naming-violations.md` | 18 | DB tables/columns snake_case, abbreviation casing, file naming |
| 2 | Internal Contradictions | `02-internal-contradictions.md` | 11 | sqlx vs rusqlite, localStorage vs SQLite, duplicate definitions |
| 3 | Structural Issues | `03-structural-issues.md` | 5 | Missing overview files, folder organization |
| 4 | Content Gaps | `04-content-gaps.md` | 12 | Missing migration tool, exemption docs, coding guideline cross-refs |
| 5 | AI Handoff Risks | `05-ai-handoff-risks.md` | 4 | Ambiguous directives, missing error handling spec |
| 6 | Logic Consistency | `06-logic-consistency.md` | 11 | Cross-file contradictions, missed alarm query, event types |
| 7 | UI/UX Consistency | `07-ui-ux-consistency.md` | 4 | IPC naming conventions, frontend state gaps |
| 8 | Guideline Compliance | `08-guideline-compliance.md` | 12 | PascalCase keys, boolean naming, function length |

---

## Issues by Discovery Phase

| Phase | File | Focus | Issues | Key Findings |
|:-----:|------|-------|:------:|-------------|
| 1–6 | `01`–`08` | Initial categories audit | 77 | Core naming, contradictions, structural, content gaps, AI risks, logic, UI/UX, guidelines |
| 7 | `09-discovery-phase-7.md` | Post-fix regression scan | 18 | Regressions from Fix Phases 16–20 |
| 8 | `10-discovery-phase-8.md` | Remaining files scan | 11 | `snake_case` table/column refs in prose |
| 9 | `11-discovery-phase-9.md` | Full grep scan | 30 | Comprehensive `grep -rn` sweep |
| 10 | `12-discovery-phase-10.md` | Deep cross-file audit | 18 | Post-naming-fix alignment |
| 11 | `13-discovery-phase-11.md` | Feature specs deep audit | 14 | Feature file internal consistency |
| 12 | `14-discovery-phase-12.md` | Root-level docs audit | 9 | Execution guides, handoff reports |
| 13 | `15-discovery-phase-13.md` | App issues & reference audit | 3 | Reference doc alignment |
| 14 | `16-discovery-phase-14.md` | Foundational alignment | 29 | Coding guidelines, booleans, enums, split-db, seedable config |
| 15 | `17-discovery-phase-15.md` | Boolean, negation & code samples | 13 | `expect()` → `match`, raw `!` → named booleans |
| 16 | `18-discovery-phase-16.md` | Test fixtures & cheat sheet | 12 | PascalCase test keys, cross-references |
| 17 | `19-discovery-phase-17.md` | Execution guides & concurrency | 12 | Race conditions, async safety |
| 18 | `20-discovery-phase-18.md` | Changelog & staleness | 10 | Stale version numbers, metrics |
| 19 | `31-discovery-phase-19.md` | Post-completion regression | 34 | Magic strings, camelCase in PascalCase contexts, naming mismatches |
| 20 | `32-discovery-phase-20.md` | Fresh audit | 21 | IPC, magic strings, Scoring tables, serde, seedable config |
| 21 | `33-discovery-phase-21.md` | Post-Phase-20 regression | 4 | Stale metrics, version alignment |
| 22 | `34-discovery-phase-22.md` | Fresh comprehensive | 18 | Missing deps, undefined interfaces, naming |
| 23 | `35-discovery-phase-23.md` | Cross-file consistency | 11 | Code sample audit |
| 24 | `36-discovery-phase-24.md` | IPC command coverage | 13 | File structure gaps, interface consistency |
| 25 | `37-discovery-phase-25.md` | Cross-spec deep consistency | 15 | AI handoff audit |
| 26 | `38-discovery-phase-26.md` | Architecture & IPC registry | 12 | Stale metrics audit |
| 27 | `39-discovery-phase-27.md` | Post-fix regression | 12 | Unfixed Phase 22–26 issues |
| 28 | `41-discovery-phase-28.md` | Post-Fix-U regression | 9 | Stale metadata, double separators, memory drift |
| 29 | `47-discovery-phase-29.md` | IPC registry completeness | 5 | 8 missing commands, settings ambiguity |
| 30 | `48-discovery-phase-30.md` | Payload & interface definitions | 7 | StreakData, Quote, Settings, StreakCalendarDay undefined |
| 31 | `49-discovery-phase-31.md` | Rust struct definitions | 8 | 8 missing Rust structs for IPC types |
| 32 | `50-discovery-phase-32.md` | IPC payload structs | 7 | 7 missing Rust structs for request/response |
| 33 | `51-discovery-phase-33.md` | Undefined types & inline objects | 11 | IPC registry mismatches, phantom fields |
| 34 | `52-discovery-phase-34.md` | IPC inline objects | 15 | Groups, Personalization, Sound, Challenge structs |
| 35 | `53-discovery-phase-35.md` | Export/import, webhook, analytics | 14 | Export/import/webhook/analytics/system Rust structs |
| 36 | `54-discovery-phase-36.md` | Final sweep: registry alignment | 12 | All remaining inline payloads → named structs |

---

## Issues by Fix Phase

| Phase | File | Issues Fixed | Focus |
|:-----:|------|:-----------:|-------|
| 1–20 | Various | 103 | Naming, contradictions, structural, content, logic, UI/UX, guidelines |
| A | `21-fix-phase-a-domain-enums.md` | 11 | Domain enums — 13 TS + 13 Rust enums |
| B | `22-fix-phase-b-error-enums.md` | 2 | Error enums (AlarmAppError + WebhookError) |
| C | `24-fix-phase-c-acceptance-criteria.md` | 6 | Acceptance criteria + IPC key fixes |
| D | `23-fix-phase-d-test-fixtures.md` | 6 | Test fixtures + cheat sheet |
| E | `27-fix-phase-e-settings-ui-states.md` | 4 | Settings seeding + UI states |
| F | `28-fix-phase-f-remaining.md` | 13 | PascalCase, atomic tasks, semantic inverses |
| G | `25-fix-phase-g-code-patterns.md` | 12 | Code sample patterns + exemptions |
| H | `26-fix-phase-h-stale-metrics.md` | 15 | Stale metrics update |
| I | — | 2 | Acceptance criteria rollups (197 total) |
| J | `30-fix-phase-j-final-7.md` | 7 | ARIA, 0=disabled, IPC, magic strings |
| K–S | Various | 56 | SQL defaults, magic strings, camelCase, serde, scoring, cross-refs |
| T | — | 4 | Stale "290" → "315" metrics |
| U | `40-fix-phase-u-comprehensive.md` | 81 | Comprehensive fix of Phases 22–27 issues |

---

## Top Issue Categories (by root cause)

| Root Cause | Total Issues | Prevention |
|-----------|:-----------:|-----------|
| **Stale metrics** after fix cycles | ~60 | `grep` old counts across ALL root-level files after every fix |
| **IPC registry drift** from feature specs | ~45 | Feature spec is canonical; registry must match exactly |
| **snake_case in PascalCase contexts** | ~40 | PascalCase applies to ALL DB/JSON/API identifiers |
| **Magic string union types** instead of enums | ~25 | Use domain enum references everywhere |
| **Missing Rust struct definitions** for IPC | ~50 | Every IPC payload/response needs a `#[derive, serde]` Rust struct |
| **Prose references** using wrong casing | ~30 | Backtick-quoted identifiers follow same naming rules as code |
| **Scattered duplication** across files | ~20 | Fix in canonical source + grep for ALL occurrences |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Issues Overview | `./00-overview.md` |
| Readiness Report | `../10-ai-handoff-readiness-report.md` |
| Consistency Report | `../99-consistency-report.md` |
| Changelog | `../98-changelog.md` |

---

*Spec Issues — Summary Index v1.0.0 — updated: 2026-04-11*
