# Discovery Phase 9 — Full Grep Scan

**Generated:** 2026-04-10  
**Scope:** Full-text grep across ALL alarm app spec files for remaining snake_case violations  

---

## Summary

**Total new issues found:** 30  
- **Feature specs (critical):** 8  
- **Fundamentals:** 3  
- **App issues (historical):** 6  
- **Reliability report:** 4  
- **Concurrency guide:** 2  
- **Reference docs:** 4  
- **Atomic task breakdown:** 2  
- **Consistency report:** 1  

---

## Category A: Feature Specs (Critical — AI reads these first)

### D9-001: `03-alarm-firing.md` line 439 — `alarm_events` lowercase
**Severity:** 🟡 Medium  
**Problem:** "Log as `type = 'missed'` in `alarm_events` table" → should be `AlarmEvents`.

### D9-002: `03-alarm-firing.md` lines 49, 205, 216, 219, 220 — `nextFireTime` camelCase in prose
**Severity:** 🟡 Medium  
**Problem:** Multiple backtick-quoted `nextFireTime` references → should be `NextFireTime`.

### D9-003: `03-alarm-firing.md` line 578 — `autoDismissMin` camelCase
**Severity:** 🟡 Medium  
**Problem:** "Each queued alarm's `autoDismissMin` timer" → should be `AutoDismissMin`.

### D9-004: `01-alarm-crud.md` lines 30, 35, 201 — `nextFireTime` camelCase
**Severity:** 🟡 Medium  
**Problem:** Three references to `nextFireTime` → should be `NextFireTime`.

### D9-005: `10-export-import.md` line 112 — `groupId` camelCase
**Severity:** 🟡 Medium  
**Problem:** "`groupId` values reference valid groups" → should be `GroupId`.

### D9-006: `11-sleep-wellness.md` lines 29, 39, 58 — `settings` and `alarm_events` lowercase
**Severity:** 🟡 Medium  
**Problem:** Three references to `settings` and `alarm_events` tables → should be `Settings` and `AlarmEvents`.

### D9-007: `09-test-strategy.md` line 34 — `nextFireTime` camelCase
**Severity:** 🟡 Medium  
**Problem:** "`nextFireTime` for all 5 repeat types" → should be `NextFireTime`.

### D9-008: `09-test-strategy.md` line 186 — `maxSnoozeCount` camelCase
**Severity:** 🟡 Medium  
**Problem:** "Hides snooze when `maxSnoozeCount` reached" → should be `MaxSnoozeCount`.

## Category B: Fundamentals

### D9-009: `01-data-model.md` line 418 — `nextFireTime` camelCase in prose
**Severity:** 🟡 Medium  
**Problem:** "`nextFireTime` is computed as an absolute UTC timestamp" → should be `NextFireTime`.

### D9-010: `04-platform-constraints.md` line 281 — `alarm_events` lowercase
**Severity:** 🟡 Medium  
**Problem:** "Limit alarm_events in memory" → should be `AlarmEvents`.

### D9-011: `99-consistency-report.md` line 50 — `alarm_events` and `settings` lowercase
**Severity:** 🟢 Low  
**Problem:** Changelog entry references `alarm_events` and `settings` in backticks → should be PascalCase.

## Category C: Concurrency Guide

### D9-012: `12-platform-and-concurrency-guide.md` line 196 — `snooze_state` lowercase
**Severity:** 🟡 Medium  
**Problem:** "clears snooze_state" → should be `SnoozeState`.

### D9-013: `12-platform-and-concurrency-guide.md` line 200 — `snooze_state` lowercase
**Severity:** 🟡 Medium  
**Problem:** "checks `snooze_state` table" → should be `SnoozeState`.

## Category D: AI Handoff Reliability Report

### D9-014: `09-ai-handoff-reliability-report.md` line 51 — `alarm_events` lowercase
**Severity:** 🟢 Low  
**Problem:** "Implement `alarm_events` insert" → should be `AlarmEvents`.

### D9-015: `09-ai-handoff-reliability-report.md` line 52 — `snooze_state` lowercase
**Severity:** 🟢 Low  
**Problem:** "Implement `snooze_state` table" → should be `SnoozeState`.

### D9-016: `09-ai-handoff-reliability-report.md` line 124 — `snooze_state` lowercase
**Severity:** 🟢 Low  
**Problem:** "checks `snooze_state` table" → should be `SnoozeState`.

### D9-017: `09-ai-handoff-reliability-report.md` lines 73–90, 125–126, 211 — `nextFireTime`/`maxSnoozeCount` camelCase
**Severity:** 🟢 Low  
**Problem:** Multiple camelCase field references in task descriptions.

## Category E: App Issues (Historical)

### D9-018: `03-backend-issues.md` line 139 — `alarm_events` + `nextFireTime`
**Severity:** 🟢 Low  
**Problem:** Historical bug description uses snake_case/camelCase.

### D9-019: `03-backend-issues.md` line 161 — `nextFireTime` camelCase
**Severity:** 🟢 Low  
**Problem:** "earliest `nextFireTime` first" → should be `NextFireTime`.

### D9-020: `03-backend-issues.md` line 189 — `settings` lowercase
**Severity:** 🟢 Low  
**Problem:** "Load settings from `settings` table" → should be `Settings`.

### D9-021: `04-database-issues.md` lines 35, 51 — issue titles use snake_case
**Severity:** 🟢 Low  
**Problem:** Issue titles "alarm_events table grows unbounded" and "Orphaned alarm_events" → should reference `AlarmEvents`.

### D9-022: `04-database-issues.md` line 63 — `alarm_events` in resolution + migration SQL
**Severity:** 🟢 Low  
**Problem:** Resolution text uses `alarm_events` throughout. Migration SQL uses `alarm_events` — but actual migration filenames are exempt (refinery convention).

### D9-023: `07-ux-ui-issues.md` lines 43–47, 69 — `nextFireTime`, `settings`, `alarm_events.metadata`
**Severity:** 🟢 Low  
**Problem:** Multiple snake_case/camelCase refs in resolved UX issue descriptions.

## Category F: Reference Docs

### D9-024: `alarm-clock-features.md` line 104 — `alarm_events` lowercase
**Severity:** 🟢 Low  
**Problem:** "All data in SQLite `alarm_events` table" → should be `AlarmEvents`.

### D9-025: `alarm-clock-features.md` line 160 — `settings` lowercase
**Severity:** 🟢 Low  
**Problem:** "Preferences stored in SQLite `settings` table" → should be `Settings`.

### D9-026: `alarm-clock-features.md` line 192 — `settings` lowercase
**Severity:** 🟢 Low  
**Problem:** "Preferences in SQLite `settings`" → should be `Settings`.

### D9-027: `alarm-clock-features.md` line 198 — `alarm_groups` lowercase
**Severity:** 🟢 Low  
**Problem:** "Stored in SQLite `alarm_groups` table" → should be `AlarmGroups`.

## Category G: Atomic Task Breakdown (additional)

### D9-028: `11-atomic-task-breakdown.md` line 65–66 — `nextFireTime` in spec references
**Severity:** 🟢 Low  
**Problem:** "nextFireTime Computation" in spec reference column — should be `NextFireTime`.

### D9-029: `11-atomic-task-breakdown.md` line 166 — `nextFireTime` camelCase
**Severity:** 🟡 Medium  
**Problem:** "recalculate all `nextFireTime`" → should be `NextFireTime`.

### D9-030: `alarm-app-features.md` line 25 — `deletedAt` camelCase
**Severity:** 🟢 Low  
**Problem:** "Delete sets `deletedAt` timestamp" → should be `DeletedAt`.

---

## Updated Totals (Including Discovery Phase 9)

| Status | Previous | New | Total |
|--------|:--------:|:---:|:-----:|
| Total issues | 106 | 30 | **136** |
| Open | 0 | 30 | **30** |
| Resolved | 106 | 0 | **106** |

---

## Proposed Fix Phases

| Phase | Issues | Files | Description |
|-------|--------|-------|-------------|
| **Fix 31** | D9-001–003 | `03-alarm-firing.md` | Fix all snake_case/camelCase in firing spec (~8 replacements) |
| **Fix 32** | D9-004–005 | `01-alarm-crud.md`, `10-export-import.md` | Fix `nextFireTime`→`NextFireTime`, `groupId`→`GroupId` |
| **Fix 33** | D9-006–008 | `11-sleep-wellness.md`, `09-test-strategy.md` | Fix table + field names |
| **Fix 34** | D9-009–011 | `01-data-model.md`, `04-platform-constraints.md`, `99-consistency-report.md` | Fix fundamentals prose |
| **Fix 35** | D9-012–013 | `12-platform-and-concurrency-guide.md` | Fix `snooze_state`→`SnoozeState` |
| **Fix 36** | D9-014–017 | `09-ai-handoff-reliability-report.md` | Fix all snake_case/camelCase in reliability report |
| **Fix 37** | D9-018–023 | `03-app-issues/` (3 files) | Fix historical issue descriptions |
| **Fix 38** | D9-024–027, D9-030 | `15-reference/` (2 files) | Fix reference doc table names |
| **Fix 39** | D9-028–029 | `11-atomic-task-breakdown.md` | Fix remaining `nextFireTime` refs |
