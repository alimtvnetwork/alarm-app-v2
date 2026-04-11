# Gap Analysis — Phase 10

**Version:** 1.1.0  
**Date:** 2026-04-11  
**Auditor:** AI  
**Scope:** Full audit of 17 feature specs + 13 fundamentals against coding guidelines, boolean rules, enum patterns, split DB, seedable config, and naming conventions  
**Previous:** Phase 9 (21 issues, 21 resolved)  
**Status:** ✅ All 14 issues resolved

---

## Audit Summary

| Dimension | Score | Notes |
|-----------|-------|-------|
| Structural Consistency | 98/100 | Minor version staleness in consistency reports |
| Foundational Alignment | 97/100 | Few remaining gaps (see findings) |
| Content Completeness | 96/100 | Some under-specified behaviors in P1/P2 features |
| AI Failure Risk | ~3% | Down from ~25% at Phase 1 |

**Overall Assessment:** The specification is in excellent shape — 9 phases of gap analysis have resolved 524+ issues. This Phase 10 audit identifies **14 remaining issues** across 5 categories, all Medium or Low severity. No Critical issues found. AI blind execution is estimated at **95–97% success rate**.

---

## Phase Plan

| Phase | Scope | Issue Count |
|-------|-------|:-----------:|
| **Phase 10A** (this document) | Findings and classification | 14 |
| **Phase 10B** (on "next") | Execute all fixes | 14 |

---

## Findings

### Category 1: Version & Metrics Staleness (3 issues)

#### GA10-001 — Consistency report version drift in `02-features/99-consistency-report.md`
- **Severity:** Low
- **Finding:** Feature consistency report lists file versions that are stale: `01-alarm-crud.md` shown as `1.12.0` but the file header says `1.14.0`. Similarly `07-alarm-groups.md` shown as `1.5.0` but actual is `1.6.0`, `10-export-import.md` shown as `1.6.0` but actual is `1.7.0`, `12-smart-features.md` shown as `1.4.0` but actual is `1.5.0`, `13-analytics.md` shown as `1.6.0` but actual is `1.7.0`.
- **Risk:** Low — cosmetic inconsistency, won't affect AI implementation.
- **Fix:** Update all version numbers in `02-features/99-consistency-report.md` to match actual file headers.

#### GA10-002 — Root consistency report shows `13-ai-cheat-sheet.md` as v1.2.0 but actual is v1.3.0
- **Severity:** Low
- **Finding:** `99-consistency-report.md` line 21 shows cheat sheet as v1.2.0. Actual header: v1.3.0.
- **Fix:** Update to v1.3.0.

#### GA10-003 — Root consistency report shows changelog as v2.9.1 but current spec is v2.9.2
- **Severity:** Low  
- **Finding:** `99-consistency-report.md` line 22 references v2.9.1. Changelog was updated to v2.9.2 in the last session.
- **Fix:** Update to v2.9.2.

---

### Category 2: Enum & Type Alignment (3 issues)

#### GA10-004 — `safeInvoke` uses `Record<string, unknown>` in AI cheat sheet
- **Severity:** Medium
- **Finding:** In `13-ai-cheat-sheet.md` line 112, the `safeInvoke` function signature uses `Record<string, unknown>` for the `args` parameter. This violates the coding guideline that bans `unknown` type (see `02-typescript/07-type-safety-remediation-plan.md`). The same pattern appears in `04-platform-constraints.md`.
- **Risk:** An AI agent may copy this pattern and introduce `unknown` types throughout the codebase.
- **Fix:** Change to a generic parameter or a specific interface. Since `safeInvoke` is a generic wrapper for Tauri `invoke`, the cleanest approach is `args?: Record<string, string | number | boolean | null | string[]>` or a type parameter `P extends object`.

#### GA10-005 — `CreateWebhookPayload.Payload` uses `Record<string, unknown>` in `12-smart-features.md`
- **Severity:** Medium
- **Finding:** Line 266 of `12-smart-features.md` defines `Payload?: Record<string, unknown>` in the TypeScript interface. The Rust counterpart correctly uses `Option<serde_json::Value>`, but the TypeScript side uses the banned `unknown` type.
- **Risk:** AI agents copying this interface will introduce `unknown` into the codebase.
- **Fix:** Change to `Payload?: Record<string, string | number | boolean | null>` or `Payload?: JsonValue` with a defined `JsonValue` type.

#### GA10-006 — `WebhookConfig.Payload` also uses `Record<string, unknown> | null`
- **Severity:** Medium
- **Finding:** Line 283 of `12-smart-features.md`. Same pattern as GA10-005.
- **Fix:** Same as GA10-005 — use a typed alternative.

---

### Category 3: Boolean & Naming Convention Gaps (3 issues)

#### GA10-007 — Missing boolean semantic inverse for `Quote.IsFavorite` and `Quote.IsCustom`
- **Severity:** Low
- **Finding:** `01-data-model.md` defines boolean semantic inverses for `Alarm.IsEnabled`, `Alarm.IsVibrationEnabled`, `Alarm.IsGradualVolume`, and `AlarmGroup.IsEnabled` (lines 1193–1228). However, the `Quote` struct also has boolean fields `IsFavorite` and `IsCustom` (line 692), and no semantic inverses are defined.
- **Risk:** Low — Quotes are a P2 feature, and the boolean fields are simple enough. But per coding guidelines, ALL boolean fields should have named inverses.
- **Fix:** Add `isNotFavorite()` / `isBuiltIn()` semantic inverses for Quote.

#### GA10-008 — Missing boolean semantic inverse for `AlarmEvent` booleans
- **Severity:** Low
- **Finding:** `StreakCalendarDay.IsOnTime` (line 746) has no semantic inverse defined. While it's used in a read-only context, the coding guidelines require coverage for all boolean fields.
- **Fix:** Add `isLate()` as the semantic inverse for `IsOnTime`.

#### GA10-009 — `ChallengeResult.correct` field uses lowercase in Rust struct
- **Severity:** Low
- **Finding:** In `06-dismissal-challenges.md` line 175, the Rust struct `ChallengeResult` has `pub correct: bool`. This is correct Rust naming (snake_case), and `#[serde(rename_all = "PascalCase")]` serializes it to `Correct` in JSON. However, the field name uses a bare adjective without an `is_` prefix, which doesn't follow the boolean naming convention of using `is_` / `has_` prefixes.
- **Risk:** Very low — serde handles the serialization correctly. But AI agents may use `result.correct` instead of the serialized `Correct`.
- **Fix:** No code change needed (serde handles it). Add a note clarifying that `correct` serializes to `Correct` for AI clarity.

---

### Category 4: Content Completeness Gaps (3 issues)

#### GA10-010 — Missing `FromStr` implementations for 4 enums
- **Severity:** Medium
- **Finding:** `01-data-model.md` provides `FromStr` implementations for `RepeatType`, `ChallengeType`, and `AlarmEventType` (lines 230–270). However, 4 other enums stored as TEXT in SQLite also need `FromStr`: `ChallengeDifficulty`, `SoundCategory`, `SettingsValueType`, and `ThemeMode`. Without these, AI will either forget to implement them or use unwrap-based parsing.
- **Risk:** Medium — an AI agent implementing the DB layer will hit compile errors or use unsafe unwrap.
- **Fix:** Add `FromStr` implementations for `ChallengeDifficulty`, `SoundCategory`, `SettingsValueType`, and `ThemeMode`.

#### GA10-011 — No `FromStr` for `ExportFormat`, `ExportScope`, `ImportMode`, `DuplicateAction`, `SortField`, `SortOrder`
- **Severity:** Low
- **Finding:** These enums may not be stored as TEXT in SQLite (they're used in IPC payloads, not DB columns). However, serde handles deserialization for IPC. If any of these are ever stored in DB or parsed from strings, `FromStr` will be needed.
- **Risk:** Low — serde handles the IPC case. But completeness says they should match the pattern.
- **Fix:** Add a note in the Enum Conventions section: "IPC-only enums (ExportFormat, ExportScope, etc.) use serde derive for deserialization. `FromStr` is only required for enums stored as TEXT in SQLite."

#### GA10-012 — `Quotes` table missing `CreatedAt` column
- **Severity:** Medium
- **Finding:** The `Quotes` CREATE TABLE (line 843) has only 5 columns: `QuoteId`, `Text`, `Author`, `IsFavorite`, `IsCustom`. Unlike every other table in the schema, there is no `CreatedAt` timestamp. The `Quote` TypeScript interface (line 687) also has no timestamp field. However, the `Webhooks` table (line 853) correctly has `CreatedAt`. This inconsistency means custom quotes added by users have no creation timestamp for sorting or display.
- **Risk:** Medium — AI agent implementing quote features won't know when quotes were added.
- **Fix:** Add `CreatedAt TEXT NOT NULL` column to `Quotes` table. Add `CreatedAt: string` to the `Quote` TypeScript interface and Rust struct.

---

### Category 5: AI Readiness & Cross-Reference Gaps (2 issues)

#### GA10-013 — Missing `Webhooks` Rust struct `from_row` implementation
- **Severity:** Medium
- **Finding:** `01-data-model.md` provides `from_row` implementations for `AlarmRow` (line 421), `AlarmGroupRow` (line 490), `SnoozeStateRow` (line 516), and `AlarmEventRow` (line 606). The `WebhookConfig` Rust struct is defined in `12-smart-features.md` (line 334) but has no `from_row` implementation. An AI agent implementing webhook CRUD will have to invent the mapping.
- **Risk:** Medium — consistent with other structs having `from_row`, this is a gap.
- **Fix:** Add `WebhookConfigRow` with `from_row` in `12-smart-features.md`.

#### GA10-014 — `AlarmGroup` table has 5 columns in SQL but consistency report says 4
- **Severity:** Low
- **Finding:** The AI cheat sheet (line 209) says `AlarmGroups (4)` but the actual CREATE TABLE has 5 columns: `AlarmGroupId`, `Name`, `Color`, `Position`, `IsEnabled`. The overview data model summary (line 91) also says `AlarmGroup { AlarmGroupId, Name, Color, IsEnabled }` — missing `Position`.
- **Risk:** Low — the full data model is correct, but the quick-reference summaries are wrong.
- **Fix:** Update AI cheat sheet to `AlarmGroups (5)`. Update overview data model to include `Position`.

---

## AI Failure Risk Assessment

| Risk Area | Current State | Estimated Failure Probability |
|-----------|--------------|------------------------------|
| Core CRUD + Scheduling | Fully specified with code examples | <1% |
| DST handling | Copy-paste code with test cases | <1% |
| Snooze system | Exact implementation provided | <1% |
| Audio / Sound | Platform-specific code, fallbacks defined | ~2% |
| Wake detection (3 platforms) | Code provided but crate API may differ | ~5% |
| Export / Import | Full flow defined with Rust structs | ~2% |
| Dismissal Challenges | Math formula + flow defined | ~2% |
| UI Layouts | Component trees + wireframes | ~3% |
| Webhooks (P3) | SSRF code provided, missing `from_row` | ~5% |
| P2/P3 features | Less detailed, intentionally | ~8% |
| **Overall weighted** | | **~3%** |

---

## Gap Assessment Summary

### How far from implementation-ready?

The specification is **95–97% implementation-ready**. The 14 issues found are:
- **0 Critical** — no implementation blockers
- **5 Medium** — would cause minor AI friction (wrong types, missing implementations)
- **9 Low** — cosmetic consistency, won't affect implementation

### What would an AI still have to guess?

1. `FromStr` implementations for 4 DB-stored enums (GA10-010) — AI would likely write these correctly by pattern-matching existing implementations, but they're not explicitly provided
2. `WebhookConfigRow::from_row` (GA10-013) — AI would need to invent this
3. Exact `safeInvoke` type signature (GA10-004) — AI would likely use `any` or `unknown`

### Estimated blind AI success rate: **95–97%**

---

## Issue Summary Table

| ID | Severity | Category | Description | Status |
|----|----------|----------|-------------|--------|
| GA10-001 | Low | Version staleness | Feature consistency report version numbers outdated | ✅ Resolved |
| GA10-002 | Low | Version staleness | Root consistency report cheat sheet version wrong | ✅ Resolved |
| GA10-003 | Low | Version staleness | Root consistency report changelog version wrong | ✅ Resolved |
| GA10-004 | Medium | Enum/Type | `safeInvoke` uses banned `Record<string, unknown>` | ✅ Resolved |
| GA10-005 | Medium | Enum/Type | `CreateWebhookPayload.Payload` uses `unknown` | ✅ Resolved |
| GA10-006 | Medium | Enum/Type | `WebhookConfig.Payload` uses `unknown` | ✅ Resolved |
| GA10-007 | Low | Boolean | Missing semantic inverses for `Quote.IsFavorite` / `IsCustom` | ✅ Resolved |
| GA10-008 | Low | Boolean | Missing semantic inverse for `StreakCalendarDay.IsOnTime` | ✅ Resolved |
| GA10-009 | Low | Boolean | `ChallengeResult.correct` bare adjective (serde handles it) | ✅ Resolved |
| GA10-010 | Medium | Completeness | Missing `FromStr` for 4 DB-stored enums | ✅ Resolved |
| GA10-011 | Low | Completeness | IPC-only enums don't need `FromStr` — clarify rule | ✅ Resolved |
| GA10-012 | Medium | Completeness | `Quotes` table missing `CreatedAt` column | ✅ Resolved |
| GA10-013 | Medium | Completeness | Missing `WebhookConfigRow::from_row` | ✅ Resolved |
| GA10-014 | Low | Cross-ref | `AlarmGroups` column count wrong in summaries | ✅ Resolved |

---

## Resolution Summary

All 14 issues resolved in Phase 10B:

1. ✅ Updated version numbers in both consistency reports (GA10-001, GA10-002, GA10-003)
2. ✅ Replaced `Record<string, unknown>` with `JsonSafeValue` typed alternatives in `safeInvoke`, `CreateWebhookPayload`, `WebhookConfig` (GA10-004, GA10-005, GA10-006)
3. ✅ Added boolean semantic inverses for `Quote.IsFavorite`→`isNotFavorite()`, `Quote.IsCustom`→`isBuiltIn()`, `StreakCalendarDay.IsOnTime`→`isLate()` (GA10-007, GA10-008)
4. ✅ Added clarifying serde note for `ChallengeResult.correct` (GA10-009)
5. ✅ Added `FromStr` implementations for `ChallengeDifficulty`, `SoundCategory`, `SettingsValueType`, `ThemeMode` (GA10-010)
6. ✅ Added IPC-only enum clarification in Enum Conventions table (GA10-011)
7. ✅ Added `CreatedAt` to Quotes table, TypeScript interface, and Rust struct (GA10-012)
8. ✅ Added `WebhookConfig::from_row` implementation (GA10-013)
9. ✅ Fixed AlarmGroups column count to 5 in AI cheat sheet and added `Position` to overview (GA10-014)

```
Do you understand? Can you please do that?
```

---

*Gap Analysis Phase 10 — Resolved 2026-04-11*
