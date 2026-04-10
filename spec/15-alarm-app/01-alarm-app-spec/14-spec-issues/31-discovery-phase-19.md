# Discovery Phase 19 — Post-Completion Regression Audit

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Scope:** Fresh audit after 256/256 resolution — checking for surviving violations, regressions, and missed issues

---

## Audit Checklist Applied

Checked against: PascalCase key naming, boolean principles (Is/Has only, no negatives), no magic strings, serde rename_all, DB naming conventions, enum standards, function length, file naming, cross-reference integrity.

---

## Issues Found

### Category 1: SQL DEFAULT Values Use Lowercase — Contradicts Enum PascalCase Convention

> **Severity: 🔴 Critical.** AI will copy these DEFAULT values verbatim into seed data and comparisons. The enum convention table explicitly says "SQLite stores the PascalCase string value" but the actual SQL uses lowercase.

| # | Issue ID | File | Line | Problem | Fix |
|---|----------|------|------|---------|-----|
| 1 | P19-001 | `01-fundamentals/01-data-model.md` | 491 | `RepeatType TEXT NOT NULL DEFAULT 'once'` — lowercase | Change to `DEFAULT 'Once'` |
| 2 | P19-002 | `01-fundamentals/01-data-model.md` | 504 | Comment `-- easy|medium|hard (math only)` — lowercase | Change to `-- Easy|Medium|Hard (math only)` |
| 3 | P19-003 | `01-fundamentals/01-data-model.md` | 523 | `ValueType TEXT NOT NULL DEFAULT 'string'` — lowercase | Change to `DEFAULT 'String'` |
| 4 | P19-004 | `01-fundamentals/01-data-model.md` | 535 | Comment `-- fired|snoozed|dismissed|missed` — lowercase | Change to `-- Fired|Snoozed|Dismissed|Missed` |

### Category 2: Magic String Literals in Code Examples and Prose

> **Severity: 🔴 Critical.** Despite 256 "resolved" issues including domain enum work, raw string literals survive in prose, acceptance criteria, and code comments. AI agents reading these will use raw strings instead of enum references.

| # | Issue ID | File | Line | Problem | Fix |
|---|----------|------|------|---------|-----|
| 5 | P19-005 | `02-features/03-alarm-firing.md` | 33 | `Type = 'fired'` in firing logic prose | Change to `Type = AlarmEventType::Fired` |
| 6 | P19-006 | `02-features/03-alarm-firing.md` | 35 | `'once'` in repeat type reference | Change to `RepeatType::Once` |
| 7 | P19-007 | `02-features/03-alarm-firing.md` | 460 | `Type = 'missed'` in Missed Alarm UI prose | Change to `Type = AlarmEventType::Missed` |
| 8 | P19-008 | `02-features/03-alarm-firing.md` | 473 | `type = 'dismissed'` in Auto-Dismiss prose | Change to `AlarmEventType::Dismissed` |
| 9 | P19-009 | `02-features/03-alarm-firing.md` | 572 | Acceptance criteria: `Type = 'missed'` | Change to `AlarmEventType::Missed` |
| 10 | P19-010 | `02-features/03-alarm-firing.md` | 596 | `EventType = 'Fired'` — PascalCase but still magic string | Change to `AlarmEventType::Fired` |
| 11 | P19-011 | `02-features/04-snooze-system.md` | 61 | `Type = 'snoozed'` in behavior prose | Change to `AlarmEventType::Snoozed` |

### Category 3: PascalCase/camelCase Inconsistency in TypeScript Code Examples

> **Severity: 🟡 Medium.** Interface defines PascalCase keys but usage code uses camelCase — AI will follow the usage code.

| # | Issue ID | File | Line | Problem | Fix |
|---|----------|------|------|---------|-----|
| 12 | P19-012 | `02-features/01-alarm-crud.md` | 239 | `e.token` — should be `e.Token` (interface defines `Token`) | Use PascalCase key access |
| 13 | P19-013 | `02-features/01-alarm-crud.md` | 244 | `{ token:, alarmId:, label:, expiresAt:, timerId }` — all camelCase | Use PascalCase: `{ Token:, AlarmId:, Label:, ExpiresAt:, TimerId }` |

### Category 4: Structural Issues

> **Severity: 🟡 Medium.**

| # | Issue ID | File | Line | Problem | Fix |
|---|----------|------|------|---------|-----|
| 14 | P19-014 | `01-fundamentals/04-platform-constraints.md` | 374 + 392 | Duplicate `## Cross-References` heading — two sections | Remove duplicate on line 374 (empty one) |

### Category 5: Naming Inconsistencies Between Components

> **Severity: 🟡 Medium.** AI will use whichever name it encounters first, creating bugs.

| # | Issue ID | File | Line | Problem | Fix |
|---|----------|------|------|---------|-----|
| 15 | P19-015 | `02-features/03-alarm-firing.md` | 615 | `FiredAlarm.sound_id` — but Alarm model uses `SoundFile` | Rename to `sound_file` for consistency |
| 16 | P19-016 | `02-features/03-alarm-firing.md` | 596 | `EventType = 'Fired'` — column name is `Type`, not `EventType` | Change to `Type` to match schema |
| 17 | P19-017 | `01-fundamentals/03-file-structure.md` | 33 | Store description uses camelCase: `snoozeDuration` | Change to match Settings key: `DefaultSnoozeDuration` |
| 18 | P19-018 | `01-fundamentals/07-startup-sequence.md` | 159 | Uses `pool` but Step 2 creates single `Connection`, not pool | Align: either change to `conn` or document connection pool |

### Category 6: Missing `serde(rename_all)` on Serialized Structs

> **Severity: 🟡 Medium.** If these structs are serialized to the frontend, keys will be snake_case instead of PascalCase.

| # | Issue ID | File | Line | Problem | Fix |
|---|----------|------|------|---------|-----|
| 19 | P19-019 | `02-features/03-alarm-firing.md` | 605 | `AlarmQueue` struct — no `#[serde(rename_all = "PascalCase")]` | Add serde attribute if serialized |
| 20 | P19-020 | `02-features/03-alarm-firing.md` | 612 | `FiredAlarm` struct — no `#[serde(rename_all = "PascalCase")]` | Add serde attribute if serialized |

### Category 7: Migration Description Uses Snake_Case Table Names

> **Severity: 🟢 Low.** Prose only — but AI reads descriptions to understand context.

| # | Issue ID | File | Line | Problem | Fix |
|---|----------|------|------|---------|-----|
| 21 | P19-021 | `01-fundamentals/01-data-model.md` | 754 | `alarms, alarm_groups, settings, snooze_state, alarm_events` | Change to `Alarms, AlarmGroups, Settings, SnoozeState, AlarmEvents` |

---

## Summary

| Severity | Count |
|----------|:-----:|
| 🔴 Critical | 11 |
| 🟡 Medium | 9 |
| 🟢 Low | 1 |
| **Total** | **21** |

---

## AI Failure Risk Assessment

| Category | Risk Level | Impact |
|----------|-----------|--------|
| SQL defaults lowercase vs PascalCase enums | **HIGH** — AI copies `DEFAULT 'once'` into comparisons | Alarms with `RepeatType::Once` won't match `'once'` in queries |
| Magic strings in prose/criteria | **HIGH** — AI uses `'fired'` instead of `AlarmEventType::Fired` | Enum matching fails, events misclassified |
| PascalCase/camelCase mismatch | **MEDIUM** — AI follows code examples over interface defs | Runtime key mismatches, undefined field access |
| Missing serde attributes | **MEDIUM** — IPC returns snake_case keys | Frontend expects PascalCase, gets snake_case |
| Column name mismatch (EventType vs Type) | **MEDIUM** — AI uses wrong column in SQL | Query errors or silent data loss |

---

## Remaining Audit Scope

This is **Phase 1** — covered fundamentals (01-04, 07) and features (01, 03, 04, 05, 10). Remaining files to audit:

- `01-fundamentals/`: 05, 06, 08, 09, 10, 11
- `02-features/`: 02, 06, 07, 08, 09, 11, 12, 13, 14, 15, 16
- Root files: 09, 11, 12, 13
- Cross-reference link validation pass

---

*Discovery Phase 19 — created: 2026-04-10*
