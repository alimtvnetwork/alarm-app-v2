# Discovery Phase 8 — Remaining File Scan

**Generated:** 2026-04-10  
**Scope:** `11-atomic-task-breakdown.md`, `02-design-system.md`, `14-personalization.md`, `15-keyboard-shortcuts.md`, `16-accessibility-and-nfr.md`

---

## Summary

**Total new issues found:** 11  
- **Naming violations (snake_case table/column refs):** 8  
- **Content inconsistencies:** 3  

**Clean files:** `02-design-system.md` ✅, `15-keyboard-shortcuts.md` ✅

---

## Issues

### D8-001: `14-personalization.md` line 19 — `settings` and `alarm_events` lowercase
**Severity:** 🟡 Medium  
**Problem:** "persisted in SQLite `settings` table; streak data in `alarm_events`" — should be `Settings` and `AlarmEvents`.

### D8-002: `14-personalization.md` line 27 — `settings` lowercase
**Severity:** 🟡 Medium  
**Problem:** "SQLite `settings` table" — should be `Settings`.

### D8-003: `14-personalization.md` line 29 — `alarm_events` snake_case
**Severity:** 🟡 Medium  
**Problem:** "SQLite `alarm_events` table queries" — should be `AlarmEvents`.

### D8-004: `14-personalization.md` line 40 — `settings` lowercase
**Severity:** 🟡 Medium  
**Problem:** "persisted in SQLite `settings`" — should be `Settings`.

### D8-005: `14-personalization.md` line 54 — `alarm_events` snake_case
**Severity:** 🟡 Medium  
**Problem:** "from SQLite `alarm_events` table" — should be `AlarmEvents`.

### D8-006: `16-accessibility-and-nfr.md` line 108 — `settings` lowercase + `language` snake_case key
**Severity:** 🟡 Medium  
**Problem:** "stored in `settings` SQLite table (`key = 'language'`)" — should be `Settings` table and key `Language`.

### D8-007: `11-atomic-task-breakdown.md` line 6 — task count says 52, should be 62
**Severity:** 🟡 Medium  
**Problem:** Header says "Total Tasks: 52" but document contains 62 tasks, and the root overview calls it "62 dependency-ordered tasks".

### D8-008: `11-atomic-task-breakdown.md` line 83 — `snooze_state` snake_case
**Severity:** 🟡 Medium  
**Problem:** "write snooze_state" — should be `SnoozeState`.

### D8-009: `11-atomic-task-breakdown.md` line 84 — `snooze_state` snake_case
**Severity:** 🟡 Medium  
**Problem:** "check `snooze_state`" — should be `SnoozeState`.

### D8-010: `11-atomic-task-breakdown.md` line 85 — `alarm_event` snake_case
**Severity:** 🟡 Medium  
**Problem:** "log alarm_event" — should be `AlarmEvent` (or `AlarmEvents` table).

### D8-011: `11-atomic-task-breakdown.md` line 50 — error variant count says 12, now 13
**Severity:** 🟢 Low  
**Problem:** "all 12 error variants" — should be 13 after `RestrictedPath` was added in Fix Phase 26.

---

## Updated Totals (Including Discovery Phase 8)

| Status | Previous | New | Total |
|--------|:--------:|:---:|:-----:|
| Total issues | 95 | 11 | **106** |
| Open | 0 | 11 | **11** |
| Resolved | 95 | 0 | **95** |

---

## Proposed Fix Phases

| Phase | Issues | Files | Description |
|-------|--------|-------|-------------|
| **Fix 28** | D8-001–005 | `14-personalization.md` | Fix all `settings`/`alarm_events` → PascalCase |
| **Fix 29** | D8-006 | `16-accessibility-and-nfr.md` | Fix `settings` → `Settings`, `language` → `Language` |
| **Fix 30** | D8-007–011 | `11-atomic-task-breakdown.md` | Fix task count, snake_case table refs, error variant count |
