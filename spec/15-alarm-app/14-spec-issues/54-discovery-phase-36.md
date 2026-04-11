# Discovery Phase 36 — Final Comprehensive Sweep: IPC Registry Alignment & Stale References

**Version:** 1.0.0  
**Updated:** 2026-04-11  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`discovery`, `phase-36`, `ipc`, `registry`, `alignment`, `stale`, `final-sweep`

---

## Summary

**Total new issues found:** 12  
- **IPC registry inline payloads replaced with named struct references:** 11  
- **Stale metrics in consistency report:** 1  

---

## Issues

### P36-001: Registry `set_custom_sound` inline → `SetCustomSoundPayload` ✅ Resolved
**Severity:** 🟡 Medium  
**Fix:** Updated registry to reference named struct from `05-sound-and-vibration.md`.

### P36-002: Registry `submit_challenge_answer` inline → `SubmitChallengePayload` + `ChallengeResult` ✅ Resolved
**Severity:** 🟡 Medium  
**Fix:** Updated registry payload and return type to named structs from `06-dismissal-challenges.md`.

### P36-003: Registry `log_sleep_quality` inline → `LogSleepQualityPayload` ✅ Resolved
**Severity:** 🟡 Medium  
**Fix:** Updated registry to reference named struct from `11-sleep-wellness.md`.

### P36-004: Registry `play_ambient` inline → `PlayAmbientPayload` ✅ Resolved
**Severity:** 🟡 Medium  
**Fix:** Updated registry to reference named struct from `11-sleep-wellness.md`.

### P36-005: Registry `save_favorite_quote` inline → `SaveFavoriteQuotePayload` ✅ Resolved
**Severity:** 🟢 Low  
**Fix:** Updated registry to reference named struct from `14-personalization.md`.

### P36-006: Registry `add_custom_quote` inline → `AddCustomQuotePayload` ✅ Resolved
**Severity:** 🟢 Low  
**Fix:** Updated registry to reference named struct from `14-personalization.md`.

### P36-007: Registry `set_custom_background` inline → `SetCustomBackgroundPayload` + `CustomBackgroundResponse` ✅ Resolved
**Severity:** 🟡 Medium  
**Fix:** Updated registry payload and return type to named structs from `14-personalization.md`.

### P36-008: Registry `get_streak_calendar` inline → `GetStreakCalendarPayload` ✅ Resolved
**Severity:** 🟢 Low  
**Fix:** Updated registry to reference named struct from `14-personalization.md`.

### P36-009: Registry `validate_custom_sound` inline → `ValidateCustomSoundPayload` + `SoundValidationResult` ✅ Resolved
**Severity:** 🟡 Medium  
**Fix:** Updated registry payload and return type to named structs from `05-sound-and-vibration.md`.

### P36-010: Registry `get_bedtime_reminder` inline return → `BedtimeReminderResponse` ✅ Resolved
**Severity:** 🟡 Medium  
**Fix:** Updated registry return type to named struct from `11-sleep-wellness.md`.

### P36-011: Registry `set_bedtime_reminder` inline → `SetBedtimeReminderPayload` ✅ Resolved
**Severity:** 🟢 Low  
**Fix:** Updated registry to reference named struct from `11-sleep-wellness.md`.

### P36-012: `99-consistency-report.md` stale `14-spec-issues/` version and count ✅ Resolved
**Severity:** 🟡 Medium  
**Fix:** Updated from `v1.39.0` / `458/458` to `v1.40.0` / `472/472`.

---

## Fix Summary

| Fix | Issues | File(s) | Description |
|-----|--------|---------|-------------|
| **Fix 36** | P36-001–012 | `06-tauri-architecture...md`, `99-consistency-report.md` | Registry alignment to named structs + stale metric fix |

---

*Discovery Phase 36 — updated: 2026-04-11*
