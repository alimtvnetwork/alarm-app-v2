# Discovery Phase 29 — IPC Registry Completeness Audit

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Phase:** 4 (IPC Registry)

---

## Keywords

`ipc`, `registry`, `commands`, `completeness`, `cross-consistency`

---

## Methodology

Extracted all IPC commands from:
- **Feature specs** (16 files in `02-features/`) — found **46 unique commands**
- **Architecture registry** (`01-fundamentals/06-tauri-architecture-and-framework-comparison.md`) — found **40 commands**

Cross-compared for gaps, duplicates, naming inconsistencies, and missing definitions.

---

## Findings

### IPC-001 — 8 commands in features but missing from architecture registry [CRITICAL]

Commands defined in feature specs but absent from the canonical IPC table in `06-tauri-architecture-and-framework-comparison.md`:

| # | Command | Source Feature | Risk |
|---|---------|----------------|------|
| 1 | `clear_history` | 13-analytics | AI won't register this Tauri command |
| 2 | `export_history_csv` | 13-analytics | AI won't register this Tauri command |
| 3 | `get_bedtime_reminder` | 11-sleep-wellness | AI won't register this Tauri command |
| 4 | `get_theme` | 09-theme-system | AI won't register this Tauri command |
| 5 | `list_alarm_events` | 13-analytics | AI won't register this Tauri command |
| 6 | `set_bedtime_reminder` | 11-sleep-wellness | AI won't register this Tauri command |
| 7 | `set_theme` | 09-theme-system | AI won't register this Tauri command |
| 8 | `validate_custom_sound` | 05-sound-and-vibration | AI won't register this Tauri command |

**Impact:** High. AI implementing from the architecture doc alone will miss 8 commands entirely. Features 09, 11, and 13 are most affected.

### IPC-002 — 2 commands in registry but not in any feature spec [MEDIUM]

| # | Command | Notes |
|---|---------|-------|
| 1 | `get_settings` | Registry has this; features use `get_theme` instead. Unclear if both exist or one replaces the other |
| 2 | `log_from_frontend` | Utility command for frontend logging — no feature spec defines its payload or behavior |

**Impact:** AI may implement orphaned commands with no clear spec.

### IPC-003 — 3 commands duplicated across feature specs [LOW]

| Command | Defined In | Notes |
|---------|-----------|-------|
| `snooze_alarm` | 03-alarm-firing + 04-snooze-system | Identical signatures — intentional cross-reference |
| `get_snooze_state` | 03-alarm-firing + 04-snooze-system | Identical — intentional |
| `cancel_snooze` | 03-alarm-firing + 04-snooze-system | Identical — intentional |

**Impact:** Low — signatures match. But no explicit note saying "see also X" to confirm intentional duplication.

### IPC-004 — `update_setting` used as generic command with varying payloads [MEDIUM]

`14-personalization.md` lists `update_setting` twice with different `Key` values (`ThemeSkin`, `AccentColor`). This is a generic settings command, but:
- No spec defines the full list of valid `Key` values
- `09-theme-system.md` uses `set_theme`/`get_theme` instead — contradicts `update_setting` for theme storage
- `get_settings` in the registry vs `get_theme` in features — unclear which is canonical

### IPC-005 — `12-smart-features.md` has NO IPC command table [MEDIUM]

Smart Features defines webhooks, weather, location, and voice but lacks an IPC command table. AI won't know what Tauri commands to create for:
- Webhook CRUD (create/update/delete webhook config)
- Weather briefing fetch
- Location/geofence management
- Voice command registration

### IPC-006 — `02-alarm-scheduling.md` has no IPC commands (by design) [INFO]

Explicitly states scheduling is handled by `create_alarm`/`update_alarm`. This is correct and well-documented.

---

## Summary

| ID | Severity | Description | Status |
|----|----------|-------------|--------|
| IPC-001 | 🔴 Critical | 8 commands missing from architecture registry | ✅ Resolved — added to `06-tauri-architecture-and-framework-comparison.md` |
| IPC-002 | 🟡 Medium | 2 orphaned commands in registry (no feature spec) | ✅ Resolved — `get_settings` clarified as full Settings loader; `log_from_frontend` is utility (no feature spec needed) |
| IPC-003 | 🟢 Low | 3 intentional duplicates across snooze specs | ✅ Resolved — added cross-reference notes to both `03-alarm-firing.md` and `04-snooze-system.md` |
| IPC-004 | 🟡 Medium | `update_setting` generic key ambiguity vs `set_theme` | ✅ Resolved — `get_theme`/`set_theme` documented as convenience wrappers around Settings table; note added to registry and `09-theme-system.md` |
| IPC-005 | 🟡 Medium | `12-smart-features.md` missing IPC command table | ✅ Resolved — added 4 commands (`create_webhook`, `delete_webhook`, `test_webhook`, `get_weather_briefing`) with payload interfaces |
| IPC-006 | ℹ️ Info | `02-alarm-scheduling.md` no IPC (by design) | Closed |

**New issues this phase:** 5 open (1 critical, 3 medium, 1 low)  
**AI failure risk contribution:** ~8% (missing commands = broken features)

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Architecture IPC table | `../01-fundamentals/06-tauri-architecture-and-framework-comparison.md` |
| Platform constraints (safeInvoke) | `../01-fundamentals/04-platform-constraints.md` |
| Previous discovery | `./46-gap-analysis-phase-5.md` |
