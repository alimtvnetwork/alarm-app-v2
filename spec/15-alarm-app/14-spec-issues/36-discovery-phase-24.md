# Discovery Phase 24 — IPC Command Coverage, File Structure Gaps & Interface Consistency

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Scope:** Cross-referencing all IPC commands across feature specs against file structure; interface optional syntax consistency; missing cross-references and assets.

---

## Issues Found

### 🔴 Critical — AI Will Fail

| # | ID | File | Description | Fix Guidance |
|---|-----|------|-------------|-------------|
| 1 | P24-001 | `01-fundamentals/03-file-structure.md` | **File structure lists only 4 Rust command files** (`alarm.rs`, `audio.rs`, `settings.rs`, `export_import.rs`) but feature specs define IPC commands across **at least 8 domains**: alarm, audio, settings, export_import, group, challenge, analytics/history, personalization/wellness/ambient. ~15+ IPC commands have no corresponding Rust file. AI will not know where to implement them | Add missing command files: `commands/group.rs`, `commands/challenge.rs`, `commands/history.rs`, `commands/wellness.rs`, `commands/personalization.rs` — or consolidate with clear comments |

### 🟡 Medium — AI Will Produce Wrong Code

| # | ID | File | Description | Fix Guidance |
|---|-----|------|-------------|-------------|
| 2 | P24-002 | `02-features/13-analytics.md` | `HistoryFilter` interface (lines 59–68) uses TypeScript `?` optional on ALL 7 fields (`StartDate?: string`, `EndDate?: string`, etc.) instead of `| null` pattern. Same violation as P22-013 and P23-005 | Use `| null` pattern consistently |
| 3 | P24-003 | `02-features/08-clock-display.md` | `ClockState.Is24Hour` boolean doesn't map to any Settings key. Settings table has `TimeFormat` with `"12h"` / `"24h"` values — no derivation documented. AI won't know how to connect them | Add note: `Is24Hour` is derived from `getSettings("TimeFormat") === "24h"` |
| 4 | P24-004 | `02-features/08-clock-display.md` | IPC command `get_next_alarm_time` is defined here but **not listed in any other file** — not in cheat sheet, not in alarm-crud IPC table, not in file structure IPC flow. AI may miss it | Add to cheat sheet IPC reference and to the file structure IPC flow diagram |
| 5 | P24-005 | `02-features/11-sleep-wellness.md` | IPC commands `log_sleep_quality`, `play_ambient`, `stop_ambient` defined but **no Rust command file exists** in file structure. Missing `commands/wellness.rs` or similar | Add command file to file structure (or merge into existing file with clear note) |
| 6 | P24-006 | `02-features/13-analytics.md` | IPC commands `list_alarm_events`, `export_history_csv`, `clear_history` defined but **no Rust command file exists** in file structure. Missing `commands/history.rs` | Add command file to file structure |
| 7 | P24-007 | `02-features/14-personalization.md` | 7 IPC commands defined (`get_daily_quote`, `save_favorite_quote`, `add_custom_quote`, `set_custom_background`, `clear_custom_background`, `get_streak_data`, `get_streak_calendar`) but **no Rust command file exists** | Add `commands/personalization.rs` to file structure |
| 8 | P24-008 | `02-features/09-theme-system.md` | IPC commands `get_theme` and `set_theme` use Settings table but no cross-reference to `commands/settings.rs`. AI may create a separate `commands/theme.rs` | Add note: "Theme IPC commands are implemented in `commands/settings.rs` alongside other settings" |
| 9 | P24-009 | `02-features/97-acceptance-criteria.md` | Line 36: `Type = "once"` raw string inherited from source spec (`02-alarm-scheduling.md` P22-014). The rollup must also be fixed when the source is fixed | Fix alongside P22-014 — update to `RepeatType.Once` |
| 10 | P24-010 | `01-fundamentals/02-design-system.md` | Fonts `Outfit` and `Figtree` specified for typography but **neither appears in npm deps, asset files, or any installation instruction**. AI won't know how to include them (Google Fonts CDN? npm package? bundled .woff2?) | Document font loading strategy: CDN link in `index.html`, or npm `@fontsource/outfit` + `@fontsource/figtree`, or bundled `.woff2` files |

### 🟢 Low — Cosmetic / Minor Confusion

| # | ID | File | Description | Fix Guidance |
|---|-----|------|-------------|-------------|
| 11 | P24-011 | `01-fundamentals/10-dependency-lock.md` | Footer says "v1.0.0" but header says "Version: 1.1.0" — version mismatch | Update footer to "v1.1.0" |
| 12 | P24-012 | `02-features/15-keyboard-shortcuts.md` | Last updated `2026-04-08` while all other files show `2026-04-09` or `2026-04-10` — stale date | Update to current date |
| 13 | P24-013 | `02-features/06-dismissal-challenges.md` | `AlarmChallenge` interface defined inline (lines 94–101) with a note saying it's a "convenience wrapper" — but the note doesn't clarify whether AI should implement it as a real interface or just use flat columns directly | Strengthen the note: "Do NOT create this as a separate interface in code. It is documentation-only. Use the flat columns directly." |

---

## Summary

| Severity | Count |
|----------|:-----:|
| 🔴 Critical | 1 |
| 🟡 Medium | 9 |
| 🟢 Low | 3 |
| **Total** | **13** |

---

## Relationship to Prior Issues

P24-001 is a **superset** of P23-006 (missing `group.rs`) and P23-007 (missing `challenge.rs`). This phase reveals the full scope: 5+ command files are missing, not just 2. If P24-001 is fixed comprehensively, P23-006 and P23-007 are resolved as part of it.

---

## Suggested Fix Phases

| Phase | Issues | Description |
|-------|:------:|-------------|
| **Phase AE** | P24-001, P24-005, P24-006, P24-007, P24-008 | Comprehensive file structure update: add all missing command files, cross-reference theme commands |
| **Phase AF** | P24-002, P24-003, P24-004 | Fix HistoryFilter optional syntax, ClockState derivation, get_next_alarm_time cross-refs |
| **Phase AG** | P24-009, P24-010 | Font loading strategy, acceptance criteria raw string |
| **Phase AH** | P24-011, P24-012, P24-013 | Cosmetic: version mismatch, stale date, AlarmChallenge clarification |

---

*Discovery Phase 24 — updated: 2026-04-10*
