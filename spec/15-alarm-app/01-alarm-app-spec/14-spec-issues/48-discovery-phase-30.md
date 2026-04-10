# Discovery Phase 30 — Payload & Interface Definitions Audit

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Phase:** 5 (Payload/Interface Completeness)

---

## Keywords

`payload`, `interface`, `types`, `ipc`, `definitions`, `completeness`

---

## Methodology

Cross-referenced all IPC command return types and payload types between:
- Feature specs (16 files in `02-features/`)
- Data model (`01-fundamentals/01-data-model.md` — 31 defined interfaces/enums)
- Architecture registry (`01-fundamentals/06-tauri-architecture-and-framework-comparison.md`)

Identified types referenced in IPC tables but never formally defined as TypeScript interfaces.

---

## Findings

### PL-001 — `StreakData` interface never defined [CRITICAL]

`06-tauri-architecture-and-framework-comparison.md` line 143 returns `StreakData` from `get_streak_data`, but no interface exists. `14-personalization.md` uses an inline object `{ CurrentStreak: number, LongestStreak: number, CalendarDays: string[] }` — this should be formalized.

### PL-002 — `StreakCalendarDay` interface never defined [CRITICAL]

Registry returns `StreakCalendarDay[]` from `get_streak_calendar`. Feature spec uses inline `{ Days: { Date: string, IsOnTime: boolean }[] }`. Mismatched structure (array vs wrapper object).

### PL-003 — `Quote` interface never defined [CRITICAL]

Registry returns `Quote` from `get_daily_quote` and `add_custom_quote`. Feature spec uses inline `{ Text: string, Author: string }`. `add_custom_quote` returns `{ QuoteId: string }` in feature but `Quote` in registry — contradicts.

### PL-004 — `Settings` interface never defined [MEDIUM]

`get_settings` returns `Settings` in the registry. No TypeScript interface exists in the data model. The SQL schema defines `Settings` as a key-value table, but the TS shape AI should return is unspecified.

### PL-005 — `save_favorite_quote` payload mismatch [MEDIUM]

- **Registry:** `{ QuoteId: string }` (save by ID)
- **Feature spec:** `{ Text: string, Author: string }` (save by content)

These are semantically different operations. AI will implement the wrong one.

### PL-006 — `play_ambient` payload mismatch [MEDIUM]

- **Registry:** `{ SoundId: string }` (missing `DurationMin`)
- **Feature spec:** `{ SoundId: string, DurationMin: number }`

Missing `DurationMin` means ambient sounds won't auto-stop.

### PL-007 — `add_custom_quote` return type mismatch [LOW]

- **Registry:** `Quote` (full object)
- **Feature spec:** `{ QuoteId: string }` (ID only)

---

## Summary

| ID | Severity | Description | Status |
|----|----------|-------------|--------|
| PL-001 | 🔴 Critical | `StreakData` interface undefined | ✅ Resolved |
| PL-002 | 🔴 Critical | `StreakCalendarDay` interface undefined | ✅ Resolved |
| PL-003 | 🔴 Critical | `Quote` interface undefined | ✅ Resolved |
| PL-004 | 🟡 Medium | `Settings` interface undefined | ✅ Resolved |
| PL-005 | 🟡 Medium | `save_favorite_quote` payload contradicts | ✅ Resolved |
| PL-006 | 🟡 Medium | `play_ambient` missing `DurationMin` in registry | ✅ Resolved |
| PL-007 | 🟢 Low | `add_custom_quote` return type mismatch | ✅ Resolved |

**New issues this phase:** 7 open (3 critical, 3 medium, 1 low)

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Data model | `../01-fundamentals/01-data-model.md` |
| Architecture IPC registry | `../01-fundamentals/06-tauri-architecture-and-framework-comparison.md` |
| Personalization | `../02-features/14-personalization.md` |
| Sleep & Wellness | `../02-features/11-sleep-wellness.md` |
| Previous discovery | `./47-discovery-phase-29.md` |
