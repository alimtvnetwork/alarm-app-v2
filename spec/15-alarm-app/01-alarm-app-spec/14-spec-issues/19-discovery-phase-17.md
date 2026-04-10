# Discovery Phase 17 — Execution Guides, Handoff Reports & Concurrency Audit

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Auditor:** AI Spec Auditor  
**Scope:** Atomic task breakdown, platform/concurrency guide, AI handoff readiness/reliability reports — consistency, naming, stale metrics

---

## Audit Methodology

1. Reviewed `11-atomic-task-breakdown.md` for naming, reference accuracy, and task completeness
2. Reviewed `12-platform-and-concurrency-guide.md` code samples for boolean/enum/naming violations
3. Reviewed `10-ai-handoff-readiness-report.md` and `09-ai-handoff-reliability-report.md` for stale metrics
4. Cross-referenced all claims against actual current issue counts

---

## P17-001: Handoff Readiness Report Claims 180 Issues / 100% Resolved — Stale

**Severity:** 🔴 Critical  
**Rule Violated:** Internal consistency — metrics must reflect current state  
**Location:** `10-ai-handoff-readiness-report.md` (12+ lines)  
**Observation:** The report claims:
- "All 180 identified issues... resolved" (line 19)
- "Readiness Score: 100/100 (A+)" (line 23)
- "AI Success Rate: 99%+" (line 7)
- "Total Issues: 180, Resolved: 180, Open: 0" (lines 26–28)
- "13 discovery phases" (line 29)

**Actual state:** 234 total issues, 54 open, 16 discovery phases. The readiness score should be significantly lower than 100/100. AI success rate is estimated at ~70%, not 99%+.  
**AI Risk:** An AI reading this report will believe the spec is perfect and skip validation. This is the most dangerous stale data in the spec.

---

## P17-002: Handoff Readiness Report — Checklist Item 12 Stale

**Severity:** 🟡 Medium  
**Location:** `10-ai-handoff-readiness-report.md` line 169  
**Code:** `All 180 spec issues resolved across 13 discovery phases ✅`  
**Actual:** 234 issues, 54 open, 16 phases.

---

## P17-003: Handoff Readiness Report — Severity Table Stale

**Severity:** 🟡 Medium  
**Location:** `10-ai-handoff-readiness-report.md` lines 74–80  
**Observation:** Table shows 39 Critical, 80 Medium, 19 Low = 180. Actual: 47 Critical, 111 Medium, 34 Low = 234 (54 open).

---

## P17-004: Reliability Report — Superseded Task Count Not Updated

**Severity:** 🟢 Low  
**Location:** `09-ai-handoff-reliability-report.md` line 24  
**Observation:** States "94 tasks — SUPERSEDED" and references the 62-task version. This is correct (it's marked as historical). However, the reliability report still claims "ALL RESOLVED" for spec improvements (line 223) which is no longer accurate given 54 open issues.

---

## P17-005: Concurrency Guide — `e.r#type == "fired"` Magic String Comparison

**Severity:** 🟡 Medium  
**Rule Violated:** Magic strings §8.2 — domain status comparisons must use enum  
**Location:** `12-platform-and-concurrency-guide.md` lines 452, 466  
**Code:** `events.iter().filter(|e| e.r#type == "fired").count()`  
**Required Fix:** Should use `e.r#type == AlarmEventType::Fired` (once the enum exists per P14-005).

---

## P17-006: Concurrency Guide — `expect()` in Non-Startup Code

**Severity:** 🟡 Medium  
**Rule Violated:** Error handling — `expect()` panics in production  
**Location:** `12-platform-and-concurrency-guide.md` lines 107–108  
**Code:**
```rust
let conn = Connection::system().await.expect("D-Bus connect failed");
let proxy = Login1ManagerProxy::new(&conn).await.expect("proxy failed");
```
**Context:** This is inside the Linux gotcha section (1.3). The VERY NEXT code block (lines 114–119) shows the correct pattern with `match` and graceful degradation. These two code blocks contradict each other — the first uses `expect()`, the second handles the error properly.  
**AI Risk:** AI may copy the first block (line 107) instead of the correct second block (line 114).

---

## P17-007: Concurrency Guide — `deleted_at` snake_case Field in Test

**Severity:** 🟢 Low  
**Location:** `12-platform-and-concurrency-guide.md` line 431  
**Code:** `assert!(alarm.unwrap().deleted_at.is_none());`  
**Context:** Rust struct field — snake_case is correct per Rust convention. The field serializes to `DeletedAt` via serde. Not a violation, but should have a comment: `// Rust field: deleted_at → serializes to DeletedAt`.

---

## P17-008: Concurrency Guide — `alarm_id` vs `AlarmId` Inconsistency

**Severity:** 🟢 Low  
**Location:** `12-platform-and-concurrency-guide.md` lines 232, 235, 243  
**Code:** `alarm.alarm_id` (Rust snake_case field access)  
**Context:** Same as P17-007 — Rust convention, not a violation. But the code uses `alarm.alarm_id` in the engine (line 232) while the SQL uses `AlarmId` (line 166). This is correct (Rust field vs DB column) but the transition is never explained in-doc.

---

## P17-009: Concurrency Guide — Mutex `expect()` Documented But Not Exempt

**Severity:** 🟢 Low  
**Location:** `12-platform-and-concurrency-guide.md` lines 230, 242  
**Code:** `.expect("currently_firing mutex poisoned")`  
**Context:** Mutex poisoning is a panic-worthy scenario (thread panicked while holding lock). This `expect()` is intentional and correct. Should be documented in the exemptions list alongside startup `expect()` calls.

---

## P17-010: Atomic Task Breakdown — No Mention of Enum Creation Tasks

**Severity:** 🟡 Medium  
**Rule Violated:** Content completeness  
**Location:** `11-atomic-task-breakdown.md`  
**Observation:** The 62-task breakdown includes Task 12 ("Implement `AlarmAppError` enum") and Task 13 ("Create TypeScript interfaces"). However, there is NO task for creating the domain enums identified in P14:
- `ChallengeType` enum (TS + Rust)
- `ChallengeDifficulty` enum
- `AlarmEventType` enum
- `RepeatType` TypeScript enum (Rust already has it)
- `SoundCategory` enum
- `SettingsValueType` enum
- `ThemeMode` enum
- `ExportFormat`, `ExportScope`, `DuplicateAction`, `ImportMode` enums
- `SortField` enum

These are spread across Task 9 (models.rs) and Task 13 (TS interfaces) but never explicitly called out. An AI will create the structs/interfaces without the enums.

---

## P17-011: Atomic Task Breakdown — Task 12 References Wrong File

**Severity:** 🟡 Medium  
**Location:** `11-atomic-task-breakdown.md` line 50  
**Code:** Task 12 spec reference: `04-platform-constraints.md → Rust Error Type`  
**Observation:** `04-platform-constraints.md` lists some error variants but does NOT define the complete `AlarmAppError` enum. Per P14-018/P14-027, there IS no complete error enum spec. Task 12 references a file that doesn't contain what the task needs.

---

## P17-012: Atomic Task Breakdown — Near-100% Success Claim Stale

**Severity:** 🟡 Medium  
**Location:** `11-atomic-task-breakdown.md` line 6  
**Code:** "Purpose: Dependency-ordered atomic coding tasks for AI execution at near-100% success"  
**Observation:** With 54 open issues including missing enums, missing error specs, wrong test fixtures, and magic strings throughout — the "near-100% success" claim is inaccurate. Current estimate: ~70%.

---

## Summary

| Severity | Count |
|----------|:-----:|
| 🔴 Critical | 1 |
| 🟡 Medium | 7 |
| 🟢 Low | 4 |
| **Total** | **12** |

### Key Findings

1. **Handoff readiness report is dangerously stale** (P17-001) — claims 100/100, 180 issues, 0 open. Actual: 234 issues, 54 open, ~70% AI success rate. An AI reading this will skip all validation.
2. **Concurrency guide has contradictory D-Bus code** (P17-006) — `expect()` crash version right next to the graceful `match` version.
3. **Magic string `"fired"` comparison in test code** (P17-005) — reinforces the pattern P14-005 aims to fix.
4. **Atomic task breakdown missing enum creation tasks** (P17-010) — 12+ domain enums not assigned to any task.
5. **Task 12 references wrong file for error enum** (P17-011) — file doesn't contain the needed spec.

---

## Cumulative Issue Count

| Phase | Issues | Net New | Running Total |
|-------|:------:|:-------:|:-------------:|
| Phases 1–13 | 180 | 180 | 180 |
| Phase 14 | 29 | 29 | 209 |
| Phase 15 | 13 | 13 | 222 |
| Phase 16 | 12 | 12 | 234 |
| **Phase 17** | **12** | **12** | **246** |

**Open: 66 | Resolved: 180**

---

*Discovery Phase 17 — updated: 2026-04-10*
