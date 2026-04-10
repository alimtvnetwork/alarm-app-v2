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

---

### Category 2: Magic String Literals in Code Examples and Prose

> **Severity: 🔴 Critical.** Despite domain enum work, raw string literals survive in prose, acceptance criteria, and code comments. AI agents will use raw strings instead of enum references.

| # | Issue ID | File | Line | Problem | Fix |
|---|----------|------|------|---------|-----|
| 5 | P19-005 | `02-features/03-alarm-firing.md` | 33 | `Type = 'fired'` in firing logic step | Change to `Type = AlarmEventType::Fired` |
| 6 | P19-006 | `02-features/03-alarm-firing.md` | 35 | `'once'` → set `IsEnabled = 0` | Change to `RepeatType::Once` |
| 7 | P19-007 | `02-features/03-alarm-firing.md` | 460 | `Type = 'missed'` in Missed Alarm UI section | Change to `AlarmEventType::Missed` |
| 8 | P19-008 | `02-features/03-alarm-firing.md` | 473 | `type = 'dismissed'` in Auto-Dismiss section | Change to `AlarmEventType::Dismissed` |
| 9 | P19-009 | `02-features/03-alarm-firing.md` | 572 | Acceptance criteria: `Type = 'missed'` | Change to `AlarmEventType::Missed` |
| 10 | P19-010 | `02-features/03-alarm-firing.md` | 596 | `EventType = 'Fired'` — PascalCase but still magic string, and wrong column name | Change to `Type = AlarmEventType::Fired` |
| 11 | P19-011 | `02-features/04-snooze-system.md` | 61 | `Type = 'snoozed'` in behavior step | Change to `AlarmEventType::Snoozed` |

---

### Category 3: Magic String Union Types in IPC/Interface Definitions

> **Severity: 🔴 Critical.** These inline union types duplicate enum definitions but use raw strings. AI will copy these instead of referencing the enum.

| # | Issue ID | File | Line | Problem | Fix |
|---|----------|------|------|---------|-----|
| 12 | P19-012 | `02-features/02-alarm-scheduling.md` | 34 | `Type: 'once' \| 'daily' \| 'weekly' \| 'interval' \| 'cron'` — magic string union | Change to `Type: RepeatType` |
| 13 | P19-013 | `02-features/02-alarm-scheduling.md` | 23-28 | Table uses lowercase `'once'`, `'daily'`, etc. in backtick columns | Use PascalCase: `Once`, `Daily`, etc. |
| 14 | P19-014 | `02-features/02-alarm-scheduling.md` | 88-93 | Post-fire behavior: `'once'`, `'daily'`, `'weekly'` lowercase | Use PascalCase enum values |
| 15 | P19-015 | `02-features/02-alarm-scheduling.md` | 101 | Quick alarm: `Type = "once"` | Change to `RepeatType::Once` |
| 16 | P19-016 | `01-fundamentals/06-tauri-architecture*.md` | 105 | `export_data` payload: `Format: string, Scope: string` | Change to `Format: ExportFormat, Scope: ExportScope` |
| 17 | P19-017 | `01-fundamentals/06-tauri-architecture*.md` | 106 | `import_data` payload: `Mode: "Merge" \| "Replace"` | Change to `Mode: ImportMode` |
| 18 | P19-018 | `01-fundamentals/06-tauri-architecture*.md` | 116 | `theme-changed` event: `Theme: "light" \| "dark"` | Change to `Theme: ThemeMode` (also missing `System`) |
| 19 | P19-019 | `01-fundamentals/06-tauri-architecture*.md` | 192 | `SettingsStore.theme: 'light' \| 'dark' \| 'system'` — magic union | Change to `Theme: ThemeMode` |

---

### Category 4: PascalCase/camelCase Inconsistency in Code Examples

> **Severity: 🟡 Medium.** Interface defines PascalCase keys but usage code uses camelCase — AI follows usage code.

| # | Issue ID | File | Line | Problem | Fix |
|---|----------|------|------|---------|-----|
| 20 | P19-020 | `02-features/01-alarm-crud.md` | 239 | `e.token` — should be `e.Token` (interface defines `Token`) | Use PascalCase key access |
| 21 | P19-021 | `02-features/01-alarm-crud.md` | 244 | `{ token:, alarmId:, label:, expiresAt:, timerId }` — all camelCase | Use PascalCase: `{ Token:, AlarmId:, Label:, ExpiresAt:, TimerId }` |
| 22 | P19-022 | `01-fundamentals/06-tauri-architecture*.md` | 146-150 | Store diagram uses camelCase: `timeFormat`, `snoozeDuration`, `isShown` | Use PascalCase where these are IPC-serialized values |
| 23 | P19-023 | `01-fundamentals/06-tauri-architecture*.md` | 193-196 | `SettingsStore` properties: `timeFormat`, `defaultSnoozeDuration` — camelCase | If IPC-serialized, use PascalCase |
| 24 | P19-024 | `02-features/13-analytics.md` | 41-43 | IPC payload keys `filter`, `before`, `deleted` — camelCase | Change to `Filter`, `Before`, `Deleted` |

---

### Category 5: Naming Inconsistencies Between Components

> **Severity: 🟡 Medium.** AI will use whichever name it encounters first, creating bugs or confusion.

| # | Issue ID | File | Line | Problem | Fix |
|---|----------|------|------|---------|-----|
| 25 | P19-025 | `02-features/03-alarm-firing.md` | 615 | `FiredAlarm.sound_id` — but Alarm model uses `SoundFile` | Rename to `sound_file` |
| 26 | P19-026 | `02-features/03-alarm-firing.md` | 596 | `EventType = 'Fired'` — column name is `Type`, not `EventType` | Change to `Type` |
| 27 | P19-027 | `01-fundamentals/03-file-structure.md` | 33 | `useSettingsStore.ts — snoozeDuration` | Change to `DefaultSnoozeDuration` |
| 28 | P19-028 | `01-fundamentals/07-startup-sequence.md` | 159 | `Settings::load_all(&pool)` — uses `pool` but Step 2 creates `Connection` | Align to `conn` or document pool |
| 29 | P19-029 | `01-fundamentals/06-tauri-architecture*.md` | 87 | `get_groups` — but `02-design-system.md` uses `list_groups` | Standardize to one name |

---

### Category 6: Missing `serde(rename_all)` on Serialized Structs

> **Severity: 🟡 Medium.** If serialized to frontend, keys will be snake_case instead of PascalCase.

| # | Issue ID | File | Line | Problem | Fix |
|---|----------|------|------|---------|-----|
| 30 | P19-030 | `02-features/03-alarm-firing.md` | 605 | `AlarmQueue` struct — no `#[serde(rename_all = "PascalCase")]` | Add if serialized |
| 31 | P19-031 | `02-features/03-alarm-firing.md` | 612 | `FiredAlarm` struct — no `#[serde(rename_all = "PascalCase")]` | Add if serialized |

---

### Category 7: Structural Issues

> **Severity: 🟡 Medium.**

| # | Issue ID | File | Line | Problem | Fix |
|---|----------|------|------|---------|-----|
| 32 | P19-032 | `01-fundamentals/04-platform-constraints.md` | 374 + 392 | Duplicate `## Cross-References` heading | Remove empty duplicate on line 374 |

---

### Category 8: Prose/Comment Uses Wrong Casing for Table Names or Values

> **Severity: 🟢 Low.** Prose only, but AI reads descriptions to understand context.

| # | Issue ID | File | Line | Problem | Fix |
|---|----------|------|------|---------|-----|
| 33 | P19-033 | `01-fundamentals/01-data-model.md` | 754 | Migration description: `alarms, alarm_groups, settings, snooze_state, alarm_events` (snake_case) | Change to PascalCase table names |
| 34 | P19-034 | `02-features/09-theme-system.md` | 26-29 | Mode table uses backtick `light`, `dark`, `system` | Use `ThemeMode.Light`, `ThemeMode.Dark`, `ThemeMode.System` |

---

## Summary

| Severity | Count |
|----------|:-----:|
| 🔴 Critical | 19 |
| 🟡 Medium | 13 |
| 🟢 Low | 2 |
| **Total** | **34** |

---

## AI Failure Risk Assessment

| Category | Risk Level | Impact |
|----------|-----------|--------|
| SQL defaults lowercase vs PascalCase enums (4) | **HIGH** | `DEFAULT 'once'` won't match `RepeatType::Once` in queries |
| Magic strings in prose/criteria (7) | **HIGH** | AI uses `'fired'` instead of `AlarmEventType::Fired` |
| Magic string unions in interfaces (8) | **HIGH** | AI copies `'once' \| 'daily'` instead of `RepeatType` enum |
| camelCase in PascalCase contexts (5) | **MEDIUM** | Runtime key mismatches, undefined field access |
| Naming mismatches between components (5) | **MEDIUM** | `sound_id` vs `SoundFile`, `get_groups` vs `list_groups` |
| Missing serde attributes (2) | **MEDIUM** | IPC returns snake_case keys, frontend expects PascalCase |
| Structural (1) | **LOW** | Duplicate section, no functional impact |
| Prose casing (2) | **LOW** | Context confusion for AI |

---

## Fix Plan (Proposed Phases)

### Fix Phase K — SQL Defaults + Critical Magic Strings (4 + 7 = 11 issues) ✅ RESOLVED
**P19-001 to P19-004** (SQL defaults) + **P19-005 to P19-011** (prose magic strings)  
Files: `01-data-model.md`, `03-alarm-firing.md`, `04-snooze-system.md`

### Fix Phase L — Magic String Union Types (8 issues)
**P19-012 to P19-019** (inline union types in interfaces/IPC tables)  
Files: `02-alarm-scheduling.md`, `06-tauri-architecture*.md`

### Fix Phase M — camelCase + Naming Fixes (10 issues)
**P19-020 to P19-029** (PascalCase inconsistencies + naming mismatches)  
Files: `01-alarm-crud.md`, `06-tauri-architecture*.md`, `13-analytics.md`, `03-file-structure.md`, `07-startup-sequence.md`

### Fix Phase N — Serde + Structural + Prose (5 issues)
**P19-030 to P19-034** (missing serde, duplicate section, prose casing)  
Files: `03-alarm-firing.md`, `04-platform-constraints.md`, `01-data-model.md`, `09-theme-system.md`

---

*Discovery Phase 19 — created: 2026-04-10*
