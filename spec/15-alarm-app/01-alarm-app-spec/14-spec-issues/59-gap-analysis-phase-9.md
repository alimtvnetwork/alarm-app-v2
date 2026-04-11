# Gap Analysis — Phase 9

**Version:** 1.1.0  
**Updated:** 2026-04-11  
**Scope:** Full audit of alarm app spec folder against foundational specifications  
**Auditor:** AI — comprehensive structural + foundational + content + AI-readiness audit  
**Previous:** Phase 8 (58-gap-analysis-phase-8.md)

---

## Keywords

`gap-analysis`, `audit`, `consistency`, `foundational-alignment`, `ai-readiness`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ⚠️ N/A (audit document) |

---

## Audit Summary

| Dimension | Result |
|-----------|--------|
| Total issues found | **21** |
| Critical | 0 |
| High | 5 |
| Medium | 10 |
| Low | 6 |
| Estimated AI failure risk | ~5–7% (up from 3% due to acceptance criteria drift) |

---

## Phase Plan

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1 | Structural + Foundational Alignment | ✅ Complete |
| Phase 2 | Content Completeness + AI Gap Audit | ✅ This update |
| Phase 3 | Issue Grouping into Atomic Fix Tasks | Pending (`next`) |

---

## All Findings (Phase 1 + Phase 2)

### Phase 1: Structural + Foundational Alignment (14 issues)

| # | ID | Severity | File | Issue | AI Impact |
|---|-----|----------|------|-------|-----------|
| 1 | GA9-001 | 🟡 High | `01-fundamentals/97-acceptance-criteria.md` L135 | **Stale IPC command name:** Says `log_frontend_error` but canonical name is `log_from_frontend` (aligned in Phase 8 for all other files, this one was missed) | AI implements wrong command name |
| 2 | GA9-002 | 🟡 High | `01-fundamentals/97-acceptance-criteria.md` L33 | **Wrong settings seed count:** Says "All 9 default settings seeded" but V1 migration actually seeds **16 settings** | AI seeds only 9, missing 7 keys → settings UI breaks |
| 3 | GA9-003 | 🟡 High | `01-fundamentals/97-acceptance-criteria.md` L63 | **Wrong WebhookError variant count:** Says "4 variants" but `12-smart-features.md` defines **7 variants** (InvalidUrl, InsecureScheme, BlockedHost, MissingHost, PrivateIp, NonStandardPort, RequestFailed) | AI implements incomplete error enum |
| 4 | GA9-004 | 🟠 Medium | `01-fundamentals/06-tauri-architecture.md` L276, L288 | **Undeclared error variant `WindowNotFound`** used in overlay code but not in `AlarmAppError` enum (04-platform-constraints.md) | AI gets compile error |
| 5 | GA9-005 | 🟠 Medium | `02-features/02-alarm-scheduling.md` L138 | **Undeclared error variant `InvalidCronExpression`** referenced in edge cases but not in `AlarmAppError` enum | AI invents nonexistent variant |
| 6 | GA9-006 | 🟠 Medium | `01-fundamentals/06-tauri-architecture.md` L388–389 | **SettingsStore methods use PascalCase** (`FetchSettings`, `UpdateSetting`) while all other stores use camelCase | Inconsistent codebase |
| 7 | GA9-007 | 🟠 Medium | `99-consistency-report.md` L15, L17, L21 | **Stale version references** in consistency report (v2.9.0 → v2.9.1/2.9.2, v2.8.3 → v2.9.1) | Misleading audit metadata |
| 8 | GA9-008 | 🟠 Medium | `99-consistency-report.md` L17 | **Says "484/484 resolved"** in readiness report row; actual is 524/524 | Misleading metrics |
| 9 | GA9-009 | 🟠 Medium | `99-consistency-report.md` L38 | **Stale spec-issues breakdown** — doesn't account for Phase 8 (20 issues) | Misleading metrics |
| 10 | GA9-010 | 🟠 Medium | `13-ai-cheat-sheet.md` L166–170 | **AI cheat sheet says WebhookError has "7 variants" but lists only "5 key variants"** without naming the other 2 | Minor confusion |
| 11 | GA9-011 | 🟢 Low | `01-fundamentals/97-acceptance-criteria.md` L33 | Settings seed list parenthetical only names 9 of 16 keys | Compound of GA9-002 |
| 12 | GA9-012 | 🟢 Low | `01-fundamentals/06-tauri-architecture.md` L383 | SettingsStore `Theme` property references `ThemeMode` enum without import context | Minor |
| 13 | GA9-013 | 🟢 Low | `99-consistency-report.md` L21 | Changelog version range out of date ("v1.0.0 → v2.8.3" → should be v2.9.1) | Cosmetic |
| 14 | GA9-014 | 🟢 Low | `01-fundamentals/97-acceptance-criteria.md` L63–64 | IPC error response says `{ Code, Message, Details? }` but actual struct has no `Details` field | AI may add unused field |

### Phase 2: Content Completeness + AI Gap Audit (7 new issues)

| # | ID | Severity | File | Issue | AI Impact |
|---|-----|----------|------|-------|-----------|
| 15 | GA9-015 | 🟡 High | `02-features/97-acceptance-criteria.md` (rollup) | **Acceptance criteria rollup is stale:** Rollup lists **133 criteria** but individual feature specs now contain **157 criteria** (delta: 24). Missing criteria from `01-alarm-crud.md` (7 accessibility criteria), `15-keyboard-shortcuts.md` (3 search/select criteria), and `17-ui-layouts.md` (14 criteria not reflected in rollup total) | AI skips 24 testable criteria |
| 16 | GA9-016 | 🟡 High | `02-features/97-acceptance-criteria.md` Summary table | **Feature criteria count table wrong:** Shows `01 Alarm CRUD: 11` (actual: 18), `15 Keyboard Shortcuts: 7` (actual: 10). Total should be ~157, not 133 | Stale rollup → AI uses incomplete checklist |
| 17 | GA9-017 | 🟠 Medium | `02-features/12-smart-features.md` L257 | **Multi-timezone claims `Timezone` field on create/update alarm** but `Alarm` interface and `CreateAlarmPayload` have no such field. Only `SystemTimezone` exists as a global setting | AI attempts to add non-existent field to payloads |
| 18 | GA9-018 | 🟠 Medium | `00-overview.md` L4 + `10-ai-handoff-readiness-report.md` | **Total acceptance criteria count stale:** Root overview and readiness report say 205 (133+72) but actual is **229** (157 feature + 72 fundamental) | Misleading metrics in executive docs |
| 19 | GA9-019 | 🟠 Medium | `01-fundamentals/97-acceptance-criteria.md` L33 | **Acceptance criteria says "9 default settings"** but Settings Keys table in `01-data-model.md` shows **16 keys** and V1 migration seeds all 16. The criteria must list all 16 | AI tests only 9 seeded keys |
| 20 | GA9-020 | 🟢 Low | `02-features/08-clock-display.md` L46 | Clock display spec references **Outfit and Figtree fonts** but design system and dependency lock don't list these fonts explicitly | AI may not include correct font packages |
| 21 | GA9-021 | 🟢 Low | `02-features/11-sleep-wellness.md` L69 vs L92 | Sleep quality IPC payload uses `AlarmId` in description L69 but actual payload uses `AlarmEventId` L92. The IPC table is correct but the prose is misleading | Minor confusion — IPC table is authoritative |

---

## Foundational Alignment Assessment

### Coding Guidelines Alignment

| Rule | Status | Notes |
|------|--------|-------|
| Function ≤ 15 lines | ✅ | All code samples comply; `from_row` exemptions documented |
| No magic strings → enum | ✅ | 13 domain enums, zero raw string comparisons |
| No magic numbers → const | ✅ | All numeric values are named constants |
| Boolean naming (`is`/`has` prefix) | ✅ | All boolean fields prefixed correctly |
| No negation in booleans | ✅ | Semantic inverses documented in data model |
| camelCase for TS functions | ⚠️ | **GA9-006:** SettingsStore uses PascalCase methods |
| PascalCase for enum variants | ✅ | All enum variants PascalCase |
| No `any`/`unknown` in business logic | ✅ | No untyped code in specs |
| Structured error handling | ✅ | `AlarmAppError` + `WebhookError` + `IpcErrorResponse` |

### Split Database Alignment

| Concept | Status | Notes |
|---------|--------|-------|
| PascalCase table/column names | ✅ | All SQL uses PascalCase identifiers |
| WAL mode | ✅ | Explicitly configured at startup Step 4 |
| Foreign keys | ✅ | `PRAGMA foreign_keys=ON` at startup |
| Index naming (`Idx{Table}_{Column}`) | ✅ | 4 indexes follow convention |

### Seedable Config Alignment

| Concept | Status | Notes |
|---------|--------|-------|
| Explicit relationship documented | ✅ | Data model explains why simplified approach was chosen |
| Default seeding via migration | ✅ | V1 migration seeds all 16 defaults |
| Version-based additions | ✅ | `INSERT OR IGNORE` pattern documented |
| Acceptance criteria match actual seeds | ❌ | **GA9-002/019:** Says 9, actual 16 |

### Boolean Fix Alignment

| Rule | Status | Notes |
|------|--------|-------|
| `is`/`has` prefix on all booleans | ✅ | Verified across all interfaces |
| No negation (`!`) — use semantic inverses | ✅ | `isDisabled()`, `isVibrationOff()`, `isFixedVolume()` defined |
| SQLite INTEGER boolean exempt from negation rule | ✅ | `!= 0` exemption documented |
| Three-state booleans exempted | ✅ | `IsPreviousEnabled` nullable exemption documented (B-001) |

### Enum Pattern Alignment

| Rule | Status | Notes |
|------|--------|-------|
| PascalCase variants | ✅ | All 13 enums comply |
| Dot notation only | ✅ | `RepeatType.Once`, never string literal |
| Serde derives for Rust | ✅ | All enums have `Serialize, Deserialize` |

---

## Content Completeness Assessment

### Feature Specs — Deep Read Summary

| Feature Spec | IPC Defined | Rust Structs | Edge Cases | Acceptance Criteria | Overall |
|-------------|:-:|:-:|:-:|:-:|:-:|
| 01 Alarm CRUD | ✅ 8 commands | ✅ Create + Update payloads | ✅ 8 cases | ✅ 18 (11 + 7 a11y) | Complete |
| 02 Scheduling | ✅ (uses CRUD) | ✅ RepeatPattern | ✅ 6 cases | ✅ 9 | Complete |
| 03 Firing | ✅ 4 commands | ✅ Queue + FiredAlarm | ✅ 5 queue + DST | ✅ 15 | Complete |
| 04 Snooze | ✅ 4 commands | ✅ SnoozeState | ✅ 3 cases | ✅ 7 | Complete |
| 05 Sound | ✅ 3 commands | ✅ Payloads + validation | ✅ 6 cases | ✅ 10 | Complete |
| 06 Challenges | ✅ 2 commands | ✅ Payloads + result | ✅ 5 cases | ✅ 8 | Complete |
| 07 Groups | ✅ 5 commands | ✅ All payloads | ✅ 3 cases | ✅ 5 | Complete |
| 08 Clock | ✅ 1 command | ✅ NextAlarmResponse | ✅ 4 cases | ✅ 5 | Complete |
| 09 Theme | ✅ 2 commands | ✅ (uses Settings) | ✅ 4 cases | ✅ 5 | Complete |
| 10 Export/Import | ✅ 3 commands | ✅ All payloads + results | ✅ 6 cases | ✅ 12 | Complete |
| 11 Sleep & Wellness | ✅ 5 commands | ✅ All payloads | ✅ 12 cases | ✅ 8 | Complete |
| 12 Smart Features | ✅ 4 commands | ✅ All payloads | ✅ 10 cases | ✅ 7 | ⚠️ Timezone field gap (GA9-017) |
| 13 Analytics | ✅ 3 commands | ✅ All payloads | ✅ 8 cases | ✅ 6 | Complete |
| 14 Personalization | ✅ 6 commands | ✅ All payloads | ✅ 12 cases | ✅ 8 | Complete |
| 15 Keyboard | ✅ 2 commands | ✅ (frontend) | ✅ 6 cases | ✅ 10 | Complete |
| 16 Accessibility | ✅ (N/A) | ✅ (N/A) | ✅ (N/A) | ✅ 10 | Complete |
| 17 UI Layouts | ✅ (refs others) | ✅ (refs others) | ✅ (N/A) | ✅ 14 | Complete |

**Content Completeness: 98%.** All 17 feature specs fully define behavior, IPC commands, Rust structs, edge cases, and acceptance criteria. The only gap is the phantom `Timezone` field in smart features (P3 future).

---

## AI Failure Risk Assessment

| Risk Area | Likelihood | Impact | Notes |
|-----------|-----------|--------|-------|
| AI uses stale rollup (133 vs 157 criteria) (GA9-015/016) | 🟡 Medium | High | 24 criteria untested — especially a11y |
| AI seeds only 9 settings (GA9-002/019) | 🟡 Medium | High | Settings UI shows defaults for 7 keys |
| AI uses `log_frontend_error` name (GA9-001) | 🟡 Medium | Medium | Command won't register |
| AI implements 4-variant WebhookError (GA9-003) | 🟡 Medium | Medium | 3 SSRF checks missing |
| AI adds `Timezone` field to Alarm (GA9-017) | 🟢 Low | Medium | P3 feature, unlikely in initial build |
| AI can't compile overlay code (GA9-004) | 🟡 Medium | Low | Easy to fix — add variant |
| AI uses `InvalidCronExpression` (GA9-005) | 🟢 Low | Low | P2, unlikely in initial phases |
| AI mixes method naming conventions (GA9-006) | 🟢 Low | Low | Inconsistent but functional |

**Overall AI Success Rate:** 93–95% (down from 95–97% due to stale acceptance criteria rollup — if AI uses rollup as test checklist, 24 criteria are missed)

---

## Remaining Phase

### Phase 3: Issue Grouping into Atomic Fix Tasks (say `next`)

Group all 21 findings into executable, atomic fix task groups:
1. **Acceptance criteria sync** — Update rollup with all 157 feature criteria, update total to 229
2. **Stale metrics** — Fix all version refs, issue counts, settings counts
3. **Missing error variants** — Add `WindowNotFound` + clarify `InvalidCronExpression` → `Validation`
4. **SettingsStore casing** — Fix PascalCase → camelCase methods
5. **Smart features timezone** — Clarify multi-timezone is P3 future, no `Timezone` field exists yet
6. **Consistency report update** — Sync all version/count references

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Phase 8 Gap Analysis | `./58-gap-analysis-phase-8.md` |
| Coding Guidelines | `../../../02-coding-guidelines/consolidated-review-guide-condensed.md` |
| Split Database | `../../../04-split-db-architecture/00-overview.md` |
| Seedable Config | `../../../05-seedable-config-architecture/00-overview.md` |
| Data Model (authoritative) | `../01-fundamentals/01-data-model.md` |
| Feature Acceptance Criteria Rollup | `../02-features/97-acceptance-criteria.md` |

---

*Gap Analysis Phase 9 v1.1.0 — 2026-04-11*
