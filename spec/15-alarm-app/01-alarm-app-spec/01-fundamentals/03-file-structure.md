# File Structure

**Version:** 1.11.0  
**Updated:** 2026-04-11  
**AI Confidence:** High  
**Ambiguity:** None  
**Resolves:** DEVOPS-PERM-001, DEVOPS-CARGO-001, FE-I18N-001, AI-007, AI-008

---

## Keywords

`file-structure`, `components`, `hooks`, `organization`, `tauri`, `rust`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ⚠️ N/A (consolidated in 97-acceptance-criteria.md) |


## Purpose

Defines the source code file organization for the Alarm App (Tauri 2.x).

---

## Structure

```
src/                          — Frontend (React + TypeScript)
  types/
    alarm.ts                  — Alarm, AlarmGroup, AlarmSound interfaces

  stores/                     — Zustand global state stores (Resolves UX-STATE-001, AI-004)
    useAlarmStore.ts          — Alarm CRUD + groups + loading/error state
    useOverlayStore.ts        — Active alarm, queue mirror, overlay visibility
    useSettingsStore.ts       — Theme, TimeFormat, Language, DefaultSnoozeDuration

  hooks/
    useAlarms.ts              — Thin wrapper over useAlarmStore for component convenience
    useTheme.ts               — Theme state + settings table + class toggle
    useAlarmFiring.ts         — Listen for Rust alarm-fired events, sync to useOverlayStore
    useClock.ts               — Current time state, updated every second

  components/
    AnalogClock.tsx           — SVG clock face with hour/minute/second hands
    DigitalClock.tsx          — Time + date display
    AlarmList.tsx             — Grouped alarm list with toggles
    AlarmForm.tsx             — Create/edit alarm dialog
    AlarmGroupForm.tsx        — Group create/rename dialog
    AlarmOverlay.tsx          — Full-screen firing overlay (dismiss/snooze) — rendered in a **separate Tauri window**, not a child component of Index.tsx (see `03-alarm-firing.md`)
    ChallengePanel.tsx        — Dismissal challenge UI (math/shake/typing) — rendered inside AlarmOverlay when ChallengeType is set
    ThemeToggle.tsx           — Sun/moon icon button
    ExportImport.tsx          — Export button + import via native file dialog
    AlarmCountdown.tsx        — "Alarm in X hours Y minutes" display
    Toast.tsx                 — Toast notifications via `sonner` (success/error/info/undo)
    SettingsPanel.tsx         — Settings sections: Theme, Time Format, Snooze, Language, Keyboard Shortcuts ref
    SleepWellness.tsx         — Sleep & wellness hub: bedtime reminder config, sleep calculator, mood logger
    BedtimeReminder.tsx       — Bedtime reminder configuration form
    SleepCalculator.tsx       — Optimal bedtime / wake time calculator
    AmbientPlayer.tsx         — Ambient sound player with auto-stop timer
    MoodLogger.tsx            — Post-dismissal sleep quality + mood prompt
    StreakCalendar.tsx         — Calendar view of alarm streak data
    QuoteDisplay.tsx          — Daily motivational quote display
    AccentColorPicker.tsx     — Accent color selection for personalization
    BackgroundPicker.tsx      — Custom background image selection
    HistoryList.tsx           — Alarm event history list with filters
    AnalyticsChart.tsx        — Charts/graphs for alarm analytics
    HistoryFilter.tsx         — Filter controls for history view (date range, event type)

  pages/                      — Route-level page components (Resolves AI-008)
    Index.tsx                 — Main layout: clock + alarm list + countdown (route: /)
    Settings.tsx              — Settings page wrapping SettingsPanel (route: /settings)
    Analytics.tsx             — Alarm history + analytics charts (route: /analytics)
    Sleep.tsx                 — Sleep & wellness features hub (route: /sleep)
    Personalization.tsx       — Streaks, quotes, themes, backgrounds (route: /personalization)

  lib/
    tauri-commands.ts         — Typed wrappers for Tauri invoke() calls
    db.ts                     — IPC query wrappers (all DB access via Tauri invoke)

  i18n/                       — Internationalization (Resolves FE-I18N-001, AI-007)
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
      settings.rs             — Settings read/write + theme IPC commands
      export_import.rs        — File export/import commands
      group.rs                — Group CRUD commands (create, update, delete, list, toggle)
      challenge.rs            — Dismissal challenge commands (get_challenge, submit_challenge_answer)
      history.rs              — Alarm event history commands (list_alarm_events, export_history_csv, clear_history)
      wellness.rs             — Sleep wellness commands (log_sleep_quality, play_ambient, stop_ambient)
      personalization.rs      — Personalization commands (quotes, streaks, themes, backgrounds)
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

> **Resolves DEVOPS-CARGO-001.** All crate versions pinned with `=` to prevent incompatible version selection. See `10-dependency-lock.md` for API surface documentation and breaking change notes.

```toml
[package]
name = "alarm-app"
version = "1.0.0"
edition = "2021"

[dependencies]
# Tauri core
tauri = { version = "=2.10.3", features = ["tray-icon", "global-shortcut"] }
tauri-build = { version = "=2.5.6", features = [] }

# Tauri plugins
tauri-plugin-notification = "=2.3.3"
tauri-plugin-dialog = "=2.7.0"
tauri-plugin-fs = "=2.5.0"
tauri-plugin-autostart = "=2.5.1"
tauri-plugin-updater = "=2.10.1"
tauri-plugin-global-shortcut = "=2.3.1"

# Database
rusqlite = { version = "=0.32.1", features = ["bundled"] }  # Pin 0.32.x — refinery 0.8.x compat
refinery = { version = "=0.8.14", features = ["rusqlite"] }

# Audio
rodio = "=0.19.0"                 # Pin 0.19 — 0.20+ breaks OutputStream API

# Date/time
chrono = { version = "=0.4.44", features = ["serde"] }
chrono-tz = "=0.10.4"             # IANA timezone database
croner = "=2.0.7"                 # Pin 2.x — 3.0 rewrites Cron constructor

# Serialization
serde = { version = "=1.0.228", features = ["derive"] }
serde_json = "=1.0.149"

# Error handling
thiserror = "=2.0.18"             # Used by AlarmAppError — was missing from prior spec

# HTTP (webhooks)
reqwest = { version = "=0.12.12", features = ["json", "rustls-tls"], default-features = false }
url = "=2.5.4"                    # URL parsing for webhook validation

# Utilities
uuid = { version = "=1.23.0", features = ["v4"] }
tokio = { version = "=1.51.1", features = ["full"] }
rand = "=0.8.5"                   # Random number generation (math challenges, etc.)
tracing = "=0.1.44"               # Structured logging
tracing-subscriber = { version = "=0.3.23", features = ["env-filter"] }
tracing-appender = "=0.2.4"       # Log file rotation

# Platform-specific (conditional)
[target.'cfg(target_os = "macos")'.dependencies]
objc2 = "=0.5.2"                  # Pin 0.5.x — 0.6 restructures modules

[target.'cfg(target_os = "windows")'.dependencies]
windows = { version = "=0.58.0", features = ["Win32_System_Power"] }  # Pin 0.58 — 0.59+ changes feature gates

[target.'cfg(target_os = "linux")'.dependencies]
zbus = "=4.4.0"                   # Pin 4.x — 5.x is async-only rewrite
```

## npm Dependencies (package.json)

> All versions pinned with `=` to prevent breaking upgrades. See `10-dependency-lock.md` for API surface and breaking change notes.

```json
{
  "dependencies": {
    "@tauri-apps/api": "=2.10.1",
    "@dnd-kit/core": "=6.1.0",
    "@dnd-kit/sortable": "=8.0.0",
    "react": "=18.3.1",
    "react-dom": "=18.3.1",
    "react-router-dom": "=6.30.0",
    "zustand": "=4.5.7",
    "sonner": "=1.7.7",
    "i18next": "=24.2.3",
    "react-i18next": "=15.5.3"
  },
  "devDependencies": {
    "@tauri-apps/cli": "=2.10.1",
    "typescript": "=5.7.3",
    "vite": "=5.4.18",
    "tailwindcss": "=3.4.22",
    "vitest": "=2.1.8",
    "@testing-library/react": "=16.1.0",
    "eslint-plugin-i18next": "=6.1.3"
  }
}
```

---

## Routing Table

> **Resolves GA2-012, GA3-010.** Defines all routes and navigation structure.

| Route | Page Component | Primary Content | Navigation |
|-------|---------------|-----------------|------------|
| `/` | `Index.tsx` | Clock + alarm list + countdown | Bottom tab: Home |
| `/settings` | `Settings.tsx` | SettingsPanel (theme, time format, snooze, language, shortcuts) | Bottom tab: Settings |
| `/analytics` | `Analytics.tsx` | HistoryList + AnalyticsChart + HistoryFilter | Bottom tab: Analytics |
| `/sleep` | `Sleep.tsx` | SleepWellness + BedtimeReminder + SleepCalculator + AmbientPlayer | Bottom tab: Sleep |
| `/personalization` | `Personalization.tsx` | StreakCalendar + QuoteDisplay + AccentColorPicker + BackgroundPicker | Bottom tab: Me |

### Navigation Method

**Bottom tab bar** (mobile-first) with 5 tabs: Home, Analytics, Sleep, Settings, Me. On desktop, tabs render as a top navigation bar. The tab bar is always visible except when `AlarmOverlay` is active (separate window).

### Router Setup

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/analytics" element={<Analytics />} />
    <Route path="/sleep" element={<Sleep />} />
    <Route path="/personalization" element={<Personalization />} />
  </Routes>
</BrowserRouter>
```

---

## Component Hierarchy

```
Index.tsx (route: /)
  ├── ThemeToggle
  ├── AnalogClock
  ├── DigitalClock
  ├── AlarmCountdown
  ├── AlarmList
  │   ├── AlarmForm (dialog)
  │   └── AlarmGroupForm (dialog)
  └── ExportImport

Analytics.tsx (route: /analytics)
  ├── HistoryFilter
  ├── HistoryList
  └── AnalyticsChart

Sleep.tsx (route: /sleep)
  ├── BedtimeReminder
  ├── SleepCalculator
  ├── AmbientPlayer
  └── MoodLogger

Personalization.tsx (route: /personalization)
  ├── StreakCalendar
  ├── QuoteDisplay
  ├── AccentColorPicker
  └── BackgroundPicker

AlarmOverlay.tsx (mounted in separate Tauri overlay window — NOT a child of any page)
  └── ChallengePanel (rendered when ChallengeType is set on the firing alarm)
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

## Frontend Routing Structure (AI-008)

> **Resolves AI-008.** The app is a **single-page application** (SPA) using `react-router-dom` with `BrowserRouter`. All routes render inside a shared `<AppShell>` layout with no nested routing.

### Route Table

| Route | Page Component | Purpose | Nav Entry |
|-------|---------------|---------|-----------|
| `/` | `Index.tsx` | Clock display + alarm list + "next alarm" countdown | Home (default) |
| `/settings` | `Settings.tsx` | All app settings (see `17-ui-layouts.md`) | Gear icon in header |
| `/analytics` | `Analytics.tsx` | Alarm event history + charts | Bottom nav / menu |
| `/sleep` | `Sleep.tsx` | Bedtime reminder, sleep calculator, ambient sounds, mood logger | Bottom nav / menu |
| `/personalization` | `Personalization.tsx` | Streaks, quotes, accent color, backgrounds | Bottom nav / menu |

### Router Configuration

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/sleep" element={<Sleep />} />
        <Route path="/personalization" element={<Personalization />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Navigation Pattern

- **Primary navigation:** Bottom bar with 3–4 icons (Home, Sleep, Analytics, Personalization)
- **Settings:** Accessed via gear icon in the header bar of `Index.tsx` — navigates to `/settings`
- **Back button:** Settings and sub-pages show a `←` back button that calls `navigate(-1)`
- **No auth routes:** The app has no authentication — all routes are public

---

## i18n Key Naming Convention (AI-007)

> **Resolves AI-007.** Defines the `react-i18next` key naming pattern so AI agents produce consistent translation files.

### Key Pattern

```
{page}.{section}.{element}
```

All keys use **dot-separated lowercase** segments. Maximum 3 levels deep.

### Key Examples

| Key | English Value | Context |
|-----|---------------|---------|
| `alarm.list.empty` | `"No alarms yet"` | Empty state message |
| `alarm.list.createFirst` | `"Create your first alarm"` | Empty state CTA |
| `alarm.form.title.create` | `"Create Alarm"` | Dialog title |
| `alarm.form.title.edit` | `"Edit Alarm"` | Dialog title |
| `alarm.form.label.placeholder` | `"Alarm label (optional)"` | Input placeholder |
| `alarm.form.repeat.once` | `"Once"` | Repeat type option |
| `alarm.form.repeat.daily` | `"Daily"` | Repeat type option |
| `alarm.form.repeat.weekly` | `"Weekly"` | Repeat type option |
| `alarm.form.advanced` | `"Advanced Settings"` | Collapsible section title |
| `alarm.card.delete.undo` | `"Undo"` | Undo toast button |
| `alarm.card.delete.message` | `"Deleted {{label}}"` | Undo toast message (interpolation) |
| `settings.section.appearance` | `"Appearance"` | Section heading |
| `settings.section.clock` | `"Clock"` | Section heading |
| `settings.theme.light` | `"Light"` | Theme option |
| `settings.theme.dark` | `"Dark"` | Theme option |
| `settings.theme.system` | `"System"` | Theme option |
| `settings.timeFormat.12h` | `"12h"` | Time format option |
| `settings.timeFormat.24h` | `"24h"` | Time format option |
| `notification.alarm.title` | `"⏰ {{label}}"` | Notification title |
| `notification.alarm.body` | `"{{time}} — Tap to dismiss or snooze"` | Notification body |
| `notification.missed.title` | `"Missed Alarm"` | Missed alarm notification |
| `notification.missed.body` | `"You missed {{label}} at {{time}}"` | Missed alarm body |
| `common.save` | `"Save"` | Shared button |
| `common.cancel` | `"Cancel"` | Shared button |
| `common.retry` | `"Retry"` | Error banner button |
| `common.error.generic` | `"Something went wrong"` | Fallback error |

### Rules

| Rule | Detail |
|------|--------|
| **Nesting** | Max 3 levels: `{page}.{section}.{element}` |
| **Case** | `camelCase` for multi-word segments (e.g., `createFirst`, `timeFormat`) |
| **Interpolation** | Use `{{variable}}` syntax (react-i18next default) |
| **Plurals** | Use `_one` / `_other` suffixes: `alarm.count_one` = "{{count}} alarm", `alarm.count_other` = "{{count}} alarms" |
| **Shared keys** | Prefix with `common.` — used across multiple pages |
| **Page-specific** | Prefix with page name: `alarm.`, `settings.`, `analytics.`, `sleep.`, `personalization.` |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Data Model | `./01-data-model.md` |
| Platform Strategy | `./05-platform-strategy.md` |
| Startup Sequence | `./07-startup-sequence.md` |
| Test Strategy | `./09-test-strategy.md` |
| Features | `../02-features/00-overview.md` |
| UI Layouts | `../02-features/17-ui-layouts.md` |
| App Issues | `../03-app-issues/08-devops-issues.md` → DEVOPS-PERM-001, DEVOPS-CARGO-001 |
| Frontend Issues | `../03-app-issues/02-frontend-issues.md` → FE-I18N-001 |
