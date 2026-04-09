# Platform Strategy Research

**Version:** 2.0.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`platform`, `cross-platform`, `framework`, `native`, `tauri`, `electron`, `wails`, `flutter`, `fyne`, `cef`, `comparison`, `research`, `evaluation`

---

## Purpose

Comprehensive research document evaluating cross-platform frameworks for the Alarm App. Covers requirements analysis, framework deep-dives, alarm-specific scoring, architecture design, rollout strategy, risk analysis, and final recommendation. This document supersedes `01-fundamentals/05-platform-strategy.md` and `01-fundamentals/06-tauri-architecture-and-framework-comparison.md`.

---

## 1. Requirements Analysis

### Hard Requirements (Must Have)

| # | Requirement | Priority | Why |
|---|-------------|----------|-----|
| R1 | macOS desktop app (first target) | P0 | Primary user base, development machine |
| R2 | Native OS notifications (not browser) | P0 | Alarm reliability — browser notifications can be dismissed/blocked |
| R3 | Native audio playback (not Web Audio) | P0 | Web Audio throttled in background tabs, unreliable for alarms |
| R4 | System tray / menu bar integration | P0 | Always-accessible quick controls without opening main window |
| R5 | Offline-first (no backend dependency) | P0 | Alarm app must work without internet |
| R6 | Background execution (reliable timers) | P0 | Alarms must fire even when app is minimized or system wakes from sleep |
| R7 | Local data persistence (SQLite) | P0 | Alarm data must survive app restarts |

### Soft Requirements (Should Have)

| # | Requirement | Priority | Why |
|---|-------------|----------|-----|
| R8 | Windows desktop app | P1 | Second largest desktop platform |
| R9 | Linux desktop app | P1 | Developer audience, server use cases |
| R10 | Small bundle size (< 20 MB) | P1 | Fast install, low disk usage |
| R11 | Low memory footprint (< 100 MB) | P1 | Always-running app should not hog RAM |
| R12 | Auto-update mechanism | P1 | Frictionless updates for end users |
| R13 | Code signing & notarization | P1 | macOS Gatekeeper, Windows SmartScreen |

### Future Requirements (Nice to Have)

| # | Requirement | Priority | Why |
|---|-------------|----------|-----|
| R14 | iOS mobile app | P2 | Expand to mobile users |
| R15 | Android mobile app | P2 | Largest mobile platform |
| R16 | Frontend code reuse (React) | P1 | Existing investment in React + Tailwind + shadcn/ui |

---

## 2. Framework Evaluation

### 2.1 Overview Matrix

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

### 2.2 Detailed Framework Analysis

#### Tauri 2.x (Rust + Web Frontend) — ✅ RECOMMENDED

**Architecture:** Rust backend runs natively; frontend renders in OS WebView (WKWebView on macOS, WebView2 on Windows, webkit2gtk on Linux). Communication via typed IPC commands.

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

**Alarm-specific advantages:**
- Rust `tokio` runtime provides reliable background timers unaffected by UI throttling
- `rodio` crate for cross-platform audio playback with volume control
- `tauri-plugin-notification` for OS-native alarm notifications
- System tray plugin allows "always present" alarm controls
- SQLite plugin for persistent alarm storage without external dependencies

**Known risks:**
- macOS WKWebView has occasional CSS rendering quirks (mitigated by testing)
- Linux webkit2gtk version varies by distro (mitigated by setting minimum version)
- Mobile Tauri plugins are newer than desktop equivalents (mitigated by Phase 3 timeline)

---

#### Electron (JavaScript/Node + Chromium)

**Architecture:** Ships Chromium browser + Node.js runtime. Frontend and backend both JavaScript. Renderer process for UI, main process for system access.

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

**Alarm-specific concerns:**
- Chromium aggressively throttles `setInterval`/`setTimeout` in background tabs — alarms may fire late or not at all
- Memory footprint (150–500 MB) is excessive for an always-running alarm app
- No path to mobile — would need a second codebase for iOS/Android
- Battery drain makes it unsuitable for laptop users who keep it running

---

#### Wails (Go + Web Frontend)

**Architecture:** Go backend with OS-native WebView frontend. Similar model to Tauri but using Go instead of Rust.

| Pros | Cons |
|------|------|
| Go backend — simple, fast, excellent stdlib | **No mobile support** — desktop only |
| Small bundles (~8–15 MB) | Smaller ecosystem than Tauri/Electron |
| Uses OS-native WebView | Less mature plugin system |
| Clean IPC model | Fewer contributors and community resources |
| Familiar for Go developers | WebView rendering inconsistencies |
| Simple build pipeline | No built-in auto-update mechanism |
| — | No system tray plugin (manual implementation needed) |

**Alarm-specific assessment:**
- Go goroutines provide reliable background timers (similar to Rust)
- Missing system tray support is a dealbreaker for menu bar alarm controls
- No mobile support limits future platform expansion
- Smaller plugin ecosystem means more custom code for notifications, audio

---

#### Flutter (Dart)

**Architecture:** Dart VM with custom Skia rendering engine. No web technologies — entirely Dart/Flutter widgets. Compiles to native ARM/x64 code.

| Pros | Cons |
|------|------|
| Best mobile support (iOS + Android, very mature) | **Requires full frontend rewrite in Dart** (no React reuse) |
| Beautiful custom UI via Skia rendering | Dart language — not widely adopted outside Flutter |
| Single codebase: desktop + mobile | Custom rendering = not truly native OS look & feel |
| Google-backed, very active community | Desktop support less mature than mobile |
| Hot reload for rapid development | Larger bundles than Tauri (~15–30 MB) |
| Material Design + Cupertino widgets built-in | System tray support via community plugins only |
| — | Background execution more complex than Rust threads |

**Alarm-specific assessment:**
- Would require complete rewrite of existing React frontend
- Flutter's background execution model (Isolates) is less straightforward than Rust threads for alarm timers
- Desktop system tray support is via community plugins with inconsistent quality
- Strong choice if mobile were the primary target, but macOS desktop is Phase 1

---

#### Go + CEF (Chromium Embedded Framework)

**Architecture:** Embeds Chromium directly via C bindings. Go backend for system access. Very low-level control.

| Pros | Cons |
|------|------|
| Full Chromium rendering control | Massive bundle (~150+ MB, same as Electron) |
| Go backend performance | **No mobile support** |
| Flexible embedding options | Complex build and packaging pipeline |
| — | Very high memory usage (~200+ MB) |
| — | Tiny community, minimal documentation |
| — | Manual implementation needed for tray, notifications, updates |
| — | Chromium throttles background timers |

**Verdict:** Too low-level, too heavy, and shares Electron's timer throttling problem. Not suitable for an alarm app.

---

#### Fyne (Pure Go)

**Architecture:** Pure Go toolkit with custom rendering (no web, no native widgets). OpenGL-based rendering.

| Pros | Cons |
|------|------|
| Pure Go — no web tech, no JavaScript | Custom widget look — **not native appearance** |
| Small binary, low memory (~30–60 MB) | Very limited mobile support |
| Consistent UI across platforms | Smallest ecosystem of all options |
| Simple API for basic apps | Limited system tray support |
| — | No auto-update mechanism |
| — | Far fewer UI widgets than web-based frameworks |
| — | No built-in audio library integration |

**Verdict:** Too limited for a feature-rich alarm app. No audio support, minimal tray, and non-native appearance.

---

## 3. Alarm App–Specific Scoring

Weighted scoring based on alarm app requirements. Each criterion scored 0–10.

| Factor | Weight | Tauri | Electron | Wails | Flutter | Go+CEF | Fyne |
|--------|--------|:-----:|:--------:|:-----:|:-------:|:------:|:----:|
| Platform coverage (5 OS) | High | 10 | 6 | 6 | 10 | 6 | 7 |
| Frontend reuse (React) | High | 10 | 10 | 10 | 0 | 10 | 0 |
| Bundle size | Medium | 10 | 2 | 8 | 7 | 2 | 8 |
| Memory efficiency | Medium | 10 | 3 | 8 | 6 | 2 | 9 |
| Alarm timer reliability | Critical | 10 | 5 | 8 | 7 | 5 | 7 |
| Native integration (tray, notif) | High | 9 | 8 | 7 | 6 | 4 | 4 |
| Audio playback control | High | 9 | 7 | 7 | 7 | 7 | 3 |
| Ecosystem & community | Medium | 7 | 10 | 5 | 9 | 2 | 4 |
| Security model | Medium | 10 | 5 | 7 | 8 | 4 | 6 |
| **Total (out of 90)** | — | **85** | **56** | **66** | **60** | **42** | **48** |

### Ranking

| Rank | Framework | Score | Verdict |
|------|-----------|-------|---------|
| 🥇 1st | **Tauri 2.x** | 85/90 | Best fit — full platform coverage, React reuse, smallest footprint, reliable Rust timers |
| 🥈 2nd | Wails | 66/90 | Strong desktop alternative, but no mobile and no tray |
| 🥉 3rd | Flutter | 60/90 | Best for mobile-first, but requires full Dart rewrite |
| 4th | Electron | 56/90 | Too heavy, timer throttling, no mobile |
| 5th | Fyne | 48/90 | Too limited for feature-rich alarm app |
| 6th | Go + CEF | 42/90 | Niche — all of Electron's problems with less ecosystem |

---

## 4. Tauri Architecture Deep-Dive

### 4.1 System Architecture

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

### 4.2 Rust Backend Modules

| Module | Responsibility | Key Crates / APIs |
|--------|---------------|-------------------|
| **Alarm Engine** | 30-second interval timer, time matching, missed alarm detection | `tokio`, `chrono`, `chrono-tz` |
| **Audio Manager** | Sound playback, volume ramp, looping, stop | `rodio`, Core Audio (macOS), AAudio (Android) |
| **Notification Manager** | OS-native notifications for alarm firing, bedtime reminders | `tauri-plugin-notification` |
| **Storage (SQLite)** | CRUD for alarms, groups, settings, snooze state, events | `tauri-plugin-sql`, `refinery` (migrations) |
| **System Tray** | Menu bar icon, quick alarm toggle, next alarm display | `tauri-plugin-system-tray` |
| **Config Manager** | Read/write settings table, theme preference, sound preferences | SQLite `settings` table |
| **Snooze Tracker** | Active snooze state, countdown, auto-fire on expiry | SQLite `snooze_state` table |
| **Power Manager** | Prevent sleep during alarm, wake from sleep | Platform power APIs |
| **Export/Import** | JSON serialization, file dialog, merge/replace logic | `tauri-plugin-dialog`, `serde_json` |
| **Cron Parser** | Parse and evaluate cron expressions for repeat patterns | `croner` |

### 4.3 IPC Command Registry

All frontend ↔ backend communication uses Tauri's `invoke()` system.

#### Alarm Commands

| Command | Direction | Payload | Returns |
|---------|-----------|---------|---------|
| `create_alarm` | FE → BE | `CreateAlarmPayload` | `Alarm` |
| `update_alarm` | FE → BE | `UpdateAlarmPayload` | `Alarm` |
| `delete_alarm` | FE → BE | `{ id: string }` | `void` |
| `get_alarms` | FE → BE | `void` | `Alarm[]` |
| `toggle_alarm` | FE → BE | `{ id: string, enabled: boolean }` | `void` |
| `duplicate_alarm` | FE → BE | `{ id: string }` | `Alarm` |
| `reorder_alarms` | FE → BE | `{ orderedIds: string[] }` | `void` |

#### Group Commands

| Command | Direction | Payload | Returns |
|---------|-----------|---------|---------|
| `create_group` | FE → BE | `{ name: string, color: string }` | `AlarmGroup` |
| `update_group` | FE → BE | `{ id: string, name: string, color: string }` | `AlarmGroup` |
| `delete_group` | FE → BE | `{ id: string }` | `void` |
| `get_groups` | FE → BE | `void` | `AlarmGroup[]` |
| `toggle_group` | FE → BE | `{ id: string, enabled: boolean }` | `void` |

#### Alarm Firing Commands

| Command | Direction | Payload | Returns |
|---------|-----------|---------|---------|
| `dismiss_alarm` | FE → BE | `{ alarmId: string }` | `void` |
| `snooze_alarm` | FE → BE | `{ alarmId: string, durationMin: number }` | `SnoozeState` |
| `cancel_snooze` | FE → BE | `{ alarmId: string }` | `void` |
| `get_snooze_state` | FE → BE | `void` | `SnoozeState[]` |

#### System Commands

| Command | Direction | Payload | Returns |
|---------|-----------|---------|---------|
| `get_settings` | FE → BE | `void` | `Settings` |
| `update_setting` | FE → BE | `{ key: string, value: string }` | `void` |
| `export_data` | FE → BE | `{ format: "json" \| "csv" \| "ical" }` | `string` (file path) |
| `import_data` | FE → BE | `{ mode: "merge" \| "replace" }` | `ImportResult` |
| `get_next_alarm` | FE → BE | `void` | `NextAlarmInfo \| null` |
| `get_alarm_history` | FE → BE | `{ filters?: HistoryFilters }` | `AlarmEvent[]` |

#### Events (Backend → Frontend)

| Event | Direction | Payload | Purpose |
|-------|-----------|---------|---------|
| `alarm-fired` | BE → FE | `{ alarmId: string, alarm: Alarm }` | Trigger alarm overlay UI |
| `snooze-expired` | BE → FE | `{ alarmId: string }` | Re-trigger alarm after snooze |
| `missed-alarm` | BE → FE | `{ alarmId: string, scheduledTime: string }` | Show missed alarm notification |
| `theme-changed` | BE → FE | `{ theme: "light" \| "dark" }` | OS appearance change detected |
| `tray-action` | BE → FE | `{ action: string, alarmId?: string }` | User clicked tray menu item |

### 4.4 Plugin Integration

| Plugin | Version | Purpose | Platform |
|--------|---------|---------|----------|
| `tauri-plugin-sql` | 2.x | SQLite database | All |
| `tauri-plugin-notification` | 2.x | OS notifications | All |
| `tauri-plugin-dialog` | 2.x | File open/save dialogs | Desktop |
| `tauri-plugin-shell` | 2.x | Open URLs, system commands | Desktop |
| `tauri-plugin-updater` | 2.x | Auto-update mechanism | Desktop |
| `tauri-plugin-os` | 2.x | OS detection, platform info | All |
| `tauri-plugin-process` | 2.x | App lifecycle, restart | All |

### 4.5 Build Pipeline

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

### 4.6 Code Signing & Distribution

| Platform | Signing | Distribution |
|----------|---------|-------------|
| macOS | Apple Developer ID + notarization | DMG, Homebrew Cask |
| Windows | Code signing certificate (EV recommended) | MSI, winget |
| Linux | GPG signing | APT repo, Flathub, Snap |
| iOS | Apple Developer Program | App Store |
| Android | Keystore signing | Google Play, F-Droid |

### 4.7 Security Model

| Layer | Protection |
|-------|-----------|
| IPC permissions | `tauri.conf.json` allowlist — only declared commands accessible |
| File system | Scoped access — app data directory only |
| Network | No outbound by default — explicit allowlist for update checks |
| Rust memory | No buffer overflows, use-after-free, or data races |
| SQLite | Parameterized queries — no SQL injection |
| Updates | Signed update manifests — no tampering |

---

## 5. Risk Analysis

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Rust learning curve slows development | Medium | Medium | Start with well-documented IPC commands; AI can generate Rust boilerplate |
| WebView CSS inconsistencies across platforms | Medium | Low | Use Tailwind utility classes; test on all 3 desktop WebViews |
| macOS WKWebView quirks (scrollbar, font rendering) | Low | Low | Platform-specific CSS overrides in Tailwind |
| Linux webkit2gtk version fragmentation | Medium | Medium | Set minimum version (2.36+); document in install requirements |
| Tauri mobile plugins lag behind desktop | Medium | Low | Mobile is Phase 3 — plugins will mature by then |
| `rodio` audio crate platform differences | Low | Medium | Abstract behind AudioManager trait; platform-specific fallbacks |
| SQLite migration failures on updates | Low | High | Use `refinery` for versioned migrations; backup before migration |

### Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Apple notarization rejection | Low | High | Follow Apple guidelines strictly; test with `xcrun notarytool` |
| Windows SmartScreen warnings | Medium | Medium | Use EV code signing certificate |
| Auto-update delivery failures | Low | Medium | Fallback to manual download page |
| App Store rejection (iOS Phase 3) | Medium | Medium | Review Apple guidelines early; prepare justification for alarm permissions |

### AI Implementation Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| AI cannot compile/test Rust code | High | High | Provide exact function signatures, types, and example code in spec |
| AI generates incorrect IPC bindings | Medium | Medium | Define typed command registry with payload/return types |
| AI mishandles platform-specific code (#[cfg]) | Medium | Medium | Document platform branching patterns explicitly |
| AI struggles with async Rust (tokio) | Medium | High | Provide async patterns and examples for alarm engine |

---

## 6. Rollout Strategy

| Phase | Platform | Scope | Timeline | Key Milestones |
|-------|----------|-------|----------|----------------|
| Phase 1 | macOS desktop | Full P0 + P1 feature set | First release | Core alarm CRUD, firing, snooze, tray, notifications |
| Phase 2 | Windows + Linux | Adapt platform-specific code | Second release | WebView2 testing, Linux audio/notification testing |
| Phase 3 | iOS + Android | Mobile-specific UI, haptics | Third release | Touch UI, haptic feedback, mobile notifications |

### Phase 1 → Phase 2 Delta

| Area | macOS (Phase 1) | Windows (Phase 2) | Linux (Phase 2) |
|------|----------------|-------------------|-----------------|
| WebView | WKWebView (Safari) | WebView2 (Edge/Chromium) | webkit2gtk |
| Audio | Core Audio / rodio | WASAPI / rodio | PulseAudio / ALSA / rodio |
| Notifications | NSUserNotification | Windows Toast | libnotify / D-Bus |
| Tray | NSStatusItem | System tray icon | StatusNotifierItem / AppIndicator |
| Auto-update | Sparkle-compatible | WinSparkle-compatible | AppImage delta updates |

### Phase 2 → Phase 3 Delta

| Area | Desktop (Phase 1–2) | Mobile (Phase 3) |
|------|---------------------|------------------|
| UI layout | Sidebar + main area | Bottom tab navigation |
| Interaction | Mouse + keyboard | Touch + gestures |
| Alarm dismiss | Click button | Swipe, shake, or challenge |
| Audio | System speakers | Device speaker + vibration |
| Background | Always running (tray) | Background service + push notification |
| Storage | SQLite (local) | SQLite (local) |

---

## 7. Decision Record

| Decision | Date | Rationale |
|----------|------|-----------|
| **Choose Tauri 2.x** over all alternatives | 2026-04-08 | Highest score (85/90), only framework meeting all hard requirements (5 platforms, React reuse, reliable timers, native integration, small footprint) |
| **Reject Electron** | 2026-04-08 | Timer throttling makes it unreliable for alarms; 150–300 MB bundle is excessive; no mobile path |
| **Reject Flutter** | 2026-04-08 | Requires full Dart rewrite of existing React frontend; desktop tray support is weak |
| **Reject Wails** | 2026-04-08 | No mobile support, no system tray plugin, smaller ecosystem |
| **Reject Go+CEF and Fyne** | 2026-04-08 | Both too limited — CEF is too heavy, Fyne lacks audio and tray |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Data Model | `../01-fundamentals/01-data-model.md` |
| Design System | `../01-fundamentals/02-design-system.md` |
| File Structure | `../01-fundamentals/03-file-structure.md` |
| Platform Constraints | `../01-fundamentals/04-platform-constraints.md` |
| Platform Strategy (legacy) | `../01-fundamentals/05-platform-strategy.md` |
| Tauri Architecture (legacy) | `../01-fundamentals/06-tauri-architecture-and-framework-comparison.md` |
| Alarm Firing | `../02-features/03-alarm-firing.md` |
| Sound & Vibration | `../02-features/05-sound-and-vibration.md` |
| Smart Features | `../02-features/12-smart-features.md` |
