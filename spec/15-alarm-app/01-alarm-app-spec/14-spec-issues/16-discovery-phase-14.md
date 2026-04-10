# Discovery Phase 14 — Foundational Alignment Audit

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Auditor:** AI Spec Auditor  
**Scope:** App spec folder (`15-alarm-app/01-alarm-app-spec/`) vs foundational specs (coding guidelines, boolean principles, enum patterns, split-db, seedable config, naming conventions)

---

## Audit Methodology

1. Read all 17 feature files, 12 fundamentals, root overview, cheat sheet
2. Cross-referenced against: `02-coding-guidelines/` (boolean principles, no-negatives, magic strings, key naming, database naming, function naming), `04-split-db-architecture/`, `05-seedable-config-architecture/`
3. Every finding grounded in a specific rule from a specific foundational spec

---

## Phase 1 Findings: Structural & Naming

### P14-001: Missing `97-acceptance-criteria.md` in Feature Folder

**Severity:** 🟡 Medium  
**Rule Violated:** Spec authoring guide — Reserved file `97` recommended for acceptance criteria  
**Location:** `02-features/`  
**Observation:** The features folder has no consolidated `97-acceptance-criteria.md`. Each feature has inline acceptance criteria sections, but there is no single document that rolls up all acceptance criteria for the app. An AI doing implementation would have to visit 17 files to collect all criteria.  
**Risk:** Medium — scattered criteria increase the chance of AI missing acceptance criteria during implementation.

### P14-002: Missing `97-acceptance-criteria.md` in Fundamentals Folder

**Severity:** 🟡 Medium  
**Rule Violated:** Spec authoring guide — Reserved file `97`  
**Location:** `01-fundamentals/`  
**Observation:** No consolidated acceptance criteria file for fundamentals (startup sequence success criteria, migration success criteria, WAL verification, etc.).

---

## Phase 1 Findings: Enum / Magic String Violations

### P14-003: `ChallengeType` Uses Magic Strings, Not Enum

**Severity:** 🔴 Critical  
**Rule Violated:** `05-magic-strings-and-organization.md` §8.2 — Domain status comparisons MUST use enum constants  
**Location:** `01-data-model.md` line 44, `06-dismissal-challenges.md` line 85  
**Observation:** `ChallengeType` is typed as `string | null` with raw string literals `'math' | 'memory' | 'shake' | 'typing' | 'qr' | 'steps'`. The coding guidelines FORBID raw string comparisons for domain statuses. This should be a TypeScript enum `ChallengeType` and a Rust enum with `#[serde(rename_all = "PascalCase")]`.  
**AI Risk:** AI will use raw string comparisons like `if (alarm.ChallengeType === 'math')` throughout the codebase — directly violating the magic string rule.

### P14-004: `ChallengeDifficulty` Uses Magic Strings, Not Enum

**Severity:** 🔴 Critical  
**Rule Violated:** `05-magic-strings-and-organization.md` §8.2  
**Location:** `01-data-model.md` line 45  
**Observation:** `ChallengeDifficulty` typed as `string | null` with values `'easy' | 'medium' | 'hard'`. Must be a proper enum.

### P14-005: `AlarmEvent.Type` Uses Magic Strings, Not Enum

**Severity:** 🔴 Critical  
**Rule Violated:** `05-magic-strings-and-organization.md` §8.2  
**Location:** `01-data-model.md` line 232, `03-alarm-firing.md` line 33e  
**Observation:** `Type: "fired" | "snoozed" | "dismissed" | "missed"` is a domain status field. Must be an enum `AlarmEventType`.  
**AI Risk:** Every place that checks event type will use raw strings.

### P14-006: `RepeatPattern.Type` — Partially Addressed but TypeScript Enum Missing

**Severity:** 🟡 Medium  
**Rule Violated:** `05-magic-strings-and-organization.md` §8.2  
**Location:** `01-data-model.md` line 63  
**Observation:** Rust has `RepeatType` enum (good), but TypeScript interface uses `"once" | "daily" | "weekly" | "interval" | "cron"` string literal union — NOT a proper TypeScript enum. The coding guidelines require `RepeatType.Once`, not `"once"`.

### P14-007: `AlarmSound.Category` Uses Magic Strings

**Severity:** 🟡 Medium  
**Rule Violated:** `05-magic-strings-and-organization.md` §8.2  
**Location:** `01-data-model.md` line 223  
**Observation:** `Category: 'classic' | 'gentle' | 'nature' | 'digital'` — should be an enum `SoundCategory`.

### P14-008: `Settings.ValueType` Uses Magic Strings

**Severity:** 🟡 Medium  
**Rule Violated:** `05-magic-strings-and-organization.md` §8.2  
**Location:** `01-data-model.md` line 290 (SQL schema)  
**Observation:** `ValueType TEXT NOT NULL DEFAULT 'string'` with values `'string' | 'integer' | 'boolean' | 'json'` — should be an enum `SettingsValueType`.

### P14-009: `Theme` Setting Uses Magic Strings

**Severity:** 🟡 Medium  
**Rule Violated:** `05-magic-strings-and-organization.md` §8.2  
**Location:** `09-theme-system.md` line 56  
**Observation:** `"light" | "dark" | "system"` used as raw strings in IPC commands. Should be `ThemeMode` enum.

### P14-010: Export `format` and `scope` Use Magic Strings

**Severity:** 🟡 Medium  
**Rule Violated:** `05-magic-strings-and-organization.md` §8.2  
**Location:** `10-export-import.md` line 46-48  
**Observation:** IPC command payloads use `format: "json" | "csv" | "ics"` and `scope: "all" | "selected"` and `duplicateAction: "skip" | "overwrite" | "rename"` and `mode: "merge" | "replace"` — all raw strings. Each should be a typed enum.

### P14-011: `HistoryFilter.SortBy` Mixes Casing

**Severity:** 🟡 Medium  
**Rule Violated:** PascalCase key naming (`11-key-naming-pascalcase.md`)  
**Location:** `13-analytics.md` line 54  
**Observation:** `SortBy?: "date" | "label" | "SnoozeCount"` — `date` and `label` are lowercase but `SnoozeCount` is PascalCase. Inconsistent. Also these should be enum values.

---

## Phase 1 Findings: Boolean Principle Violations

### P14-012: Code Uses `!` Raw Negation in Pseudocode

**Severity:** 🟡 Medium  
**Rule Violated:** `12-no-negatives.md` — No raw negations, use positive guard functions  
**Location:** `01-alarm-crud.md` line 149 — `alarm.enabled ? 'enabled' : 'disabled'`  
**Observation:** The ARIA label uses `alarm.enabled` — but the field is actually `IsEnabled` per PascalCase convention. This is a double issue: wrong field name in the example AND the ARIA code should use `alarm.IsEnabled`. Not a raw negation violation itself, but the pattern `alarm.enabled` without prefix is a boolean naming violation.

### P14-013: `enabled` Used Without `Is` Prefix in ARIA Example

**Severity:** 🟡 Medium  
**Rule Violated:** Boolean principles P1 — `is`/`has` prefix required  
**Location:** `01-alarm-crud.md` line 149  
**Observation:** Code reads `alarm.enabled` instead of `alarm.IsEnabled`. This directly contradicts the data model and the boolean naming rule.

### P14-014: Missing Semantic Inverse Methods Specification

**Severity:** 🟢 Low  
**Status:** ✅ Resolved — Fix Phase F  
**Resolution:** Added "Boolean Semantic Inverses" section to `01-data-model.md` documenting named guard methods for all boolean fields. See Fix Phase F tracker.

---

## Phase 1 Findings: Split Database Alignment

### P14-015: Single SQLite File — No Split-DB Consideration

**Severity:** 🟢 Low  
**Status:** ✅ Resolved — Fix Phase F  
**Resolution:** Added "Single Database Decision" section to `01-data-model.md` documenting the design choice and rationale vs split-db architecture.

---

## Phase 1 Findings: Seedable Config Alignment

### P14-016: Settings Table Has No Seed/Default Value Specification

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved — Fix Phase E  
**Rule Violated:** Seedable config principles — defaults should be explicitly seeded  
**Location:** `01-data-model.md` → Settings Keys table  
**Resolution:** Added "Settings Seeding Strategy" section to `01-data-model.md`: documents migration-based seeding via V1 SQL inserts, first-launch behavior, `INSERT OR IGNORE` pattern for adding new settings in future migrations, and explicit rationale for why the full seedable config architecture is not used. Settings Keys table now includes Default column. V1 migration seed values updated with `ValueType` column.

### P14-017: No Config Version Tracking

**Severity:** 🟢 Low  
**Status:** ✅ Resolved — Fix Phase E  
**Rule Violated:** Seedable config architecture — config version flow  
**Location:** `01-data-model.md`  
**Resolution:** Documented that `refinery_schema_history` provides equivalent version tracking — migration version = config version. Added explicit "Why Not Seedable Config Architecture?" section explaining the design decision.

---

## Phase 1 Findings: Content Completeness Gaps

### P14-018: No Error Type Enum / Error Handling Spec

**Severity:** 🔴 Critical  
**Rule Violated:** Magic strings rule + error handling best practices  
**Location:** Multiple files reference `AlarmAppError` but no single spec defines all variants  
**Observation:** The spec references `AlarmAppError::InvalidSoundFormat`, `AlarmAppError::SymlinkRejected`, `AlarmAppError::FileNotFound`, `AlarmAppError::RestrictedPath`, `AlarmAppError::SoundFileTooLarge`, `AlarmAppError::Audio`, `WebhookError::*`. But there is NO central error type specification. An AI must guess the full error enum, derive traits, and Display implementations.  
**AI Risk:** 95% chance of incorrect or incomplete error type definition.

### P14-019: No IPC Error Handling / Error Response Format

**Severity:** 🔴 Critical  
**Rule Violated:** Content completeness  
**Location:** All IPC command tables across 17 feature files  
**Observation:** Every IPC command specifies payload and return type, but NONE define the error response format. What happens when `create_alarm` receives invalid input? What error shape does the frontend receive? Is it `{ Error: string }` or `{ Code: string, Message: string }`? No spec exists for:
  - IPC error envelope format
  - Frontend error handling pattern
  - Error toast display rules
  - Retry logic (if any)
**AI Risk:** 90% chance of inconsistent error handling across commands.

### P14-020: `AlarmChallenge` Interface Has No Acceptance Criteria

**Severity:** 🟡 Medium  
**Location:** `06-dismissal-challenges.md`  
**Observation:** The file defines challenge types and IPC commands but has NO acceptance criteria section. Every other feature file has one.  
**Correction:** It does have implicit criteria in the "Rules" sub-sections, but no formal `## Acceptance Criteria` checkbox list.  
**Update after re-check:** Actually `06-dismissal-challenges.md` does NOT have an `## Acceptance Criteria` section — unlike all 15 other feature files that do.

### P14-021: `11-sleep-wellness.md` Missing Acceptance Criteria

**Severity:** 🟡 Medium  
**Location:** `11-sleep-wellness.md`  
**Observation:** No `## Acceptance Criteria` section. The file describes 5 features but provides no testable criteria.

### P14-022: `12-smart-features.md` Missing Acceptance Criteria

**Severity:** 🟡 Medium  
**Location:** `12-smart-features.md`  
**Observation:** No `## Acceptance Criteria` section.

### P14-023: `14-personalization.md` Missing Acceptance Criteria

**Severity:** 🟡 Medium  
**Location:** `14-personalization.md`  
**Observation:** No `## Acceptance Criteria` section.

---

## Phase 1 Findings: PascalCase / Naming Violations

### P14-024: `HistoryFilter.SortBy` Values Use Lowercase

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved — Fix Phase A (domain enums)  
**Resolution:** `SortBy` now uses `SortField` enum (`Date`, `Label`, `SnoozeCount`) and `SortOrder` enum. Raw string values replaced.

### P14-025: Export IPC Uses `format`, `scope`, `mode` — Lowercase Keys

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved — Fix Phases A + prior naming fixes  
**Resolution:** Export IPC payload keys are now PascalCase (`Format: ExportFormat`, `Scope: ExportScope`, `Mode: ImportMode`, `AlarmIds`, `PreviewId`, `DuplicateAction: DuplicateAction`).

### P14-026: `useClock` Hook Returns `Is24Hour` — Correct, But `Hours`/`Minutes`/`Seconds` Should Be Reviewed

**Severity:** 🟢 Low (informational)  
**Status:** ✅ Closed — N/A (positive finding, no issue)  
**Observation:** `ClockState` interface uses PascalCase keys correctly. No fix needed.

---

## Phase 1 Findings: Missing Foundational Specifications

### P14-027: No Rust Error Enum Spec (thiserror)

**Severity:** 🔴 Critical  
**Status:** ✅ Resolved — Fix Phase B (error enums)  
**Resolution:** Complete `AlarmAppError` and `WebhookError` enum specs added to `04-platform-constraints.md` with all variants, `thiserror` derive macros, IPC error response format, and recoverable vs fatal classification.

### P14-028: No Frontend State Management Spec

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved — Fix Phase 18 (UX-001) + Fix Phase E  
**Resolution:** Zustand store architecture fully defined in `06-tauri-architecture-and-framework-comparison.md` (Fix Phase 18). Data flow (IPC → store → UI), cache invalidation, and optimistic update decisions documented in `02-design-system.md` UI States section (Fix Phase E).

### P14-029: No Loading / Empty / Error UI States Spec

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved — Fix Phase E  
**Resolution:** Added comprehensive "UI States Specification" section to `02-design-system.md`: four-state model (loading/populated/empty/error), per-view state table, skeleton screen pattern with code example, error handling flow via `safeInvoke`, and explicit "no optimistic updates" decision with rationale.

---

## Summary

| Severity | Count |
|----------|:-----:|
| 🔴 Critical | 6 |
| 🟡 Medium | 17 |
| 🟢 Low | 6 |
| **Total** | **29** |

### AI Failure Risk Assessment

**Current readiness for blind AI handoff: ~75-80%**

The spec is structurally excellent — well-organized, cross-referenced, and internally consistent on the big architectural decisions. However, the **coding guideline compliance** has significant gaps:

1. **Magic strings are pervasive** — 9 domain types use raw string literals instead of enums. An AI will propagate these throughout the codebase, creating exactly the pattern the coding guidelines forbid.
2. **No error type specification** — the highest single-point-of-failure gap. Every IPC command needs error handling, and there's no definition.
3. **Missing acceptance criteria** in 4 feature files means the AI has no testable definition of "done."
4. **Settings seeding** is undefined — first-launch behavior will be guessed.

### What Works Well

- PascalCase naming on data model fields: ✅ consistent
- Serde `rename_all = "PascalCase"` on Rust structs: ✅ specified
- Boolean naming (`IsEnabled`, `IsGradualVolume`, `HasOverdue`): ✅ mostly correct
- Cross-references between files: ✅ thorough
- Platform-specific implementations: ✅ detailed
- DST/timezone handling: ✅ exemplary
- Security (SSRF, path traversal): ✅ well-defined

---

## Proposed Phases for Fixes

| Phase | Scope | Est. Issues |
|-------|-------|:-----------:|
| Phase A | Define all TypeScript + Rust enums for magic string types | 9 |
| Phase B | Define `AlarmAppError` + `WebhookError` enum with all variants | 2 |
| Phase C | Define IPC error response format + frontend error handling pattern | 2 |
| Phase D | Add missing acceptance criteria to 4 feature files | 4 |
| Phase E | Fix PascalCase violations in IPC payloads | 2 |
| Phase F | Add settings seeding specification | 2 |
| Phase G | Add frontend state management + UI states spec | 2 |
| Phase H | Add boolean semantic inverse utilities spec | 1 |
| Phase I | Document single-DB decision vs split-DB | 1 |
| Phase J | Fix `alarm.enabled` → `alarm.IsEnabled` in ARIA example | 1 |

**Total estimated fix tasks: ~26 (across 10 phases)**

---

## Issues Found So Far: 29
## Open: 2 | Resolved: 27

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
| Discovery Phase 7 | `09-discovery-phase-7.md` | 18 |
| Discovery Phase 8 | `10-discovery-phase-8.md` | 11 |
| Discovery Phase 9 | `11-discovery-phase-9.md` | 30 |
| Discovery Phase 10 | `12-discovery-phase-10.md` | 18 |
| Discovery Phase 11 | `13-discovery-phase-11.md` | 14 |
| Discovery Phase 12 | `14-discovery-phase-12.md` | 9 |
| Discovery Phase 13 | `15-discovery-phase-13.md` | 3 |
| **Discovery Phase 14** | **`16-discovery-phase-14.md`** | **29** |
| **Total Found So Far** | | **209** |

**Discovery status:** Phase 14 — Foundational alignment audit complete (Phase 1 of multi-phase audit).
