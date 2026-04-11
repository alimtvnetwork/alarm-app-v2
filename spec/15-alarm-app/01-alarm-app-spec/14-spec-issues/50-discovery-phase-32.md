# Discovery Phase 32 — IPC Payload Structs Audit

**Version:** 1.0.0  
**Updated:** 2026-04-11  
**Phase:** 7 (IPC Payload Struct Completeness)

---

## Keywords

`rust`, `struct`, `serde`, `payload`, `IPC`, `deserialize`, `serialize`

---

## Methodology

Cross-referenced all IPC commands in `06-tauri-architecture-and-framework-comparison.md` against feature spec files. Identified every named payload or response type that has a TypeScript interface but no Rust struct definition.

---

## Findings

### PY-001 — `CreateAlarmPayload` has no Rust struct [CRITICAL]

TS interface in `01-alarm-crud.md` line 347. 20 fields including enums. Used by `create_alarm` IPC command. Without Rust `Deserialize` struct, AI will manually parse JSON fields.

### PY-002 — `UpdateAlarmPayload` has no Rust struct [CRITICAL]

TS interface in `01-alarm-crud.md` line 375. PATCH semantics — all fields optional except `AlarmId`. Needs `Option<Option<T>>` pattern for nullable fields. Without this, AI will either skip optional handling or break null-clearing.

### PY-003 — `WebhookConfig` has no Rust struct [MEDIUM]

TS interface in `12-smart-features.md` line 262. Response type for `create_webhook`. 5 fields including `serde_json::Value` for arbitrary payload.

### PY-004 — `WeatherBriefing` has no Rust struct [MEDIUM]

TS interface in `12-smart-features.md` line 270. Response type for `get_weather_briefing`. 5 fields. In-memory struct (no DB table).

### PY-005 — `HistoryFilter` has no Rust struct [CRITICAL]

TS interface in `13-analytics.md` line 58. Input payload for `list_alarm_events` and `export_history_csv`. Contains enum references (`AlarmEventType`, `SortField`, `SortOrder`). Without Rust struct, AI will skip enum deserialization.

### PY-006 — `ImportPreview` has no Rust struct [MEDIUM]

TS interface in `10-export-import.md` line 131. Response from `import_data`. Contains nested `Alarm[]` and `AlarmGroup[]`.

### PY-007 — `ImportResult` has no Rust struct [LOW]

TS interface in `10-export-import.md` line 147. Response from `confirm_import`. Simple 4-field struct.

---

## Summary

| ID | Severity | Description | Status |
|----|----------|-------------|--------|
| PY-001 | 🔴 Critical | `CreateAlarmPayload` — no Rust struct | ✅ Resolved |
| PY-002 | 🔴 Critical | `UpdateAlarmPayload` — no Rust struct | ✅ Resolved |
| PY-003 | 🟡 Medium | `WebhookConfig` — no Rust struct | ✅ Resolved |
| PY-004 | 🟡 Medium | `WeatherBriefing` — no Rust struct | ✅ Resolved |
| PY-005 | 🔴 Critical | `HistoryFilter` — no Rust struct | ✅ Resolved |
| PY-006 | 🟡 Medium | `ImportPreview` — no Rust struct | ✅ Resolved |
| PY-007 | 🟢 Low | `ImportResult` — no Rust struct | ✅ Resolved |

**New issues this phase:** 7 (3 critical, 3 medium, 1 low) — all resolved immediately.

---

## Design Decisions

### `Option<Option<T>>` for PATCH semantics

`UpdateAlarmPayload` uses `Option<Option<T>>` for nullable fields:
- `None` → field not in payload (don't update)
- `Some(None)` → explicitly set to null
- `Some(Some(value))` → set to value

This is standard Rust serde pattern for JSON PATCH semantics. Requires `#[serde(default, deserialize_with = "...")]` or `serde_with` crate in implementation.

### `Serialize` vs `Deserialize`

- **Request payloads** (FE → BE): `Deserialize` only — `CreateAlarmPayload`, `UpdateAlarmPayload`, `HistoryFilter`
- **Response types** (BE → FE): `Serialize` only — `WebhookConfig`, `WeatherBriefing`, `ImportPreview`, `ImportResult`

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Alarm CRUD | `../02-features/01-alarm-crud.md` |
| Smart Features | `../02-features/12-smart-features.md` |
| Analytics | `../02-features/13-analytics.md` |
| Export/Import | `../02-features/10-export-import.md` |
| IPC Registry | `../01-fundamentals/06-tauri-architecture-and-framework-comparison.md` |
| Previous discovery | `./49-discovery-phase-31.md` |
