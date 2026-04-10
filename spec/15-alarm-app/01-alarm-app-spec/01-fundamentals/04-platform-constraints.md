# Platform Constraints

**Version:** 1.4.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** None  
**Resolves:** BE-ERROR-001, FE-RENDER-001, PERF-MEMORY-001

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

    #[error("Invalid sound format: {0}")]
    InvalidSoundFormat(String),

    #[error("Symlink rejected: custom sounds must not be symlinks")]
    SymlinkRejected,

    #[error("Sound file too large: {size_bytes} bytes (max {max_bytes})")]
    SoundFileTooLarge { size_bytes: u64, max_bytes: u64 },

    #[error("Restricted path: cannot use files from system directories")]
    RestrictedPath,

    #[error("Concurrent modification: row was changed by another operation")]
    ConcurrentModification,

    #[error("Invalid alarm data: {0}")]
    Validation(String),

    #[error("Export/import failed: {0}")]
    ExportImport(String),
}
```

### IPC Error Response Format

> **Resolves P14-019.** Defines the error envelope returned from all IPC commands so the frontend handles errors consistently.

**Tauri IPC Error Convention:** When a Tauri command returns `Result<T, E>` where `E: Serialize`, the error is serialized to the frontend as a string (the `Display` output). Tauri wraps this in a rejected promise.

```typescript
// Frontend: All IPC errors arrive as rejected promises with a string message.
// The safeInvoke wrapper (below) catches these and shows user-friendly toasts.

interface IpcError {
  Message: string;       // Human-readable error from AlarmAppError::Display
  Code: string;          // Error variant name for programmatic handling (e.g., "FileNotFound")
}
```

**Rust IPC Error Serialization:**

```rust
use serde::Serialize;

/// Wrapper that serializes AlarmAppError into a structured IPC error.
/// Tauri commands should return Result<T, IpcErrorResponse>.
#[derive(Serialize)]
pub struct IpcErrorResponse {
    #[serde(rename = "Message")]
    pub message: String,
    #[serde(rename = "Code")]
    pub code: String,
}

impl From<AlarmAppError> for IpcErrorResponse {
    fn from(err: AlarmAppError) -> Self {
        Self {
            message: err.to_string(),
            code: error_code(&err),
        }
    }
}

/// Map error variant to a stable string code for frontend matching.
fn error_code(err: &AlarmAppError) -> String {
    match err {
        AlarmAppError::Database(_) => "Database",
        AlarmAppError::Audio(_) => "Audio",
        AlarmAppError::IpcTimeout { .. } => "IpcTimeout",
        AlarmAppError::FileNotFound { .. } => "FileNotFound",
        AlarmAppError::Migration(_) => "Migration",
        AlarmAppError::NotificationDenied => "NotificationDenied",
        AlarmAppError::InvalidSoundFormat(_) => "InvalidSoundFormat",
        AlarmAppError::SymlinkRejected => "SymlinkRejected",
        AlarmAppError::SoundFileTooLarge { .. } => "SoundFileTooLarge",
        AlarmAppError::RestrictedPath => "RestrictedPath",
        AlarmAppError::ConcurrentModification => "ConcurrentModification",
        AlarmAppError::Validation(_) => "Validation",
        AlarmAppError::ExportImport(_) => "ExportImport",
    }.to_string()
}
```

**Frontend Error Display Rules:**

| Error Code | Toast Type | User Message |
|-----------|-----------|-------------|
| `Database` | Error | "Failed to save — try again" |
| `Audio` | Warning | "Could not play sound — using default" |
| `IpcTimeout` | Error | "Operation timed out — try again" |
| `FileNotFound` | Warning | "Sound file missing — using default" |
| `Validation` | Warning | Show `Message` directly (contains field-specific detail) |
| `SoundFileTooLarge` | Warning | "Sound file must be under 10MB" |
| Other | Error | Show `Message` directly |



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
const ALARM_CHECK_INTERVAL_SECS: u64 = 30;

// alarm_engine.rs — main loop
loop {
    match self.check_and_fire_alarms().await {
        Ok(_) => {},
        Err(e) => {
            tracing::error!(error = %e, "Alarm engine tick failed — continuing");
            // NEVER break the loop. Log and continue.
        }
    }
    tokio::time::sleep(Duration::from_secs(ALARM_CHECK_INTERVAL_SECS)).await;
}
```

---

## WebView CSS Compatibility (Resolves FE-RENDER-001)

> CSS features behave differently across Safari WebKit (macOS), WebView2/Chromium (Windows), and WebKitGTK (Linux). Without a compatibility strategy, UI will break on at least one platform.

### WebView Engine Matrix

| Platform | Engine | CSS Notes |
|----------|--------|-----------|
| macOS | Safari WebKit (system version) | `backdrop-filter` supported. `gap` in flexbox supported since Safari 14.1 |
| Windows | WebView2 (Chromium-based) | Full modern CSS support. Evergreen auto-updates |
| Linux | WebKitGTK (distro version) | **Most restrictive.** May be WebKitGTK 2.38+ (varies by distro). `backdrop-filter` may be missing |

### CSS Compatibility Rules

1. **Feature detection with `@supports`:**
   ```css
   /* Frosted glass effect with fallback */
   .overlay-backdrop {
     background: hsl(var(--background) / 0.95);  /* Solid fallback */
   }
   @supports (backdrop-filter: blur(12px)) {
     .overlay-backdrop {
       background: hsl(var(--background) / 0.7);
       backdrop-filter: blur(12px);
     }
   }
   ```

2. **Avoid cutting-edge CSS:** No `container-queries`, `@layer`, `color-mix()`, `light-dark()`. These may not be available on older WebKitGTK versions.

3. **Safe CSS features (use freely):** Flexbox, Grid, CSS custom properties, `calc()`, `clamp()`, `aspect-ratio`, `gap` (flex/grid), transitions, animations, `prefers-color-scheme`.

4. **Create `platform.css`** for WebView-specific overrides:
   ```css
   /* src/platform.css — loaded conditionally based on detected platform */
   /* Linux WebKitGTK fallbacks */
   .platform-linux .frosted-panel {
     background: hsl(var(--background) / 0.95);
     /* No backdrop-filter */
   }
   ```

5. **CI testing:** Test on all 3 WebView engines. Add to CI matrix (see `08-devops-setup-guide.md`).

---

## Memory Budget (Resolves PERF-MEMORY-001)

> WebView2 alone uses ~80–120MB on Windows. The original 150MB NFR is unrealistic.

### Revised Memory Targets

| Component | Idle Memory | Notes |
|-----------|-------------|-------|
| WebView (Chromium/WebKit) | 80–120 MB | Outside app control |
| Rust runtime + engine | ~5 MB | Alarm engine + tokio |
| SQLite (in-memory cache) | ~2 MB | WAL + page cache |
| Audio (rodio) | ~1 MB (idle) | Sink allocated only when playing |
| React app bundle | ~10 MB | Parsed JS + DOM |
| **Total (idle)** | **~100–140 MB** | |

**Revised NFR:** **200 MB idle target** (up from 150 MB). This accounts for WebView overhead which is outside application control.

### Memory Optimization Strategies

1. **Lazy-load React routes:** `React.lazy()` for Settings, History, Analytics pages. Only AlarmList loads on startup
2. **Dispose audio sink:** Release `rodio::Sink` after alarm dismissal, not at app start
3. **Limit `AlarmEvents` in memory:** Paginate history view (50 per page), don't load all into React state
4. **WebView when minimized to tray:** Call `webview.hide()` (keeps process but reduces active memory) — do NOT destroy WebView (re-creation is expensive)

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
| backdrop-filter CSS | ✅ | ✅ | ⚠️ Distro-dependent | ✅ | ✅ |

---

## Cross-References
---

## Code Pattern Exemptions

> These patterns are exempt from the no-negation and no-`expect()` rules.

| Pattern | Context | Reason |
|---------|---------|--------|
| `expect()` in startup Steps 1–3 | App data dir, DB open | Startup-critical — app cannot function without these. Marked `FATAL:` |
| `.expect("mutex poisoned")` | `Mutex::lock()` | Thread panicked while holding lock — unrecoverable. Idiomatic Rust. |
| `assert!(!expr)` | Rust test assertions | Idiomatic test pattern. Exempt from boolean P3. |
| `.not.toBeVisible()` | Playwright/Jest matchers | Framework API negation. Exempt from boolean P3. |
| `row.get() != 0` | SQLite INTEGER → bool | Database boolean conversion idiom. Exempt from no-negation. |
| `!args.start` (D-Bus) | `PrepareForSleep` signal | External protocol value — extract to `let is_waking = !args.start;` |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Platform Strategy | `./05-platform-strategy.md` |
| Startup Sequence | `./07-startup-sequence.md` |
| Alarm Firing Feature | `../02-features/03-alarm-firing.md` |
| Sound & Vibration Feature | `../02-features/05-sound-and-vibration.md` |
| App Issues | `../03-app-issues/03-backend-issues.md` → BE-ERROR-001 |
| Frontend Issues | `../03-app-issues/02-frontend-issues.md` → FE-RENDER-001 |
| Performance Issues | `../03-app-issues/06-performance-issues.md` → PERF-MEMORY-001 |
