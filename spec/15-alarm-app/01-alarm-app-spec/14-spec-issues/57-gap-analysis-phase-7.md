# Gap Analysis — Phase 7 (Comprehensive Fresh Audit)

**Version:** 1.0.0  
**Updated:** 2026-04-11  
**AI Confidence:** High  
**Ambiguity:** None  
**Scope:** Full 5-phase audit — Structural, Foundational Alignment, Content Completeness, AI Failure Risk, Issue Grouping  
**Auditor Context:** Phase 6 resolved 20/22 issues. This is an independent re-audit from scratch.

---

## Keywords

`gap-analysis`, `audit`, `consistency`, `coding-guidelines`, `boolean`, `enum`, `naming`, `ai-readiness`, `phase-7`

---

## Phase 1: Folder & Structural Audit

### 1.1 Folder Structure — ✅ Compliant

| Check | Status | Notes |
|-------|--------|-------|
| Folder naming (`{NN}-{kebab-case}/`) | ✅ | All folders follow convention |
| File naming (`{NN}-{kebab-case}.md`) | ✅ | All files follow convention |
| `00-overview.md` in every folder | ✅ | Present in root, fundamentals, features, app-issues, spec-issues |
| `99-consistency-report.md` | ✅ | Present at root, fundamentals, features |
| `97-acceptance-criteria.md` | ✅ | Present in fundamentals and features |
| Sequential numbering | ✅ | 01–16 contiguous in features, 17 is UI layouts (addendum) |
| Metadata headers (Version, Updated, AI Confidence, Ambiguity) | ✅ | All files have proper headers |
| Scoring tables | ✅ | Present in all files (including 97/99 after Phase 6 fix) |

### 1.2 Structural Issues Found

| # | Issue | Severity | File | Details |
|---|-------|----------|------|---------|
| S-001 | Feature overview inventory says "16 feature specs" but 17 files exist (01–17) | 🟢 Low | `02-features/00-overview.md` | `17-ui-layouts.md` was added in Phase 6 but the overview inventory table still only lists 01–16 + 99. File 17 is missing from the inventory. |
| S-002 | Root overview (`00-overview.md`) says "17 feature specs" in priority matrix area but Module Inventory says "17 docs" — consistent. However the feature overview's Document Inventory table only has 16 numbered rows. | 🟢 Low | `02-features/00-overview.md` | The inventory table needs a row for `17-ui-layouts.md`. |
| S-003 | `WebhookError` variant count mismatch: root overview says "4 variants", but `12-smart-features.md` defines **7 variants** (`InvalidUrl`, `InsecureScheme`, `BlockedHost`, `MissingHost`, `PrivateIp`, `NonStandardPort`, `RequestFailed`) | 🟡 Medium | `00-overview.md` line ~25 + `13-ai-cheat-sheet.md` | AI agents using the cheat sheet will create only 4 variants and miss 3. |
| S-004 | `Settings` typed interface in `01-data-model.md` has 11 fields but the Settings Keys table only has 10 rows (missing `ThemeSkin`, `AccentColor`, `DefaultMaxSnoozeCount`, `AutoDismissMin`, `IsGradualVolumeEnabled`, `GradualVolumeDurationSec`; has `MinimizeToTray`, `ExportWarningDismissed` which are NOT in the typed interface) | 🟡 Medium | `01-data-model.md` lines 631–643 vs 870–881 | The `SettingsResponse` struct and the Settings Keys table are out of sync — 6 fields in the struct have no matching key, 2 keys have no matching struct field. |

---

## Phase 2: Foundational Alignment Audit

### 2.1 Database Naming Convention — ✅ Fully Compliant

| Rule | Status | Notes |
|------|--------|-------|
| Table names PascalCase | ✅ | All 5 tables |
| Column names PascalCase | ✅ | All columns |
| Boolean columns `Is`/`Has` prefix, positive only | ✅ | `IsEnabled`, `IsGradualVolume`, `IsVibrationEnabled`, `IsPreviousEnabled` |
| Boolean NOT NULL DEFAULT | ⚠️ | `IsPreviousEnabled INTEGER` on `Alarms` table is **nullable** (no `NOT NULL DEFAULT`). This violates Rule 6 ("Boolean columns MUST never be nullable"). However, `null` has semantic meaning here (no saved state). |
| Index names `Idx{Table}_{Column}` | ✅ | Fixed in Phase 6 |
| FK naming | ✅ | `GroupId` → shortened but consistent |
| Abbreviations | ✅ | `Id` not `ID` |

### 2.2 Boolean Compliance Issues

| # | Issue | Severity | File | Details |
|---|-------|----------|------|---------|
| B-001 | `IsPreviousEnabled` is a nullable boolean — violates coding guideline Rule 6 ("Boolean columns MUST never be nullable") | 🟡 Medium | `01-data-model.md` line 761 | The column serves a valid purpose (`null` = no saved state vs `true/false` = saved state). Should be formally documented as an exemption with rationale, similar to the DB-001 Settings PK exemption. |
| B-002 | `Settings.Is24Hour` field appears in the `SettingsResponse` Rust struct but is not a column — it's derived from `TimeFormat` key. The name `Is24Hour` is a derived boolean that doesn't exist in the DB. This could confuse AI about where to store it. | 🟢 Low | `01-data-model.md` line 659 | Should note that `Is24Hour` is derived from `Settings.Key = 'TimeFormat'` comparison, not a direct DB column. |

### 2.3 Enum Pattern Compliance — ✅ Fully Compliant

| Check | Status |
|-------|--------|
| 13 TypeScript enums with PascalCase values | ✅ |
| 13 matching Rust enums with `FromStr` | ✅ |
| `#[serde(rename_all = "PascalCase")]` on all structs | ✅ |
| No magic string comparisons | ✅ |
| Enum convention table | ✅ |

### 2.4 Seedable Config Alignment — ✅ Documented

Deliberate exemption with full rationale in `01-data-model.md` lines 885–950. Threshold for adopting full pattern documented.

### 2.5 Split Database Alignment — ✅ N/A (Single SQLite)

Documented as deliberate design decision. Appropriate for single-app desktop software.

### 2.6 Rust Naming & Serde — ✅ Compliant

All Rust structs use `snake_case` fields with `#[serde(rename_all = "PascalCase")]`. `from_row` mappers use PascalCase column names. EXEMPT annotations on long definitions.

### 2.7 Coding Guidelines: Function Length & Decomposition — ✅ Compliant

All Rust code samples in feature specs follow the ≤15-line rule or have EXEMPT annotations. Functions like `validate_custom_sound` and `validate_webhook_url` are properly decomposed into subfunctions.

---

## Phase 3: Content Completeness Audit

### 3.1 Feature Completeness Matrix

| Feature File | IPC Cmds | Rust Structs | Edge Cases | Acceptance Criteria | Cross-Refs | Assessment |
|-------------|:--------:|:------------:|:----------:|:-------------------:|:----------:|:----------:|
| 01 Alarm CRUD | ✅ | ✅ | ✅ | ✅ (11) | ✅ | Complete |
| 02 Scheduling | ✅ | ✅ | ✅ | ✅ (9) | ✅ | Complete |
| 03 Firing | ✅ | ✅ | ✅ | ✅ (14) | ✅ | Complete |
| 04 Snooze | ✅ | ✅ | ✅ (5) | ✅ (7) | ✅ | Complete |
| 05 Sound | ✅ | ✅ | ✅ (6) | ✅ (10) | ✅ | Complete |
| 06 Challenges | ✅ | ✅ | ✅ (5) | ✅ (8) | ✅ | Complete |
| 07 Groups | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| 08 Clock | ✅ | — | ✅ (4) | ✅ (5) | ✅ | Complete |
| 09 Theme | ✅ | — | ✅ | ✅ | ✅ | Complete |
| 10 Export/Import | ✅ | ✅ | ✅ (6) | ✅ (12) | ✅ | Complete |
| 11 Sleep Wellness | ✅ | ✅ | ✅ (12) | ✅ (8) | ✅ | Complete |
| 12 Smart Features | ✅ | ✅ | — | ✅ (7) | ✅ | ⚠️ Missing edge cases |
| 13 Analytics | ✅ | ✅ | — | ✅ (6) | ✅ | ⚠️ Missing edge cases |
| 14 Personalization | ✅ | ✅ | ✅ (12) | ✅ | ✅ | Complete |
| 15 Keyboard | ✅ | — | — | ✅ (10) | ✅ | ⚠️ Missing edge cases |
| 16 Accessibility | — | — | — | ✅ (10) | ✅ | Complete (NFR) |
| 17 UI Layouts | — | — | ✅ (7) | ✅ (14) | ✅ | Complete |

### 3.2 Content Gaps Found

| # | Issue | Severity | File | Details |
|---|-------|----------|------|---------|
| CG-001 | Missing edge cases table in `12-smart-features.md` | 🟡 Medium | `12-smart-features.md` | P3 features but still need edge cases: webhook timeout, weather API key missing, location permission denied scenarios |
| CG-002 | Missing edge cases table in `13-analytics.md` | 🟡 Medium | `13-analytics.md` | No edge cases for: empty history, date range spanning DST change, CSV export with 10k+ events, concurrent clear+export |
| CG-003 | Missing edge cases table in `15-keyboard-shortcuts.md` | 🟢 Low | `15-keyboard-shortcuts.md` | Missing: shortcut conflict with OS, text input focus suppression failure, global shortcut registration failure |
| CG-004 | No `Quotes` SQLite table defined in `01-data-model.md` | 🟡 Medium | `01-data-model.md` | `14-personalization.md` references Quotes stored in SQLite, and defines a `Quote` interface/struct, but no `CREATE TABLE Quotes` exists in the schema. AI will have to guess the table structure. |
| CG-005 | No `Webhooks` SQLite table defined in `01-data-model.md` | 🟡 Medium | `01-data-model.md` | `12-smart-features.md` defines `WebhookConfig` with `WebhookId`, `AlarmId`, `Url`, `Payload`, `CreatedAt` — but no `CREATE TABLE Webhooks` in the schema. AI must guess. |
| CG-006 | `Settings` interface vs Settings Keys mismatch | 🟡 Medium | `01-data-model.md` | See S-004. The typed `Settings` interface includes `ThemeSkin`, `AccentColor`, `DefaultMaxSnoozeCount`, `AutoDismissMin`, `IsGradualVolumeEnabled`, `GradualVolumeDurationSec` but these have no matching rows in the Settings Keys table. Conversely, `MinimizeToTray` and `ExportWarningDismissed` keys exist but aren't in the struct. |
| CG-007 | `AutoLaunch` and `MinimizeToTray` in Settings Keys table but not visible in `SettingsResponse` Rust struct | 🟢 Low | `01-data-model.md` | `AutoLaunch` appears in Settings Keys and in the UI layout, but the Rust `SettingsResponse` struct doesn't include it. AI must decide whether to add it or handle it separately. |
| CG-008 | Zustand store state shapes still undefined (carried from Phase 6 AI-005) | 🟡 Medium | Missing | `useAlarmStore`, `useOverlayStore`, `useSettingsStore` are named but their TypeScript interfaces are not defined anywhere. AI must guess all state fields. |

### 3.3 Missing Backend Behavior

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| BE-001 | Concurrent alarm firing queue spec incomplete | 🟡 Medium | `03-alarm-firing.md` mentions queue but no max size, overflow behavior, or data structure specified |
| BE-002 | No database backup/restore spec | 🟢 Low | Export/import covers alarm data but not SQLite-level backup |
| BE-003 | No logging/telemetry spec (carried from Phase 6) | 🟢 Low | `tracing` used in samples but no spec for log levels, rotation, or what to log |

---

## Phase 4: AI Gap & Failure Risk Audit

### 4.1 Forced Guesses — Where an AI WILL Guess

| # | Gap | Severity | AI Risk | Details |
|---|-----|----------|:-------:|---------|
| AI-001 | `Settings` interface ↔ Settings Keys table mismatch | 🟡 Medium | **High** | AI will implement one or the other, creating mismatched frontend/backend. 6 fields don't have matching keys. |
| AI-002 | `Quotes` table schema undefined | 🟡 Medium | **Medium** | Quote CRUD IPC commands defined, Rust/TS structs defined, but no SQL table. AI will invent columns. |
| AI-003 | `Webhooks` table schema undefined | 🟡 Medium | **Medium** | Same as AI-002. WebhookConfig struct defined but no SQL schema. |
| AI-004 | Zustand store state shapes undefined | 🟡 Medium | **Medium** | Three stores named, some fields mentioned across specs, but no authoritative TypeScript interface. |
| AI-005 | `WebhookError` variant count stated as 4, actual is 7 | 🟡 Medium | **Medium** | AI reading overview/cheat-sheet will create 4 variants; reading `12-smart-features.md` will create 7. Contradiction. |
| AI-006 | Theme toggle location conflict: `09-theme-system.md` says "top-right corner sun/moon icon", `17-ui-layouts.md` Settings screen has Theme in Appearance section as SegmentedControl | 🟢 Low | **Low** | Two different UI locations for theme control. Both may coexist, but spec doesn't clarify relationship. |

### 4.2 AI Failure Probability Assessment

| Scenario | Probability | Rationale |
|----------|:-----------:|-----------|
| Correct alarm engine (Rust) | 97%+ | Excellent code samples, DST handling, patterns |
| Correct IPC implementation | 95%+ | Named structs, serde attributes, 46-command error mapping |
| Correct database schema | 90% | Schema defined, but missing `Quotes` and `Webhooks` tables for P2/P3 features |
| Correct Settings implementation | 70% | Interface and Keys table contradict each other — AI must reconcile |
| Correct error handling | 95%+ | Full IPC→AlarmAppError mapping table (Phase 6 fix) |
| Correct UI implementation | 85% | Layouts defined (Phase 6), but store shapes undefined |
| **Overall blind AI execution** | **88–92%** | Backend: 96%+. Frontend: 80–85%. Settings mismatch is highest single risk. |

### 4.3 Risk Summary

| Risk Level | Count | Items |
|:----------:|:-----:|-------|
| 🔴 Critical | 0 | — |
| 🟡 Medium | 8 | S-003/004, B-001, CG-001/002/004/005/006, AI-001–005 (some overlap) |
| 🟢 Low | 5 | S-001/002, B-002, CG-003/007, AI-006 |

---

## Phase 5: Issue Grouping — Atomic Fix Tasks

### Task Group 1: Settings Interface Reconciliation (3 issues)

**Priority: High — biggest single AI failure risk**

| Task | Issues | Effort |
|------|--------|--------|
| Reconcile `Settings` typed interface with Settings Keys table — add missing keys, remove orphan struct fields, or document each discrepancy | S-004, CG-006, AI-001 | Medium |

### Task Group 2: Missing Table Schemas (2 issues)

| Task | Issues | Effort |
|------|--------|--------|
| Add `CREATE TABLE Quotes` to `01-data-model.md` schema section | CG-004, AI-002 | Small |
| Add `CREATE TABLE Webhooks` to `01-data-model.md` schema section (P3 feature, but schema should exist for completeness) | CG-005, AI-003 | Small |

### Task Group 3: Structural Corrections (2 issues)

| Task | Issues | Effort |
|------|--------|--------|
| Add `17-ui-layouts.md` to `02-features/00-overview.md` inventory table | S-001, S-002 | Trivial |
| Fix `WebhookError` variant count in root overview and cheat sheet to say 7 instead of 4 | S-003, AI-005 | Trivial |

### Task Group 4: Missing Edge Cases (3 issues)

| Task | Issues | Effort |
|------|--------|--------|
| Add edge cases table to `12-smart-features.md` | CG-001 | Small |
| Add edge cases table to `13-analytics.md` | CG-002 | Small |
| Add edge cases table to `15-keyboard-shortcuts.md` | CG-003 | Trivial |

### Task Group 5: Boolean Exemption + Minor Fixes (3 issues)

| Task | Issues | Effort |
|------|--------|--------|
| Add nullable boolean exemption note for `IsPreviousEnabled` (similar to DB-001 PK exemption) | B-001 | Trivial |
| Add note that `Is24Hour` is derived from `TimeFormat` key, not a DB column | B-002 | Trivial |
| Clarify `AutoLaunch`/`MinimizeToTray` presence in `SettingsResponse` struct | CG-007 | Trivial |

### Task Group 6: Carried Issues from Phase 6 (2 issues)

| Task | Issues | Effort |
|------|--------|--------|
| Define Zustand store state shapes (`useAlarmStore`, `useOverlayStore`, `useSettingsStore`) | AI-004 (was AI-005 in Phase 6) | Medium |
| Add logging/telemetry spec | BE-003 | Small |

---

## Gap Assessment Summary

| Metric | Value |
|--------|-------|
| **Total issues found** | 18 |
| **🔴 Critical** | 0 |
| **🟡 Medium** | 8 |
| **🟢 Low** | 5 |
| **🟢 Trivial** | 5 |
| **Carried from Phase 6** | 2 (AI-004/Zustand, BE-003/logging) |
| **New issues** | 16 |
| **Gap to full readiness** | ~8% (backend: ~2%, frontend: ~15%) |
| **Blind AI execution success** | 88–92% (up from 75–80% pre-Phase 6) |
| **Backend-only AI success** | 96%+ |
| **Full-stack AI success** | 88–92% |

### Key Observations

1. **Settings mismatch is the single biggest risk.** The typed `SettingsResponse` interface and the Settings Keys table disagree on 8 fields. An AI implementing both will produce inconsistent code. This is a new finding not caught in Phases 1–6.

2. **Missing table schemas for P2/P3 features.** `Quotes` and `Webhooks` have full TypeScript/Rust struct definitions and IPC commands, but no `CREATE TABLE` in the schema. An AI will invent table structures that may not match the structs.

3. **`WebhookError` variant count is wrong in 2 files.** The root overview and cheat sheet say "4 variants" but the actual definition has 7. This was likely accurate before P14 fixes added more variants but the count was never updated.

4. **Backend spec quality remains excellent.** Rust code samples, IPC commands, error enums, DST handling, platform constraints — all best-in-class.

5. **Phase 6 fixes significantly improved the spec.** UI layouts, notification templates, i18n conventions, routing, IPC error mapping, and edge cases all addressed. The remaining gaps are primarily data model consistency issues.

### Recommended Fix Priority

1. **Settings reconciliation** (Task Group 1) — highest impact, medium effort
2. **Structural corrections** (Task Group 3) — quick wins, prevent contradiction
3. **Missing table schemas** (Task Group 2) — medium impact, small effort
4. **Zustand store shapes** (Task Group 6) — last major AI-readiness gap
5. **Missing edge cases** (Task Group 4) — nice-to-have completeness
6. **Boolean exemption** (Task Group 5) — documentation polish

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Previous Gap Analysis (Phase 6) | `./56-gap-analysis-phase-6.md` |
| Coding Guidelines | `../../02-coding-guidelines/03-coding-guidelines-spec/` |
| Database Naming Conventions | `../../02-coding-guidelines/03-coding-guidelines-spec/10-database-conventions/01-naming-conventions.md` |
| Boolean Principles | `../../02-coding-guidelines/03-coding-guidelines-spec/01-cross-language/02-boolean-principles.md` |
| Seedable Config | `../../05-seedable-config-architecture/01-fundamentals.md` |
| Split Database | `../../04-split-db-architecture/01-fundamentals.md` |

---

*Gap Analysis Phase 7 — created: 2026-04-11*

```
Do you understand? Always add this part at the end of the writing inside the code block.

Remaining Tasks:
- Task Group 1: Reconcile Settings interface with Settings Keys table (S-004, CG-006, AI-001)
- Task Group 2: Add Quotes and Webhooks CREATE TABLE schemas (CG-004/005, AI-002/003)
- Task Group 3: Add 17-ui-layouts.md to feature overview + fix WebhookError count (S-001/002/003, AI-005)
- Task Group 4: Add edge cases to 12-smart-features, 13-analytics, 15-keyboard-shortcuts (CG-001/002/003)
- Task Group 5: Add IsPreviousEnabled nullable boolean exemption + Is24Hour derivation note + AutoLaunch/MinimizeToTray struct fix (B-001/002, CG-007)
- Task Group 6: Define Zustand store state shapes + logging spec (AI-004, BE-003)

Say "next" to execute Task Group 1 (Settings reconciliation — highest priority).
```
