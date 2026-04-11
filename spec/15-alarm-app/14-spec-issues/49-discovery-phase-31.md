# Discovery Phase 31 — Rust Struct Definitions & Serde Attribute Audit

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Phase:** 6 (Rust Struct Completeness)

---

## Keywords

`rust`, `struct`, `serde`, `rename_all`, `PascalCase`, `from_row`, `IPC`

---

## Methodology

Cross-referenced all TypeScript interfaces in `01-data-model.md` against Rust struct definitions. Checked for:
1. Missing Rust struct counterparts for IPC-facing TypeScript interfaces
2. Missing `#[serde(rename_all = "PascalCase")]` attributes
3. Field alignment between TS interface and Rust struct
4. Missing `from_row` implementations for DB-backed structs

---

## Findings

### RS-001 — `SnoozeState` has no Rust struct [CRITICAL]

TS interface defined at line 351. Returned by `snooze_alarm` and `get_snooze_state` IPC commands. Without a Rust struct with `#[serde(rename_all = "PascalCase")]`, AI will serialize as `snake_case` — breaking the frontend.

### RS-002 — `AlarmGroup` has no Rust struct [CRITICAL]

TS interface defined at line 465. Returned by `create_group`, `update_group`, `list_groups`. Five IPC commands depend on this type.

### RS-003 — `AlarmSound` has no Rust struct [MEDIUM]

TS interface defined at line 479. Returned by `list_sounds`. In-memory only (no DB table), but still needs serde for IPC serialization.

### RS-004 — `AlarmEvent` has no Rust struct [CRITICAL]

TS interface defined at line 496. 13 fields including enum types (`AlarmEventType`, `ChallengeType`). Returned by `list_alarm_events`. Needs `from_row` with enum parsing like `AlarmRow`.

### RS-005 — `Quote` has no Rust struct [MEDIUM]

TS interface defined at line 540. Returned by `get_daily_quote` and `add_custom_quote`.

### RS-006 — `StreakData` has no Rust struct [MEDIUM]

TS interface defined at line 554. Returned by `get_streak_data`. Computed struct (not a DB row).

### RS-007 — `StreakCalendarDay` has no Rust struct [LOW]

TS interface defined at line 566. Element of array returned by `get_streak_calendar`.

### RS-008 — `Settings` has no Rust struct [MEDIUM]

TS interface defined at line 518. Returned by `get_settings`. Key-value table requires assembly into typed struct.

---

## Summary

| ID | Severity | Description | Status |
|----|----------|-------------|--------|
| RS-001 | 🔴 Critical | `SnoozeState` — no Rust struct | ✅ Resolved |
| RS-002 | 🔴 Critical | `AlarmGroup` — no Rust struct | ✅ Resolved |
| RS-003 | 🟡 Medium | `AlarmSound` — no Rust struct | ✅ Resolved |
| RS-004 | 🔴 Critical | `AlarmEvent` — no Rust struct | ✅ Resolved |
| RS-005 | 🟡 Medium | `Quote` — no Rust struct | ✅ Resolved |
| RS-006 | 🟡 Medium | `StreakData` — no Rust struct | ✅ Resolved |
| RS-007 | 🟢 Low | `StreakCalendarDay` — no Rust struct | ✅ Resolved |
| RS-008 | 🟡 Medium | `Settings` — no Rust struct | ✅ Resolved |

**New issues this phase:** 8 (3 critical, 4 medium, 1 low) — all resolved immediately.

---

## Existing Rust Structs (Verified)

| Struct | File | `rename_all` | `from_row` | Status |
|--------|------|:------------:|:----------:|--------|
| `AlarmRow` | `01-data-model.md` | ✅ PascalCase | ✅ | OK |
| `RepeatPattern` | `01-data-model.md` | ✅ PascalCase | N/A (constructed) | OK |
| `AlarmQueue` | `03-alarm-firing.md` | ✅ PascalCase | N/A (in-memory) | OK |
| `FiredAlarm` | `03-alarm-firing.md` | ✅ PascalCase | N/A (in-memory) | OK |
| `IpcErrorResponse` | `04-platform-constraints.md` | Per-field `#[serde(rename)]` | N/A | OK (only 2 fields) |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Data model | `../01-fundamentals/01-data-model.md` |
| Platform constraints | `../01-fundamentals/04-platform-constraints.md` |
| Alarm firing | `../02-features/03-alarm-firing.md` |
| Previous discovery | `./48-discovery-phase-30.md` |
