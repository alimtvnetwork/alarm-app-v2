# Discovery Phase 25 — Cross-Spec Deep Consistency & AI Handoff Audit

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Issues Found:** 15 (2 Critical, 9 Medium, 4 Low)

---

## Issues

### P25-001 — AlarmEvent uses `?` optional on 5 fields (violates `| null` convention) 🔴 Critical

**File:** `01-fundamentals/01-data-model.md` line ~480  
**Problem:** `AlarmEvent` interface uses TypeScript `?` optional syntax on `ChallengeType?`, `ChallengeSolveTimeSec?`, `SleepQuality?`, `Mood?` — should be `ChallengeType: ChallengeType | null` etc. per the established `| null` convention used consistently on `Alarm` interface.  
**Impact:** AI will generate inconsistent optional field handling. Some interfaces use `| null`, others use `?`. The data model section itself says "Use `Option<EnumType>` (Rust) / `ChallengeType | null` (TS) for optional fields."  
**Fix:** Change `AlarmEvent` fields from `?` optional to explicit `| null`.

---

### P25-002 — `03-alarm-firing.md` uses `is_day_excluded` (negative boolean) 🔴 Critical

**File:** `02-features/03-alarm-firing.md` line ~120  
**Problem:** `compute_weekly()` calls `repeat.is_day_excluded(weekday_num as u8)` — a negative boolean name that violates `12-no-negatives.md`. Should be a positive check like `repeat.includes_day()` with the condition inverted.  
**Impact:** Already flagged in Phase 22 (P22-009) but the actual code in `03-alarm-firing.md` still shows it. This is the primary source — if an AI copies this code verbatim, it embeds a guideline violation.  
**Fix:** Change to `!repeat.includes_day(weekday_num as u8)` or refactor to positive `if repeat.includes_day(...) { ... }`.

---

### P25-003 — `02-alarm-scheduling.md` acceptance criteria uses raw strings 🟡 Medium

**File:** `02-features/02-alarm-scheduling.md` line ~134  
**Problem:** Acceptance criteria line 134 says `Type = "once"` (lowercase raw string) — should use `RepeatType::Once` or `RepeatType.Once`.  
**Impact:** AI may implement acceptance criteria checks using raw strings instead of enum comparisons.  
**Fix:** Change `Type = "once"` to `Type = RepeatType.Once` in the acceptance criteria.

---

### P25-004 — `03-alarm-firing.md` post-fire behavior uses mixed casing 🟡 Medium

**File:** `02-features/03-alarm-firing.md` lines ~47-50  
**Problem:** Post-fire behavior table mixes enum references with lowercase strings:
- Line 46: `RepeatType::Once` ✅
- Line 47: `daily` ❌ (should be `RepeatType::Daily`)
- Line 48: `weekly` ❌
- Line 49: `interval` ❌
- Line 50: `cron` ❌  
**Impact:** AI copies the table and uses lowercase string comparisons for these cases.  
**Fix:** Change all to `RepeatType::Daily`, `RepeatType::Weekly`, `RepeatType::Interval`, `RepeatType::Cron`.

---

### P25-005 — `AlarmChallenge` interface uses `?` optional instead of `| null` 🟡 Medium

**File:** `02-features/06-dismissal-challenges.md` line ~97  
**Problem:** `AlarmChallenge` interface uses `Difficulty?: ChallengeDifficulty`, `ShakeCount?: number`, `StepCount?: number` — should use `| null` pattern.  
**Impact:** Inconsistent with the `Alarm` interface convention.  
**Fix:** Change to `Difficulty: ChallengeDifficulty | null`, etc.

---

### P25-006 — `HistoryFilter` uses `?` optional on all fields 🟡 Medium

**File:** `02-features/13-analytics.md` line ~59  
**Problem:** `HistoryFilter` interface uses `StartDate?: string`, `EndDate?: string`, `GroupId?: string`, etc. — all use `?` instead of `| null`.  
**Impact:** Already noted in Phase 24 (P24-002) — but the actual interface still uses `?`. This is a different observation: all 7 fields use `?`, making this the worst offender.  
**Fix:** Change all to `| null` pattern.

---

### P25-007 — `07-alarm-groups.md` missing CRUD IPC commands 🟡 Medium

**File:** `02-features/07-alarm-groups.md` line ~70  
**Problem:** IPC Commands section only lists `toggle_group`. Missing: `create_group`, `update_group`, `delete_group`, `list_groups`. The Behavior table (line ~37) describes create/rename/delete but no IPC commands for them.  
**Impact:** Already noted in Phase 22 (P22-005) — reconfirmed. AI cannot implement group CRUD without IPC contracts.  
**Fix:** Add missing IPC command table entries with payloads and returns.

---

### P25-008 — `01-alarm-crud.md` undo code uses camelCase IPC keys 🟡 Medium

**File:** `02-features/01-alarm-crud.md` line ~270  
**Problem:** Line 270: `await safeInvoke("undo_delete_alarm", { undoToken: token })` — uses camelCase `undoToken` as the IPC payload key. Should be PascalCase `UndoToken` per established convention.  
**Impact:** Already noted in Phase 23 (P23-003) — reconfirmed. The code sample is a direct copy target for AI.  
**Fix:** Change `{ undoToken: token }` to `{ UndoToken: token }`.

---

### P25-009 — `AlarmSound` has no storage mechanism or IPC 🟡 Medium

**File:** `01-fundamentals/01-data-model.md` line ~462  
**Problem:** `AlarmSound` interface is defined with `AlarmSoundId`, `Name`, `FileName`, `Category` but there is no corresponding SQLite table, no IPC command to list sounds, and no explanation of how sounds are stored (bundled assets? hardcoded array?). `05-sound-and-vibration.md` has a "Sound Library" table with 10 entries but no link to the `AlarmSound` interface.  
**Impact:** AI will try to create a database table for sounds or won't know how to populate the sound list.  
**Fix:** Add a note clarifying `AlarmSound` is a read-only in-memory list derived from bundled assets, not a DB table. Or add an IPC command `list_sounds` that returns hardcoded entries.

---

### P25-010 — `13-ai-cheat-sheet.md` says "22 columns" for Alarms, actual is 26 🟡 Medium

**File:** `13-ai-cheat-sheet.md` line ~209  
**Problem:** "Alarms (22 columns)" — actual column count in V1 schema is 26 (including `IsPreviousEnabled`, `RepeatType`, `RepeatDaysOfWeek`, `RepeatIntervalMinutes`, `RepeatCronExpression` which were added during fixes).  
**Impact:** Already noted in Phase 23 (P23-008) — reconfirmed. AI may create incomplete table schemas.  
**Fix:** Update to "Alarms (26 columns)".

---

### P25-011 — `13-ai-cheat-sheet.md` says "12 variants" for AlarmAppError, actual is 13+ 🟡 Medium

**File:** `13-ai-cheat-sheet.md` line ~166  
**Problem:** "AlarmAppError — 12 variants" but the actual enum in `04-platform-constraints.md` has 13+ variants (including `RestrictedPath`, `SymlinkRejected`, etc. added during fixes).  
**Impact:** Already noted in Phase 22 (P22-015) — reconfirmed. AI may implement incomplete error handling.  
**Fix:** Count actual variants and update number.

---

### P25-012 — `10-export-import.md` references `ImportPreview` without defining it 🟡 Medium

**File:** `02-features/10-export-import.md` line ~59  
**Problem:** `confirm_import` returns `ImportResult` (defined on line 107) but `import_data` returns `ImportPreview` which is never defined anywhere in the spec.  
**Impact:** Already noted in Phase 22 (P22-006) — reconfirmed. AI cannot implement the import preview without an interface definition.  
**Fix:** Add `ImportPreview` interface definition.

---

### P25-013 — Double `---` horizontal rules in all spec files 🟢 Low

**File:** All 28+ spec files  
**Problem:** Every spec file has `---\n---` (double horizontal rule) after the Keywords section. This is a formatting artifact that could confuse markdown parsers.  
**Impact:** Cosmetic, but some markdown renderers show a double line. AI may replicate this pattern.  
**Fix:** Remove one of the duplicate `---` in each file.

---

### P25-014 — `07-alarm-groups.md` still shows `Updated: 2026-04-09` 🟢 Low

**File:** `02-features/07-alarm-groups.md` line ~4  
**Problem:** Updated date is `2026-04-09` while all other files show `2026-04-10`. This file may have been missed in the last date update pass.  
**Fix:** Update to `2026-04-10`.

---

### P25-015 — `10-export-import.md` still shows `Updated: 2026-04-09` 🟢 Low

**File:** `02-features/10-export-import.md` line ~4  
**Problem:** Same as P25-014.  
**Fix:** Update to `2026-04-10`.

---

### P25-016 — `15-keyboard-shortcuts.md` still shows `Updated: 2026-04-08` 🟢 Low

**File:** `02-features/15-keyboard-shortcuts.md` line ~4  
**Problem:** Two days behind. Missed in update passes.  
**Fix:** Update to `2026-04-10`.

---

## Summary

| Severity | Count |
|----------|:-----:|
| 🔴 Critical | 2 |
| 🟡 Medium | 9 |
| 🟢 Low | 4 |
| **Total** | **15** |

### Overlap with Prior Phases

Several issues reconfirm findings from Phases 22-24 that are still open (P22-005, P22-006, P22-009, P22-015, P23-003, P23-008, P24-002). These are listed here for completeness — they should not be double-counted.

**Net new issues (not previously found):** 7 (P25-001, P25-003, P25-004, P25-005, P25-009, P25-014, P25-015, P25-016)

**Adjusted new count:** 8 new issues + 7 reconfirmations = 15 total entries.

---

*Discovery Phase 25 — 2026-04-10*
