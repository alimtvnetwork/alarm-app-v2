# Tauri Architecture & Cross-Platform Framework Comparison

**Version:** 1.3.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`tauri`, `rust`, `architecture`, `ipc`, `plugins`, `build`, `framework`, `comparison`, `native`, `cross-platform`

---

## Purpose

Detailed Tauri 2.x architecture for the Alarm App — Rust backend design, IPC command system, plugin integration, build pipeline — plus a comprehensive cross-platform framework comparison with pros, cons, and recommendation rationale.

---

## Part 1: Tauri Architecture

### System Architecture

```
┌─────────────────────────────────────────────────┐
│                 Frontend (WebView)               │
│      React 18 + Vite 5 + Tailwind + shadcn/ui   │
│              TypeScript UI Layer                 │
├─────────────────────────────────────────────────┤
│              Tauri IPC Bridge                    │
│       invoke() / emit() / listen()               │
├─────────────────────────────────────────────────┤
│              Backend (Rust Core)                 │
│  ┌───────────┐ ┌───────────┐ ┌────────────────┐ │
│  │  Alarm    │ │  Audio    │ │   Storage      │ │
│  │  Engine   │ │  Manager  │ │   (SQLite)     │ │
│  ├───────────┤ ├───────────┤ ├────────────────┤ │
│  │  Notif.   │ │  System   │ │   Config       │ │
│  │  Manager  │ │  Tray     │ │   Manager      │ │
│  ├───────────┤ ├───────────┤ ├────────────────┤ │
│  │  Snooze   │ │  Power    │ │   Export /     │ │
│  │  Tracker  │ │  Manager  │ │   Import       │ │
│  └───────────┘ └───────────┘ └────────────────┘ │
├─────────────────────────────────────────────────┤
│             Operating System APIs                │
│    macOS / Windows / Linux / iOS / Android        │
└─────────────────────────────────────────────────┘
```

### Rust Backend Modules

| Module | Responsibility | Key Crates / APIs |
|--------|---------------|-------------------|
| **Alarm Engine** | 30-second interval timer, time matching, missed alarm detection | `tokio`, `chrono` |
| **Audio Manager** | Sound playback, volume ramp, looping, stop | `rodio`, Core Audio (macOS), AAudio (Android) |
| **Notification Manager** | OS-native notifications for alarm firing, bedtime reminders | `tauri-plugin-notification` |
| **Storage (SQLite)** | CRUD for alarms, groups, settings, snooze state, analytics events | `rusqlite`, `refinery` |
| **System Tray** | Menu bar icon, quick alarm toggle, next alarm display | `tauri-plugin-system-tray` |
| **Config Manager** | Read/write Settings table, theme preference, sound preferences | SQLite `Settings` table |
| **Snooze Tracker** | Active snooze state, countdown, auto-fire on expiry | SQLite `SnoozeState` table |
| **Power Manager** | Prevent sleep during alarm, wake from sleep | Platform power APIs |
| **Export/Import** | JSON serialization, file dialog, merge/replace logic | `tauri-plugin-dialog`, `serde_json` |

### IPC Command Registry

All frontend ↔ backend communication uses Tauri's `invoke()` system.

#### Alarm Commands

| Command | Direction | Payload | Returns |
|---------|-----------|---------|---------|
| `create_alarm` | FE → BE | `CreateAlarmPayload` | `Alarm` |
| `update_alarm` | FE → BE | `UpdateAlarmPayload` | `Alarm` |
| `delete_alarm` | FE → BE | `{ AlarmId: string }` | `{ UndoToken: string }` |
| `list_alarms` | FE → BE | `void` | `Alarm[]` |
| `toggle_alarm` | FE → BE | `{ AlarmId: string, IsEnabled: boolean }` | `void` |

#### Group Commands

| Command | Direction | Payload | Returns |
|---------|-----------|---------|---------|
| `create_group` | FE → BE | `{ Name: string }` | `AlarmGroup` |
| `update_group` | FE → BE | `{ AlarmGroupId: string, Name: string }` | `AlarmGroup` |
| `delete_group` | FE → BE | `{ AlarmGroupId: string }` | `void` |
| `get_groups` | FE → BE | `void` | `AlarmGroup[]` |
| `toggle_group` | FE → BE | `{ AlarmGroupId: string, IsEnabled: boolean }` | `void` |

#### Alarm Firing Commands

| Command | Direction | Payload | Returns |
|---------|-----------|---------|---------|
| `dismiss_alarm` | FE → BE | `{ AlarmId: string }` | `void` |
| `snooze_alarm` | FE → BE | `{ AlarmId: string, DurationMin: number }` | `SnoozeState` |
| `cancel_snooze` | FE → BE | `{ AlarmId: string }` | `void` |
| `get_snooze_state` | FE → BE | `void` | `SnoozeState[]` |

#### System Commands

| Command | Direction | Payload | Returns |
|---------|-----------|---------|---------|
| `get_settings` | FE → BE | `void` | `Settings` |
| `update_setting` | FE → BE | `{ Key: string, Value: string }` | `void` |
| `export_data` | FE → BE | `{ Format: ExportFormat, Scope: ExportScope, AlarmIds?: string[] }` | `string` (file path) |
| `import_data` | FE → BE | `{ Mode: ImportMode }` | `ImportResult` |
| `get_next_alarm` | FE → BE | `void` | `NextAlarmInfo \| null` |

#### Events (Backend → Frontend)

| Event | Direction | Payload | Purpose |
|-------|-----------|---------|---------|
| `alarm-fired` | BE → FE | `{ AlarmId: string, Alarm: Alarm }` | Trigger alarm overlay UI |
| `snooze-expired` | BE → FE | `{ AlarmId: string }` | Re-trigger alarm after snooze |
| `missed-alarm` | BE → FE | `{ AlarmId: string, ScheduledTime: string }` | Show missed alarm notification |
| `theme-changed` | BE → FE | `{ Theme: ThemeMode }` | OS appearance change detected |
| `tray-action` | BE → FE | `{ Action: string, AlarmId?: string }` | User clicked tray menu item |

### Plugin Integration

> All versions pinned with `=` — see `10-dependency-lock.md` for full API surface and breaking change notes.

| Plugin | Pinned Version | Purpose | Key API Methods | Platform |
|--------|:-:|---------|-----------------|----------|
| `rusqlite` + `refinery` | `=0.32.1` + `=0.8.14` | SQLite database + migrations | `Connection::open()`, `execute()`, `query_row()`, `embed_migrations!()` | All |
| `tauri-plugin-notification` | `=2.3.3` | OS notifications | `notification()`, `.show()`, `.request_permission()`, `.is_permission_granted()` | All |
| `tauri-plugin-dialog` | `=2.7.0` | File open/save dialogs | `dialog()`, `.file().pick_file()`, `.save_file()`, `.message()`, `.ask()` | Desktop |
| `tauri-plugin-fs` | `=2.5.0` | File validation | `fs()`, `.read_file()`, `.exists()` | All |
| `tauri-plugin-autostart` | `=2.5.1` | Launch on login | `autostart()`, `.enable()`, `.disable()`, `.is_enabled()` | Desktop |
| `tauri-plugin-updater` | `=2.10.1` | Auto-update mechanism | `updater()`, `.check()`, `.download_and_install()` | Desktop |
| `tauri-plugin-global-shortcut` | `=2.3.1` | Keyboard shortcuts | `global_shortcut()`, `.register()`, `.unregister()` | Desktop |

### Frontend State Management (Resolves UX-STATE-001)

The frontend uses **Zustand** for global state management. Zustand is chosen over React Context (re-render cascades), Redux (boilerplate overhead), and local state (duplication across components). Each logical domain gets its own Zustand store.

#### Store Architecture

```
┌─────────────────────────────────────────────────┐
│                  Zustand Stores                  │
│  ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ useAlarm │ │ useOverlay│ │  useSettings   │  │
│  │  Store   │ │  Store    │ │    Store       │  │
│  ├──────────┤ ├──────────┤ ├────────────────┤  │
│  │ alarms[] │ │ active   │ │ theme          │  │
│  │ groups[] │ │ queue[]  │ │ timeFormat     │  │
│  │ loading  │ │ isShown  │ │ snoozeDuration │  │
│  │ error    │ │ queueLen │ │ language       │  │
│  └──────────┘ └──────────┘ └────────────────┘  │
│                     ↕ IPC                        │
│              Tauri invoke() / listen()            │
└─────────────────────────────────────────────────┘
```

#### Store Definitions

```typescript
// stores/useAlarmStore.ts
interface AlarmStore {
  alarms: Alarm[];
  groups: AlarmGroup[];
  isLoading: boolean;
  error: string | null;

  // Actions (each calls Tauri IPC then updates local state)
  fetchAlarms: () => Promise<void>;
  createAlarm: (payload: CreateAlarmPayload) => Promise<Alarm>;
  updateAlarm: (payload: UpdateAlarmPayload) => Promise<Alarm>;
  deleteAlarm: (alarmId: string) => Promise<{ UndoToken: string }>;
  toggleAlarm: (alarmId: string, isEnabled: boolean) => Promise<void>;
  toggleGroup: (groupId: string, isEnabled: boolean) => Promise<void>;
  reorderAlarms: (alarmIds: string[]) => void;
}

// stores/useOverlayStore.ts
interface OverlayStore {
  activeAlarm: FiredAlarm | null;
  queue: FiredAlarm[];
  isVisible: boolean;

  // Actions
  showOverlay: (alarm: FiredAlarm) => void;
  enqueueAlarm: (alarm: FiredAlarm) => void;
  dismissCurrent: () => void;   // Removes active, shows next from queue
  snoozeCurrent: () => void;    // Removes active, shows next from queue
  clearQueue: () => void;
}

// stores/useSettingsStore.ts
interface SettingsStore {
  Theme: ThemeMode;             // ThemeMode enum: Light | Dark | System
  TimeFormat: TimeFormat;       // TimeFormat enum: TwelveHour | TwentyFourHour
  Language: string;
  DefaultSnoozeDuration: number;

  FetchSettings: () => Promise<void>;
  UpdateSetting: (Key: string, Value: string) => Promise<void>;
}
```

#### IPC Event → Store Update Flow

```typescript
// In App.tsx or a top-level hook
import { listen } from '@tauri-apps/api/event';

function useAlarmEvents() {
  const { enqueueAlarm, showOverlay, activeAlarm } = useOverlayStore();
  const { fetchAlarms } = useAlarmStore();

  useEffect(() => {
    const unlisten = listen<FiredAlarmPayload>('alarm-fired', (event) => {
      const firedAlarm = mapPayloadToFiredAlarm(event.payload);
      if (activeAlarm) {
        enqueueAlarm(firedAlarm);  // Already showing an overlay → queue it
      } else {
        showOverlay(firedAlarm);   // No active overlay → show immediately
      }
    });

    return () => { unlisten.then(fn => fn()); };
  }, [activeAlarm]);
}
```

#### Crate / Package

> All versions pinned with `=` — see `10-dependency-lock.md` for breaking change notes.

| Package | Pinned Version | Purpose |
|---------|:-:|---------|
| `zustand` | `=4.5.7` | Minimal global state (2KB gzipped, no providers). ⚠️ Do not upgrade to v5 — changes `create()` import |
| `sonner` | `=1.7.7` | Toast notifications (success/error/info) — used by `safeInvoke` and undo system. ⚠️ Do not upgrade to v2 |
| `react-router-dom` | `=6.30.0` | Client-side routing (Index + Settings pages). ⚠️ Do not upgrade to v7 — Remix merger rewrite |

---

### Build Pipeline

| Stage | Tool | Output |
|-------|------|--------|
| Frontend build | `vite build` | Optimized HTML/CSS/JS bundle |
| Rust compile | `cargo build --release` | Native binary |
| Bundle | `tauri build` | Platform installer |
| macOS | `tauri build --target universal-apple-darwin` | `.dmg` / `.app` |
| Windows | `tauri build --target x86_64-pc-windows-msvc` | `.msi` / `.exe` |
| Linux | `tauri build --target x86_64-unknown-linux-gnu` | `.deb` / `.AppImage` |
| iOS | `tauri ios build` | `.ipa` |
| Android | `tauri android build` | `.apk` / `.aab` |

### Code Signing & Distribution

| Platform | Signing | Distribution |
|----------|---------|-------------|
| macOS | Apple Developer ID + notarization | DMG, Homebrew Cask |
| Windows | Code signing certificate (EV recommended) | MSI, winget |
| Linux | GPG signing | APT repo, Flathub, Snap |
| iOS | Apple Developer Program | App Store |
| Android | Keystore signing | Google Play, F-Droid |

### Security Model

| Layer | Protection |
|-------|-----------|
| IPC permissions | `tauri.conf.json` allowlist — only declared commands accessible |
| File system | Scoped access — app data directory only |
| Network | No outbound by default — explicit allowlist for update checks |
| Rust memory | No buffer overflows, use-after-free, or data races |
| SQLite | Parameterized queries — no SQL injection |
| Updates | Signed update manifests — no tampering |

---

## Part 2: Cross-Platform Framework Comparison

### Overview Matrix

| Criterion | **Tauri 2.x** | **Electron** | **Wails** | **Flutter** | **Go + CEF** | **Fyne** |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|
| **Backend Language** | Rust | JavaScript/Node | Go | Dart | Go | Go |
| **Frontend** | Web (React/Vue) | Web (React/Vue) | Web (React/Vue) | Dart widgets | Web (React/Vue) | Go widgets |
| **macOS** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Windows** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Linux** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **iOS** | ✅ (v2) | ❌ | ❌ | ✅ | ❌ | ⚠️ Basic |
| **Android** | ✅ (v2) | ❌ | ❌ | ✅ | ❌ | ⚠️ Basic |
| **Bundle Size** | ~3–10 MB | ~150–300 MB | ~8–15 MB | ~15–30 MB | ~150+ MB | ~10–20 MB |
| **Memory Usage** | ~30–80 MB | ~150–500 MB | ~40–100 MB | ~80–150 MB | ~200+ MB | ~30–60 MB |
| **Native Feel** | High (OS WebView) | Medium (Chromium) | High (OS WebView) | Custom rendering | Medium (Chromium) | Custom rendering |
| **Ecosystem Maturity** | Growing (stable v2) | Very mature | Moderate | Very mature | Low-level | Moderate |
| **System Tray** | ✅ Built-in | ✅ | ✅ | ⚠️ Plugin | Manual | ⚠️ Limited |
| **OS Notifications** | ✅ Native plugin | ✅ (node) | ✅ | ✅ | Manual | ⚠️ Limited |
| **Auto-Update** | ✅ Built-in plugin | ✅ (electron-updater) | ⚠️ Manual | ⚠️ Manual | ❌ | ❌ |
| **Code Signing** | ✅ Supported | ✅ Supported | ✅ Supported | ✅ Supported | Manual | ❌ |
| **Alarm Reliability** | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★★☆ | ★★★☆☆ | ★★★☆☆ |

### Detailed Pros & Cons

#### Tauri 2.x (Rust + Web Frontend) — ✅ RECOMMENDED

| Pros | Cons |
|------|------|
| Smallest bundle size (~3–10 MB) | Rust learning curve for backend logic |
| Lowest memory footprint (~30–80 MB) | WebView rendering inconsistencies across OS |
| Full mobile support in v2 (iOS + Android) | Mobile plugin ecosystem still maturing |
| Uses OS-native WebView (no bundled browser) | Dependent on OS WebView quality (Safari/WebKit on macOS) |
| Rust memory safety — no crashes, no data races | Debugging Rust requires separate tooling (rust-analyzer, LLDB) |
| Existing React/Vite/Tailwind frontend reusable | Smaller community than Electron (but growing fast) |
| Rich plugin ecosystem (notifications, tray, SQL, updater) | Some advanced native APIs need custom Rust code |
| Background threads in Rust — reliable alarm timers | Compiling Rust is slower than JS/Go |
| Granular IPC permission model — strong security | — |
| Active development, backed by CrabNebula | — |

#### Electron (JavaScript/Node + Chromium)

| Pros | Cons |
|------|------|
| Most mature ecosystem, largest community | Massive bundle (~150–300 MB per app) |
| Consistent rendering (ships own Chromium) | Extremely high memory usage (~150–500 MB) |
| Easiest for web developers (JS/Node everywhere) | **No mobile support** — desktop only |
| Battle-tested: VS Code, Slack, Discord, Figma | Ships entire Chromium = slow cold startup |
| Vast npm ecosystem | Significant battery drain on laptops |
| Excellent documentation and tooling | Background timers throttled by Chromium (alarm reliability risk) |
| electron-builder for packaging/signing | Over-engineered for a simple alarm app |
| — | Security concerns (Node.js in renderer process) |

#### Wails (Go + Web Frontend)

| Pros | Cons |
|------|------|
| Go backend — simple, fast, excellent stdlib | **No mobile support** — desktop only |
| Small bundles (~8–15 MB) | Smaller ecosystem than Tauri/Electron |
| Uses OS-native WebView | Less mature plugin system |
| Clean IPC model | Fewer contributors and community resources |
| Familiar for Go developers | WebView rendering inconsistencies |
| Simple build pipeline | No built-in auto-update mechanism |
| — | No system tray plugin (manual implementation) |

#### Flutter (Dart)

| Pros | Cons |
|------|------|
| Best mobile support (iOS + Android, very mature) | **Requires full frontend rewrite in Dart** (no React reuse) |
| Beautiful custom UI via Skia rendering | Dart language — not widely adopted outside Flutter |
| Single codebase: desktop + mobile | Custom rendering = not truly native OS look & feel |
| Google-backed, very active community | Desktop support less mature than mobile |
| Hot reload for rapid development | Larger bundles than Tauri (~15–30 MB) |
| Material Design + Cupertino widgets built-in | System tray support via community plugins only |
| — | Background execution more complex than Rust threads |

#### Go + CEF (Chromium Embedded Framework)

| Pros | Cons |
|------|------|
| Full Chromium rendering control | Massive bundle (~150+ MB, same as Electron) |
| Go backend performance | **No mobile support** |
| Flexible embedding options | Complex build and packaging pipeline |
| — | Very high memory usage (~200+ MB) |
| — | Tiny community, minimal documentation |
| — | Manual implementation needed for tray, notifications, updates |
| — | Chromium throttles background timers |

#### Fyne (Pure Go)

| Pros | Cons |
|------|------|
| Pure Go — no web tech, no JavaScript | Custom widget look — **not native appearance** |
| Small binary, low memory (~30–60 MB) | Very limited mobile support |
| Consistent UI across platforms | Smallest ecosystem of all options |
| Simple API for basic apps | Limited system tray support |
| — | No auto-update mechanism |
| — | Far fewer UI widgets than web-based frameworks |
| — | No audio library integration |

### Alarm App–Specific Scoring

| Factor | Tauri | Electron | Wails | Flutter | Go+CEF | Fyne |
|--------|:-----:|:--------:|:-----:|:-------:|:------:|:----:|
| Platform coverage (5 OS) | 10 | 6 | 6 | 10 | 6 | 7 |
| Frontend reuse (React) | 10 | 10 | 10 | 0 | 10 | 0 |
| Bundle size | 10 | 2 | 8 | 7 | 2 | 8 |
| Memory efficiency | 10 | 3 | 8 | 6 | 2 | 9 |
| Alarm timer reliability | 10 | 5 | 8 | 7 | 5 | 7 |
| Native integration (tray, notif) | 9 | 8 | 7 | 6 | 4 | 4 |
| Audio playback control | 9 | 7 | 7 | 7 | 7 | 3 |
| Ecosystem & community | 7 | 10 | 5 | 9 | 2 | 4 |
| Security model | 10 | 5 | 7 | 8 | 4 | 6 |
| **Total (out of 90)** | **85** | **56** | **66** | **60** | **42** | **48** |

### Recommendation Summary

| Rank | Framework | Score | Best For |
|------|-----------|-------|----------|
| 🥇 1st | **Tauri 2.x** | 85/90 | This project — full platform coverage, React reuse, smallest footprint, reliable Rust timers |
| 🥈 2nd | Wails | 66/90 | Desktop-only Go projects, if mobile not needed |
| 🥉 3rd | Flutter | 60/90 | Mobile-first projects willing to rewrite UI in Dart |
| 4th | Electron | 56/90 | Teams requiring maximum ecosystem maturity, desktop-only |
| 5th | Fyne | 48/90 | Simple Go utility apps, no audio/tray needs |
| 6th | Go + CEF | 42/90 | Niche use cases requiring full Chromium control |

**Tauri 2.x wins decisively** for the Alarm App because it uniquely combines: React frontend reuse, all 5 target platforms, smallest resource footprint, and Rust's reliable background threading for alarm timers.

---

## Rollout Strategy

| Phase | Platform | Scope | Timeline |
|-------|----------|-------|----------|
| Phase 1 | macOS desktop | Full feature set | First release |
| Phase 2 | Windows + Linux desktop | Adapt platform-specific code | Second release |
| Phase 3 | iOS + Android mobile | Mobile-specific UI, haptics, sensors | Third release |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Data Model | `./01-data-model.md` |
| Design System | `./02-design-system.md` |
| File Structure | `./03-file-structure.md` |
| Platform Constraints | `./04-platform-constraints.md` |
| Platform Strategy (legacy) | `./05-platform-strategy.md` |
| Alarm Firing | `../02-features/03-alarm-firing.md` |
| Sound & Vibration | `../02-features/05-sound-and-vibration.md` |
| Smart Features | `../02-features/12-smart-features.md` |
