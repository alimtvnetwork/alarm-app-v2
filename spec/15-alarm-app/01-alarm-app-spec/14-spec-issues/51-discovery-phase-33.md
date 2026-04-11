# Discovery Phase 33 — Undefined Types & IPC Inline Objects Audit

**Version:** 1.0.0  
**Updated:** 2026-04-11  
**Phase:** 8 (Undefined Types & Inline Object Payloads)

---

## Keywords

`challenge`, `ambient`, `sleep`, `bedtime`, `rust`, `struct`, `IPC`, `inline`, `mismatch`

---

## Methodology

Audited all IPC commands for: (1) inline object payloads/returns with no named Rust struct, (2) return type mismatches between IPC registry and feature specs, (3) undefined or ambiguous types referenced in IPC signatures.

---

## Findings

### UT-001 — `get_challenge` payload mismatch between registry and feature spec [CRITICAL]

IPC registry (`06-tauri-architecture.md` line 123) had `{ ChallengeType, Difficulty }` but feature spec (`06-dismissal-challenges.md` line 149) has `{ AlarmId }`. Feature spec is authoritative — the command looks up challenge config from the alarm record, not from arbitrary parameters.

### UT-002 — `get_challenge` return type mismatch [CRITICAL]

IPC registry returned `Challenge` (undefined type). Feature spec returns `AlarmChallenge | null`. Fixed registry to match.

### UT-003 — `submit_challenge_answer` payload mismatch [CRITICAL]

IPC registry had `{ AlarmId, ChallengeId, Answer }` with phantom `ChallengeId` field. Feature spec has `{ AlarmId, Answer }`. No `ChallengeId` concept exists in data model.

### UT-004 — `submit_challenge_answer` return mismatch [CRITICAL]

IPC registry returned `{ IsCorrect: boolean }`. Feature spec returns `{ Correct: boolean, SolveTimeSec: number }`. Missing `SolveTimeSec` would break challenge analytics.

### UT-005 — No `GetChallengePayload` Rust struct [MEDIUM]

Added `Deserialize` struct with `AlarmId` field to `06-dismissal-challenges.md`.

### UT-006 — No `SubmitChallengePayload` Rust struct [MEDIUM]

Added `Deserialize` struct with `AlarmId` + `Answer` fields.

### UT-007 — No `ChallengeResult` Rust struct [MEDIUM]

Added `Serialize` struct with `Correct: bool` + `SolveTimeSec: f64`.

### UT-008 — No `LogSleepQualityPayload` Rust struct [MEDIUM]

Added `Deserialize` struct to `11-sleep-wellness.md`.

### UT-009 — No `PlayAmbientPayload` Rust struct [MEDIUM]

Added `Deserialize` struct with `SoundId` + `DurationMin`.

### UT-010 — No `SetBedtimeReminderPayload` Rust struct [LOW]

Added `Deserialize` struct with `Bedtime` + `ReminderMinBefore`.

### UT-011 — No `BedtimeReminderResponse` Rust struct [LOW]

Added `Serialize` struct returned by `get_bedtime_reminder`.

---

## Summary

| ID | Severity | Description | Status |
|----|----------|-------------|--------|
| UT-001 | 🔴 Critical | `get_challenge` payload mismatch (registry vs feature spec) | ✅ Resolved |
| UT-002 | 🔴 Critical | `get_challenge` return type `Challenge` → `AlarmChallenge \| null` | ✅ Resolved |
| UT-003 | 🔴 Critical | `submit_challenge_answer` phantom `ChallengeId` field | ✅ Resolved |
| UT-004 | 🔴 Critical | `submit_challenge_answer` missing `SolveTimeSec` in return | ✅ Resolved |
| UT-005 | 🟡 Medium | `GetChallengePayload` — no Rust struct | ✅ Resolved |
| UT-006 | 🟡 Medium | `SubmitChallengePayload` — no Rust struct | ✅ Resolved |
| UT-007 | 🟡 Medium | `ChallengeResult` — no Rust struct | ✅ Resolved |
| UT-008 | 🟡 Medium | `LogSleepQualityPayload` — no Rust struct | ✅ Resolved |
| UT-009 | 🟡 Medium | `PlayAmbientPayload` — no Rust struct | ✅ Resolved |
| UT-010 | 🟢 Low | `SetBedtimeReminderPayload` — no Rust struct | ✅ Resolved |
| UT-011 | 🟢 Low | `BedtimeReminderResponse` — no Rust struct | ✅ Resolved |

**New issues this phase:** 11 (4 critical, 5 medium, 2 low) — all resolved immediately.

---

## Design Decisions

### Ambient Sound IDs — String Constants, Not Enum

Ambient sound IDs (`ambient-rain`, `ambient-ocean`, etc.) use kebab-case string constants validated against a hardcoded Rust allowlist, rather than a domain enum. Rationale: they map directly to audio asset filenames and are not referenced in database schemas or cross-file types.

### `ChallengeResult` vs `{ IsCorrect }`

Feature spec's `{ Correct, SolveTimeSec }` is richer than registry's `{ IsCorrect }`. `SolveTimeSec` is essential for analytics logging (`AlarmEvents.ChallengeSolveTimeSec`). Named the Rust struct `ChallengeResult` to avoid confusion with `AlarmChallenge` (config) vs result (outcome).

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Dismissal Challenges | `../02-features/06-dismissal-challenges.md` |
| Sleep & Wellness | `../02-features/11-sleep-wellness.md` |
| IPC Registry | `../01-fundamentals/06-tauri-architecture-and-framework-comparison.md` |
| Previous discovery | `./50-discovery-phase-32.md` |
