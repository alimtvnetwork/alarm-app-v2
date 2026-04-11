# Gap Analysis — Phase 9

**Version:** 1.0.0  
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
| Total issues found | **14** |
| Critical | 0 |
| High | 3 |
| Medium | 7 |
| Low | 4 |
| Estimated AI failure risk | ~3–5% (up from 3% due to new findings) |

---

## Phase Plan

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1 | Structural + Foundational Alignment | ✅ This document |
| Phase 2 | Content Completeness + AI Gap Audit | Pending (`next`) |
| Phase 3 | Issue Grouping into Atomic Fix Tasks | Pending (`next`) |

---

## Phase 1 Findings

### Issue List

| # | ID | Severity | File | Issue | AI Impact |
|---|-----|----------|------|-------|-----------|
| 1 | GA9-001 | 🟡 High | `01-fundamentals/97-acceptance-criteria.md` L135 | **Stale IPC command name:** Says `log_frontend_error` but canonical name is `log_from_frontend` (aligned in Phase 8 for all other files, this one was missed) | AI implements wrong command name |
| 2 | GA9-002 | 🟡 High | `01-fundamentals/97-acceptance-criteria.md` L33 | **Wrong settings seed count:** Says "All 9 default settings seeded" but V1 migration actually seeds **16 settings** (Theme, ThemeSkin, AccentColor, TimeFormat, DefaultSnoozeDuration, DefaultMaxSnoozeCount, DefaultSound, AutoDismissMin, AutoLaunch, MinimizeToTray, Language, EventRetentionDays, IsGradualVolumeEnabled, GradualVolumeDurationSec, SystemTimezone, ExportWarningDismissed) | AI seeds only 9, missing 7 keys → settings UI breaks |
| 3 | GA9-003 | 🟡 High | `01-fundamentals/97-acceptance-criteria.md` L63 | **Wrong WebhookError variant count:** Says "4 variants" but `12-smart-features.md` defines **7 variants** (InvalidUrl, InsecureScheme, BlockedHost, NoHost, PrivateIp, NonStandardPort, RequestFailed) | AI implements incomplete error enum |
| 4 | GA9-004 | 🟠 Medium | `01-fundamentals/06-tauri-architecture-and-framework-comparison.md` L276, L288 | **Undeclared error variant `WindowNotFound`** used in overlay show/hide code but not listed in `AlarmAppError` enum (04-platform-constraints.md). AI will get a compile error | AI gets compile error; must guess how to add variant |
| 5 | GA9-005 | 🟠 Medium | `02-features/02-alarm-scheduling.md` L138 | **Undeclared error variant `InvalidCronExpression`** referenced in edge cases table but not in `AlarmAppError` enum. Should map to `Validation("Invalid cron expression: ...")` | AI invents nonexistent variant or ignores cron validation |
| 6 | GA9-006 | 🟠 Medium | `01-fundamentals/06-tauri-architecture-and-framework-comparison.md` L388–389 | **SettingsStore methods use PascalCase** (`FetchSettings`, `UpdateSetting`) while `AlarmStore` uses camelCase (`fetchAlarms`, `createAlarm`). Coding guidelines mandate camelCase for TS functions/methods | AI follows inconsistent pattern; half the codebase PascalCase methods, half camelCase |
| 7 | GA9-007 | 🟠 Medium | `99-consistency-report.md` L15, L17, L21 | **Stale version references:** Root consistency report says `00-overview.md` is v2.9.0 (actual: v2.9.1), `10-ai-handoff-readiness-report.md` is v2.9.0 (actual: v2.9.2), `98-changelog.md` is v2.8.3 (actual: v2.9.1) | No functional impact but signals outdated audit |
| 8 | GA9-008 | 🟠 Medium | `99-consistency-report.md` L17 | **Stale issue count in consistency report:** Says "484/484 resolved" in readiness report row; actual is 524/524 | Misleading metrics |
| 9 | GA9-009 | 🟠 Medium | `99-consistency-report.md` L38 | **Stale spec-issues metrics:** Says "484 original + 22 Phase 6 + 18 Phase 7" but the actual breakdown should reference 524 total across all phases including Phase 8 (20 issues) | Misleading metrics |
| 10 | GA9-010 | 🟠 Medium | `13-ai-cheat-sheet.md` L166–170 | **AI cheat sheet says WebhookError has 7 variants but lists only 5 key ones.** Cross-ref to `12-smart-features.md` is correct, but the quick summary is misleading | Minor — AI reads full spec |
| 11 | GA9-011 | 🟢 Low | `01-fundamentals/97-acceptance-criteria.md` L33 | **Settings seed list incomplete:** Only lists 9 of 16 settings in parenthetical (missing ThemeSkin, AccentColor, DefaultMaxSnoozeCount, AutoDismissMin, IsGradualVolumeEnabled, GradualVolumeDurationSec, ExportWarningDismissed) | Compound of GA9-002 |
| 12 | GA9-012 | 🟢 Low | `01-fundamentals/06-tauri-architecture-and-framework-comparison.md` L383 | **SettingsStore `Theme` property is `ThemeMode` type** but the store interface doesn't import/reference the enum. Other stores don't have this issue since they use primitives | Minor — AI can infer |
| 13 | GA9-013 | 🟢 Low | `99-consistency-report.md` L21 | **Changelog version out of date in consistency report:** Says "v1.0.0 → v2.8.3" but changelog now covers v1.0.0 → v2.9.1 | Cosmetic |
| 14 | GA9-014 | 🟢 Low | `01-fundamentals/04-platform-constraints.md` | **IPC error response spec says `{ Code, Message, Details? }` in acceptance criteria L63–64 but actual struct in same file (L266–271) only has `{ Message, Code }` — no `Details` field** | AI may add unused `Details` field |

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
| Acceptance criteria match actual seeds | ❌ | **GA9-002:** Says 9, actual 16 |

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
| `Type` suffix for categories | ⚠️ | Mixed — `RepeatType` ✅, `ThemeMode` ✅, but `SortField` and `SortOrder` have no suffix. Minor — these are data-model types, not category enums |
| Serde derives for Rust | ✅ | All enums have `Serialize, Deserialize` |

---

## AI Failure Risk Assessment

| Risk Area | Likelihood | Impact | Notes |
|-----------|-----------|--------|-------|
| AI seeds only 9 settings (GA9-002) | 🟡 Medium | High | Settings UI will show defaults/empty for 7 keys |
| AI uses `log_frontend_error` name (GA9-001) | 🟡 Medium | Medium | Command won't register; frontend logging silently fails |
| AI implements 4-variant WebhookError (GA9-003) | 🟡 Medium | Medium | 3 SSRF checks missing → security gap |
| AI can't compile overlay code (GA9-004) | 🟡 Medium | Low | Easy to fix — add variant to enum |
| AI uses `InvalidCronExpression` (GA9-005) | 🟢 Low | Low | Cron is P2; AI likely won't hit this in initial phases |
| AI mixes method naming conventions (GA9-006) | 🟢 Low | Low | Inconsistent but functional |

**Overall AI Success Rate:** 95–97% (unchanged from Phase 8 — the high-severity issues are in metadata/acceptance criteria, not in core behavioral specs)

---

## Remaining Phases

### Phase 2: Content Completeness + AI Gap Audit (say `next`)

- Deep-read all 17 feature specs for missing behaviors
- Check all IPC payload types are fully defined
- Verify cross-references between features
- Check for missing UI state descriptions

### Phase 3: Issue Grouping into Atomic Fix Tasks (say `next`)

- Group all findings into executable fix tasks
- Prioritize by AI failure impact
- Estimate effort per task group

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Phase 8 Gap Analysis | `./58-gap-analysis-phase-8.md` |
| Coding Guidelines | `../../../02-coding-guidelines/consolidated-review-guide-condensed.md` |
| Split Database | `../../../04-split-db-architecture/00-overview.md` |
| Seedable Config | `../../../05-seedable-config-architecture/00-overview.md` |
| Data Model (authoritative) | `../01-fundamentals/01-data-model.md` |

---

*Gap Analysis Phase 9 v1.0.0 — 2026-04-11*
