# Startup Sequence

**Version:** 1.5.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 — Must Have  
**Resolves:** BE-STARTUP-001, BE-LOG-001

---

## Keywords

`startup`, `initialization`, `boot`, `sequence`, `migration`, `tray`, `engine`, `missed-alarm`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ⚠️ N/A (consolidated in 97-acceptance-criteria.md) |


## Purpose

Defines the exact initialization order for the Alarm App on launch. Incorrect ordering causes crashes (e.g., alarm engine starting before DB is ready) or silent failures (e.g., missed alarms not surfaced because engine starts before migration runs).

---

## Startup Sequence

```
┌─────────────────────────────────────────────────────┐
│                   App Launch                         │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
         1.   │ Resolve app    │  Determine OS-specific data directory:
              │ data directory │  macOS: ~/Library/Application Support/com.alarm-app
              └───────┬────────┘  Windows: %APPDATA%/alarm-app
                      │           Linux: ~/.local/share/alarm-app
                      ▼
              ┌────────────────┐
         2.   │ Open SQLite    │  Open or create alarm-app.db in app data dir
              │ connection     │  Connection pool: 1 writer + N readers
              └───────┬────────┘
                      │
                      ▼
              ┌────────────────┐
         3.   │ Run migrations │  refinery::embed_migrations!("migrations")
              │ (refinery)     │  If migration fails → show error dialog
              └───────┬────────┘  with "Reset Database" option, then exit
                      │
                      ▼
              ┌────────────────┐
         4.   │ Enable WAL     │  PRAGMA journal_mode=WAL
              │ mode           │  PRAGMA busy_timeout=5000
              └───────┬────────┘  PRAGMA foreign_keys=ON
                      │
                      ▼
              ┌────────────────┐
         5.   │ Load settings  │  Read all rows from Settings table
              │ into memory    │  Parse into typed Settings struct
              └───────┬────────┘  Apply defaults for missing keys
                      │
                      ▼
         ┌────────────┴────────────┐
         │     PARALLEL INIT       │
         │  (tokio::join!)         │
         ├─────────┬───────────────┤
         │         │               │
         ▼         ▼               ▼
    ┌─────────┐ ┌──────────┐ ┌──────────┐
6a. │ Init    │ │ Init     │ │ Start    │
    │ system  │ │ logging  │ │ WebView  │
    │ tray    │ │ (tracing)│ │ / React  │
    └────┬────┘ └────┬─────┘ └────┬─────┘
         │           │            │
         └─────────┬─┘            │
                   │              │
                   ▼              │
         ┌────────────────┐       │
    7.   │ Start alarm    │       │
         │ engine thread  │       │
         └───────┬────────┘       │
                 │                │
                 ▼                │
         ┌────────────────┐       │
    8.   │ Missed alarm   │       │
         │ check + queue  │       │
         └───────┬────────┘       │
                 │                │
                 ▼                ▼
         ┌────────────────────────────┐
    9.   │ Update tray: next alarm    │
         │ Surface missed alarms      │
         │ App ready                  │
         └────────────────────────────┘
```

---

## Step Details

### Step 1 — Resolve App Data Directory

```rust
// INTENTIONAL PANIC: App cannot function without data directory.
// These expect() calls are exempt — startup-critical, no recovery possible.
let app_dir = app_handle.path().app_data_dir()
    .expect("FATAL: Failed to resolve app data directory");
std::fs::create_dir_all(&app_dir)
    .expect("FATAL: Failed to create app data directory");
```

- **Error:** If directory creation fails → show native error dialog, exit with code 1

---

### Step 2 — Open SQLite Connection

```rust
let db_path = app_dir.join("alarm-app.db");
// INTENTIONAL PANIC: App cannot function without database.
let conn = Connection::open(&db_path)
    .expect("FATAL: Failed to open database");
```

- **Error:** If DB file is locked by another process → show "Another instance may be running" dialog

---

### Step 3 — Run Migrations

```rust
refinery::embed_migrations!("migrations");
migrations::runner().run(&mut conn)?;
```

- **Error:** If migration fails:
  1. Log full error to stderr
  2. Show dialog: "Database migration failed. [Reset Database] [Exit]"
  3. "Reset Database" → backup `alarm-app.db` to `alarm-app.db.backup.{timestamp}`, delete original, retry

---

### Step 4 — Enable WAL Mode

```sql
PRAGMA journal_mode=WAL;
PRAGMA busy_timeout=5000;
PRAGMA foreign_keys=ON;
PRAGMA synchronous=NORMAL;
```

- WAL allows concurrent reads during writes (critical for alarm engine + UI)
- `busy_timeout` prevents immediate `SQLITE_BUSY` errors

---

### Step 5 — Load Settings

```rust
let settings = Settings::load_all(&conn).await?;
// Apply defaults for any missing keys
settings.ensure_defaults(&conn).await?;
```

- Must complete before tray init (needs `TimeFormat` for display)
- Must complete before engine start (needs `DefaultSnoozeDuration`, etc.)

---

### Step 6 — Parallel Initialization (tokio::join!)

Three independent subsystems start concurrently:

| Subsystem | Duration | Notes |
|-----------|----------|-------|
| **6a. System tray** | ~50ms | Show tray icon with "Loading..." tooltip |
| **6b. Logging** | ~10ms | `tracing_subscriber` + file appender |
| **6c. WebView/React** | ~200–500ms | Vite bundle loads in WebView |

#### 6b. Logging Strategy (Resolves BE-LOG-001)

```rust
use tracing_subscriber::{fmt, prelude::*, EnvFilter};
use tracing_appender::rolling;

pub fn init_logging(app_dir: &Path) -> Result<(), AlarmAppError> {
    let log_dir = app_dir.join("logs");
    std::fs::create_dir_all(&log_dir)?;

    // Daily rotation, keep 7 days
    let file_appender = rolling::daily(&log_dir, "alarm-app.log");
    let (non_blocking, _guard) = tracing_appender::non_blocking(file_appender);

    tracing_subscriber::registry()
        .with(EnvFilter::new("info"))  // Default: INFO
        .with(fmt::layer()
            .with_writer(non_blocking)
            .with_ansi(false)
            .with_target(true)
            .with_timer(fmt::time::UtcTime::rfc_3339()))
        .with(fmt::layer().with_writer(std::io::stderr))  // Also log to stderr
        .init();

    Ok(())
}
```

**Log levels:**

| Level | Usage | Examples |
|-------|-------|---------|
| `ERROR` | Unrecoverable failures | DB corruption, migration fail, audio device missing |
| `WARN` | Fallbacks, degraded state | Missing sound file, PRAGMA fail, notification denied |
| `INFO` | Key lifecycle events | Alarm fire, dismiss, snooze, app start/stop, settings change |
| `DEBUG` | Engine internals | Tick checks, next-fire calculations, IPC calls |
| `TRACE` | Development only | SQL queries, full alarm state dumps |

**Log file location:** `{app_data_dir}/logs/alarm-app.log`  
**Rotation:** Daily, keep 7 days, oldest auto-deleted  
**Frontend forwarding:** `console.error` and `console.warn` forwarded to Rust via `log_from_frontend` IPC command

```rust
#[tauri::command]
fn log_from_frontend(level: String, message: String) {
    match level.as_str() {
        "error" => tracing::error!(source = "frontend", "{message}"),
        "warn" => tracing::warn!(source = "frontend", "{message}"),
        _ => tracing::info!(source = "frontend", "{message}"),
    }
}
```

```rust
let (tray, _, _) = tokio::join!(
    init_tray(&app_handle, &settings),
    init_logging(&app_dir),
    // WebView is started by Tauri automatically
);
```

---

### Step 7 — Start Alarm Engine

```rust
const ALARM_CHECK_INTERVAL_SECS: u64 = 30;

let engine = AlarmEngine::new(pool.clone(), event_emitter.clone());
tokio::spawn(async move {
    engine.run_loop(Duration::from_secs(ALARM_CHECK_INTERVAL_SECS)).await;
});
```

- Engine must start **after** migrations (Step 3) and settings (Step 5)
- Engine runs independently of WebView — alarms fire even if UI is not visible

---

### Step 8 — Missed Alarm Check + Snooze Recovery (Resolves LC-010)

#### 8a. Missed Alarm Check

```sql
SELECT * FROM Alarms
WHERE NextFireTime < datetime('now')
  AND IsEnabled = 1
  AND DeletedAt IS NULL;
```

- For each missed alarm:
  1. Insert `AlarmEvents` row with `Type = AlarmEventType::Missed`
  2. Add to alarm queue (see `03-alarm-firing.md` → Simultaneous Alarms)
  3. Recompute `NextFireTime` for repeating alarms
  4. Dispatch OS notification: "Missed Alarm: {label} at {originalTime}"

#### 8b. Snooze Crash Recovery

```sql
SELECT * FROM SnoozeState;
```

- For each active snooze:
  - If `SnoozeUntil > now`: spawn `tokio::time::sleep_until(snooze_expiry)` task to resume the snooze timer
  - If `SnoozeUntil <= now`: snooze expired during downtime — fire immediately as missed alarm (add to queue, log event)
  - If alarm no longer exists (deleted during downtime): delete orphaned `SnoozeState` row

---

### Step 9 — App Ready

- Update tray tooltip: "Next alarm: {time} — {label}"
- If missed alarms exist, show first overlay from queue
- Log `INFO` "App started in {elapsed}ms, {n} alarms loaded, {m} missed"

---

## Startup Time Budget

| Step | Budget | Notes |
|------|--------|-------|
| 1. App data dir | <10ms | Filesystem only |
| 2. SQLite open | <50ms | Single file open |
| 3. Migrations | <100ms | Usually no-op after first run |
| 4. WAL + PRAGMAs | <10ms | SQLite PRAGMAs |
| 5. Load settings | <20ms | ~10 rows |
| 6. Parallel init | <500ms | WebView dominates |
| 7. Engine start | <5ms | Spawns async task |
| 8. Missed check | <50ms | Single indexed query |
| 9. Ready | <5ms | Tray update |
| **Total** | **<750ms** | Well under 2s NFR target |

---

## Error Handling Summary

| Step | Error | Behavior |
|------|-------|----------|
| 1 | Dir creation fails | Native error dialog → exit |
| 2 | DB locked | "Another instance running" dialog → exit |
| 3 | Migration fails | Backup DB → offer reset → retry or exit |
| 4 | PRAGMA fails | Log warning, continue (non-fatal) |
| 5 | Settings read fails | Use all defaults, log warning |
| 6a | Tray init fails | Log error, continue without tray |
| 6b | Logging init fails | Fall back to stderr |
| 7 | Engine spawn fails | Fatal — show error dialog → exit |
| 8 | Missed check fails | Log error, continue (alarms will fire on next tick) |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Alarm Firing | `../02-features/03-alarm-firing.md` |
| Platform Constraints | `./04-platform-constraints.md` |
| Data Model | `./01-data-model.md` |
| File Structure | `./03-file-structure.md` |
| Logging & Telemetry | `./12-logging-and-telemetry.md` — authoritative log format, rotation, retention |
| App Issues | `../03-app-issues/03-backend-issues.md` → BE-STARTUP-001 |

---

*Startup sequence — created: 2026-04-09*
