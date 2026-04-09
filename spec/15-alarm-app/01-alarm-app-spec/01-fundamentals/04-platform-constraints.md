# Platform Constraints

**Version:** 1.2.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** None  
**Resolves:** BE-ERROR-001

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

## Error Handling Strategy

> **Resolves BE-ERROR-001.** Defines what happens when things go wrong. Without this, AI will implement happy-path-only code.

### Error → Behavior Mapping

| # | Error | Severity | Behavior | Fallback |
|---|-------|----------|----------|----------|
| E1 | SQLite write failure | High | Retry once after 500ms. If still fails → show toast "Failed to save — try again" | Operation cancelled, no data loss (read-only state) |
| E2 | SQLite read failure | High | Show toast "Could not load data". Retry on next user action | UI shows stale cached data if available |
| E3 | Audio file not found | Medium | Fall back to built-in `classic-beep`. Show "⚠ Sound file missing" in overlay | Alarm still fires with default sound |
| E4 | Audio playback failure | Medium | Log error. Show overlay without audio. Dispatch OS notification with sound | User still sees overlay + notification |
| E5 | IPC timeout (>5s) | Medium | Cancel operation. Show toast "Operation timed out — try again" | No state change |
| E6 | Corrupt database | Critical | Run `PRAGMA integrity_check`. If fails → backup DB to `alarm-app.db.backup.{timestamp}`, create fresh DB, run migrations | User loses data but gets clean start |
| E7 | Migration failure | Critical | App refuses to start. Show native error dialog: "Database update failed. [Reset Database] [Exit]" | "Reset Database" backs up + recreates |
| E8 | Notification permission denied | Low | Fall back to in-app overlay only. Show one-time hint: "Enable notifications in System Settings for alerts when app is minimized" | Overlay still works |
| E9 | Tray init failure | Low | Log error, continue without tray. App works normally but can't minimize to tray | Window-only mode |
| E10 | Network failure (updater) | Low | Silently skip update check. Retry on next app launch | App continues on current version |
| E11 | Custom sound file too large (>10MB) | Low | Reject with toast "Sound file must be under 10MB" | User selects different file |
| E12 | Timezone detection failure | Medium | Fall back to UTC. Log warning. Show toast "Could not detect timezone" | Alarms fire on UTC time |

### Error Handling Implementation Rules

1. **Never crash silently.** Every error must either show a user-visible message or be logged at `WARN`/`ERROR` level
2. **Never lose alarm data.** SQLite write errors must not corrupt existing rows. Use transactions for multi-step operations
3. **Always have a fallback.** Every feature must degrade gracefully — no feature failure should prevent alarms from firing
4. **Retry before failing.** Transient errors (disk I/O, IPC) get one retry with a short delay
5. **Log everything.** All errors logged with context: `tracing::error!(alarm_id = %id, error = %e, "Failed to play audio")`

### Rust Error Type

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AlarmAppError {
    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),

    #[error("Audio playback failed: {0}")]
    Audio(String),

    #[error("IPC timeout after {timeout_ms}ms")]
    IpcTimeout { timeout_ms: u64 },

    #[error("File not found: {path}")]
    FileNotFound { path: String },

    #[error("Migration failed: {0}")]
    Migration(String),

    #[error("Notification permission denied")]
    NotificationDenied,
}
```

### Frontend Error Handling

```typescript
// All IPC calls wrapped with timeout + error toast
async function safeInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T | null> {
  try {
    const result = await Promise.race([
      invoke<T>(command, args),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ]);
    return result;
  } catch (error) {
    toast.error(getErrorMessage(error));
    console.error(`IPC ${command} failed:`, error);
    return null;
  }
}
```

### Critical Path Protection

The alarm firing path has **zero tolerance for unhandled errors**. The engine loop must never stop:

```rust
// alarm_engine.rs — main loop
loop {
    match self.check_and_fire_alarms().await {
        Ok(_) => {},
        Err(e) => {
            tracing::error!(error = %e, "Alarm engine tick failed — continuing");
            // NEVER break the loop. Log and continue.
        }
    }
    tokio::time::sleep(Duration::from_secs(30)).await;
}
```

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
| Startup Sequence | `./07-startup-sequence.md` |
| Alarm Firing Feature | `../02-features/03-alarm-firing.md` |
| Sound & Vibration Feature | `../02-features/05-sound-and-vibration.md` |
| App Issues | `../03-app-issues/03-backend-issues.md` → BE-ERROR-001 |
