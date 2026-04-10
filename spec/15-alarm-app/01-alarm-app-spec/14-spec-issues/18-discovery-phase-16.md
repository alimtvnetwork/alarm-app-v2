# Discovery Phase 16 — Test Fixtures, Cheat Sheet & Cross-Reference Audit

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Auditor:** AI Spec Auditor  
**Scope:** Test strategy code samples, AI cheat sheet alignment, cross-reference completeness, test fixture naming

---

## Audit Methodology

1. Reviewed `09-test-strategy.md` code samples for naming/boolean/negation violations
2. Reviewed `13-ai-cheat-sheet.md` for accuracy vs current spec state
3. Checked cross-reference tables in all feature files for completeness
4. Verified test fixtures against PascalCase key naming rules

---

## P16-001: Test Fixture Uses camelCase Keys

**Severity:** 🔴 Critical  
**Rule Violated:** PascalCase key naming (`11-key-naming-pascalcase.md`)  
**Location:** `01-fundamentals/09-test-strategy.md` lines 284–294  
**Code:**
```typescript
export const testAlarm = {
  time: '07:30',           // should be Time
  label: 'Test Alarm',     // should be Label
  repeat: { type: 'daily', daysOfWeek: [], intervalMinutes: 0, cronExpression: '' },
  snoozeDurationMin: 5,    // should be SnoozeDurationMin
  maxSnoozeCount: 3,       // should be MaxSnoozeCount
  soundFile: 'classic-beep', // should be SoundFile
  gradualVolume: false,    // should be IsGradualVolume (also missing Is prefix)
  gradualVolumeDurationSec: 30, // should be GradualVolumeDurationSec
  autoDismissMin: 0,       // should be AutoDismissMin
};
```
**Required Fix:** ALL keys must be PascalCase. `gradualVolume` also violates boolean P1 (missing `Is` prefix). `repeat` sub-object keys also camelCase.  
**AI Risk:** Very high — AI copies test fixtures verbatim. Every test will use wrong key names.

---

## P16-002: Test Fixture `repeat.type` Uses Magic String

**Severity:** 🟡 Medium  
**Rule Violated:** Magic strings rule §8.2  
**Location:** `09-test-strategy.md` line 287  
**Code:** `type: 'daily' as const`  
**Required Fix:** Should use `Type: RepeatType.Daily` (TypeScript enum).

---

## P16-003: Integration Test Uses snake_case Field Access

**Severity:** 🟡 Medium  
**Rule Violated:** Rust struct fields use snake_case (exempt — Rust convention), but the test accesses `alarm.time`, `alarm.next_fire_time`, `alarm.alarm_id` which implies the Rust struct has snake_case fields. This is CORRECT per Rust convention and the serde exemption.  
**Verdict:** **Not a violation** — Rust fields are snake_case, serde serializes to PascalCase. However, the test should add a comment clarifying this: `// Rust struct fields are snake_case; serde serializes to PascalCase for IPC`.  
**Severity downgrade:** 🟢 Low (documentation clarity, not a defect)

---

## P16-004: `assert!(!result.undo_token.is_empty())` — Raw Negation in Test

**Severity:** 🟢 Low  
**Rule Violated:** Boolean principles P3 — No raw `!` on function calls  
**Location:** `09-test-strategy.md` line 118  
**Code:** `assert!(!result.undo_token.is_empty());`  
**Required Fix:** `assert!(result.undo_token.is_defined());` or define a positive assertion  
**Exemption Check:** Test assertions with `assert!(!...)` are extremely common in Rust. This could be added to the Go-style exemptions list for Rust. Recommend documenting as exempt.

---

## P16-005: E2E Test Uses `.not.toBeVisible()` — Playwright Negation

**Severity:** 🟢 Low  
**Rule Violated:** Boolean principles P3  
**Location:** `09-test-strategy.md` line 215  
**Code:** `await expect(page.locator('[data-testid="alarm-overlay"]')).not.toBeVisible();`  
**Exemption Check:** `.not.toBeVisible()` is Playwright's API. Framework API negation should be exempt (like `!ok` in Go). Recommend documenting as exempt: "Playwright/Jest `.not.*` matchers are exempt."

---

## P16-006: AI Cheat Sheet — `thiserror` Version Mismatch

**Severity:** 🟡 Medium  
**Rule Violated:** Internal consistency  
**Location:** `13-ai-cheat-sheet.md` line 24  
**Code:** `thiserror | 1.x`  
**Actual:** `10-dependency-lock.md` pins `thiserror = "=2.0.12"` (version 2, not 1)  
**AI Risk:** AI will use `thiserror 1.x` API which differs from 2.x (`#[error(...)]` attribute syntax changed).

---

## P16-007: AI Cheat Sheet — Missing Enum Guidance

**Severity:** 🟡 Medium  
**Rule Violated:** Content completeness  
**Location:** `13-ai-cheat-sheet.md`  
**Observation:** The cheat sheet has NO mention of:
- Required TypeScript enums (ChallengeType, AlarmEventType, RepeatType, etc.)
- Required Rust enums beyond RepeatType
- The magic string zero-tolerance rule
- The PascalCase serialization requirement for enum variants

An AI reading only the cheat sheet will use raw strings everywhere.

---

## P16-008: AI Cheat Sheet — Missing Error Enum Section

**Severity:** 🟡 Medium  
**Rule Violated:** Content completeness  
**Location:** `13-ai-cheat-sheet.md` → "Error Handling Rules" section  
**Observation:** The error handling section lists 5 behavioral rules but provides NO `AlarmAppError` or `WebhookError` enum definition. The cheat sheet is supposed to be a one-page implementation reference, yet the most critical type definition is absent.

---

## P16-009: AI Cheat Sheet — `safeInvoke` Missing PascalCase Args

**Severity:** 🟡 Medium  
**Rule Violated:** PascalCase key naming  
**Location:** `13-ai-cheat-sheet.md` line 109  
**Code:** `async function safeInvoke<T>(cmd: string, args?: Record<string, unknown>)`  
**Observation:** The function itself is fine (camelCase is correct for TS functions), but the example doesn't show that `args` keys must be PascalCase. Should add a usage example: `safeInvoke('create_alarm', { Time: '07:30', Label: 'Morning' })`.

---

## P16-010: AI Cheat Sheet — `!= 0` Pattern Without Exemption Note

**Severity:** 🟢 Low  
**Rule Violated:** Boolean principles P3  
**Location:** `13-ai-cheat-sheet.md` line 101  
**Code:** `is_enabled: row.get::<_, i32>("IsEnabled")? != 0`  
**Observation:** Same `!= 0` pattern as P15-017. The cheat sheet copies this pattern as a "Critical Implementation Pattern" — reinforcing the convention without documenting it as an exemption from the no-negation rule.

---

## P16-011: Feature Files Missing Cross-References to Coding Guidelines

**Severity:** 🟢 Low  
**Rule Violated:** Cross-reference completeness  
**Location:** All 16 feature files  
**Observation:** No feature file has a cross-reference to the coding guidelines spec. While features reference each other and fundamentals, none points to `spec/02-coding-guidelines/` for enum patterns, boolean rules, or naming conventions. An AI implementing a feature won't know to check the coding guidelines unless it reads the cheat sheet or root overview.

---

## P16-012: No Cross-Reference Between `09-test-strategy.md` and Coding Guidelines

**Severity:** 🟢 Low  
**Location:** `01-fundamentals/09-test-strategy.md` → Cross-References table  
**Observation:** The test strategy references DevOps, Data Model, CRUD, Firing — but NOT coding guidelines. Test code must follow the same boolean/naming/enum rules, and the cross-reference should make this explicit.

---

## P16-013: `09-test-strategy.md` — Frontend Test Mock Uses camelCase Payload Keys

**Severity:** 🟡 Medium  
**Rule Violated:** PascalCase key naming  
**Location:** `09-test-strategy.md` line 169  
**Code:** `await result.current.createAlarm({ Time: '07:30', Label: 'Test' });`  
**Verdict:** Actually this one IS correct — `Time` and `Label` are PascalCase. ✅  
**Correction:** This is NOT an issue. Removing from count.

---

## P16-014: `09-test-strategy.md` — IPC Mock Return Uses PascalCase Correctly

**Severity:** N/A (positive finding)  
**Location:** `09-test-strategy.md` line 165  
**Code:** `{ AlarmId: '1', Time: '07:30', Label: 'Test' }`  
**Verdict:** Correct. ✅

---

## Summary

| Severity | Count |
|----------|:-----:|
| 🔴 Critical | 1 |
| 🟡 Medium | 5 |
| 🟢 Low | 6 |
| N/A (not issues) | 2 |
| **Total Issues** | **12** |

### Key Findings

1. **Test fixture uses ALL camelCase keys** (P16-001) — highest-risk issue because AIs copy fixtures verbatim.
2. **AI cheat sheet has wrong thiserror version** (1.x vs 2.x) — will cause compilation failures.
3. **AI cheat sheet missing enum guidance entirely** — AIs reading only the cheat sheet will use magic strings.
4. **No feature file cross-references coding guidelines** — the foundational rules are invisible from the feature specs.
5. **Rust test assertion negation** (`assert!(!...)` and `.not.*`) — recommend documenting as exempt patterns.

---

## Proposed Exemptions (for Fix Phase)

| Pattern | Language | Recommendation |
|---------|----------|---------------|
| `assert!(!expr)` | Rust tests | Exempt — idiomatic test assertion |
| `.not.toBeVisible()` | Playwright/Jest | Exempt — framework matcher API |
| `row.get() != 0` | Rust SQLite | Exempt — database boolean conversion idiom |

---

## Cumulative Issue Count

| Phase | Issues | Net New | Running Total |
|-------|:------:|:-------:|:-------------:|
| Phases 1–13 | 180 | 180 | 180 |
| Phase 14 | 29 | 29 | 209 |
| Phase 15 | 13 | 13 | 222 |
| **Phase 16** | **12** | **12** | **234** |

**Open: 54 | Resolved: 180**

---

*Discovery Phase 16 — updated: 2026-04-10*
