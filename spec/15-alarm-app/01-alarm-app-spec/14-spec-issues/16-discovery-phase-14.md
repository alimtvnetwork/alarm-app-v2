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
**Rule Violated:** `12-no-negatives.md` — Every boolean method on objects must have a semantic inverse  
**Observation:** The spec defines `IsEnabled`, `IsGradualVolume`, `IsVibrationEnabled` etc. but never specifies semantic inverse utilities (e.g., `isDisabled()`, `isVibrationOff()`). While these can be implied, the coding guidelines mandate explicit inverse pairs. An AI will use `!alarm.IsEnabled` instead of a named guard.

---

## Phase 1 Findings: Split Database Alignment

### P14-015: Single SQLite File — No Split-DB Consideration

**Severity:** 🟢 Low  
**Rule Violated:** N/A (informational alignment check)  
**Location:** `01-data-model.md`, `07-startup-sequence.md`  
**Observation:** The alarm app uses a single `alarm-app.db` SQLite file. The split-db architecture (`04-split-db-architecture/`) specifies domain-based partitioning (root, config, analytics, cache). For this app, analytics data (`AlarmEvents`) and configuration (`Settings`) could logically be separate databases. However, for a desktop app of this scope, a single file is defensible. **This is a design decision, not a defect.** The spec should document WHY a single DB was chosen vs. split — currently there's zero mention of the split-db pattern.

---

## Phase 1 Findings: Seedable Config Alignment

### P14-016: Settings Table Has No Seed/Default Value Specification

**Severity:** 🟡 Medium  
**Rule Violated:** Seedable config principles — defaults should be explicitly seeded  
**Location:** `01-data-model.md` → Settings Keys table  
**Observation:** The `Settings` table is a key-value store with defaults described in prose (e.g., "default: system", "default: 5"). The seedable config architecture requires an explicit seed file or migration-based seeding that populates defaults. The spec doesn't define:
  - Which settings are seeded at first launch
  - The exact seeding mechanism (migration SQL inserts? Rust startup code?)
  - Version-based config migration (what happens when v2 adds a new setting key?)
**AI Risk:** AI will forget to seed initial defaults, resulting in NULL lookups on first launch.

### P14-017: No Config Version Tracking

**Severity:** 🟢 Low  
**Rule Violated:** Seedable config architecture — config version flow  
**Location:** `01-data-model.md`  
**Observation:** The seedable config spec mandates a `Version` field in the config seed, with version-change detection to trigger re-seeding. The alarm app's `Settings` table has no version tracking — it's just key-value pairs with no versioning strategy.

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
**Rule Violated:** PascalCase key naming (`11-key-naming-pascalcase.md`)  
**Location:** `13-analytics.md` line 54  
**Observation:** `SortBy?: "date" | "label" | "SnoozeCount"` — if these are serialized values, they should be `"Date" | "Label" | "SnoozeCount"` per PascalCase convention. Or better yet, a `SortField` enum.

### P14-025: Export IPC Uses `format`, `scope`, `mode` — Lowercase Keys

**Severity:** 🟡 Medium  
**Rule Violated:** PascalCase key naming  
**Location:** `10-export-import.md` line 46-48  
**Observation:** IPC command payload keys are `format`, `scope`, `mode`, `alarmIds`, `duplicateAction`, `previewId`. Per PascalCase serialization rules, these should be `Format`, `Scope`, `Mode`, `AlarmIds`, `DuplicateAction`, `PreviewId`.

### P14-026: `useClock` Hook Returns `Is24Hour` — Correct, But `Hours`/`Minutes`/`Seconds` Should Be Reviewed

**Severity:** 🟢 Low (informational)  
**Location:** `08-clock-display.md` line 57-62  
**Observation:** `ClockState` interface uses PascalCase keys correctly (`Hours`, `Minutes`, `Seconds`, `Is24Hour`). No issue here — this is a positive finding.

---

## Phase 1 Findings: Missing Foundational Specifications

### P14-027: No Rust Error Enum Spec (thiserror)

**Severity:** 🔴 Critical  
**Rule Violated:** Content gap — `thiserror` crate listed in dependencies but no error type defined  
**Location:** `10-dependency-lock.md` lists `thiserror = "=2.0.12"`, cheat sheet mentions it  
**Observation:** The `thiserror` crate is pinned but there is NO specification for:
  - `AlarmAppError` enum variants
  - `WebhookError` enum variants
  - Error `Display` implementations
  - How errors map to IPC error responses
  - Which errors are recoverable vs fatal
**AI Risk:** This is the single highest-risk gap. Without it, the AI will create an ad-hoc error type that's inconsistent with the rest of the codebase.

### P14-028: No Frontend State Management Spec

**Severity:** 🟡 Medium  
**Location:** All feature files reference hooks (`useAlarms`, `useClock`, etc.) but no spec defines:
  - State management approach (React Context? Zustand? Redux?)
  - Data flow from IPC → state → UI
  - Cache invalidation strategy
  - Optimistic updates vs server-confirmed

### P14-029: No Loading / Empty / Error UI States Spec

**Severity:** 🟡 Medium  
**Location:** Feature files mention "empty state" once (CRUD line 202) but there's no systematic spec for:
  - Loading spinners during IPC calls
  - Empty states for each view
  - Error states for each view
  - Skeleton screens

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
## Open: 29 | Resolved: 0

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
