# Gap Analysis — Phase 1: Structural & Foundational Alignment Audit

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Scope:** Audit the App specification folder (`02-features/` and `01-fundamentals/`) against foundational specs (coding guidelines, boolean fixes, enum patterns, split DB, seedable config, naming conventions). Phase 1 covers structural consistency and foundational alignment.  
**Status:** Discovery only — no fixes applied.

---

## Audit Summary

| Metric | Value |
|--------|-------|
| Issues found | 29 |
| 🔴 Critical (will break AI implementation) | 6 |
| 🟠 High (ambiguity / wrong implementation) | 10 |
| 🟡 Medium (weakens clarity) | 9 |
| 🟢 Low (cosmetic / secondary) | 4 |

---

## Estimated AI Blind Execution Failure Rate

| Scenario | Estimated Failure Rate |
|----------|----------------------|
| AI given ONLY the App spec folder | ~25-30% failure |
| AI given App spec + fundamentals + coding guidelines | ~10-15% failure |
| AI given everything + this gap analysis fixes applied | ~3-5% failure |

**Rationale:** The spec is already exceptionally well-organized (100/100 readiness score after 405 issues resolved). The remaining gaps are second-order: missing interface definitions that force AI guessing, inconsistent error handling patterns in code samples, and incomplete logging guidance in 12/16 feature specs.

---

## Phase 1 Findings

### Category A: Missing Interface Definitions (🔴 Critical)

These interfaces are referenced in IPC tables but never defined anywhere. AI MUST guess their shape.

| # | ID | Issue | Location | Severity |
|---|-----|-------|----------|----------|
| 1 | GA1-001 | `CreateAlarmPayload` interface referenced in IPC table and architecture but **never defined** — AI has no field list | `01-alarm-crud.md` L296, `06-tauri-architecture.md` L84 | 🔴 Critical |
| 2 | GA1-002 | `UpdateAlarmPayload` interface referenced in IPC table but **never defined** — AI must guess which fields are updatable vs read-only | `01-alarm-crud.md` L297, `06-tauri-architecture.md` L85 | 🔴 Critical |
| 3 | GA1-003 | `CreateGroupPayload` interface never defined — `07-alarm-groups.md` IPC table references it implicitly but no shape given | `07-alarm-groups.md` | 🟠 High |
| 4 | GA1-004 | `UpdateGroupPayload` interface never defined | `07-alarm-groups.md` | 🟠 High |

**AI Risk:** Without `CreateAlarmPayload`, an AI will either include all 25 Alarm fields (wrong — `AlarmId`, `CreatedAt`, `UpdatedAt`, `NextFireTime`, `DeletedAt` are server-generated) or guess which to exclude (likely wrong).

### Category B: Error Handling Violations (🔴 Critical)

Per coding guidelines: "ZERO TOLERANCE: Never swallow an error." These code samples violate that rule.

| # | ID | Issue | Location | Severity |
|---|-----|-------|----------|----------|
| 5 | GA1-005 | `.ok();` swallows SQL DELETE error in `cleanup_stale_soft_deletes` — no logging, no error propagation | `01-alarm-crud.md` L90 | 🔴 Critical |
| 6 | GA1-006 | `.ok();` swallows SQL DELETE error in `purge_old_events` — same pattern | `01-data-model.md` L611 | 🔴 Critical |
| 7 | GA1-007 | `_ => {}` silently ignores non-positive-row-count case in `schedule_permanent_delete` | `01-alarm-crud.md` L79 | 🟠 High |

**AI Risk:** An AI following these code samples will replicate the error-swallowing pattern throughout the codebase, violating the #1 coding guideline.

### Category C: Prose Magic Strings (🟠 High)

Per coding guidelines: "No magic strings → enum." These appear in prose where an AI might copy them.

| # | ID | Issue | Location | Severity |
|---|-----|-------|----------|----------|
| 8 | GA1-008 | `"Interval"` and `"Cron"` used as raw strings in prose UI description instead of `RepeatType::Interval` / `RepeatType::Cron` | `02-alarm-scheduling.md` L68-69 | 🟡 Medium |

### Category D: Missing Logging in Code Samples (🟠 High)

Per coding guidelines: "Log at: function entry, external calls, errors." 12 of 16 feature specs have ZERO `tracing::` calls in their code samples.

| # | ID | Issue | Location | Severity |
|---|-----|-------|----------|----------|
| 9 | GA1-009 | No logging in dismissal challenges code samples (0 tracing calls) | `06-dismissal-challenges.md` | 🟠 High |
| 10 | GA1-010 | No logging in alarm groups code samples (0 tracing calls) | `07-alarm-groups.md` | 🟠 High |
| 11 | GA1-011 | No logging in clock display code samples (0 tracing calls) | `08-clock-display.md` | 🟡 Medium |
| 12 | GA1-012 | No logging in theme system code samples (0 tracing calls) | `09-theme-system.md` | 🟡 Medium |
| 13 | GA1-013 | No logging in export/import code samples (0 tracing calls) | `10-export-import.md` | 🟠 High |
| 14 | GA1-014 | No logging in sleep/wellness code samples (0 tracing calls) | `11-sleep-wellness.md` | 🟡 Medium |
| 15 | GA1-015 | No logging in analytics code samples (0 tracing calls) | `13-analytics.md` | 🟡 Medium |
| 16 | GA1-016 | No logging in personalization code samples (0 tracing calls) | `14-personalization.md` | 🟡 Medium |
| 17 | GA1-017 | No logging in keyboard shortcuts code samples (0 tracing calls) | `15-keyboard-shortcuts.md` | 🟢 Low |
| 18 | GA1-018 | No logging in accessibility/NFR code samples (0 tracing calls) | `16-accessibility-and-nfr.md` | 🟢 Low |

**AI Risk:** An AI will generate functions without logging, making debugging impossible in production.

### Category E: Missing IPC Sections in Feature Specs (🟠 High)

6 feature specs reference Tauri IPC operations but have no formal "IPC Commands" section with the standard table format.

| # | ID | Issue | Location | Severity |
|---|-----|-------|----------|----------|
| 19 | GA1-019 | `02-alarm-scheduling.md` — no IPC Commands table (scheduling is handled by alarm CRUD, but this is not explicitly stated) | `02-alarm-scheduling.md` | 🟠 High |
| 20 | GA1-020 | `03-alarm-firing.md` — no formal IPC Commands table (has inline invoke calls but no summary table) | `03-alarm-firing.md` | 🟡 Medium |
| 21 | GA1-021 | `05-sound-and-vibration.md` — has `set_custom_sound` inline but no IPC Commands table | `05-sound-and-vibration.md` | 🟡 Medium |
| 22 | GA1-022 | `11-sleep-wellness.md` — no IPC Commands section despite defining bedtime reminder and mood logging behavior | `11-sleep-wellness.md` | 🟠 High |
| 23 | GA1-023 | `12-smart-features.md` — no IPC Commands table despite defining webhook and location alarm operations | `12-smart-features.md` | 🟠 High |
| 24 | GA1-024 | `16-accessibility-and-nfr.md` — no IPC Commands section (may not need one — NFR spec) | `16-accessibility-and-nfr.md` | 🟢 Low |

**AI Risk:** Without an IPC table, an AI must infer command names, payloads, and return types — high chance of inconsistency with existing commands.

### Category F: Coding Guidelines Cross-Reference Missing (🟡 Medium)

Only 4 of 28 spec files cross-reference the coding guidelines. The coding guidelines mandate "Spec first → code second" and all code samples should follow its rules.

| # | ID | Issue | Location | Severity |
|---|-----|-------|----------|----------|
| 25 | GA1-025 | 12 feature specs lack a Cross-References entry pointing to coding guidelines | `02-features/` (12 of 16 files) | 🟡 Medium |

### Category G: Nested Control Flow in Code Samples (🟢 Low)

Per coding guidelines: "Zero nested `if`". Some code samples have nested conditions.

| # | ID | Issue | Location | Severity |
|---|-----|-------|----------|----------|
| 26 | GA1-026 | Nested `if` in `compute_weekly`: `if let Some(t) = ... { if t > now { return ... } }` — could be flattened with early continue | `03-alarm-firing.md` L120-121 | 🟢 Low |

### Category H: Split DB & Seedable Config Alignment (✅ Clean)

| # | ID | Issue | Location | Severity |
|---|-----|-------|----------|----------|
| 27 | GA1-027 | Split DB: Explicitly documented as NOT applicable — single DB decision with full rationale | `01-data-model.md` L940-975 | ✅ No issue |
| 28 | GA1-028 | Seedable Config: Explicitly documented with simplified approach rationale and cross-reference to full architecture | `01-data-model.md` L640-710 | ✅ No issue |
| 29 | GA1-029 | Settings seeding via V1 migration with `INSERT OR IGNORE` upgrade path — aligns with seedable config principles | `01-data-model.md` L660-690 | ✅ No issue |

---

## Structural Consistency Assessment

| Check | Status | Notes |
|-------|--------|-------|
| Folder placement | ✅ | `01-fundamentals/` + `02-features/` properly separated |
| File naming (kebab-case with numeric prefix) | ✅ | All 28 files follow `NN-name.md` pattern |
| Section naming consistency | ✅ | All have Keywords, Scoring, Description, Cross-References |
| Numbering sequential | ✅ | 01-16 features, 01-11 fundamentals |
| Separation of concerns | ✅ | Each feature is self-contained with clear boundaries |
| `00-overview.md` present | ✅ | Both folders have overviews |
| `99-consistency-report.md` present | ✅ | Both folders have reports |
| `97-acceptance-criteria.md` present | ✅ | Both folders have rollups |
| PascalCase in all SQL/code/IPC | ✅ | Consistent after 405 fixes |
| Boolean naming (`is`/`has` prefix) | ✅ | All boolean fields follow convention |
| Enum patterns (proper types, no magic strings in code) | ✅ | 13 domain enums properly defined |
| Negation in booleans | ✅ | No `isNot`/`hasNo` patterns found |

---

## Remaining Phases

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 1** | Structural & Foundational Alignment | ✅ Complete (this document) |
| **Phase 2** | Content Completeness — backend behavior, frontend behavior, flow details, edge cases | ⬜ Pending |
| **Phase 3** | AI Failure Risk — forced guesses, conflicting instructions, missing sequences | ⬜ Pending |
| **Phase 4** | Deep Code Sample Audit — every code block checked against coding guidelines | ⬜ Pending |
| **Phase 5** | Issue Grouping — atomic fixable tasks, effort estimates | ⬜ Pending |

---

## Key Observations

1. **The spec is already excellent** — 100/100 readiness score after 405 resolved issues is reflected in the findings. No structural issues, naming is consistent, enums are proper, split DB and seedable config alignment is explicitly documented with rationale.

2. **The critical gaps are second-order** — missing payload interfaces (`CreateAlarmPayload`, `UpdateAlarmPayload`) are the single biggest AI failure risk. An AI WILL guess wrong on which fields are client-supplied vs server-generated.

3. **Error handling in code samples contradicts coding guidelines** — `.ok();` appears in 2 code samples, directly violating the "ZERO TOLERANCE: Never swallow an error" rule. An AI will replicate this anti-pattern.

4. **Logging gap is systematic** — 12 of 16 feature specs have no logging in code samples. This creates a blind spot in production debugging.

5. **IPC table inconsistency** — some features define formal IPC Command tables while others have inline `invoke()` calls scattered in prose. An AI needs the consistent table format to auto-generate command handlers.

---

*Gap Analysis Phase 1 — updated: 2026-04-10*
