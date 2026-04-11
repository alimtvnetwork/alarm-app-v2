# OS Service Layer Specification

**Version:** 2.3.0  
**Updated:** 2026-04-11  
**Target Platform:** macOS (primary), Windows/Linux (future)  
**Architecture:** Tauri 2.x (Rust core)  
**Scope:** Background service behavior — auto-start, polling engine, tray icon, notifications, wake/sleep, packaging  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Problem Statement](#2-problem-statement)
3. [System Concept — What Is a "Background Service"?](#3-system-concept--what-is-a-background-service)
4. [Service Architecture](#4-service-architecture)
5. [System Tray / Menu Bar](#5-system-tray--menu-bar)
6. [Background Polling Engine](#6-background-polling-engine)
7. [Notification Dispatch](#7-notification-dispatch)
8. [Auto-Start / Login Item Registration](#8-auto-start--login-item-registration)
9. [Wake / Sleep Handling](#9-wake--sleep-handling)
10. [Interval Check Service](#10-interval-check-service)
11. [Rust Module Structure](#11-rust-module-structure)
12. [Tauri Configuration](#12-tauri-configuration)
13. [Deployment & Packaging](#13-deployment--packaging)
14. [Technical Constraints & Edge Cases](#14-technical-constraints--edge-cases)
15. [Platform Notes (Windows & Linux)](#15-platform-notes-windows--linux)
16. [Glossary](#16-glossary)

---

## Keywords

`background-service`, `polling-engine`, `tray-icon`, `notifications`, `auto-start`, `wake-sleep`, `launchagent`, `daemon`, `os-service`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ⚠️ N/A (architecture spec — no AC needed) |

---

## 1. Purpose & Scope

This document specifies **how Alarm App behaves as an operating system background service**. It covers the service lifecycle, auto-start, polling engine, notification dispatch, system tray presence, and wake/sleep recovery.

### What This Document Covers

- How the app starts automatically on login
- How it runs silently in the background (no dock icon, no visible window)
- How the 30-second polling engine works
- How native OS notifications are fired and handled
- How the system tray icon behaves
- How the app recovers from sleep/shutdown (missed alarm detection)
- How the app is packaged and distributed

### What This Document Does NOT Cover

These are documented in separate specs and are referenced where needed:

| Topic | Reference |
|-------|-----------|
| Data model & schema | `01-data-model.md` |
| Design system & UI | `02-design-system.md` |
| Alarm CRUD features | `../02-features/01-alarm-crud.md` |
| Alarm scheduling logic | `../02-features/02-alarm-scheduling.md` |
| Alarm firing behavior | `../02-features/03-alarm-firing.md` |
| Snooze system | `../02-features/04-snooze-system.md` |
| Sound & vibration | `../02-features/05-sound-and-vibration.md` |
| Dismissal challenges | `../02-features/06-dismissal-challenges.md` |
| Platform constraints | `04-platform-constraints.md` |

---

## 2. Problem Statement

### What the User Wants

A desktop application for macOS that behaves like a **Windows Service** — a process that:

- **Starts automatically** when the computer boots (no manual launch required)
- **Runs silently in the background** with no visible window or dock icon
- **Continuously monitors** a local database every **30 seconds** for pending alarms
- **Delivers native OS notifications** when an alarm is due, with actionable buttons (Snooze / Dismiss)
- **Provides a minimal tray UI** (accessed via the menu bar icon) for quick access to the alarm app
- **Survives sleep/wake cycles** — detects and surfaces missed alarms on resume

### The Windows Service Analogy

On Windows, "Services" are long-running background processes visible in Task Manager → Services tab. They start on boot, run without a GUI, and communicate with other applications via APIs. Examples: Windows Update, Print Spooler, SQL Server.

**Alarm App replicates this pattern on macOS** using:

- **Tauri 2.x** as the application shell (provides tray icon, background execution, native notifications via Rust backend)
- **macOS Login Items** for auto-start on boot (via `tauri-plugin-autostart`)
- **SQLite** as the local persistent database (via `rusqlite` in Rust — no network/cloud dependency)
- **IPC** between the background service (Tauri Rust core) and the UI (React webview)

---

## 3. System Concept — What Is a "Background Service"?

### Definition

A background service is a process that:

1. **Launches at system startup** without user intervention
2. **Has no persistent visible interface** — it runs "headless" or with only a system tray presence
3. **Performs scheduled or continuous work** — in our case, polling a database for due alarms
4. **Responds to events** — when an alarm is due, it fires a notification
5. **Exposes an interface for management** — a tray icon click opens a small panel for alarm operations

### How Alarm App Implements This

```
┌──────────────────────────────────────────────────────────────┐
│                        macOS System                          │
│                                                              │
│  ┌─ Login Items ─────────────────────────────────────────┐   │
│  │  Alarm App.app (registered via tauri-plugin-autostart)│  │
│  │  → Launches automatically on user login               │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Menu Bar ────────────────────────────────────────────┐   │
│  │  🔔 (System Tray Icon via tauri::tray)                │   │
│  │  • Click → Opens dropdown panel (WebviewWindow)       │   │
│  │  • Red dot badge when alarms are pending/overdue      │   │
│  │  • No dock icon visible (LSUIElement = true)          │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Tauri Rust Core (the "service") ─────────────────────┐   │
│  │                                                        │   │
│  │  ┌─ Polling Loop (tokio task) ────────────────────┐   │   │
│  │  │  Every 30s:                                   │   │   │
│  │  │  1. Query SQLite for due alarms                │   │   │
│  │  │  2. For each result → fire native notification │   │   │
│  │  │  3. Update alarm status accordingly            │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  ┌─ SQLite Database (rusqlite) ───────────────────┐   │   │
│  │  │  ~/Library/Application Support/Alarm App/    │   │   │
│  │  │  alarm-app.db                                     │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  ┌─ Wake/Sleep Handler ───────────────────────────┐   │   │
│  │  │  NSWorkspace didWakeNotification               │   │   │
│  │  │  → Immediately check for missed alarms         │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  ┌─ Notification Handler ─────────────────────────┐   │   │
│  │  │  tauri-plugin-notification                     │   │   │
│  │  │  Actions: [Snooze] [Dismiss]                   │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Tauri Webview (React UI) ────────────────────────────┐   │
│  │  Hidden by default, shown on tray icon click          │   │
│  │  Communicates with Rust core via invoke() / listen()  │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Service Architecture

### Process Model

Tauri runs a **single process** with two logical layers:

1. **Rust Core** (`src-tauri/src/main.rs`) — Native environment
   - Has full OS access (filesystem, notifications, tray, SQLite via `rusqlite`)
   - Runs the polling loop as a `tokio` async task
   - Exposes `#[tauri::command]` functions callable from the webview
   - This IS the "background service"

2. **Webview** (React app) — Sandboxed browser environment
   - Runs the React UI inside a native webview (WKWebView on macOS)
   - No direct filesystem or OS access
   - Communicates with Rust core via `@tauri-apps/api` (`invoke()` and `listen()`)

### Security Model

```
Rust Core (full OS access)
      ↑
      │  Tauri IPC (command whitelist via tauri.conf.json)
      │  Only #[tauri::command] functions are callable
      │  All other Rust code is inaccessible from the webview
      ↓
Webview (sandboxed, no Node.js, no filesystem)
      │  @tauri-apps/api
      │  invoke("command_name", { ... })
      │  listen("event-name", callback)
```

- Webview cannot access the filesystem, spawn processes, or call arbitrary Rust code
- Only explicitly registered `#[tauri::command]` functions are exposed
- Permissions are declared in `tauri.conf.json` → `capabilities`

### Service Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│                    SERVICE LIFECYCLE                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. SYSTEM BOOT / USER LOGIN                             │
│     └─→ macOS Login Items launches Alarm App.app       │
│                                                          │
│  2. APP INITIALIZATION                                   │
│     ├─→ Initialize rusqlite connection                   │
│     ├─→ Run database migrations (if needed)              │
│     ├─→ Create system tray icon (🔔)                     │
│     ├─→ Create hidden WebviewWindow                      │
│     ├─→ Register wake/sleep listeners                    │
│     └─→ Spawn polling engine (tokio task)                │
│                                                          │
│  3. RUNNING STATE                                        │
│     ├─→ Polling loop checks DB every 30s                │
│     ├─→ Fires notifications for due alarms               │
│     ├─→ Handles notification actions (Snooze/Dismiss)    │
│     ├─→ Updates tray badge on alarm state changes        │
│     └─→ Shows/hides webview on tray click                │
│                                                          │
│  4. SLEEP EVENT                                          │
│     └─→ NSWorkspace willSleepNotification received       │
│         └─→ Log timestamp, polling pauses naturally      │
│                                                          │
│  5. WAKE EVENT                                           │
│     └─→ NSWorkspace didWakeNotification received         │
│         ├─→ Immediately query for missed alarms          │
│         ├─→ Fire "missed alarm" notifications            │
│         └─→ Polling loop resumes automatically           │
│                                                          │
│  6. QUIT                                                 │
│     └─→ User selects "Quit" from tray menu               │
│         └─→ App exits, restarts on next login            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 5. System Tray / Menu Bar

### Behavior

- App icon appears in the macOS menu bar (top-right area)
- Left-click toggles the dropdown panel visibility
- The panel is a frameless `WebviewWindow` positioned directly below the tray icon
- When the panel loses focus (user clicks elsewhere), it hides automatically
- `LSUIElement = true` in `Info.plist` prevents a dock icon from appearing

### Tray Icon States

| State | Icon | Description |
|-------|------|-------------|
| Normal | 🔔 | No overdue alarms |
| Pending/Overdue | 🔔🔴 | Red dot overlay — one or more alarms are past due |
| Firing | 🔔🔴 (animated) | Optional pulse animation while notification is active |

### Tray Right-Click Menu

| Item | Action |
|------|--------|
| Next alarm: HH:MM | Info display (disabled item) |
| Open Alarm App | Show webview panel |
| Separator | — |
| Quit Alarm App | Exit the app |

### WebviewWindow Configuration

```json
{
  "label": "main",
  "title": "Alarm App",
  "width": 420,
  "height": 600,
  "visible": false,
  "decorations": false,
  "resizable": false,
  "skipTaskbar": true,
  "alwaysOnTop": true
}
```

### Tray Implementation (Rust)

```rust
use tauri::tray::{TrayIconBuilder, MouseButton, MouseButtonState};

fn setup_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .icon_as_template(true)  // macOS menu bar style (monochrome)
        .on_tray_icon_event(|tray, event| {
            match event {
                tauri::tray::TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                } => {
                    let app = tray.app_handle();
                    if let Some(window) = app.get_webview_window("main") {
                        if window.is_visible().unwrap_or(false) {
                            let _ = window.hide();
                        } else {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                }
                _ => {}
            }
        })
        .build(app)?;

    Ok(())
}
```

---

## 6. Background Polling Engine

### Overview

The polling engine is a `tokio` async task running in the Tauri Rust core. It uses `tokio::time::interval` for precise **30-second** ticks. It is the core mechanism that makes Alarm App function as a background daemon.

> **Canonical interval:** 30 seconds — aligned with `03-alarm-firing.md`. See that spec for full firing logic, queue management, and multi-alarm handling.

### Why 30 Seconds?

| Interval | Trade-off |
|----------|-----------|
| 100ms | Excessive CPU wake-ups, no perceptible benefit |
| 500ms–1s | Sub-second but unnecessary for alarm use case |
| **30s** | **Balanced detection with minimal resource cost. Sub-minute accuracy is sufficient for alarms.** |
| 60s | Acceptable but can miss by up to 1 full minute |

### Algorithm (Pseudocode)

```
async fn polling_loop(app_handle: AppHandle, db: Arc<Mutex<Connection>>) {
    let mut interval = tokio::time::interval(Duration::from_secs(30));
    
    loop {
        interval.tick().await;
        
        1. current_time = Utc::now() as ISO 8601
        
        2. due_alarms = SQL: SELECT * FROM Alarms
                             WHERE IsEnabled = 1
                             AND NextFireTime <= current_time
                             AND DeletedAt IS NULL
                             ORDER BY NextFireTime ASC
        
        3. FOR EACH alarm IN due_alarms:
           
           a. IF alarm.RepeatType = RepeatType::Interval AND is_interval_check:
              → Skip (handled by separate interval check task)
           
           b. Fire native notification via tauri-plugin-notification
              - Title: alarm.Label
              - Body: "Alarm is due!"
              - Actions: [Snooze] [Dismiss]
           
           c. Emit "alarm-fired" event to webview
           
           d. IF alarm.RepeatType != RepeatType::Once:
              → Compute next NextFireTime from RepeatType + repeat fields
                 (see 02-alarm-scheduling.md for full computation rules)
              → Update alarm with new NextFireTime
           
           e. Insert AlarmEvents row with Type = AlarmEventType::Fired
        
        4. Update tray icon badge:
           - Count alarms where NextFireTime < now AND IsEnabled = 1
           - If count > 0 → red dot overlay
           - If count = 0 → normal icon
    }
}
```

### Resource Impact

| Metric | Value |
|--------|-------|
| CPU per tick | < 0.1% (single SQLite query) |
| Memory overhead | ~1 MB for the tokio task |
| SQLite query time | < 1ms (indexed on `NextFireTime`) |
| Battery impact | Negligible (no network, no disk writes unless alarm fires) |

### Required Database Index

```sql
-- Canonical index from 01-data-model.md
CREATE INDEX IdxAlarms_NextFireTime ON Alarms(NextFireTime) WHERE IsEnabled = 1 AND DeletedAt IS NULL;
```

> **Note:** The full database schema and index definitions are in `01-data-model.md`. The polling engine uses the partial index above for efficient due-alarm queries.

---

## 7. Notification Dispatch

### macOS Native Notifications via tauri-plugin-notification

`tauri-plugin-notification` wraps macOS's `UNUserNotificationCenter` for native notification delivery.

### Notification Content

> **Canonical templates** are defined in `../02-features/03-alarm-firing.md` → Notification Content Templates. This section summarizes for service-layer context.

| Field | Value |
|-------|-------|
| Title | `"⏰ {Label}"` or `"⏰ Alarm"` if label is empty |
| Body | `"{Time} — Tap to dismiss or snooze"` (uses `Is24Hour` setting for format) |
| Sound | System default (configurable via settings) |
| Actions | **Snooze** — reschedule alarm; **Dismiss** — mark as dismissed |

### Rust Implementation

```rust
use tauri_plugin_notification::NotificationExt;

fn fire_alarm_notification(app: &AppHandle, alarm: &Alarm, is_24_hour: bool, is_sound_enabled: bool) {
    let label = if alarm.label.is_empty() { "Alarm" } else { &alarm.label };
    let time_str = format_time(&alarm.time, is_24_hour);

    let mut notification = app.notification()
        .builder()
        .title(&format!("⏰ {label}"))
        .body(&format!("{time_str} — Tap to dismiss or snooze"))
        .action_type_id("alarm-actions");
    
    if is_sound_enabled {
        notification = notification.sound("default");
    }

    notification
        .action(tauri_plugin_notification::Action {
            id: "snooze".into(),
            title: "Snooze".into(),
            ..Default::default()
        })
        .action(tauri_plugin_notification::Action {
            id: "dismiss".into(),
            title: "Dismiss".into(),
            ..Default::default()
        })
        .show()
        .unwrap_or_else(|e| {
            tracing::warn!(error = %e, "Failed to show notification");
        });
}
```

### Action Handling

```rust
app.handle().plugin(
    tauri_plugin_notification::init()
        .action_handler(|app, action| {
            let alarm_id = action.notification_id;
            match action.action_id.as_str() {
                "snooze" => snooze_alarm_by_id(app, &alarm_id),
                "dismiss" => dismiss_alarm_by_id(app, &alarm_id),
                _ => {}
            }
        })
)?;
```

### Notification Action Behavior

| Action | What Happens |
|--------|-------------|
| **Snooze** | `NextFireTime = now + SnoozeDurationMin`, `SnoozeCount++` in SnoozeState — alarm fires again later (see `04-snooze-system.md`) |
| **Dismiss** | Soft-delete or mark as fired — `AlarmEvents` row with `Type = AlarmEventType::Dismissed` |
| **Ignored** (notification closed) | Alarm remains enabled — fires again on next poll cycle if `NextFireTime` still past |

### macOS Permission

- First notification triggers macOS permission prompt
- If denied: app falls back to in-app overlay (webview-based)
- User can re-enable in **System Settings → Notifications → Alarm App**

---

## 8. Auto-Start / Login Item Registration

### How It Works

`tauri-plugin-autostart` registers the Tauri app as a **macOS Login Item**. This is the macOS equivalent of a Windows Service set to "Automatic" startup.

### Sequence

1. User enables "Auto-start" in settings
2. Rust core calls `autostart::enable()`
3. The plugin registers the app as a Login Item via macOS APIs
4. On next login, macOS automatically launches Alarm App
5. Alarm App starts with `LSUIElement = true` (no dock icon), only the tray icon appears
6. The polling loop begins immediately

### Rust Implementation

```rust
use tauri_plugin_autostart::MacosLauncher;

// In main.rs setup
app.handle().plugin(
    tauri_plugin_autostart::init(
        MacosLauncher::LaunchAgent,
        Some(vec!["--hidden"]),
    )
)?;

#[tauri::command]
async fn set_auto_start(app: AppHandle, is_enabled: bool) -> Result<(), String> {
    let autostart = app.autolaunch();
    if is_enabled {
        autostart.enable().map_err(|e| e.to_string())?;
    } else {
        autostart.disable().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn get_auto_start_status(app: AppHandle) -> Result<bool, String> {
    app.autolaunch().is_enabled().map_err(|e| e.to_string())
}
```

### macOS Login Item Details

| Aspect | Detail |
|--------|--------|
| Mechanism | `LaunchAgent` plist in `~/Library/LaunchAgents/` |
| Trigger | User login (not system boot — macOS does not support user-space boot services) |
| Visibility | `LSUIElement = true` → no dock icon |
| User control | System Settings → General → Login Items → Alarm App toggle |
| Removal | Disabling in settings calls `autostart.disable()` which removes the LaunchAgent |

---

## 9. Wake / Sleep Handling

### Why This Matters

Desktop computers sleep, shut down, and resume. If a user set an alarm for 7:00 AM but the computer was asleep from 6:00 AM to 9:00 AM, the alarm must not be silently lost.

### Strategy

1. **On system sleep** (`NSWorkspace.willSleepNotification`):
   - Log the sleep timestamp
   - Polling loop pauses naturally (tokio timer freezes during sleep)

2. **On system wake** (`NSWorkspace.didWakeNotification`):
   - Immediately query all alarms where `NextFireTime < now AND IsEnabled = 1 AND DeletedAt IS NULL`
   - Fire "missed alarm" notifications for each
   - Log as `Type = AlarmEventType::Missed` in AlarmEvents
   - Polling loop resumes automatically

3. **On app launch** (cold start after shutdown):
   - Same missed alarm check as wake
   - Catches alarms missed during complete shutdown

### Rust Implementation

> **Note:** Uses `objc2` (pinned at `=0.5.2` — see `10-dependency-lock.md`). Do NOT use the deprecated `cocoa` or `objc` crates.

```rust
use objc2::runtime::NSObject;
use objc2_foundation::{NSNotificationCenter, NSNotificationName};
use objc2_app_kit::NSWorkspace;

fn register_wake_sleep_handlers(app_handle: AppHandle) {
    // Register for NSWorkspace.didWakeNotification
    // Using objc2 0.5.x API — see 10-dependency-lock.md for pin rationale
    //
    // On wake callback:
    //   check_missed_alarms(app_handle, db)
    //
    // Implementation uses NSNotificationCenter observer pattern
    // Pin objc2 at =0.5.2 — v0.6.x restructures module hierarchy
}

async fn check_missed_alarms(app: &AppHandle, db: &Connection) {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;
    
    let missed = db.prepare(
        "SELECT * FROM Alarms WHERE IsEnabled = 1 AND NextFireTime < ?1 AND DeletedAt IS NULL"
    ).unwrap()
    .query_map([now], |row| { /* map to Alarm */ })
    .unwrap();
    
    for alarm in missed {
        fire_missed_alarm_notification(app, &alarm);
        app.emit("alarm-missed", &alarm).unwrap();
    }
}
```

### Guarantee

> If the computer was off from 6:00 AM to 9:00 AM and an alarm was set for 7:00 AM, the user sees a "Missed Alarm: 7:00 AM — [label]" notification immediately at 9:00 AM when the computer wakes.

### Platform-Specific Wake/Sleep APIs

| Platform | Sleep Event | Wake Event |
|----------|-------------|------------|
| **macOS** | `NSWorkspace.willSleepNotification` | `NSWorkspace.didWakeNotification` |
| Windows (future) | `WM_POWERBROADCAST` / `PBT_APMSUSPEND` | `PBT_APMRESUMEAUTOMATIC` |
| Linux (future) | `systemd-logind` `PrepareForSleep(true)` | `PrepareForSleep(false)` |

---

## 10. Interval Check Service

### Overview

A separate service within the Rust core that monitors external URLs at configured intervals. This runs independently from the main 30-second alarm polling loop.

### How It Works

1. On startup, query all `IntervalCheck` type alarms
2. For each, spawn a dedicated `tokio` task with the configured interval
3. Each task performs HTTP GET via `reqwest` and evaluates the condition
4. When condition is met → fire notification
5. When an interval-check alarm is created/deleted, start/stop the corresponding task

### Conditions

| Condition | Behavior |
|-----------|----------|
| `StatusCodeChange` | Stores last HTTP status code in memory; fires when it changes |
| `KeywordFound` | Scans response body; fires when keyword appears |

### Resource Management

- Each interval-check alarm = one `tokio` task + one `reqwest` call per interval
- Last-known state stored in `Arc<Mutex<HashMap<String, LastCheckResult>>>` (memory only, not DB)
- Failed HTTP requests are logged and skipped — no notification for network errors

---

## 11. Rust Module Structure

```
src-tauri/src/
  main.rs                   — Tauri app entry point, plugin & command registration
  lib.rs                    — Module declarations
  engine/
    polling.rs              — 30s polling loop (tokio::spawn + tokio::time::interval)
    scheduler.rs            — Next-alarm calculation for recurring alarms
    interval_checker.rs     — HTTP polling for interval-check alarms (reqwest)
    wake_handler.rs         — Sleep/wake event listener, missed alarm recovery
  storage/
    db.rs                   — SQLite connection pool (rusqlite), migrations, queries
  notifications/
    mod.rs                  — Notification dispatch via tauri-plugin-notification
  tray/
    mod.rs                  — System tray setup, click handler, badge management
```

> **Note:** `commands/` (IPC handlers for alarm CRUD) and `storage/models.rs` (Rust structs) are part of the alarm app codebase, not this service-layer spec. See `../02-features/01-alarm-crud.md` and `01-data-model.md`.

### Cargo.toml Dependencies (Service-Related)

> **All versions must use exact pins (`=x.y.z`).** See `10-dependency-lock.md` for the complete list with API surface documentation and breaking change notes.

```toml
[dependencies]
tauri = { version = "=2.10.3", features = ["tray-icon"] }
tauri-plugin-notification = "=2.3.3"
tauri-plugin-autostart = "=2.5.1"
rusqlite = { version = "=0.32.1", features = ["bundled"] }
tokio = { version = "=1.51.1", features = ["full"] }
chrono = { version = "=0.4.44", features = ["serde"] }
reqwest = { version = "=0.12.12", features = ["json", "rustls-tls"], default-features = false }
objc2 = "=0.5.2"                # macOS wake/sleep NSWorkspace notifications
```

---

## 12. Tauri Configuration

### `tauri.conf.json` (Service-Relevant Settings)

```json
{
  "productName": "Alarm App",
  "version": "1.0.0",
  "identifier": "com.alarmdaemon.app",
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "Alarm App",
        "width": 420,
        "height": 600,
        "visible": false,
        "decorations": false,
        "resizable": false,
        "skipTaskbar": true,
        "alwaysOnTop": true
      }
    ],
    "trayIcon": {
      "iconPath": "icons/tray-icon.png",
      "iconAsTemplate": true
    },
    "security": {
      "csp": "default-src 'self'; script-src 'self'"
    }
  },
  "bundle": {
    "active": true,
    "targets": ["app", "dmg"],
    "macOS": {
      "minimumSystemVersion": "10.15"
    }
  },
  "plugins": {
    "notification": { "enabled": true },
    "autostart": { "enabled": true }
  }
}
```

### Info.plist Additions

```xml
<!-- Hide dock icon — app is tray-only -->
<key>LSUIElement</key>
<true/>
```

---

## 13. Deployment & Packaging

### Build Process

```bash
cargo tauri build
cargo tauri build --target aarch64-apple-darwin   # Apple Silicon
cargo tauri build --target x86_64-apple-darwin    # Intel Mac
```

### Output

| Artifact | Description |
|----------|-------------|
| `Alarm App.app` | macOS application bundle (self-contained, ~5-10 MB) |
| `Alarm App.dmg` | macOS disk image installer (optional, requires code signing) |

### Database Location

```
~/Library/Application Support/Alarm App/alarm-app.db
```

This persists across app updates and is not deleted when the app is removed (user data preservation).

### Installation Flow

1. User downloads `Alarm App.app` (or `.dmg`)
2. Drags to `/Applications/` (or double-clicks `.dmg`)
3. First launch: right-click → Open to bypass Gatekeeper (unsigned app)
4. App appears in menu bar as 🔔
5. User enables "Auto-start" in settings → launches automatically on next login

---

## 14. Technical Constraints & Edge Cases

### Constraints

1. **Lovable sandbox**: Tauri cannot run in the Lovable preview. The React UI is developed in-browser using a mock IPC client. Tray, notifications, and SQLite only work when built locally.
2. **No backend server**: Everything is local. No cloud, no network dependency (except interval-check alarms).
3. **macOS-first**: Tray, notification actions, and Login Items are macOS-specific. Windows/Linux support is deferred.
4. **Code signing**: macOS Gatekeeper blocks unsigned apps. For personal use: right-click → Open. For distribution: Apple Developer ID required.
5. **Rust toolchain**: Building requires `rustup` + `cargo`. Trade-off: ~5-10 MB binary vs Electron's ~150-200 MB.
6. **Notification actions**: Require macOS 10.15+ (`UNUserNotificationCenter`).

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| Computer was asleep when alarm was due | On wake, missed alarm detected and notification fired immediately |
| Multiple alarms due at the same time | Each gets its own notification, fired sequentially |
| User reaches snooze limit | Snooze button hidden/disabled after `MaxSnoozeCount` reached (default 3) — see `04-snooze-system.md` |
| Database file is corrupted | `rusqlite` error → create new database; old data lost (v1) |
| App is force-quit | `tauri-plugin-autostart` restarts on next login; alarms persist in SQLite |
| Notification permission denied | Fall back to in-app overlay in webview |
| Interval check URL unreachable | Log error, skip cycle, retry on next interval |

---

## 15. Platform Notes (Windows & Linux)

> These are future considerations. macOS is the primary target for v1.

### Windows

| Feature | Implementation |
|---------|---------------|
| Auto-start | Registry key `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` (via `tauri-plugin-autostart`) |
| System tray | Windows system tray icon (built into Tauri) |
| Wake/sleep | `WM_POWERBROADCAST` / `PBT_APMRESUMEAUTOMATIC` |
| Notifications | Windows Toast Notifications (via Tauri) |
| Packaging | `.msi` installer via `cargo tauri build` |

### Linux

| Feature | Implementation |
|---------|---------------|
| Auto-start | XDG autostart (`~/.config/autostart/Alarm App.desktop`) (via `tauri-plugin-autostart`) |
| System tray | AppIndicator or StatusNotifierItem (DE-dependent) |
| Wake/sleep | `systemd-logind` `PrepareForSleep` D-Bus signal |
| Notifications | libnotify / D-Bus notifications (via Tauri) |
| Packaging | `.AppImage` or `.deb` via `cargo tauri build` |

---

## 16. Glossary

| Term | Definition |
|------|------------|
| **Background Service** | A process that runs continuously without a visible UI, performing scheduled work. Alarm App's Rust core is the service. |
| **System Tray** | A small icon in the macOS menu bar (top-right). Alarm App uses a bell icon (🔔). Built via `tauri::tray::TrayIconBuilder`. |
| **Login Item** | A macOS feature that launches specified apps automatically when the user logs in. Managed by `tauri-plugin-autostart`. |
| **LaunchAgent** | A macOS plist file in `~/Library/LaunchAgents/` that registers a per-user background process. Used by `tauri-plugin-autostart`. |
| **LSUIElement** | An `Info.plist` key that hides the app from the Dock. Set to `true` for tray-only apps. |
| **Polling Loop** | A `tokio::time::interval` task that periodically checks the database for due alarms (every 30 seconds). |
| **Rust Core** | The Rust process compiled into the Tauri binary. Has full OS access. Contains the polling engine, SQLite, and notification logic. |
| **Webview** | The sandboxed browser environment that runs the React UI inside a WebviewWindow (WKWebView on macOS). |
| **IPC** | Inter-Process Communication. Tauri's `invoke()` (webview → Rust) and `emit()` (Rust → webview) system. |
| **Missed Alarm** | An alarm whose `NextFireTime` passed while the computer was asleep or off. Detected on wake/launch and surfaced immediately. |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Data Model & Schema | `01-data-model.md` |
| Platform Constraints | `04-platform-constraints.md` |
| Platform Strategy | `05-platform-strategy.md` |
| Tauri Architecture | `06-tauri-architecture-and-framework-comparison.md` |
| Alarm Firing Feature | `../02-features/03-alarm-firing.md` |
| Snooze System | `../02-features/04-snooze-system.md` |
| Sound & Vibration | `../02-features/05-sound-and-vibration.md` |

---

*OS Service Layer Specification v2.3.0 — updated: 2026-04-11*
