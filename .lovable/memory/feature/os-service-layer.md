---
name: OS Service Layer
description: AlarmDaemon background service spec — auto-start, 30s polling, tray icon, notifications, wake/sleep recovery, macOS LaunchAgent
type: feature
---

AlarmDaemon must behave like a Windows Service on macOS:
- Auto-start on login via `tauri-plugin-autostart` (LaunchAgent)
- No dock icon (`LSUIElement = true`), tray-only presence
- 30-second tokio polling loop queries SQLite for due alarms (aligned with 03-alarm-firing.md)
- Query pattern: `WHERE IsEnabled = 1 AND NextFireTime <= now AND DeletedAt IS NULL`
- Index: `IdxAlarms_NextFireTime ON Alarms(NextFireTime) WHERE IsEnabled = 1 AND DeletedAt IS NULL`
- Native notifications via `tauri-plugin-notification` with Snooze/Dismiss actions
- Notification templates aligned with `03-alarm-firing.md` (canonical source)
- Wake/sleep handling: `NSWorkspace.didWakeNotification` via `objc2 =0.5.2` triggers missed alarm check
- Cold start also checks for missed alarms
- Interval check service: separate tokio tasks for HTTP URL monitoring
- Single process: Rust Core (full OS access) + Webview (sandboxed React UI)
- IPC commands: `set_auto_start`, `get_auto_start_status` (registered in architecture spec)
- Cargo.toml pins match `10-dependency-lock.md`: tauri `=2.10.3`, notification `=2.3.3`
- Spec file: `01-fundamentals/13-os-service-layer.md` v2.3.0
