# Discovery Phase 28 — Post-Fix-Phase-U Regression Scan

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Scope:** Fresh regression scan after Fix Phase U (396/396 resolution). Verify all fixes applied, no new issues introduced.

---

## Scan Results

| # | ID | Location | Description | Severity | Status |
|---|-----|----------|-------------|----------|--------|
| 1 | P28-001 | `99-consistency-report.md` line 15 | Stale version: references `00-overview.md` as v2.5.0 — actual is v2.7.0 | 🟡 Medium | ⬜ Open |
| 2 | P28-002 | `99-consistency-report.md` line 21 | Stale version: references `98-changelog.md` as v2.5.0 — actual is v2.7.0 | 🟡 Medium | ⬜ Open |
| 3 | P28-003 | 27 feature + fundamental files | Double `---` separators (two consecutive `---` lines) in all 16 feature specs + 11 fundamental specs | 🟢 Low | ⬜ Open |
| 4 | P28-004 | `.lovable/memory/feature/alarm-app-spec` | Memory file says "256/256 issues resolved" — should be 396/396 | 🟡 Medium | ⬜ Open |
| 5 | P28-005 | `.lovable/memory/feature/alarm-app-spec` | Memory says "v2.3.0" — actual spec version is v2.7.0 | 🟡 Medium | ⬜ Open |
| 6 | P28-006 | `.lovable/memory/feature/alarm-app-spec` | Memory says "18 discovery phases, 30 fix phases" — actual is 27 discovery + 41 fix phases | 🟡 Medium | ⬜ Open |
| 7 | P28-007 | `.lovable/memory/index.md` | Index says "256/256 issues resolved" for alarm-app-spec-issues — should be 396/396 | 🟡 Medium | ⬜ Open |
| 8 | P28-008 | `.lovable/memory/index.md` | Index says "14 feature specs" for alarm-app-spec — should be 17 | 🟡 Medium | ⬜ Open |
| 9 | P28-009 | `spec/15-alarm-app/99-consistency-report.md` | Parent consistency report says "256/256 resolved" — should be 396/396 | 🟡 Medium | ⬜ Open |
| 10 | P28-010 | `01-fundamentals/01-data-model.md` | `isDisabled()` semantic inverse methods are intentional design (derived from `IsEnabled`) — **NOT an issue** (positive field + convenience inverse is valid pattern) | ℹ️ Info | N/A |

---

## Verified Clean (No Issues Found)

| Check | Result |
|-------|--------|
| `is_day_excluded` in feature specs | ✅ Clean — removed by Fix Phase U |
| `get_next_alarm` (without `_time`) in architecture | ✅ Clean — renamed to `get_next_alarm_time` |
| Magic strings in acceptance criteria | ✅ Clean — all use enum references |
| Root `00-overview.md` issue counts | ✅ Correct — 396/396 |
| `10-ai-handoff-readiness-report.md` counts | ✅ Correct — 396/396 |
| `13-ai-cheat-sheet.md` counts | ✅ Correct — 396/396 |
| `cancel_snooze` defined in both architecture + feature | ✅ Present in both |
| TypeScript `?` optional syntax in data model | ✅ Clean — uses `| null` |
| `14-spec-issues/00-overview.md` grand total | ✅ Correct — 396/396 |

---

## Summary

| Metric | Count |
|--------|-------|
| Issues found | 9 |
| Critical | 0 |
| Medium | 7 |
| Low | 1 |
| Info (not issues) | 1 |
| **New grand total** | **405** (396 + 9) |

---

## Analysis

All **substantive spec issues are clean** — Fix Phase U successfully resolved IPC alignment, negative booleans, magic strings, and orphaned commands. The 9 remaining issues are **stale metadata** (version numbers in consistency reports + memory files) and **cosmetic** (double `---` separators). No architectural or content issues remain.

---

*Discovery Phase 28 — updated: 2026-04-10*
