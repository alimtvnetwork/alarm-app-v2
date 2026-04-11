# Discovery Phase 26 — Architecture, IPC Registry & Stale Metrics Audit

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Issues Found:** 12 (3 Critical, 6 Medium, 3 Low)

---

## Issues

### P26-001 — `06-tauri-architecture.md` IPC contradicts `07-alarm-groups.md` — group commands ARE defined 🔴 Critical

**File:** `01-fundamentals/06-tauri-architecture-and-framework-comparison.md` lines 92–99 vs `02-features/07-alarm-groups.md` line ~70  
**Problem:** `06-tauri-architecture.md` defines full group CRUD commands (`create_group`, `update_group`, `delete_group`, `list_groups`, `toggle_group`) with correct payloads and returns. But `07-alarm-groups.md` only lists `toggle_group`. An AI reading the feature spec first will think group CRUD IPC is undefined, but the architecture spec has it.  
**Impact:** Contradictory sources — AI may implement group CRUD differently depending on which file it reads first. The feature spec should be the authoritative source for its own IPC commands.  
**Fix:** Copy the group IPC table from `06-tauri-architecture.md` into `07-alarm-groups.md` IPC Commands section.

---

### P26-002 — `06-tauri-architecture.md` uses `import_data` → returns `ImportResult`, but `10-export-import.md` says → returns `ImportPreview` 🔴 Critical

**File:** `06-tauri-architecture.md` line ~117 vs `10-export-import.md` line ~58  
**Problem:** Architecture spec says `import_data` returns `ImportResult`, but feature spec says it returns `ImportPreview`. These are different types with different purposes (preview before applying vs final result).  
**Impact:** AI will implement the wrong return type. The feature spec's two-step flow (preview → confirm) is more complete but the architecture spec contradicts it.  
**Fix:** Align `06-tauri-architecture.md` to match the two-step flow: `import_data` → `ImportPreview`, `confirm_import` → `ImportResult`. Also define `ImportPreview` interface.

---

### P26-003 — `06-tauri-architecture.md` uses `get_next_alarm` but `08-clock-display.md` uses `get_next_alarm_time` 🔴 Critical

**File:** `06-tauri-architecture.md` line ~118 vs `02-features/08-clock-display.md` line ~88  
**Problem:** Different command names for the same functionality. Architecture says `get_next_alarm` returning `NextAlarmInfo | null`. Feature says `get_next_alarm_time` returning `{ NextFireTime: string | null, AlarmLabel: string | null }`.  
**Impact:** AI will use whichever name it encounters first, causing IPC failures.  
**Fix:** Standardize on one name. `get_next_alarm_time` is more descriptive — update `06-tauri-architecture.md`.

---

### P26-004 — `00-overview.md` says "315/315 issues resolved" but actual is 315 resolved, 57 open 🟡 Medium

**File:** `00-overview.md` line ~4  
**Problem:** Status line says "All 315 Spec Quality Issues Resolved" and the module inventory says "315/315 issues resolved". But phases 22-25 added 57 open issues (total 372).  
**Impact:** AI reading the overview will think the spec is clean, missing 57 known issues.  
**Fix:** Update to "372 total, 315 resolved, 57 open" or note that phases 22-25 are pending.

---

### P26-005 — `10-ai-handoff-readiness-report.md` claims 100/100 score with 57 open issues 🟡 Medium

**File:** `10-ai-handoff-readiness-report.md` lines 7, 19, 26–28  
**Problem:** Report claims "All 315 spec quality issues resolved" and "100/100 readiness score" but 57 issues are now open from phases 22-25. The report is stale.  
**Impact:** AI may trust the readiness score and proceed without caution.  
**Fix:** Update score and open issue count, or add a note that phases 22-25 are pending.

---

### P26-006 — `04-platform-constraints.md` Updated date is `2026-04-09` 🟡 Medium

**File:** `01-fundamentals/04-platform-constraints.md` line ~4  
**Problem:** Other fundamentals files show `2026-04-10`, this one is a day behind.  
**Fix:** Update to `2026-04-10`.

---

### P26-007 — `06-tauri-architecture.md` `get_snooze_state` returns `SnoozeState[]` but `04-snooze-system.md` defines no `list` IPC 🟡 Medium

**File:** `06-tauri-architecture.md` line ~108 vs `02-features/04-snooze-system.md`  
**Problem:** Architecture spec lists `get_snooze_state` returning `SnoozeState[]` (all active snoozes) but the feature spec only defines `snooze_alarm` IPC. There's no mention of a read-all snooze state command in the feature spec.  
**Impact:** AI may not implement the read command since the feature spec doesn't mention it.  
**Fix:** Add `get_snooze_state` to `04-snooze-system.md` IPC Commands section.

---

### P26-008 — `06-tauri-architecture.md` lists `cancel_snooze` command not in any feature spec 🟡 Medium

**File:** `06-tauri-architecture.md` line ~107  
**Problem:** `cancel_snooze { AlarmId }` is in the IPC registry but not in `04-snooze-system.md`. The snooze spec describes dismissal as clearing snooze state but doesn't define a dedicated cancel command.  
**Impact:** Orphaned IPC command — AI may implement it without behavioral spec, or skip it and break something.  
**Fix:** Either add `cancel_snooze` to `04-snooze-system.md` with behavior, or remove from architecture spec if dismiss covers it.

---

### P26-009 — `06-tauri-architecture.md` `AlarmStore` uses `reorderAlarms` but no IPC command for reordering 🟡 Medium

**File:** `06-tauri-architecture.md` line ~186  
**Problem:** `AlarmStore` interface lists `reorderAlarms: (alarmIds: string[]) => void` but there is no corresponding IPC command. Alarm list sorting is by time within groups (per `01-alarm-crud.md` line ~210). Reordering would imply custom sort order which no spec defines.  
**Impact:** AI will try to implement reorder persistence without a backend command.  
**Fix:** Either add a `reorder_alarms` IPC command with sort order storage, or remove `reorderAlarms` from the store if sorting is always by time.

---

### P26-010 — `AlarmGroup` in overview uses `GroupId` but data model uses `AlarmGroupId` 🟢 Low

**File:** `00-overview.md` line ~82 vs `01-data-model.md` line ~451  
**Problem:** Overview's Data Model summary uses `GroupId: string (uuid)` for the AlarmGroup PK, but the full data model and SQL schema use `AlarmGroupId TEXT PRIMARY KEY`.  
**Impact:** Minor — overview is a summary, but inconsistency could confuse AI.  
**Fix:** Change overview to `AlarmGroupId`.

---

### P26-011 — `00-overview.md` Data Model omits several Alarm fields 🟢 Low

**File:** `00-overview.md` lines 56–72  
**Problem:** The overview's Alarm summary omits `IsPreviousEnabled`, `IsVibrationEnabled`, `GradualVolumeDurationSec`, `ChallengeType`, `ChallengeDifficulty`, `ChallengeShakeCount`, `ChallengeStepCount`. While summaries can omit, several of these are P0/P1 features.  
**Impact:** Low — AI should read the full data model, not the overview summary.  
**Fix:** No fix needed — overviews are summaries. Optionally add "See full schema in `01-data-model.md`" note.

---

### P26-012 — Cheat sheet footer says `v1.0.0` but header says `v1.1.0` 🟢 Low

**File:** `13-ai-cheat-sheet.md` line ~258 vs line ~1  
**Problem:** Footer: "AI Cheat Sheet — Alarm App v1.0.0". Header: "Version: 1.1.0". Version mismatch.  
**Impact:** Already noted in Phase 22 (P22-016) — reconfirmed. Cosmetic.  
**Fix:** Update footer to `v1.1.0`.

---

## Summary

| Severity | Count |
|----------|:-----:|
| 🔴 Critical | 3 |
| 🟡 Medium | 6 |
| 🟢 Low | 3 |
| **Total** | **12** |

### Key Theme: Architecture ↔ Feature Spec Divergence

Phase 26 reveals a systemic problem: `06-tauri-architecture-and-framework-comparison.md` has its own IPC registry that diverges from individual feature specs. The architecture spec has MORE commands (group CRUD, cancel_snooze, get_snooze_state, reorderAlarms) but feature specs are missing them. Conversely, some feature specs define commands the architecture spec doesn't list.

**Recommendation:** Establish `06-tauri-architecture.md` as the single authoritative IPC registry, and ensure each feature spec's IPC table is a subset that matches exactly.

---

*Discovery Phase 26 — 2026-04-10*
