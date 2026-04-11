# Discovery Phase 35 — Export/Import, Webhook, Analytics & System IPC Struct Audit

**Version:** 1.0.0  
**Updated:** 2026-04-11  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`discovery`, `phase-35`, `ipc`, `rust-structs`, `export`, `import`, `webhook`, `analytics`, `system`

---

## Summary

**Total new issues found:** 14  
- **Missing Rust structs (request payloads):** 6  
- **Missing Rust structs (response types):** 4  
- **IPC registry inconsistencies:** 2  
- **Missing outgoing struct definition:** 1  
- **Missing TypeScript interface:** 1  

---

## Issues

### P35-001: `10-export-import.md` — `ExportDataPayload` missing Rust struct ✅ Resolved (Fix 35)
**Severity:** 🟡 Medium  
**Problem:** IPC command `export_data` accepts `{ Format: ExportFormat, Scope: ExportScope, AlarmIds?: string[] }` but no Rust struct defined.  
**Fix:** Added `ExportDataPayload` Rust struct with `#[serde(rename_all = "PascalCase")]`.

### P35-002: `10-export-import.md` — `ConfirmImportPayload` missing Rust struct ✅ Resolved (Fix 35)
**Severity:** 🟡 Medium  
**Problem:** IPC command `confirm_import` accepts `{ PreviewId: string, Mode: ImportMode, DuplicateAction: DuplicateAction }` but no Rust struct defined.  
**Fix:** Added `ConfirmImportPayload` Rust struct.

### P35-003: `12-smart-features.md` — `CreateWebhookPayload` missing Rust struct ✅ Resolved (Fix 35)
**Severity:** 🟡 Medium  
**Problem:** IPC command `create_webhook` accepts inline object but no named Rust struct.  
**Fix:** Added `CreateWebhookPayload` Rust struct.

### P35-004: `12-smart-features.md` — `GetWeatherPayload` missing Rust struct ✅ Resolved (Fix 35)
**Severity:** 🟢 Low  
**Problem:** IPC command `get_weather_briefing` accepts `{ Latitude: number, Longitude: number }` but no Rust struct.  
**Fix:** Added `GetWeatherPayload` Rust struct.

### P35-005: `13-analytics.md` — `ClearHistoryPayload` missing Rust struct ✅ Resolved (Fix 35)
**Severity:** 🟢 Low  
**Problem:** IPC command `clear_history` accepts `{ Before?: string }` but no Rust struct.  
**Fix:** Added `ClearHistoryPayload` Rust struct.

### P35-006: System — `LogFromFrontendPayload` missing Rust struct ✅ Resolved (Fix 35)
**Severity:** 🟡 Medium  
**Problem:** IPC command `log_from_frontend` accepts `{ Level: string, Message: string, Context: Record<string, unknown> }` but no Rust struct defined anywhere.  
**Fix:** Added `LogFromFrontendPayload` Rust struct to `06-tauri-architecture...md`.

### P35-007: `12-smart-features.md` — `TestWebhookResult` missing Rust struct ✅ Resolved (Fix 35)
**Severity:** 🟡 Medium  
**Problem:** IPC command `test_webhook` returns `{ Success: boolean, StatusCode: number | null, Error: string | null }` but no Rust response struct.  
**Fix:** Added `TestWebhookResult` Rust struct.

### P35-008: `13-analytics.md` — `ClearHistoryResult` missing Rust struct ✅ Resolved (Fix 35)
**Severity:** 🟢 Low  
**Problem:** IPC command `clear_history` returns `{ Deleted: number }` but no Rust response struct.  
**Fix:** Added `ClearHistoryResult` Rust struct.

### P35-009: System — `NextAlarmResponse` missing Rust struct ✅ Resolved (Fix 35)
**Severity:** 🟡 Medium  
**Problem:** IPC command `get_next_alarm_time` returns `{ NextFireTime: string | null, AlarmLabel: string | null }` but no Rust struct.  
**Fix:** Added `NextAlarmResponse` Rust struct to `06-tauri-architecture...md`.

### P35-010: `12-smart-features.md` — `WebhookPayload` outgoing struct missing serde ✅ Resolved (Fix 35)
**Severity:** 🟡 Medium  
**Problem:** `fire_webhook()` references `&WebhookPayload` but struct is only shown as a TypeScript doc comment, not as a formal Rust struct with `#[derive(Serialize)]`.  
**Fix:** Added formal `WebhookPayload` Rust struct with serde.

### P35-011: `06-tauri-architecture...md` — `create_group` registry payload outdated ✅ Resolved (Fix 35)
**Severity:** 🟡 Medium  
**Problem:** Registry shows `{ Name: string }` but `07-alarm-groups.md` defines `CreateGroupPayload` with `Name`, `Color?`, `Position?`.  
**Fix:** Updated registry to reference `CreateGroupPayload`.

### P35-012: `06-tauri-architecture...md` — `update_group` registry payload outdated ✅ Resolved (Fix 35)
**Severity:** 🟡 Medium  
**Problem:** Registry shows `{ AlarmGroupId: string, Name: string }` but `07-alarm-groups.md` defines `UpdateGroupPayload` with optional fields.  
**Fix:** Updated registry to reference `UpdateGroupPayload`.

### P35-013: `06-tauri-architecture...md` — `delete_group`/`toggle_group` inline payloads ✅ Resolved (Fix 35)
**Severity:** 🟢 Low  
**Problem:** Registry uses inline `{ AlarmGroupId: string }` and `{ AlarmGroupId: string, IsEnabled: boolean }` but feature spec has named structs.  
**Fix:** Updated registry to reference `DeleteGroupPayload` and `ToggleGroupPayload`.

### P35-014: `10-export-import.md` — `ImportDataPayload` missing TypeScript + Rust ✅ Resolved (Fix 35)
**Severity:** 🟢 Low  
**Problem:** `import_data` command accepts `{ Mode: ImportMode }` inline — no named type.  
**Fix:** Added `ImportDataPayload` TypeScript interface and Rust struct.

---

## Fix Summary

| Fix | Issues | File(s) | Description |
|-----|--------|---------|-------------|
| **Fix 35** | P35-001–014 | `10-export-import.md`, `12-smart-features.md`, `13-analytics.md`, `06-tauri-architecture...md` | Add 12 missing Rust structs, fix 2 registry inconsistencies |

---

*Discovery Phase 35 — updated: 2026-04-11*
