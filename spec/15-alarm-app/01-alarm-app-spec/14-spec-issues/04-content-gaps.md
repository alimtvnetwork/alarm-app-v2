# Content Gaps

**Version:** 1.2.0  
**Updated:** 2026-04-10

---

## Summary

Missing content, incomplete specifications, and undefined patterns that will cause AI to guess or improvise.

---

## CG-001: No Frontend State Management Pattern Defined

**Severity:** 🟡 Medium  
**Status:** 🔴 Open

**Problem:** The spec defines React + TypeScript frontend but never specifies whether to use Zustand, Redux, Context API, or React Query. AI will pick arbitrarily.

**Affected files:** `06-tauri-architecture-and-framework-comparison.md`, all feature specs

---

## CG-002: DST Logic Hardcoded to US Spring-Forward (3:00 AM)

**Severity:** 🔴 Critical  
**Location:** `02-features/03-alarm-firing.md`  
**Status:** 🔴 Open

**Problem:** DST fallback is hardcoded to 3:00 AM — only correct for US. EU spring-forward is 1:00→2:00 AM, some regions have 0:00→1:00 AM. Malaysia (UTC+8) has no DST at all.

---

## CG-003: Error Enum Incomplete

**Severity:** 🟡 Medium  
**Location:** `01-fundamentals/04-platform-constraints.md`  
**Status:** 🔴 Open

**Missing variants referenced elsewhere:**
- `SymlinkRejected` — referenced in security issues
- `ConcurrentModification` — referenced in concurrency guide

---

## CG-004: No Serde Serialization Attributes Specified

**Severity:** 🔴 Critical  
**Location:** `01-fundamentals/01-data-model.md`  
**Status:** 🔴 Open

**Problem:** Rust structs need `#[serde(rename_all = "PascalCase")]` to match the coding guideline, but no serde attributes are shown anywhere in the spec. AI will use default snake_case serialization.

---

## CG-005: No Exemptions List for External Conventions

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved

**Problem:** The PascalCase standard (`11-key-naming-pascalcase.md` §6) has an exemptions table for external APIs. The alarm app spec had potential exemptions but never declared them.

**Resolution:** Exemptions declared:

| Exemption | Convention | Reason |
|-----------|-----------|--------|
| Refinery migration filenames | `V{N}__{snake_case}.sql` | Required by `refinery` crate — cannot be changed |
| Tauri IPC command names | `snake_case` | Tauri framework convention — e.g., `create_alarm` |
| Tauri IPC event names | `kebab-case` | Tauri framework convention — e.g., `alarm-fired` |
| Rust struct field names | `snake_case` | Rust language convention — serialized to PascalCase via `#[serde(rename_all = "PascalCase")]` |
| TS/JS function names | `camelCase` | Language convention — PascalCase applies to serialized keys only |

**Key principle:** PascalCase applies to **serialized string keys** (JSON, DB columns, config, logs). Language-level identifiers and external framework conventions follow their own rules.

---

## CG-006: Feature Specs Reference snake_case Columns in Prose

**Severity:** 🟡 Medium  
**Status:** 🔴 Open

**Problem:** Feature files reference column names in prose text (not just code blocks), e.g.:
- `07-alarm-groups.md` line 41: "Column: `previous_enabled`"
- `07-alarm-groups.md` line 47: "save `enabled` → `previous_enabled`"
- `03-alarm-firing.md` line 27: "`next_fire_time <= now`"
- `03-alarm-firing.md` line 486: "Sort by `next_fire_time ASC`"
- `04-snooze-system.md` line 47: "`snooze_state` SQLite table" (table renamed to `SnoozeState`)
- `04-snooze-system.md` lines 30–31: `snoozeDurationMin`, `maxSnoozeCount` (camelCase prose)
- `03-alarm-firing.md` lines 485–487: `next_fire_time`, `enabled`, `created_at` in queue rules
- `05-sound-and-vibration.md` lines 146, 236: `gradualVolume`, `vibrationEnabled` (camelCase prose)

These prose references must also be updated when column names change to PascalCase.

**Files affected:** `01-alarm-crud.md`, `03-alarm-firing.md`, `04-snooze-system.md`, `05-sound-and-vibration.md`, `07-alarm-groups.md`, `10-export-import.md`, `13-analytics.md`

---

## CG-007: AlarmChallenge Missing From Schema

**Severity:** 🔴 Critical  
**Location:** `02-features/06-dismissal-challenges.md` vs `01-fundamentals/01-data-model.md`  
**Cross-ref:** LC-001 in `06-logic-consistency.md`  
**Status:** 🔴 Open

**Problem:** The `AlarmChallenge` interface is defined in the dismissal challenges spec but has no corresponding columns in the `alarms` table or TS `Alarm` interface. Without schema support, challenge-per-alarm configuration cannot be implemented.

---

## CG-008: Scheduling Spec Uses Stale `recurringDays` Term

**Severity:** 🟡 Medium  
**Location:** `02-features/02-alarm-scheduling.md`  
**Cross-ref:** UX-008 in `07-ui-ux-consistency.md`  
**Status:** 🔴 Open

**Problem:** `02-alarm-scheduling.md` line 27 uses `recurringDays` — replaced by `RepeatPattern` in data model. "One-time alarms (empty `recurringDays`) auto-disable" contradicts `repeat.type = "once"` pattern in `01-data-model.md`. AI will be confused about which pattern to implement.

---

## CG-009: Settings Page Component Not Specified

**Severity:** 🟡 Medium  
**Status:** 🔴 Open

**Problem:** Multiple features reference "Settings page" (theme, i18n, retention days, shortcut reference, bedtime) but no `Settings.tsx` or settings page component exists in `03-file-structure.md`. No routing or page navigation defined — unclear if Settings is a dialog, page, or drawer.

---

## CG-010: No Error Toast Component in File Structure

**Severity:** 🟢 Low  
**Status:** 🔴 Open

**Problem:** `04-platform-constraints.md` references `toast.error()` extensively; `01-alarm-crud.md` references `UndoToast` component. No toast library specified (Sonner? react-hot-toast? Custom?) and file structure doesn't list a toast component.

---

## CG-011: `02-alarm-scheduling.md` Severely Outdated

**Severity:** 🟡 Medium  
**Location:** `02-features/02-alarm-scheduling.md`  
**Cross-ref:** UX-011 in `07-ui-ux-consistency.md`  
**Status:** 🔴 Open

**Problem:** Version 1.0.0 vs all other feature files at 1.1.0–1.6.0. Still references `recurringDays` (deprecated). Doesn't mention `interval` or `cron` repeat types (added in data model). Quick Alarm / Holiday features mentioned but no IPC commands, Rust logic, or data model integration. AI will find contradictory scheduling information.

---

## CG-012: `alarm_events.metadata` JSON Field Referenced But Does Not Exist

**Severity:** 🟡 Medium  
**Location:** `02-features/06-dismissal-challenges.md` (line 39)  
**Status:** 🔴 Open

**Problem:** `06-dismissal-challenges.md` references `alarm_events.metadata` JSON containing `{"solve_time_ms": 4500}`. No `Metadata` column exists in the `AlarmEvents` schema. The data model has `ChallengeSolveTimeSec REAL` instead. AI will try to create a non-existent column or use the wrong one.

---

## Issues Found So Far: 12
## Open: 11 | Resolved: 1
