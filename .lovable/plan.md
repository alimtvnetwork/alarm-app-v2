

# Audit Report: Discovery Phase 6 — Post-Fix Regression + Deep Compliance Scan

## Findings Summary

I found **19 new issues** across the alarm app spec. These fall into two groups:
1. **Regressions** — violations introduced during Fix Phases 2–4 (7 issues)
2. **Previously missed** — issues that were never tracked (12 issues)

---

## Category A: Regressions Introduced During Fix Phases

### REG-001: `alarms` table name still lowercase
**Severity:** 🔴 Critical  
**File:** `01-data-model.md` line 224  
`CREATE TABLE alarms (` — should be `Alarms`. Fix Phase 3 renamed `alarm_events` → `AlarmEvents` and `alarm_groups` → `AlarmGroups` but missed the main table.

### REG-002: `settings` table name still lowercase
**Severity:** 🟡 Medium  
**File:** `01-data-model.md` line 256  
`CREATE TABLE settings (` — should be `Settings`.

### REG-003: `snooze_state` table reference in snooze spec still lowercase
**Severity:** 🟡 Medium  
**File:** `04-snooze-system.md` line 47  
Prose: "Stored in the `snooze_state` SQLite table" — table was renamed to `SnoozeState` in data model but snooze spec prose wasn't updated.

### REG-004: `13-analytics.md` duplicate schema still uses snake_case
**Severity:** 🔴 Critical  
**File:** `13-analytics.md` lines 91–103  
The full `CREATE TABLE alarm_events` block with all snake_case columns was never updated. This directly contradicts the PascalCase schema in `01-data-model.md`. (This is also the tracked IC-005 — duplicate schema — but the content itself was never fixed.)

### REG-005: `13-ai-cheat-sheet.md` code samples use snake_case
**Severity:** 🔴 Critical  
**File:** `13-ai-cheat-sheet.md` lines 89–91  
`row.get("enabled")`, `row.get("repeat_days_of_week")` — still snake_case. Fix Phase 4 updated `01-data-model.md` but didn't touch the cheat sheet.

### REG-006: `12-platform-and-concurrency-guide.md` Race 1 SQL uses `id` and `deleted_at`
**Severity:** 🔴 Critical  
**File:** `12-platform-and-concurrency-guide.md` line 166–167  
`WHERE id = ? AND deleted_at IS NOT NULL` — should be `AlarmId` and `DeletedAt`.

### REG-007: `12-platform-and-concurrency-guide.md` Race 4 uses `alarm.id`
**Severity:** 🟡 Medium  
**File:** `12-platform-and-concurrency-guide.md` lines 227–234  
`alarm.id` should be `alarm.alarm_id` (Rust field) or the struct should reference `AlarmId` consistently. Also `self.pool` references don't match the `rusqlite` refactor (should be `conn`).

---

## Category B: Previously Missed Issues

### NEW-001: `04-snooze-system.md` configuration table uses camelCase field names in prose
**Severity:** 🟡 Medium  
**File:** `04-snooze-system.md` lines 30–31  
`snoozeDurationMin`, `maxSnoozeCount` — serialized key references in prose should be PascalCase: `SnoozeDurationMin`, `MaxSnoozeCount`.

### NEW-002: `03-alarm-firing.md` missed alarm query uses snake_case
**Severity:** 🔴 Critical  
**File:** `03-alarm-firing.md` line 192  
`next_fire_time < now AND enabled = 1 AND deleted_at IS NULL AND type != 'acknowledged'` — all snake_case column refs, and `'acknowledged'` is not a valid event type (should be one of: fired, snoozed, dismissed, missed).

### NEW-003: `03-alarm-firing.md` queue rules use snake_case
**Severity:** 🟡 Medium  
**File:** `03-alarm-firing.md` lines 485–487  
`next_fire_time`, `enabled`, `created_at` in prose — should be PascalCase.

### NEW-004: `07-alarm-groups.md` still references `previous_enabled` and `enabled` in prose
**Severity:** 🟡 Medium  
**File:** `07-alarm-groups.md` lines 41–71  
Multiple references to `previous_enabled`, `enabled` — should be `IsPreviousEnabled`, `IsEnabled`. (Tracked as CG-006 but listed as "open" — the content was never fixed.)

### NEW-005: `05-sound-and-vibration.md` uses camelCase in prose
**Severity:** 🟡 Medium  
**File:** `05-sound-and-vibration.md` lines 146, 236  
`gradualVolume: boolean`, `vibrationEnabled: boolean` — serialized field references should be PascalCase.

### NEW-006: Alarm Engine check interval contradiction
**Severity:** 🟡 Medium  
**Files:** `06-tauri-architecture.md` line 56 says "1-second interval timer"; `03-alarm-firing.md`, `07-startup-sequence.md`, `12-platform-and-concurrency-guide.md` all say "30-second check interval".

### NEW-007: `tauri-plugin-sql` vs `rusqlite` contradiction
**Severity:** 🔴 Critical  
**File:** `06-tauri-architecture.md` line 59  
Storage module lists `tauri-plugin-sql` (SQLite) — but the entire project uses `rusqlite` directly. AI will install the wrong crate.

### NEW-008: `delete_alarm` return type contradicts between files
**Severity:** 🟡 Medium  
**Files:** `06-tauri-architecture.md` line 76 says `delete_alarm` returns `void`; `01-alarm-crud.md` line 285 says it returns `{ UndoToken: string }`.

### NEW-009: `export_data` IPC payload contradicts between files
**Severity:** 🟡 Medium  
**Files:** `06-tauri-architecture.md` line 105 says `export_data` payload is `void`; `10-export-import.md` line 46 says `{ format, scope, alarmIds? }`.

### NEW-010: `get_alarms` vs `list_alarms` IPC command name conflict
**Severity:** 🟡 Medium  
**Files:** `06-tauri-architecture.md` line 77 uses `get_alarms`; `01-alarm-crud.md` line 290 uses `list_alarms`. (This is IC-006 — still open, just confirming it persists.)

### NEW-011: Settings keys in data model use snake_case
**Severity:** 🟡 Medium  
**File:** `01-data-model.md` lines 327–334  
`theme`, `time_format`, `default_snooze_duration`, `auto_launch`, `minimize_to_tray`, `event_retention_days`, `system_timezone` — these are serialized key-value pairs stored in the `settings` table. Per the PascalCase mandate, keys should be `Theme`, `TimeFormat`, `DefaultSnoozeDuration`, etc.

### NEW-012: `alarm_events.metadata` JSON field referenced but doesn't exist
**Severity:** 🟡 Medium  
**File:** `06-dismissal-challenges.md` line 39  
`alarm_events.metadata` JSON `{"solve_time_ms": 4500}` — no `Metadata` column exists in the `AlarmEvents` schema. The data model has `ChallengeSolveTimeSec REAL` instead.

---

## Updated Totals

| Status | Previous | New | Total |
|--------|:--------:|:---:|:-----:|
| Total issues | 64 | 19 | **83** |
| Open | 37 | 19 | **56** |
| Resolved | 27 | 0 | **27** |

---

## Proposed Next Steps (Phase-by-Phase Fix Plan)

Each phase is deliberately small (2–4 issues) for reliable execution.

| Phase | Issues | Description |
|-------|--------|-------------|
| Fix 5 | REG-001, REG-002 | Rename `alarms` → `Alarms`, `settings` → `Settings` tables everywhere |
| Fix 6 | REG-004, REG-005 | Fix `13-analytics.md` duplicate schema + `13-ai-cheat-sheet.md` code samples |
| Fix 7 | REG-003, REG-006, REG-007 | Fix remaining snake_case in snooze spec + concurrency guide |
| Fix 8 | NEW-001, NEW-002, NEW-003 | Fix snake_case prose in firing + snooze specs |
| Fix 9 | NEW-004, NEW-005 | Fix snake_case prose in groups + sound specs |
| Fix 10 | NEW-006, NEW-007, NEW-008, NEW-009 | Fix contradictions in `06-tauri-architecture.md` |
| Fix 11 | NEW-010, IC-006 | Resolve `get_alarms` vs `list_alarms` conflict |
| Fix 12 | NEW-011 | Settings keys → PascalCase |
| Fix 13 | NEW-012, LC-001 | Fix AlarmChallenge schema gaps |
| Fix 14 | CG-006 | Fix all remaining snake_case prose across all feature files |
| Fix 15 | GC-001 (partial) | Break down longest functions (start with `compute_next_fire_time`) |

---

## Plan for This Session

1. **Write all 19 new issues** to the `14-spec-issues/` files (add to appropriate category files)
2. **Update `00-overview.md`** with new totals (83 issues, 56 open)
3. **Update `05-ai-handoff-risks.md`** — AH-001 and AH-004 should be marked resolved (sqlx fixed, serde added)
4. **Update memory** with new issue counts and fix plan

