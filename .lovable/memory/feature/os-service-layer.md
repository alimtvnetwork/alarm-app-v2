---
name: OS Service Layer
description: AlarmDaemon background service spec — auto-start, 800ms polling, tray icon, notifications, wake/sleep recovery, macOS LaunchAgent
type: feature
---

AlarmDaemon must behave like a Windows Service on macOS:
- Auto-start on login via `tauri-plugin-autostart` (LaunchAgent)
- No dock icon (`LSUIElement = true`), tray-only presence
- 800ms tokio polling loop queries SQLite for due alarms
- Native notifications via `tauri-plugin-notification` with Snooze/Dismiss actions
- Wake/sleep handling: `NSWorkspace.didWakeNotification` triggers missed alarm check
- Cold start also checks for missed alarms
- Interval check service: separate tokio tasks for HTTP URL monitoring
- Single process: Rust Core (full OS access) + Webview (sandboxed React UI)
- DB index required: `IdxAlarmsStatusDue ON Alarms(Status, DueTime)`
- Spec file: `01-fundamentals/13-os-service-layer.md`
