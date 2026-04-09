# Framework Comparison

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`framework`, `comparison`, `tauri`, `electron`, `wails`, `flutter`, `fyne`, `cef`, `architecture`, `native`

---

## Purpose

Side-by-side evaluation of 6 cross-platform application frameworks. Each framework is assessed on architecture, platform support, resource usage, ecosystem maturity, native integration capabilities, and developer experience. This document is **generic** — applicable to any project considering native app development with a web frontend.

---

## 1. Overview Matrix

| Criterion | **Tauri 2.x** | **Electron** | **Wails** | **Flutter** | **Go + CEF** | **Fyne** |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|
| **Backend Language** | Rust | JavaScript/Node | Go | Dart | Go | Go |
| **Frontend Tech** | Web (React/Vue/Svelte) | Web (React/Vue/Svelte) | Web (React/Vue/Svelte) | Dart widgets | Web (React/Vue/Svelte) | Go widgets |
| **Rendering** | OS native WebView | Bundled Chromium | OS native WebView | Custom Skia engine | Bundled Chromium (CEF) | Custom OpenGL |
| **macOS** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Windows** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Linux** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **iOS** | ✅ (v2) | ❌ | ❌ | ✅ | ❌ | ⚠️ Basic |
| **Android** | ✅ (v2) | ❌ | ❌ | ✅ | ❌ | ⚠️ Basic |
| **Bundle Size** | ~3–10 MB | ~150–300 MB | ~8–15 MB | ~15–30 MB | ~150+ MB | ~10–20 MB |
| **RAM Usage** | ~30–80 MB | ~150–500 MB | ~40–100 MB | ~80–150 MB | ~200+ MB | ~30–60 MB |
| **Native Feel** | High | Medium | High | Custom (consistent) | Medium | Custom (consistent) |
| **Ecosystem** | Growing (stable v2) | Very mature | Moderate | Very mature | Low-level | Moderate |
| **System Tray** | ✅ Built-in | ✅ | ✅ | ⚠️ Plugin | Manual | ⚠️ Limited |
| **OS Notifications** | ✅ Native plugin | ✅ (node) | ✅ | ✅ | Manual | ⚠️ Limited |
| **Auto-Update** | ✅ Built-in | ✅ (electron-updater) | ⚠️ Manual | ⚠️ Manual | ❌ | ❌ |
| **Code Signing** | ✅ | ✅ | ✅ | ✅ | Manual | ❌ |

---

## 2. Detailed Framework Analysis

### 2.1 Tauri 2.x (Rust + Web Frontend)

**How it works:** Rust process runs natively on the OS. Frontend renders in the OS-provided WebView (WKWebView on macOS, WebView2 on Windows, webkit2gtk on Linux). Frontend and backend communicate via typed IPC commands (`invoke()`/`emit()`/`listen()`).

| Pros | Cons |
|------|------|
| Smallest bundle size of any option (~3–10 MB) | Rust has a steep learning curve |
| Lowest memory footprint (~30–80 MB) | WebView rendering varies slightly across OS |
| Full mobile support in v2 (iOS + Android) | Mobile plugin ecosystem still maturing |
| Uses OS-native WebView — no bundled browser | Dependent on OS WebView version and quality |
| Rust memory safety — no crashes, data races, or buffer overflows | Debugging Rust requires separate tooling (rust-analyzer, LLDB) |
| Existing web frontend (React/Vue/Svelte) reusable as-is | Smaller community than Electron (growing fast) |
| Rich plugin ecosystem (notifications, tray, SQL, updater, dialog) | Some advanced native APIs need custom Rust |
| Reliable background threads via tokio runtime | Rust compilation slower than JS/Go |
| Granular IPC permission model — strong security sandbox | — |
| Active development, commercially backed by CrabNebula | — |

**Architecture strengths:**
- Rust's `tokio` async runtime provides reliable background processing unaffected by UI throttling
- Plugin system covers most native needs out of the box
- Security model enforces least-privilege access for IPC commands
- Single codebase produces desktop + mobile builds

**When to choose:** You need all 5 platforms, want to reuse a web frontend, care about bundle size/memory, and need reliable background processing.

---

### 2.2 Electron (JavaScript/Node + Chromium)

**How it works:** Ships a full Chromium browser + Node.js runtime. Main process (Node) handles system access; renderer process (Chromium) runs the UI. IPC via `ipcMain`/`ipcRenderer`.

| Pros | Cons |
|------|------|
| Most mature ecosystem, largest community | Massive bundle (~150–300 MB per app) |
| Perfectly consistent rendering (ships own Chromium) | Very high memory usage (~150–500 MB) |
| Easiest for web developers — JS/Node everywhere | **No mobile support** — desktop only |
| Battle-tested: VS Code, Slack, Discord, Figma, Notion | Ships entire Chromium = slow cold startup (2–5 seconds) |
| Vast npm ecosystem — library for everything | Significant battery drain on laptops |
| Excellent documentation, tutorials, Stack Overflow coverage | Background timers throttled by Chromium in background tabs |
| electron-builder for packaging, signing, auto-update | Over-engineered for simple apps |
| — | Security risks: Node.js access in renderer process |

**Architecture strengths:**
- Most predictable rendering — what you see in Chrome is what users get
- Largest ecosystem means fewer custom implementations needed
- Mature packaging and distribution pipeline

**When to choose:** You're desktop-only, team is JavaScript-only, and ecosystem maturity matters more than performance or bundle size.

**When to avoid:** Mobile is on the roadmap, bundle size matters, or the app runs continuously (memory/battery drain).

---

### 2.3 Wails (Go + Web Frontend)

**How it works:** Go backend with OS-native WebView for rendering. Similar architecture to Tauri but using Go instead of Rust. Go functions are exposed to the frontend as JavaScript bindings.

| Pros | Cons |
|------|------|
| Go is simple, fast, with an excellent stdlib | **No mobile support** — desktop only |
| Small bundles (~8–15 MB) | Smaller ecosystem than Tauri or Electron |
| Uses OS-native WebView (no bundled browser) | Less mature plugin system |
| Clean binding model — Go structs become JS objects | Fewer contributors and community resources |
| Familiar for Go backend developers | WebView rendering inconsistencies (same as Tauri) |
| Simple build pipeline | No built-in auto-update |
| — | System tray support requires manual implementation |

**Architecture strengths:**
- Go goroutines provide reliable concurrent processing
- Go's simple type system makes the backend easy to maintain
- Low ceremony — fewer config files than Tauri or Electron

**When to choose:** Your team knows Go, you only need desktop, and simplicity is the priority.

**When to avoid:** Mobile is needed, or you need rich native integrations (tray, auto-update) out of the box.

---

### 2.4 Flutter (Dart)

**How it works:** Dart VM with custom Skia rendering engine draws every pixel. No web technologies involved — entirely Dart/Flutter widgets. Compiles to native ARM/x64 code. Platform channels for native API access.

| Pros | Cons |
|------|------|
| Best mobile support (iOS + Android, very mature) | **Requires full frontend rewrite in Dart** — no React/Vue reuse |
| Beautiful, consistent custom UI via Skia | Dart is a niche language outside the Flutter ecosystem |
| Single codebase: desktop + mobile from day 1 | Custom rendering means it never looks truly "native" |
| Google-backed, very active community | Desktop support is less mature than mobile |
| Hot reload for rapid development | Larger bundles than Tauri (~15–30 MB) |
| Material Design + Cupertino widgets built-in | System tray support via community plugins only (inconsistent) |
| — | Background execution model (Isolates) is more complex than threads |

**Architecture strengths:**
- Most mature mobile support of any framework
- Consistent pixel-perfect UI across all platforms
- Strong state management options (Riverpod, Bloc, Provider)

**When to choose:** Mobile is the primary target, you're starting fresh (no existing web frontend), or you want pixel-perfect consistent UI everywhere.

**When to avoid:** You have an existing React/Vue/Svelte frontend you want to reuse, or truly native OS appearance matters.

---

### 2.5 Go + CEF (Chromium Embedded Framework)

**How it works:** Embeds Chromium directly via C bindings. Go backend handles system access. Very low-level — essentially building your own Electron.

| Pros | Cons |
|------|------|
| Full Chromium rendering control | Massive bundle (~150+ MB, same problems as Electron) |
| Go backend performance | **No mobile support** |
| Flexible — embed Chromium exactly how you want | Complex build and packaging pipeline |
| — | Very high memory usage (~200+ MB) |
| — | Tiny community, minimal documentation |
| — | Manual implementation for everything (tray, notifications, updates) |
| — | Chromium throttles background timers |

**When to choose:** Almost never — only for niche cases requiring fine-grained Chromium control that Electron doesn't provide.

---

### 2.6 Fyne (Pure Go)

**How it works:** Pure Go toolkit with custom OpenGL-based rendering. No web technologies, no native widgets — Fyne draws its own UI.

| Pros | Cons |
|------|------|
| Pure Go — simplest tech stack | Custom widget look — **never looks native** |
| Small binary, very low memory (~30–60 MB) | Very limited mobile support |
| Consistent UI across platforms | Smallest ecosystem of all options |
| Simple API for basic utility apps | Limited system tray support |
| — | No auto-update mechanism |
| — | Far fewer UI widgets than any web-based framework |
| — | No built-in audio library integration |
| — | Limited theming and styling options |

**When to choose:** Building a simple Go utility app where appearance doesn't matter and native features aren't needed.

**When to avoid:** Any app requiring rich UI, audio, tray integration, or native appearance.

---

## 3. Head-to-Head Comparisons

### Bundle Size Comparison

```
Tauri 2.x     ████░░░░░░░░░░░░░░░░  3–10 MB
Wails         ██████░░░░░░░░░░░░░░  8–15 MB
Fyne          ███████░░░░░░░░░░░░░  10–20 MB
Flutter       ██████████░░░░░░░░░░  15–30 MB
Electron      ████████████████████  150–300 MB
Go + CEF      ████████████████████  150+ MB
```

### Memory Usage Comparison

```
Fyne          ███░░░░░░░░░░░░░░░░░  30–60 MB
Tauri 2.x     ████░░░░░░░░░░░░░░░░  30–80 MB
Wails         █████░░░░░░░░░░░░░░░  40–100 MB
Flutter       ████████░░░░░░░░░░░░  80–150 MB
Electron      ██████████████████░░  150–500 MB
Go + CEF      ████████████████████  200+ MB
```

### Platform Support Matrix

| Framework | macOS | Windows | Linux | iOS | Android | Total |
|-----------|:-----:|:-------:|:-----:|:---:|:-------:|:-----:|
| Tauri 2.x | ✅ | ✅ | ✅ | ✅ | ✅ | **5/5** |
| Flutter | ✅ | ✅ | ✅ | ✅ | ✅ | **5/5** |
| Electron | ✅ | ✅ | ✅ | ❌ | ❌ | **3/5** |
| Wails | ✅ | ✅ | ✅ | ❌ | ❌ | **3/5** |
| Go + CEF | ✅ | ✅ | ✅ | ❌ | ❌ | **3/5** |
| Fyne | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | **3.5/5** |

---

## 4. Ecosystem & Community Health (as of 2026)

| Framework | GitHub Stars | Monthly Downloads | Contributors | Release Cadence | Commercial Backing |
|-----------|:-----------:|:-----------------:|:------------:|:---------------:|:------------------:|
| **Flutter** | ~165K | Very high | 1000+ | Monthly | Google |
| **Electron** | ~115K | Very high | 1100+ | Monthly | OpenJS Foundation |
| **Tauri** | ~85K | High (growing fast) | 350+ | Bi-monthly | CrabNebula |
| **Wails** | ~25K | Moderate | 180+ | Quarterly | Community |
| **Fyne** | ~25K | Moderate | 300+ | Quarterly | Community |
| **Go + CEF** | ~3K | Low | 30+ | Sporadic | None |

---

## 5. Native Integration Capabilities

| Capability | Tauri | Electron | Wails | Flutter | Go+CEF | Fyne |
|-----------|:-----:|:--------:|:-----:|:-------:|:------:|:----:|
| System tray / menu bar | ✅ Plugin | ✅ API | ⚠️ Manual | ⚠️ Plugin | ❌ Manual | ⚠️ Basic |
| OS notifications | ✅ Plugin | ✅ Node API | ✅ Go lib | ✅ Plugin | ❌ Manual | ⚠️ Basic |
| File system dialogs | ✅ Plugin | ✅ Dialog API | ✅ Go lib | ⚠️ Plugin | ❌ Manual | ✅ Built-in |
| Native audio playback | ✅ Rust crates | ✅ Node libs | ✅ Go libs | ✅ Plugins | ✅ Go libs | ❌ None |
| SQLite / local storage | ✅ Plugin | ✅ better-sqlite3 | ✅ Go SQLite | ✅ sqflite | ✅ Go SQLite | ⚠️ Bolt |
| Auto-update | ✅ Plugin | ✅ electron-updater | ❌ Manual | ❌ Manual | ❌ None | ❌ None |
| Code signing | ✅ Built-in | ✅ Built-in | ✅ Manual | ✅ Manual | ❌ Manual | ❌ None |
| Keyboard shortcuts | ✅ Plugin | ✅ globalShortcut | ✅ Go lib | ⚠️ Plugin | ❌ Manual | ⚠️ Basic |
| Deep links / URL schemes | ✅ Plugin | ✅ Protocol handler | ⚠️ Manual | ✅ Plugin | ❌ Manual | ❌ None |
| Clipboard access | ✅ Plugin | ✅ clipboard API | ✅ Go lib | ✅ Plugin | ❌ Manual | ✅ Built-in |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Platform Research Overview | `./00-overview.md` |
| Development Velocity | `./02-development-velocity.md` |
| Recommendation | `./03-recommendation.md` |
| Diagrams | `../diagrams/` |
