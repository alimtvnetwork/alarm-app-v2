# Discovery Phase 34 — IPC Inline Objects & Remaining Rust Structs Audit

**Version:** 1.0.0  
**Updated:** 2026-04-11  
**Phase:** 9 (Remaining IPC Inline Objects)

---

## Keywords

`groups`, `personalization`, `sound`, `rust`, `struct`, `IPC`, `inline`, `payload`, `response`

---

## Methodology

Audited all remaining IPC commands with inline object payloads or returns that lack named Rust structs. Cross-checked IPC registry against feature specs for payload/return consistency.

---

## Findings

### IO-001 — `CreateGroupPayload` has no Rust struct definition [MEDIUM]

TS interface exists in `07-alarm-groups.md` line 84, referenced in command handler, but no `#[derive(Deserialize)]` block.

### IO-002 — `UpdateGroupPayload` has no Rust struct definition [MEDIUM]

TS interface exists in `07-alarm-groups.md` line 90, but no Rust struct.

### IO-003 — `DeleteGroupPayload` — inline `{ AlarmGroupId }` with no named type [LOW]

### IO-004 — `ToggleGroupPayload` — inline `{ AlarmGroupId, IsEnabled }` with no named type [LOW]

### IO-005 — `SaveFavoriteQuotePayload` — inline `{ QuoteId }` with no Rust struct [LOW]

### IO-006 — `AddCustomQuotePayload` — inline `{ Text, Author }` with no Rust struct [MEDIUM]

### IO-007 — `UpdateSettingPayload` — inline `{ Key, Value }` with no Rust struct [MEDIUM]

Generic settings command used by theme, accent color, and other setting keys.

### IO-008 — `SetCustomBackgroundPayload` — inline `{ FilePath }` with no Rust struct [LOW]

### IO-009 — `CustomBackgroundResponse` — inline `{ SavedPath }` with no Rust struct [LOW]

### IO-010 — `GetStreakCalendarPayload` — inline `{ Month, Year }` with no Rust struct [LOW]

### IO-011 — `SetCustomSoundPayload` — inline `{ FilePath }` with no Rust struct [MEDIUM]

### IO-012 — `ValidateCustomSoundPayload` — inline `{ FilePath }` with no Rust struct [LOW]

### IO-013 — `SoundValidationResult` — inline `{ IsValid, Error }` with no Rust struct [LOW]

### IO-014 — `set_custom_sound` prose references phantom `AlarmId` field [MEDIUM]

`05-sound-and-vibration.md` line 55 had `invoke("set_custom_sound", { AlarmId, FilePath })` but IPC table specifies `{ FilePath }` only. `AlarmId` does not exist in the payload — the command adds a sound to the library, not to a specific alarm.

### IO-015 — `set_custom_background` return type mismatch [MEDIUM]

IPC registry returned `string (stored path)` but feature spec returns `{ SavedPath: string }`. Structured response is more consistent with other commands.

---

## Summary

| ID | Severity | Description | Status |
|----|----------|-------------|--------|
| IO-001 | 🟡 Medium | `CreateGroupPayload` — no Rust struct | ✅ Resolved |
| IO-002 | 🟡 Medium | `UpdateGroupPayload` — no Rust struct | ✅ Resolved |
| IO-003 | 🟢 Low | `DeleteGroupPayload` — no named type | ✅ Resolved |
| IO-004 | 🟢 Low | `ToggleGroupPayload` — no named type | ✅ Resolved |
| IO-005 | 🟢 Low | `SaveFavoriteQuotePayload` — no Rust struct | ✅ Resolved |
| IO-006 | 🟡 Medium | `AddCustomQuotePayload` — no Rust struct | ✅ Resolved |
| IO-007 | 🟡 Medium | `UpdateSettingPayload` — no Rust struct | ✅ Resolved |
| IO-008 | 🟢 Low | `SetCustomBackgroundPayload` — no Rust struct | ✅ Resolved |
| IO-009 | 🟢 Low | `CustomBackgroundResponse` — no Rust struct | ✅ Resolved |
| IO-010 | 🟢 Low | `GetStreakCalendarPayload` — no Rust struct | ✅ Resolved |
| IO-011 | 🟡 Medium | `SetCustomSoundPayload` — no Rust struct | ✅ Resolved |
| IO-012 | 🟢 Low | `ValidateCustomSoundPayload` — no Rust struct | ✅ Resolved |
| IO-013 | 🟢 Low | `SoundValidationResult` — no Rust struct | ✅ Resolved |
| IO-014 | 🟡 Medium | `set_custom_sound` prose phantom `AlarmId` | ✅ Resolved |
| IO-015 | 🟡 Medium | `set_custom_background` return type mismatch | ✅ Resolved |

**New issues this phase:** 15 (0 critical, 7 medium, 8 low) — all resolved immediately.

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Alarm Groups | `../02-features/07-alarm-groups.md` |
| Personalization | `../02-features/14-personalization.md` |
| Sound & Vibration | `../02-features/05-sound-and-vibration.md` |
| IPC Registry | `../01-fundamentals/06-tauri-architecture-and-framework-comparison.md` |
| Previous discovery | `./51-discovery-phase-33.md` |
