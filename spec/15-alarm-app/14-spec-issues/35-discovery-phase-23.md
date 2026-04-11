# Discovery Phase 23 — Cross-File Consistency & Code Sample Audit

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Scope:** Deep audit of code samples, interface consistency, file structure alignment, and IPC command completeness across all spec files.

---

## Issues Found

### 🔴 Critical — AI Will Fail

| # | ID | File | Description | Fix Guidance |
|---|-----|------|-------------|-------------|
| 1 | P23-001 | `01-fundamentals/03-file-structure.md` | Component hierarchy (line 391) shows `AlarmOverlay` as a **child of `Index.tsx`**, but `02-features/03-alarm-firing.md` (line 506) explicitly states overlay is a **"separate Tauri window created by the Rust backend, not a CSS overlay or portal"**. AI will implement it wrong — either as a React child component or as a separate window, depending on which file it reads first | Remove `AlarmOverlay` from `Index.tsx` hierarchy. Add a separate "Overlay Window" section showing `AlarmOverlay.tsx` mounted in a separate Tauri window |
| 2 | P23-002 | `02-features/01-alarm-crud.md` | Line 268: `clearTimeout(entry.timerId)` uses **camelCase** `timerId`, but the `UndoEntry` interface (line 235) defines it as **PascalCase** `TimerId`. This is a **runtime bug** in the code sample — the property access will return `undefined` | Change `entry.timerId` → `entry.TimerId` on line 268 |

### 🟡 Medium — AI Will Produce Wrong Code

| # | ID | File | Description | Fix Guidance |
|---|-----|------|-------------|-------------|
| 3 | P23-003 | `02-features/01-alarm-crud.md` | Line 270: `safeInvoke("undo_delete_alarm", { undoToken: token })` uses **camelCase** key `undoToken` in IPC payload. Per PascalCase key naming standard, should be `{ UndoToken: token }`. AI will send wrong key over IPC | Change `undoToken` → `UndoToken` |
| 4 | P23-004 | `02-features/02-alarm-scheduling.md` | Line 68: `Type = "weekly"` is a raw string instead of `RepeatType::Weekly` enum ref. Same zero-magic-strings violation as P22-014 but in a **different location** (UI Controls section, not Acceptance Criteria) | Replace with `Type = RepeatType.Weekly` |
| 5 | P23-005 | `02-features/06-dismissal-challenges.md` | Lines 97–99: `AlarmChallenge` interface uses TypeScript `?` optional syntax (`Difficulty?: ChallengeDifficulty`, `ShakeCount?: number`, `StepCount?: number`) instead of `| null` pattern. Inconsistent with all other nullable fields in the spec | Use `| null` pattern: `Difficulty: ChallengeDifficulty \| null` |
| 6 | P23-006 | `01-fundamentals/03-file-structure.md` | No `commands/group.rs` file listed in the Rust file structure. Group CRUD IPC commands are needed (P22-004) but there's no corresponding Rust command file | Add `commands/group.rs` to file structure with comment: "Group CRUD commands (IPC handlers)" |
| 7 | P23-007 | `01-fundamentals/03-file-structure.md` | No `commands/challenge.rs` file listed. `06-dismissal-challenges.md` defines `get_challenge` and `submit_challenge_answer` IPC commands but no Rust file exists for them | Add `commands/challenge.rs` to file structure |
| 8 | P23-008 | `01-fundamentals/07-startup-sequence.md` | `log_from_frontend` IPC command is defined in code sample (lines 233–241) but **never appears in any IPC Commands table** across all spec files. AI may not expose it as a Tauri command | Add `log_from_frontend` to an IPC Commands table (either in startup-sequence or a central IPC reference) |
| 9 | P23-009 | `13-ai-cheat-sheet.md` | Line 209: `Alarms` table listed as "22 columns" but the actual SQL schema in `01-data-model.md` has **26 columns** (AlarmId through UpdatedAt). AI will create an incomplete table | Update to "26 columns" |

### 🟢 Low — Cosmetic / Minor Confusion

| # | ID | File | Description | Fix Guidance |
|---|-----|------|-------------|-------------|
| 10 | P23-010 | `02-features/04-snooze-system.md` | `SnoozeState` interface is **duplicated** — defined in both `01-data-model.md` (lines 336–342) and `04-snooze-system.md` (lines 50–56). If one is updated without the other, they diverge | Remove the duplicate in `04-snooze-system.md` and add a cross-reference: "See `01-data-model.md` → SnoozeState interface" |
| 11 | P23-011 | Multiple fundamentals files | Fundamentals files (01–11) don't have `Priority:` metadata field that all feature files have (P0–P3). **Inconsistent metadata format** across the spec | Either add `Priority:` to fundamentals (all are P0) or document that fundamentals don't use priority levels |

---

## Summary

| Severity | Count |
|----------|:-----:|
| 🔴 Critical | 2 |
| 🟡 Medium | 7 |
| 🟢 Low | 2 |
| **Total** | **11** |

---

## Suggested Fix Phases

| Phase | Issues | Description |
|-------|:------:|-------------|
| **Phase Z** | P23-001, P23-006, P23-007 | Fix file structure: AlarmOverlay hierarchy, add missing command files (group.rs, challenge.rs) |
| **Phase AA** | P23-002, P23-003 | Fix PascalCase bugs in alarm-crud.md code samples (timerId, undoToken) |
| **Phase AB** | P23-004, P23-005 | Fix enum/optional violations in scheduling and challenges specs |
| **Phase AC** | P23-008, P23-009 | Fix cheat sheet column count, add log_from_frontend to IPC tables |
| **Phase AD** | P23-010, P23-011 | Remove SnoozeState duplication, standardize metadata format |

---

*Discovery Phase 23 — updated: 2026-04-10*
