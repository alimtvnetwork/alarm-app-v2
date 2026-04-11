# Gap Analysis — Phase 4: Deep Code Sample Audit

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Scope:** Audit every code sample (Rust and TypeScript) across all 28 spec files against coding guidelines: function length (max 15 lines), nested control flow (zero nested `if`), error handling (never swallow), magic values (use constants/enums), boolean naming (`is`/`has` prefix, no negation), logging (`tracing::` at entry/exit/error), and parameter count (max 3).  
**Status:** Discovery only — no fixes applied.

---

## Audit Methodology

1. Every code block in `01-fundamentals/` (11 files) and `02-features/` (16 files + overview + acceptance + consistency) was inspected
2. Each violation is tagged with the coding guideline rule it breaks
3. Exemptions documented in `04-platform-constraints.md` § Code Pattern Exemptions are respected
4. Struct definitions and `from_row` field-per-line mappers are exempt from the 15-line limit per `01-data-model.md` L372

---

## Audit Summary

| Metric | Value |
|--------|-------|
| Code blocks audited | ~45 |
| Issues found | 27 |
| 🔴 Critical (AI will replicate bad pattern) | 3 |
| 🟠 High (violates CODE RED rule) | 8 |
| 🟡 Medium (violates STYLE rule or weakens clarity) | 12 |
| 🟢 Low (cosmetic / minor) | 4 |

---

## Phase 4 Findings

### Category A: Error Swallowing (CODE RED — Zero Tolerance)

| # | ID | File | Line | Code Pattern | Violation | Severity |
|---|-----|------|------|-------------|-----------|----------|
| 1 | GA4-001 | `01-alarm-crud.md` | L90 | `.ok();` in `cleanup_stale_soft_deletes` | Swallows SQL DELETE error — no logging, no propagation. AI will replicate `.ok()` as acceptable pattern | 🔴 Critical |
| 2 | GA4-002 | `01-data-model.md` | L611 | `.ok();` in `purge_old_events` | Same — swallows purge error. Note: logging IS present after this line, but the error itself is swallowed | 🔴 Critical |
| 3 | GA4-003 | `01-alarm-crud.md` | L79 | `_ => {}` in `schedule_permanent_delete` | Silently ignores case where no rows were deleted (alarm was undone or doesn't exist). Should log at `DEBUG` level | 🟠 High |

**Fix pattern:** Replace `.ok()` with `match` + `tracing::warn!` for non-critical paths, or `?` for critical paths.

### Category B: Function Length Violations (>15 lines)

| # | ID | File | Lines | Function | Line Count | Exempt? | Severity |
|---|-----|------|-------|----------|:---:|:---:|----------|
| 4 | GA4-004 | `01-alarm-crud.md` | L242-271 | `onDeleteAlarm` (TS) | 19 | No | 🟡 Medium |
| 5 | GA4-005 | `03-alarm-firing.md` | L162-182 | `handle_spring_forward` | 20 | No | 🟡 Medium |
| 6 | GA4-006 | `03-alarm-firing.md` | L282-312 | `register_wake_observer` + `register_sleep_observer` (combined block) | 23 | No — these are two functions in one block but each is within limit | ✅ OK |
| 7 | GA4-007 | `03-alarm-firing.md` | L390-438 | `LinuxWakeListener::start` | 48 | No — deeply nested error handling | 🟠 High |
| 8 | GA4-008 | `05-sound-and-vibration.md` | L179-190 | `run_gradual_volume` | 12 | ✅ OK | ✅ OK |
| 9 | GA4-009 | `06-tauri-architecture.md` | L221-237 | `useAlarmEvents` (TS hook) | 17 | No | 🟡 Medium |
| 10 | GA4-010 | `04-platform-constraints.md` | L224-239 | `error_code` match | 16 | Borderline — match with 13 arms is inherently long | 🟢 Low |

### Category C: Nested Control Flow (Zero Nested `if`)

| # | ID | File | Line | Pattern | Severity |
|---|-----|------|------|---------|----------|
| 11 | GA4-011 | `03-alarm-firing.md` | L120-121 | `if !repeat.days_of_week.contains(...) { continue; }` then `if let Some(t) = ... { if t > now { return ... } }` — nested `if let` inside loop | 🟡 Medium |
| 12 | GA4-012 | `03-alarm-firing.md` | L168-176 | `match` inside `for` loop inside `match` — 3 levels of nesting in `handle_spring_forward` | 🟠 High |
| 13 | GA4-013 | `01-alarm-crud.md` | L244-249 | `if (undoStack.length >= MAX_UNDO_STACK)` wraps logic that could use early return | 🟢 Low |
| 14 | GA4-014 | `06-tauri-architecture.md` | L228-232 | `if (activeAlarm) { enqueueAlarm() } else { showOverlay() }` — simple ternary, not truly nested | ✅ OK |

### Category D: Parameter Count Violations (>3 params)

| # | ID | File | Line | Function | Param Count | Severity |
|---|-----|------|------|----------|:---:|----------|
| 15 | GA4-015 | `03-alarm-firing.md` | L65-70 | `compute_next_fire_time(alarm_time, alarm_date, repeat, timezone, now)` | **5** | 🟠 High |
| 16 | GA4-016 | `03-alarm-firing.md` | L109-115 | `compute_weekly(alarm_time, repeat, now_local, now, timezone)` | **5** | 🟠 High |
| 17 | GA4-017 | `01-alarm-crud.md` | L66 | `schedule_permanent_delete(conn, alarm_id, undo_token)` | 3 | ✅ OK |
| 18 | GA4-018 | `03-alarm-firing.md` | L95-99 | `compute_daily(alarm_time, now_local, now, timezone)` | **4** | 🟡 Medium |

**Fix pattern:** Introduce an `AlarmContext` struct bundling `now`, `now_local`, and `timezone` — reduces all functions to 2-3 params.

### Category E: Magic Values (No Constants)

| # | ID | File | Line | Magic Value | Should Be | Severity |
|---|-----|------|------|------------|-----------|----------|
| 19 | GA4-019 | `01-alarm-crud.md` | L59 | `Duration::from_secs(5)` | `UNDO_TIMEOUT_SECS` constant | 🟡 Medium |
| 20 | GA4-020 | `03-alarm-firing.md` | L165 | `for _ in 0..120` | `MAX_DST_ADVANCE_MINUTES` constant | 🟡 Medium |
| 21 | GA4-021 | `04-snooze-system.md` | L90 | `duration_min as u64 * 60` | Calculation is clear but `60` could be `SECONDS_PER_MINUTE` constant | 🟢 Low |
| 22 | GA4-022 | `04-platform-constraints.md` | L263 | `setTimeout(() => reject(new Error('timeout')), 5000)` | `IPC_TIMEOUT_MS` constant (already used as `5000` elsewhere — should be shared) | 🟡 Medium |
| 23 | GA4-023 | `01-data-model.md` | L599 | `DEFAULT_EVENT_RETENTION_DAYS: i64 = 90` | ✅ Already a named constant — good | ✅ OK |

### Category F: Boolean Naming & Negation

| # | ID | File | Line | Pattern | Issue | Severity |
|---|-----|------|------|---------|-------|----------|
| 24 | GA4-024 | `03-alarm-firing.md` | L425 | `let is_waking = !args.start` | ✅ EXEMPT — documented in `04-platform-constraints.md` L395 as external protocol value extraction | ✅ OK |
| 25 | GA4-025 | `05-sound-and-vibration.md` | L140 | `let is_plain_filename = !sound_file.contains('/')` | ✅ EXEMPT — documented in L141 as idiomatic path checking | ✅ OK |
| 26 | GA4-026 | `01-data-model.md` | L427 | `is_enabled: row.get::<_, i32>("IsEnabled")? != 0` | ✅ EXEMPT — documented in `04-platform-constraints.md` L394 as SQLite boolean conversion | ✅ OK |

### Category G: Missing Logging (No `tracing::` calls)

| # | ID | File | Code Block | Has Logging? | Severity |
|---|-----|------|-----------|:---:|----------|
| 27 | GA4-027 | `01-alarm-crud.md` | `onDeleteAlarm` (TS) | ❌ No frontend logging | 🟡 Medium |
| 28 | GA4-028 | `01-alarm-crud.md` | `onUndo` (TS) | ❌ No frontend logging | 🟡 Medium |
| 29 | GA4-029 | `04-snooze-system.md` | `schedule_snooze` (Rust) | ✅ Has `tracing::info!` | ✅ OK |
| 30 | GA4-030 | `05-sound-and-vibration.md` | `validate_custom_sound` (Rust) | ❌ No logging on validation success or failure entry | 🟡 Medium |
| 31 | GA4-031 | `05-sound-and-vibration.md` | `resolve_sound_path` (Rust) | ✅ Has `tracing::warn!` for fallback | ✅ OK |
| 32 | GA4-032 | `03-alarm-firing.md` | `compute_next_fire_time` (Rust) | ❌ No entry/exit logging | 🟡 Medium |
| 33 | GA4-033 | `06-dismissal-challenges.md` | No Rust code samples | N/A — no code to audit | 🟠 High (per Phase 1 GA1-009) |

---

## Code Sample Quality Scorecard

| File | Blocks | >15 Lines | Nested If | Error Swallow | Magic Values | Missing Logging | >3 Params | Score |
|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `01-alarm-crud.md` | 5 | 1 | 0 | 2 | 1 | 2 | 0 | 50% |
| `02-alarm-scheduling.md` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 100% |
| `03-alarm-firing.md` | 12 | 2 | 2 | 0 | 1 | 1 | 2 | 55% |
| `04-snooze-system.md` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 100% |
| `05-sound-and-vibration.md` | 5 | 0 | 0 | 0 | 0 | 1 | 0 | 90% |
| `06-dismissal-challenges.md` | 1 | 0 | 0 | 0 | 0 | N/A | 0 | 80% |
| `07-alarm-groups.md` | 0 | — | — | — | — | — | — | N/A |
| `08-clock-display.md` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 100% |
| `09-theme-system.md` | 0 | — | — | — | — | — | — | N/A |
| `10-export-import.md` | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 100% |
| `11-sleep-wellness.md` | 0 | — | — | — | — | — | — | N/A |
| `12-smart-features.md` | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 100% |
| `13-analytics.md` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 100% |
| `14-personalization.md` | 0 | — | — | — | — | — | — | N/A |
| `15-keyboard-shortcuts.md` | 0 | — | — | — | — | — | — | N/A |
| `16-accessibility-and-nfr.md` | 0 | — | — | — | — | — | — | N/A |
| `01-data-model.md` | 8 | 0* | 0 | 1 | 0 | 0 | 0 | 85% |
| `02-design-system.md` | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 100% |
| `03-file-structure.md` | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 100% |
| `04-platform-constraints.md` | 5 | 1 | 0 | 0 | 1 | 0 | 0 | 85% |
| `06-tauri-architecture.md` | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 90% |
| `07-startup-sequence.md` | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 100% |

\* `from_row` and struct definitions are exempt

---

## Violation Distribution

| Rule | Violations | % of Total |
|------|:---:|:---:|
| Error swallowing (`.ok()`, `_ => {}`) | 3 | 11% |
| Function >15 lines | 4 | 15% |
| Nested control flow | 2 | 7% |
| >3 parameters | 3 | 11% |
| Magic values | 3 | 11% |
| Missing logging | 5 | 19% |
| **Total violations** | **20** | — |
| **Exempt (correctly documented)** | **7** | — |
| **Grand total audited patterns** | **27** | — |

---

## Top Fix Priorities

| Priority | Fix | Impact | Effort |
|:---:|------|--------|--------|
| 1 | Replace `.ok()` with `match` + logging in 2 code samples | Prevents AI from replicating error-swallowing across entire codebase | 5 min |
| 2 | Introduce `AlarmContext` struct to reduce 5-param functions to 2-3 params | Prevents AI from creating 5+ param functions throughout scheduling code | 15 min |
| 3 | Refactor `handle_spring_forward` to flatten nesting (early continue + extracted helper) | Prevents 3-level-deep nesting patterns in AI output | 10 min |
| 4 | Refactor `LinuxWakeListener::start` (48 lines) into 3 sub-functions | Prevents AI from generating 40+ line functions | 10 min |
| 5 | Add `IPC_TIMEOUT_MS` and `UNDO_TIMEOUT_SECS` constants to replace magic `5000` and `5` | Prevents hardcoded numbers in AI output | 5 min |
| 6 | Add `tracing::debug!` entry log to `compute_next_fire_time` and `validate_custom_sound` | Sets the pattern for AI to log in every Rust function | 5 min |

---

## Cumulative Gap Analysis Summary

| Phase | Issues | Critical | High | Medium | Low |
|-------|--------|----------|------|--------|-----|
| Phase 1 (Structural) | 29 | 6 | 10 | 9 | 4 |
| Phase 2 (Content) — revised | 30 | 4 | 12 | 10 | 4 |
| Phase 3 (AI Failure Risk) | 31 | 4 | 12 | 11 | 4 |
| Phase 4 (Code Sample Audit) | 27 | 3 | 8 | 12 | 4 |
| **Total (with dedup)** | **~97** | **15** | **38** | **32** | **12** |

> Note: GA4-001/GA4-002 overlap with GA1-005/GA1-006 from Phase 1. GA4-011 overlaps with GA1-026. After deduplication, ~90 unique issues remain.

---

## Remaining Phases

| Phase | Scope | Status |
|-------|-------|--------|
| **Phase 1** | Structural & Foundational Alignment | ✅ Complete |
| **Phase 2** | Content Completeness | ✅ Complete (revised) |
| **Phase 3** | AI Failure Risk | ✅ Complete |
| **Phase 4** | Deep Code Sample Audit | ✅ Complete (this document) |
| **Phase 5** | Issue Grouping — atomic fixable tasks, effort estimates | ⬜ Pending |

---

*Gap Analysis Phase 4 — created: 2026-04-10*
