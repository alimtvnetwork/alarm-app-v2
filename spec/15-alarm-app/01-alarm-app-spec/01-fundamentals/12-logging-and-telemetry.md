# Logging and Telemetry

**Version:** 1.0.0  
**Updated:** 2026-04-11  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P1 — Should Have  
**Resolves:** BE-003

---

## Keywords

`logging`, `telemetry`, `diagnostics`, `log-level`, `rotation`, `retention`, `tracing`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ⚠️ N/A (consolidated in 97-acceptance-criteria.md) |

---

## Purpose

Defines what the Alarm App logs, at what severity, where logs are stored, how they rotate, and what is explicitly excluded. Without this spec, AI agents will either over-log (leaking sensitive data, filling disk) or under-log (making debugging impossible).

---

## Log Levels

Uses the `LogLevel` enum from coding guidelines (`src/lib/enums/log-level.ts` / Rust equivalent).

| Level | Rust Crate | When to Use | Examples |
|-------|-----------|-------------|----------|
| `DEBUG` | `tracing::debug!` | Detailed diagnostic info — disabled in release builds | IPC payload contents, timer tick values, SQL bind params |
| `INFO` | `tracing::info!` | Normal operational events | App started, alarm created, settings saved, migration applied |
| `WARN` | `tracing::warn!` | Unexpected but recoverable situations | Audio file missing (fallback used), snooze limit reached, WebView CSS fallback |
| `ERROR` | `tracing::error!` | Failures requiring attention | DB write failed, notification permission denied, audio playback error |
| `FATAL` | `tracing::error!` + panic/exit | Unrecoverable — app cannot continue | DB file corrupted, migration failed, Tauri window creation failed |

### Default Log Level by Build

| Build | Default Level | Overridable |
|-------|--------------|-------------|
| Debug (`cargo tauri dev`) | `DEBUG` | Yes — `RUST_LOG` env var |
| Release (`cargo tauri build`) | `INFO` | Yes — Settings key `LogLevel` |

---

## Log Format

### Structured Format (JSON Lines)

```
{"ts":"2026-04-11T08:30:00.123Z","level":"INFO","target":"alarm_engine","msg":"Alarm fired","alarm_id":"abc-123","label":"Wake Up"}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `ts` | ISO 8601 UTC | Timestamp with millisecond precision |
| `level` | `LogLevel` enum value | Severity |
| `target` | string | Rust module path (e.g., `alarm_engine`, `db::migrations`) |
| `msg` | string | Human-readable message |
| `...` | key-value pairs | Structured context fields (alarm_id, setting_key, etc.) |

### Rust Implementation

```rust
// src-tauri/src/main.rs
use tracing_subscriber::{fmt, EnvFilter};
use tracing_appender::rolling;

let file_appender = rolling::daily(&log_dir, "alarm-app.log");
let (non_blocking, _guard) = tracing_appender::non_blocking(file_appender);

tracing_subscriber::fmt()
    .with_env_filter(EnvFilter::from_default_env().add_directive("alarm_app=info".parse().unwrap()))
    .json()
    .with_writer(non_blocking)
    .init();
```

---

## Log Storage

### File Location

| Platform | Path |
|----------|------|
| macOS | `~/Library/Logs/com.alarmapp.app/` |
| Windows | `%LOCALAPPDATA%\AlarmApp\logs\` |
| Linux | `~/.local/share/alarm-app/logs/` |

Resolved at runtime via `tauri::api::path::app_log_dir()`.

### File Naming

```
alarm-app.log          ← current day
alarm-app.2026-04-10.log  ← rotated
alarm-app.2026-04-09.log
```

---

## Rotation Policy

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Rotation trigger | Daily (midnight UTC) | Predictable, easy to correlate with dates |
| Max file size | 10 MB soft cap | If a single day exceeds 10 MB, rotate mid-day with `.1` suffix |
| Max retained files | 7 days | Balance between debuggability and disk usage |
| Compression | None (plain text) | Keeps log reading simple; 7 days × 10 MB = 70 MB max |
| Cleanup trigger | App startup | Delete files older than 7 days during `startup_sequence` |

### Cleanup Implementation

```rust
// Called during startup sequence (after DB init, before engine start)
fn cleanup_old_logs(log_dir: &Path, max_age_days: u64) -> Result<(), AlarmAppError> {
    let cutoff = SystemTime::now() - Duration::from_secs(max_age_days * 86400);
    for entry in fs::read_dir(log_dir)? {
        let entry = entry?;
        if entry.metadata()?.modified()? < cutoff {
            fs::remove_file(entry.path())?;
            tracing::info!(path = %entry.path().display(), "Deleted old log file");
        }
    }
    Ok(())
}
```

---

## What Gets Logged

### ✅ Always Log (INFO+)

| Event | Level | Structured Fields |
|-------|-------|-------------------|
| App startup complete | `INFO` | `version`, `platform`, `db_version` |
| App shutdown | `INFO` | `uptime_seconds` |
| Alarm created | `INFO` | `alarm_id`, `label`, `time` |
| Alarm updated | `INFO` | `alarm_id`, `changed_fields[]` |
| Alarm deleted (soft) | `INFO` | `alarm_id` |
| Alarm fired | `INFO` | `alarm_id`, `label`, `scheduled_time`, `actual_time` |
| Alarm dismissed | `INFO` | `alarm_id`, `method` (button/challenge/auto) |
| Alarm snoozed | `INFO` | `alarm_id`, `snooze_count`, `next_fire_time` |
| Alarm missed (recovery) | `WARN` | `alarm_id`, `missed_time`, `recovery_action` |
| Settings changed | `INFO` | `key`, `old_value`, `new_value` |
| Migration applied | `INFO` | `version`, `name`, `duration_ms` |
| Export completed | `INFO` | `format`, `alarm_count` |
| Import completed | `INFO` | `format`, `alarm_count`, `skipped_count` |
| Group created/updated/deleted | `INFO` | `group_id`, `name` |
| Notification permission denied | `WARN` | `platform` |
| Audio playback failed | `ERROR` | `alarm_id`, `sound_file`, `error` |
| DB write failed | `ERROR` | `operation`, `table`, `error` |
| IPC command failed | `ERROR` | `command`, `error` |

### ✅ Debug Only (stripped in release)

| Event | Level | Structured Fields |
|-------|-------|-------------------|
| IPC command received | `DEBUG` | `command`, `payload_size` |
| SQL query executed | `DEBUG` | `query`, `duration_ms`, `rows_affected` |
| Timer tick | `DEBUG` | `next_alarm_id`, `seconds_remaining` |
| Zustand state change | `DEBUG` | `store`, `action`, `diff_keys[]` |
| WebView CSS fallback applied | `DEBUG` | `property`, `fallback_value` |

### 🚫 Never Log

| Data | Reason |
|------|--------|
| User passwords or auth tokens | Security — never persisted in logs |
| Full alarm labels in ERROR logs | May contain personal info; use `alarm_id` only |
| Raw SQL with user-supplied values at INFO+ | SQL injection forensics only at DEBUG |
| OS notification content | May contain alarm labels with personal info |
| File system paths containing username | Privacy — use `~` placeholder |
| Stack traces at INFO level | Noise — only at DEBUG or ERROR |

---

## Frontend Logging

The frontend (React/TypeScript) does **not** write to log files. Instead:

| Action | Mechanism |
|--------|-----------|
| Critical errors | IPC call to `log_from_frontend` Rust command |
| Debug info | `console.debug()` — visible in DevTools only |
| User-facing errors | Rendered in UI via error modal (see error architecture spec) |

### IPC Command

> **Canonical name:** `log_from_frontend` — registered in the [IPC Command Registry](./06-tauri-architecture-and-framework-comparison.md) under System Commands.

```rust
#[tauri::command]
fn log_from_frontend(payload: LogFromFrontendPayload) {
    tracing::error!(source = "frontend", context = payload.context.as_deref().unwrap_or("unknown"), "{}", payload.message);
}
```

```typescript
// Frontend: src/lib/logging.ts
export async function logError(message: string, context?: string): Promise<void> {
  await invoke('log_from_frontend', { Message: message, Context: context });
}
```

---

## Settings Integration

| Settings Key | Type | Default | Description |
|-------------|------|---------|-------------|
| `LogLevel` | `string` | `"INFO"` | Minimum log level in release builds |

This key is already included in the Settings Keys table (see `01-data-model.md`). Changing it takes effect on next app restart.

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Log directory doesn't exist | Create it during startup; fail with `FATAL` if creation fails |
| Disk full during write | `tracing_appender` silently drops entries; no crash |
| Log file locked by another process | Skip rotation; append to current file; retry next startup |
| App crashes before flush | `tracing_appender::non_blocking` has a 8192-line buffer; partial loss possible |
| Clock moves backward (NTP correction) | Timestamps may appear out-of-order; log files still named by UTC date |
| User changes `LogLevel` setting | Applied on next app restart (not hot-reloaded) |

---

## Acceptance Criteria

| # | Criterion | Priority |
|---|-----------|----------|
| 1 | App writes structured JSON logs to platform-specific log directory | P1 |
| 2 | Logs rotate daily with 7-day retention | P1 |
| 3 | Old log files are cleaned up on startup | P1 |
| 4 | All alarm lifecycle events (create, fire, snooze, dismiss, miss) are logged at INFO | P1 |
| 5 | Sensitive data (passwords, personal label text at ERROR+) is never logged | P0 |
| 6 | Frontend errors are forwarded to Rust logger via IPC | P1 |
| 7 | `LogLevel` setting controls minimum severity in release builds | P1 |
| 8 | DEBUG-level logs are disabled in release builds by default | P1 |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| LogLevel Enum | `../../02-coding-guidelines/03-coding-guidelines-spec/02-typescript/10-log-level-enum.md` |
| Error Architecture | `../../03-error-manage-spec/04-error-manage-spec/02-error-architecture/07-logging-and-diagnostics/00-overview.md` |
| Startup Sequence | `./07-startup-sequence.md` |
| Settings Keys | `./01-data-model.md` (Settings Keys table) |
| Platform Constraints | `./04-platform-constraints.md` |
| AlarmAppError Enum | `../02-features/03-alarm-firing.md` |

---

*Logging and Telemetry v1.0.0 — 2026-04-11*
