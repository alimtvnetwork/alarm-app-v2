# Fix Phase C — Acceptance Criteria & IPC Key Fixes

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Scope:** Add acceptance criteria to 4 feature files, fix camelCase IPC keys, fix magic string enums in challenge config

---

## Issues Resolved

| Issue | Description | File Changed |
|-------|-------------|-------------|
| P14-020 | `06-dismissal-challenges.md` missing acceptance criteria | `06-dismissal-challenges.md` |
| P14-021 | `11-sleep-wellness.md` missing acceptance criteria | `11-sleep-wellness.md` |
| P14-022 | `12-smart-features.md` missing acceptance criteria | `12-smart-features.md` |
| P14-023 | `14-personalization.md` missing acceptance criteria | `14-personalization.md` |
| P15-014 | `log_sleep_quality` IPC uses camelCase keys | `11-sleep-wellness.md` |
| P15-015 | `play_ambient` IPC uses camelCase keys | `11-sleep-wellness.md` |

---

## Additional Fixes (Bonus)

- `06-dismissal-challenges.md`: `AlarmChallenge.Type` changed from magic string union to `ChallengeType` enum; `Difficulty` changed to `ChallengeDifficulty` enum
- All 4 files: added cross-reference to Domain Enums section in data model

---

## Issues Resolved: 6
## Running Total: 256 total, 205 resolved, 51 open

---

*Fix Phase C — updated: 2026-04-10*
