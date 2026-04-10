# File Structure

**Version:** 1.4.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** None  
**Resolves:** DEVOPS-PERM-001, DEVOPS-CARGO-001, FE-I18N-001

---

## Keywords

`file-structure`, `components`, `hooks`, `organization`, `tauri`, `rust`

---

## Purpose

Defines the source code file organization for the Alarm App (Tauri 2.x).

---

## Structure

```
src/                          — Frontend (React + TypeScript)
  types/
    alarm.ts                  — Alarm, AlarmGroup, AlarmSound interfaces

  hooks/
    useAlarms.ts              — CRUD, toggle, group toggle, SQLite sync via Tauri IPC
    useTheme.ts               — Theme state + settings table + class toggle
    useAlarmFiring.ts         — Listen for Rust alarm-fired events, trigger overlay
    useClock.ts               — Current time state, updated every second

  components/
    AnalogClock.tsx           — SVG clock face with hour/minute/second hands
    DigitalClock.tsx          — Time + date display
    AlarmList.tsx             — Grouped alarm list with toggles
    AlarmForm.tsx             — Create/edit alarm dialog
    AlarmGroupForm.tsx        — Group create/rename dialog
    AlarmOverlay.tsx          — Full-screen firing overlay (dismiss/snooze)
    ThemeToggle.tsx           — Sun/moon icon button
    ExportImport.tsx          — Export button + import via native file dialog
    AlarmCountdown.tsx        — "Alarm in X hours Y minutes" display

  pages/
    Index.tsx                 — Main layout combining all components

  lib/
    tauri-commands.ts         — Typed wrappers for Tauri invoke() calls
    db.ts                     — Frontend DB query helpers

  i18n/                       — Internationalization (Resolves FE-I18N-001)
    index.ts                  — i18next initialization + language detection
    locales/
      en.json                 — English strings (default)
      ms.json                 — Malay strings
      zh.json                 — Chinese strings (future)

  assets/
    sounds/                   — Built-in alarm tone audio files

  test/
    setup.ts                  — Vitest + Testing Library setup
    fixtures.ts               — Test data factories

src-tauri/                    — Backend (Rust)
  src/
    main.rs                   — Tauri app entry point, plugin registration
    lib.rs                    — Module declarations
    commands/
      alarm.rs                — Alarm CRUD commands (IPC handlers)
      audio.rs                — Audio playback commands
      settings.rs             — Settings read/write commands
      export_import.rs        — File export/import commands
    engine/
      alarm_engine.rs         — Background alarm checking thread
      scheduler.rs            — Next-alarm calculation, recurring logic
      wake_listener/
        mod.rs                — WakeListener trait + factory
        macos.rs              — NSWorkspace implementation
        windows.rs            — WM_POWERBROADCAST implementation
        linux.rs              — systemd-logind D-Bus implementation
    audio/
      player.rs               — Native audio playback (platform-specific)
      gradual_volume.rs       — Volume fade-in logic
      platform_macos.rs       — macOS audio session config (BE-AUDIO-003)
    storage/
      db.rs                   — SQLite connection + migrations (via `refinery` crate)
      models.rs               — Rust structs matching DB schema (AlarmRow etc.)
    notifications/
      mod.rs                  — OS notification dispatch
    tray/
      mod.rs                  — System tray / menu bar setup

  tauri.conf.json             — App config, permissions, window settings
  Cargo.toml                  — Rust dependencies
  migrations/                 — SQLite migration files (numbered SQL, managed by `refinery`)
    V1__initial_schema.sql    — Tables: Alarms, AlarmGroups, Settings, SnoozeState, AlarmEvents
    V2__*.sql                 — Future schema changes (sequential numbering)
  icons/                      — App icons (macOS .icns, Windows .ico, etc.)
  tests/                      — Rust integration tests
    alarm_commands.rs         — IPC handler tests with in-memory SQLite
```

---

## i18n Enforcement (Resolves FE-I18N-001)

> Without enforcement, AI will hardcode strings in JSX. i18n must be a structural requirement, not optional.

### Library: `react-i18next` + `i18next`

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: 'en',  // Read from Settings table on startup
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
```

### ESLint Enforcement

Add `eslint-plugin-i18next` to prevent hardcoded strings in JSX:

```json
// .eslintrc.json (relevant rules)
{
  "plugins": ["i18next"],
  "rules": {
    "i18next/no-literal-string": ["warn", {
      "markupOnly": true,
      "ignoreAttribute": ["data-testid", "className", "id", "role", "aria-label"],
      "ignore": ["—", "•", "/", "|"]
    }]
  }
}
```

**Rule:** All user-visible strings must use `t('key')` from `useTranslation()`. Data-testid, class names, and ARIA attributes are exempt.

### Locale File Structure

```json
// src/i18n/locales/en.json
{
  "alarm": {
    "create": "Create Alarm",
    "edit": "Edit Alarm",
    "delete": "Delete",
    "undo": "Undo",
    "toggle_on": "Enabled",
    "toggle_off": "Disabled",
    "snooze": "Snooze ({{remaining}} remaining)",
    "dismiss": "Dismiss",
    "missed": "Missed Alarm",
    "copy_suffix": "(Copy)",
    "empty_state": "No alarms yet. Tap + to create one."
  },
  "group": {
    "ungrouped": "Ungrouped",
    "create": "Create Group",
    "rename": "Rename Group",
    "delete_confirm": "Delete group? Alarms will be moved to Ungrouped."
  },
  "settings": {
    "Theme": "Theme",
    "TimeFormat": "Time Format",
    "Language": "Language",
    "DefaultSound": "Default Sound",
    "EventRetentionDays": "Event History (days)"
  },
  "error": {
    "save_failed": "Failed to save — try again",
    "timeout": "Operation timed out — try again",
    "sound_missing": "Sound file missing — using default"
  }
}
```

---

## Tauri 2.x Capabilities Manifest

> **Resolves DEVOPS-PERM-001.** Tauri 2.x requires an explicit capabilities block. Without it, all plugin calls fail silently at runtime.

Add to `src-tauri/capabilities/default.json`:

```json
{
  "identifier": "default",
  "description": "Main window capabilities for the Alarm App",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:window:default",
    "core:window:allow-close",
    "core:window:allow-set-fullscreen",
    "core:window:allow-set-focus",
    "core:app:default",
    "core:event:default",

    "sql:default",
    "sql:allow-execute",
    "sql:allow-select",

    "notification:default",
    "notification:allow-notify",
    "notification:allow-request-permission",
    "notification:allow-is-permission-granted",

    "dialog:default",
    "dialog:allow-open",
    "dialog:allow-save",
    "dialog:allow-message",
    "dialog:allow-ask",

    "fs:default",
    "fs:allow-read-file",
    "fs:allow-exists",

    "global-shortcut:default",
    "global-shortcut:allow-register",
    "global-shortcut:allow-unregister",

    "tray:default",

    "autostart:default",
    "autostart:allow-enable",
    "autostart:allow-disable",
    "autostart:allow-is-enabled",

    "updater:default",
    "updater:allow-check",
    "updater:allow-download-and-install"
  ]
}
```

### Permission Categories Explained

| Category | Permissions | Purpose |
|----------|-------------|---------|
| Core | `core:default`, `core:window:*`, `core:app:*`, `core:event:*` | Window management, app lifecycle, IPC events |
| Notification | `notification:*` | OS-native alarm notifications |
| Dialog | `dialog:*` | File open/save for import/export, confirmation dialogs |
| Filesystem | `fs:allow-read-file`, `fs:allow-exists` | Custom sound file validation |
| Global Shortcut | `global-shortcut:*` | Keyboard shortcuts (e.g., dismiss alarm) |
| Tray | `tray:default` | System tray icon and menu |
| Autostart | `autostart:*` | Launch on login toggle |
| Updater | `updater:*` | Auto-update check and install |

### Security Notes

- **No `fs:allow-write-file`** — app writes only via SQLite, never direct filesystem writes
- **No `shell:*`** — app must not execute arbitrary commands
- **Scoped `fs` access** — configure `fs` scope in `tauri.conf.json` to restrict readable paths

---

## Cargo.toml Dependencies

> **Resolves DEVOPS-CARGO-001.** All crate versions pinned to prevent incompatible version selection.

```toml
[package]
name = "alarm-app"
version = "1.0.0"
edition = "2021"

[dependencies]
# Tauri core
tauri = { version = "2", features = ["tray-icon", "global-shortcut"] }
tauri-build = { version = "2", features = [] }

# Tauri plugins
rusqlite = { version = "0.31", features = ["bundled"] }
refinery = { version = "0.8", features = ["rusqlite"] }
tauri-plugin-notification = "2"
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
tauri-plugin-autostart = "2"
tauri-plugin-updater = "2"
tauri-plugin-global-shortcut = "2"

# Audio
rodio = "0.19"                    # Cross-platform audio playback

# Date/time
chrono = { version = "0.4", features = ["serde"] }
chrono-tz = "0.10"                # IANA timezone database
croner = "2.0"                    # Cron expression parsing

# Database
refinery = { version = "0.8", features = ["rusqlite"] }  # Migration runner
rusqlite = { version = "0.31", features = ["bundled"] }   # SQLite (bundled)

# Serialization
serde = { version = "1", features = ["derive"] }
serde_json = "1"

# Utilities
uuid = { version = "1", features = ["v4"] }
tokio = { version = "1", features = ["full"] }
tracing = "0.1"                   # Structured logging
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
tracing-appender = "0.2"          # Log file rotation

# Platform-specific (conditional)
[target.'cfg(target_os = "macos")'.dependencies]
objc2 = "0.5"                     # macOS FFI for wake events, audio session

[target.'cfg(target_os = "windows")'.dependencies]
windows = { version = "0.58", features = ["Win32_System_Power"] }

[target.'cfg(target_os = "linux")'.dependencies]
zbus = "4"                        # D-Bus for systemd-logind wake events
```

---

## Component Hierarchy

```
Index.tsx
  ├── ThemeToggle
  ├── AnalogClock
  ├── DigitalClock
  ├── AlarmCountdown
  ├── AlarmList
  │   ├── AlarmForm (dialog)
  │   └── AlarmGroupForm (dialog)
  ├── ExportImport
  └── AlarmOverlay (conditional — shown when alarm fires)
```

---

## IPC Flow

```
Frontend (React)                    Backend (Rust)
────────────────                    ──────────────
invoke("create_alarm", data)  →    commands/alarm.rs → storage/db.rs
invoke("play_sound", soundId) →    commands/audio.rs → audio/player.rs
listen("alarm-fired", handler) ←   engine/alarm_engine.rs (event emit)
invoke("dismiss_alarm", id)   →    commands/alarm.rs → engine stop
invoke("export_alarms")       →    commands/export_import.rs → file dialog
```

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Data Model | `./01-data-model.md` |
| Platform Strategy | `./05-platform-strategy.md` |
| Startup Sequence | `./07-startup-sequence.md` |
| Test Strategy | `./09-test-strategy.md` |
| Features | `../02-features/00-overview.md` |
| App Issues | `../03-app-issues/08-devops-issues.md` → DEVOPS-PERM-001, DEVOPS-CARGO-001 |
| Frontend Issues | `../03-app-issues/02-frontend-issues.md` → FE-I18N-001 |
