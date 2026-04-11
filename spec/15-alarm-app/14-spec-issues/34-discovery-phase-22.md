# Discovery Phase 22 — Fresh Comprehensive Audit

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Scope:** Fresh audit of all fundamentals and feature specs. Focus: missing dependencies, undefined interfaces, naming violations, enum consistency, and AI handoff gaps.

---

## Issues Found

### 🔴 Critical — AI Will Fail

| # | ID | File | Description | Fix Guidance |
|---|-----|------|-------------|-------------|
| 1 | P22-001 | `01-fundamentals/03-file-structure.md` | `@dnd-kit/core` + `@dnd-kit/sortable` referenced in `01-alarm-crud.md` and cheat sheet but **missing from npm dependencies** | Add to `dependencies` in package.json section with pinned versions |
| 2 | P22-002 | `01-fundamentals/03-file-structure.md` | `reqwest` and `url` crates used in `02-features/12-smart-features.md` webhook code but **missing from Cargo.toml** | Add `reqwest` + `url` to `[dependencies]` with `=` pins |
| 3 | P22-003 | `01-fundamentals/03-file-structure.md` | `rand` crate referenced in `02-features/06-dismissal-challenges.md` for math problem generation but **missing from Cargo.toml** | Add `rand` to `[dependencies]` with `=` pin |
| 4 | P22-004 | `02-features/07-alarm-groups.md` | **Missing group CRUD IPC commands.** Only `toggle_group` is listed. No `create_group`, `update_group`, `delete_group`, `list_groups` defined | Add full IPC Commands table |
| 5 | P22-005 | `01-fundamentals/01-data-model.md` | `ExportWarningDismissed` setting referenced in `10-export-import.md` line 142 but **missing from Settings Keys table** (only 9 keys listed) | Add as 10th setting key |
| 6 | P22-006 | `02-features/10-export-import.md` | `ImportPreview` referenced as return type of `import_data` IPC command but **interface never defined** | Define `ImportPreview` interface with fields |
| 7 | P22-007 | `02-features/12-smart-features.md` | `WebhookPayload` used in `fire_webhook(url, payload)` but **interface never defined** | Define `WebhookPayload` interface |
| 8 | P22-008 | `01-fundamentals/01-data-model.md` | `RepeatPattern` **Rust struct never defined** — only TypeScript interface exists. `repeat_pattern()` method creates one but the struct isn't declared | Add Rust `RepeatPattern` struct with serde |

### 🟡 Medium — AI Will Produce Wrong Code

| # | ID | File | Description | Fix Guidance |
|---|-----|------|-------------|-------------|
| 9 | P22-009 | `02-features/03-alarm-firing.md` | Firing logic step 4 (lines 47–50) uses lowercase `daily`, `weekly`, `interval`, `cron` instead of `RepeatType::Daily`, etc. — contradicts enum-only rule | Replace with `RepeatType::` enum refs |
| 10 | P22-010 | `02-features/03-alarm-firing.md` | `repeat.is_day_excluded()` at line 120 uses **negative naming** — contradicts boolean guidelines. Should be `repeat.includes_day()` or `days_of_week.contains()` | Rename to positive form |
| 11 | P22-011 | `13-ai-cheat-sheet.md` | Line 166 says AlarmAppError has "12 variants" but actual enum in `04-platform-constraints.md` has **13 variants** | Update to "13 variants" |
| 12 | P22-012 | `02-features/03-alarm-firing.md` | Timezone change code (line 198) uses `&alarm.repeat` but `AlarmRow` has no `repeat` field — should use `alarm.repeat_pattern()` method or destructure fields | Fix field reference |
| 13 | P22-013 | `01-fundamentals/01-data-model.md` | `AlarmEvent` interface uses TypeScript `?` optional syntax (`ChallengeType?: ChallengeType`) for nullable fields instead of `ChallengeType: ChallengeType \| null` — inconsistent with all other nullable fields in the spec | Use `\| null` pattern consistently |
| 14 | P22-014 | `02-features/02-alarm-scheduling.md` | Acceptance criteria line 134 uses raw string `Type = "once"` instead of `RepeatType::Once` — contradicts zero-magic-strings rule | Replace with enum ref |
| 15 | P22-015 | `01-fundamentals/01-data-model.md` | `AlarmSound` interface defined but **no IPC command, no SQL table, no storage mechanism** for built-in sounds. AI won't know how to implement sound selection | Document where sound metadata lives (bundled JSON? hardcoded? table?) |

### 🟢 Low — Cosmetic / Minor Confusion

| # | ID | File | Description | Fix Guidance |
|---|-----|------|-------------|-------------|
| 16 | P22-016 | Multiple (28 files) | Double `---\n---` horizontal rule between Keywords and Scoring sections in all spec files — parsing confusion | Remove duplicate separators |
| 17 | P22-017 | `13-ai-cheat-sheet.md` | Footer says "v1.0.0" but header version is "v1.1.0" — version mismatch | Update footer to match header |
| 18 | P22-018 | `13-ai-cheat-sheet.md` | `shadcn/ui` listed in tech stack but not in npm deps — it's not an npm package (it's a CLI template). May confuse AI into trying `npm install shadcn/ui` | Add clarifying note: "shadcn/ui is copied into src/components/ui, not an npm dep" |

---

## Summary

| Severity | Count |
|----------|:-----:|
| 🔴 Critical | 8 |
| 🟡 Medium | 7 |
| 🟢 Low | 3 |
| **Total** | **18** |

---

## Suggested Fix Phases

| Phase | Issues | Description |
|-------|:------:|-------------|
| **Phase U** | P22-001, P22-002, P22-003 | Add missing dependencies (dnd-kit, reqwest, url, rand) to file-structure spec |
| **Phase V** | P22-004, P22-006, P22-007, P22-008 | Define missing IPC commands and interfaces (groups CRUD, ImportPreview, WebhookPayload, RepeatPattern Rust struct) |
| **Phase W** | P22-005, P22-015 | Fill gaps in data model (ExportWarningDismissed setting, AlarmSound storage) |
| **Phase X** | P22-009, P22-010, P22-012, P22-014 | Fix enum/naming violations in firing and scheduling specs |
| **Phase Y** | P22-011, P22-013, P22-016, P22-017, P22-018 | Fix cheat sheet counts, AlarmEvent interface, double separators, footer version |

---

*Discovery Phase 22 — updated: 2026-04-10*
