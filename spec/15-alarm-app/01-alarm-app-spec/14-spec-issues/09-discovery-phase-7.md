# Discovery Phase 7 — Post-Fix Regression Scan (Phases 16–20)

**Generated:** 2026-04-10  
**Scope:** All spec files — checking for regressions from Fix Phases 16–20 and any previously missed issues

---

## Summary

**Total new issues found:** 18  
- **Regressions from Phases 16–20:** 5  
- **Previously missed issues:** 13  

---

## Category A: Regressions from Fix Phases 16–20

### D7-REG-001: ~~`00-overview.md` spec issues count still says "69 resolved"~~ ✅ Resolved (Fix 21)
**Severity:** 🟡 Medium  
**File:** `00-overview.md` line 122  
**Problem:** Module inventory says "77 issues found, 69 resolved" — should be "95 found, 77 resolved" after Discovery Phase 7.

### D7-REG-002: ~~`04-snooze-system.md` SnoozeState still uses `NextFireTime`~~ ✅ Resolved (Fix 22)
**Severity:** 🔴 Critical  
**File:** `02-features/04-snooze-system.md` line 43  
**Problem:** Fixed `NextFireTime` → `SnoozeUntil` to match the canonical interface in `01-data-model.md`.

### D7-REG-003: ~~`00-overview.md` tech stack says "via Tauri plugin" for SQLite~~ ✅ Resolved (Fix 21)
**Severity:** 🟡 Medium  
**File:** `00-overview.md` line 46  
**Problem:** Tech stack table said "via Tauri plugin" — fixed to "via rusqlite + refinery migrations".

### D7-REG-004: ~~`00-overview.md` Data Model uses camelCase field names~~ ✅ Resolved (Fix 21)
**Severity:** 🔴 Critical  
**File:** `00-overview.md` lines 57–72  
**Problem:** All field names converted to PascalCase: `AlarmId`, `Time`, `Label`, `IsEnabled`, `SnoozeDurationMin`, etc.

### D7-REG-005: ~~`00-overview.md` AlarmGroup uses camelCase field names~~ ✅ Resolved (Fix 21)
**Severity:** 🟡 Medium  
**File:** `00-overview.md` lines 81–86  
**Problem:** AlarmGroup fields converted to PascalCase: `GroupId`, `Name`, `Color`, `IsEnabled`.

---

## Category B: Previously Missed Issues

### D7-NEW-001: `01-data-model.md` WAL section uses `alarm_events` (snake_case)
**Severity:** 🟡 Medium  
**File:** `01-fundamentals/01-data-model.md` line 317  
**Problem:** "writes `alarm_events` and updates `nextFireTime`" — should be `AlarmEvents` and `NextFireTime`.

### D7-NEW-002: `01-data-model.md` settings key description uses `alarm_events`
**Severity:** 🟢 Low  
**File:** `01-fundamentals/01-data-model.md` line 367  
**Problem:** EventRetentionDays description: "Days to keep alarm_events" — should be `AlarmEvents`.

### D7-NEW-003: `03-alarm-firing.md` acceptance criteria uses `alarm_events`
**Severity:** 🟡 Medium  
**File:** `02-features/03-alarm-firing.md` line 551  
**Problem:** "logged with `type = 'missed'` in `alarm_events`" — should be `AlarmEvents`.

### D7-NEW-004: `03-alarm-firing.md` auto-dismiss uses camelCase `autoDismissMin`
**Severity:** 🟡 Medium  
**File:** `02-features/03-alarm-firing.md` line 450  
**Problem:** "Optional per-alarm setting: `autoDismissMin`" — should be `AutoDismissMin`.

### D7-NEW-005: `08-clock-display.md` uses `settings` table (lowercase)
**Severity:** 🟡 Medium  
**File:** `02-features/08-clock-display.md` line 37  
**Problem:** "persisted to `settings` SQLite table" — should be `Settings`.

### D7-NEW-006: `13-analytics.md` uses `alarm_events` table (lowercase)
**Severity:** 🟡 Medium  
**File:** `02-features/13-analytics.md` line 26  
**Problem:** "stored in `alarm_events` SQLite table" — should be `AlarmEvents`.

### D7-NEW-007: `13-analytics.md` column name `EventType` doesn't exist
**Severity:** 🟡 Medium  
**File:** `02-features/13-analytics.md` line 93  
**Problem:** Key columns list includes `EventType` but the actual schema column is `Type`. AI will query a nonexistent column.

### D7-NEW-008: `10-export-import.md` settings key uses snake_case
**Severity:** 🟡 Medium  
**File:** `02-features/10-export-import.md` line 131  
**Problem:** Settings key `export_warning_dismissed` should be PascalCase `ExportWarningDismissed` per the naming convention.

### D7-NEW-009: `05-sound-and-vibration.md` error variant `FileTooLarge` doesn't match enum
**Severity:** 🟡 Medium  
**File:** `02-features/05-sound-and-vibration.md` line 113  
**Problem:** Uses `AlarmAppError::FileTooLarge { max_mb: 10 }` but the error enum in `04-platform-constraints.md` defines `SoundFileTooLarge { size_bytes, max_bytes }`. Field names and variant name differ.

### D7-NEW-010: `05-sound-and-vibration.md` error variant `RestrictedPath` not in enum
**Severity:** 🟡 Medium  
**File:** `02-features/05-sound-and-vibration.md` lines 96, 100, 104  
**Problem:** Uses `AlarmAppError::RestrictedPath` but this variant doesn't exist in the error enum in `04-platform-constraints.md`. AI will get a compilation error.

### D7-NEW-011: ~~`04-snooze-system.md` uses `EventType = 'Snoozed'` (capitalized)~~ ✅ Resolved (Fix 22)
**Severity:** 🟡 Medium  
**File:** `02-features/04-snooze-system.md` line 61  
**Problem:** Fixed to `Type = 'snoozed'` — matching the data model's lowercase event types and correct column name.

### D7-NEW-012: `13-ai-cheat-sheet.md` missing closing code fence
**Severity:** 🔴 Critical  
**File:** `13-ai-cheat-sheet.md` line 96  
**Problem:** Pattern 2 (DST Resolution) code block starts at line 75 with ` ```rust` but never closes. The ` ``` ` is missing before `### 3.` on line 97. This breaks markdown rendering — all subsequent content appears as code.

### D7-NEW-013: `00-overview.md` validation rules use camelCase
**Severity:** 🟡 Medium  
**File:** `00-overview.md` → Data Model section uses `repeat.type`, `repeat.daysOfWeek`, `repeat.intervalMinutes`, `repeat.cronExpression`, `groupId`, `soundFile`, `nextFireTime` in the Validation Rules of `01-data-model.md` lines 373–387  
**Problem:** The validation rules table still uses camelCase field references. AI will implement validators with wrong field names.

---

## Updated Totals (Including Discovery Phase 7)

| Status | Previous | New | Total |
|--------|:--------:|:---:|:-----:|
| Total issues | 77 | 18 | **95** |
| Open | 0 | 12 | **12** |
| Resolved | 77 | 6 | **83** |

---

## Proposed Fix Phases

| Phase | Issues | Files | Description |
|-------|--------|-------|-------------|
| **Fix 21** | D7-REG-001, D7-REG-003, D7-REG-004, D7-REG-005 | `00-overview.md` | ✅ Fixed camelCase Data Model, SQLite ref, issue count |
| **Fix 23** | D7-REG-002, D7-NEW-011 | `04-snooze-system.md` | Fix SnoozeState.NextFireTime → SnoozeUntil + event type casing |
| **Fix 24** | D7-NEW-001, D7-NEW-002, D7-NEW-013 | `01-data-model.md` | Fix remaining snake_case in data model prose + validation rules |
| **Fix 25** | D7-NEW-003, D7-NEW-004 | `03-alarm-firing.md` | Fix snake_case in firing spec |
| **Fix 26** | D7-NEW-005, D7-NEW-006, D7-NEW-007, D7-NEW-008 | `08-clock-display.md`, `13-analytics.md`, `10-export-import.md` | Fix table names + column names in secondary specs |
| **Fix 27** | D7-NEW-009, D7-NEW-010 | `05-sound-and-vibration.md`, `04-platform-constraints.md` | Align error enum variants |
| **Fix 28** | D7-NEW-012 | `13-ai-cheat-sheet.md` | Fix missing code fence |
