# Platform Constraints

**Version:** 1.1.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`platform`, `constraints`, `native`, `audio`, `notifications`, `storage`, `cross-platform`

---

## Purpose

Documents platform-specific constraints and mitigations for the Alarm App as a cross-platform native application built with Tauri 2.x. Replaces the previous web-api-constraints document.

---

## Constraints & Mitigations

### Background Execution

| Issue | Detail |
|-------|--------|
| **Problem** | The alarm engine must run reliably even when the app window is minimized or unfocused. |
| **Mitigation** | Rust backend runs a dedicated background thread with a **30-second check interval**. Not subject to browser tab throttling. Snooze expiry uses exact `tokio::time::sleep_until()` — no polling. |
| **macOS** | App remains active via `LSBackgroundOnly` or system tray presence. May require "Background App Refresh" entitlement for future mobile. |
| **Future (mobile)** | iOS/Android require platform-specific background task APIs (BGTaskScheduler, AlarmManager). |

### Audio Playback

| Issue | Detail |
|-------|--------|
| **Problem** | Audio must play reliably when alarm fires, regardless of app focus state. |
| **Mitigation** | Rust-side audio playback using native audio APIs (e.g., `rodio` crate). Not dependent on WebView focus. |
| **macOS** | Core Audio via `rodio`. Audio session category must be set for alarm-type playback. |
| **Platform differences** | Each OS has different audio session/focus APIs. Abstract behind a common Rust trait. |

### Notifications

| Issue | Detail |
|-------|--------|
| **Problem** | OS notifications require app authorization. Behavior varies by platform. |
| **Mitigation** | Use Tauri notification plugin. Request permission on first alarm creation. Fall back to in-app overlay if denied. |
| **macOS** | UNUserNotificationCenter. User can disable in System Settings. |
| **Future (mobile)** | iOS requires explicit permission prompt. Android 13+ requires POST_NOTIFICATIONS permission. |

### System Tray / Menu Bar

| Issue | Detail |
|-------|--------|
| **Problem** | Keeps app accessible without a visible window. Behavior differs by OS. |
| **Mitigation** | Tauri tray plugin. Show next alarm time, quick toggle, and quit option. |
| **macOS** | Menu bar icon (NSStatusItem). Supports click and right-click menus. |
| **Windows** | System tray icon. Supports balloon notifications. |
| **Linux** | AppIndicator or StatusNotifierItem. Support varies by DE. |

### Storage

| Issue | Detail |
|-------|--------|
| **Problem** | Data must persist across app restarts. No cloud dependency. |
| **Mitigation** | SQLite database stored in OS app data directory. Managed via Tauri SQL plugin. |
| **macOS** | `~/Library/Application Support/com.alarmapp/` |
| **Windows** | `%APPDATA%/com.alarmapp/` |
| **Linux** | `~/.local/share/com.alarmapp/` |

### Vibration / Haptics

| Issue | Detail |
|-------|--------|
| **Problem** | Desktop platforms have no vibration motor. |
| **Mitigation** | Vibration toggle hidden on desktop. Enabled on mobile (iOS Taptic Engine, Android vibration API). Feature-detected at runtime. |

### Auto-Update

| Issue | Detail |
|-------|--------|
| **Problem** | Users need to receive updates without manually downloading. |
| **Mitigation** | Tauri updater plugin with signed updates. Check on app launch. |
| **macOS** | Sparkle-compatible update flow. Requires code signing + notarization. |

### Wake / Sleep Handling

| Issue | Detail |
|-------|--------|
| **Problem** | System sleep may cause the alarm engine to miss fire times. |
| **Mitigation** | On wake, immediately check if any alarm was missed during sleep. Fire missed alarms with a "missed" indicator. Optionally prevent sleep via power management API when alarm is imminent (within 5 minutes). |

---

## Platform Support Matrix

| Feature | macOS | Windows | Linux | iOS | Android |
|---------|:---:|:---:|:---:|:---:|:---:|
| Alarm engine (background) | ✅ | ✅ | ✅ | ⚠️ Limited | ⚠️ Limited |
| Native audio | ✅ | ✅ | ✅ | ✅ | ✅ |
| OS notifications | ✅ | ✅ | ✅ | ✅ | ✅ |
| System tray / menu bar | ✅ | ✅ | ⚠️ DE-dependent | ❌ | ❌ |
| Haptic vibration | ❌ | ❌ | ❌ | ✅ | ✅ |
| Auto-update | ✅ | ✅ | ✅ | App Store | Play Store |
| SQLite storage | ✅ | ✅ | ✅ | ✅ | ✅ |
| Wake lock / prevent sleep | ✅ | ✅ | ⚠️ Varies | ✅ | ✅ |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Platform Strategy | `./05-platform-strategy.md` |
| Alarm Firing Feature | `../02-features/03-alarm-firing.md` |
| Sound & Vibration Feature | `../02-features/05-sound-and-vibration.md` |
