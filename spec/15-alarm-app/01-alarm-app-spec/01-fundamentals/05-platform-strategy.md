# Platform Strategy
 
> ⚠️ **SUPERSEDED** — This document is a legacy reference. The authoritative Tauri architecture is in `06-tauri-architecture-and-framework-comparison.md`. This file is retained for framework evaluation context only.

**Version:** 1.1.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** Low  
**Status:** Legacy (superseded by `06-tauri-architecture-and-framework-comparison.md`)

---

## Keywords

`platform`, `cross-platform`, `framework`, `native`, `desktop`, `mobile`, `macOS`

---
---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ⚠️ N/A (consolidated in 97-acceptance-criteria.md) |


## Purpose

Documents the cross-platform framework evaluation, comparison, and rollout strategy for the Alarm App. The app targets macOS first, then expands to Windows, Linux, iOS, and Android.

---

## Requirements

| Requirement | Priority |
|-------------|----------|
| macOS desktop app (first target) | P0 |
| Windows desktop app | P1 |
| Linux desktop app | P1 |
| iOS mobile app | P2 |
| Android mobile app | P2 |
| Native OS notifications (not browser-based) | P0 |
| Native audio playback (not Web Audio API) | P0 |
| System tray / menu bar integration | P0 |
| Small bundle size | P1 |
| Low memory footprint | P1 |
| Offline-first (no backend dependency) | P0 |

---

## Framework Comparison

### Overview Table

| Criterion | **Tauri 2.x** | **Electron** | **Wails** | **Flutter** | **Go + CEF** | **Fyne** |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|
| **Backend Language** | Rust | JavaScript/Node | Go | Dart | Go | Go |
| **Frontend** | Web (React/Vue/etc.) | Web (React/Vue/etc.) | Web (React/Vue/etc.) | Dart widgets | Web (React/Vue/etc.) | Go widgets |
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

### Detailed Pros & Cons

#### Tauri 2.x (Rust + Web Frontend)

| Pros | Cons |
|------|------|
| Smallest bundle size (~3–10 MB) | Rust learning curve |
| Lowest memory footprint (~30–80 MB) | WebView rendering inconsistencies across OS |
| Mobile support built-in (iOS + Android in v2) | Mobile support still maturing vs Flutter |
| Uses OS-native WebView (no bundled browser) | Dependent on OS WebView quality |
| Strong security model (Rust memory safety) | Smaller community than Electron |
| Existing React/Vite/Tailwind frontend reusable | Debugging Rust backend requires separate tooling |
| Rich plugin ecosystem (notifications, system tray, file system, auto-update) | Some plugins not yet available on mobile |
| IPC between Rust backend and web frontend | — |
| Active development, growing community | — |

#### Electron (JavaScript/Node + Chromium)

| Pros | Cons |
|------|------|
| Most mature ecosystem, largest community | Huge bundle size (~150–300 MB per app) |
| Consistent rendering (bundles own Chromium) | High memory usage (~150–500+ MB) |
| Easiest for web developers (JS/Node everywhere) | No mobile support (desktop only) |
| Battle-tested: VS Code, Slack, Discord, Figma | Ships entire Chromium = slow startup |
| Vast npm package ecosystem | Battery drain on laptops |
| Excellent documentation and tooling | Security concerns (Node.js access in renderer) |
| electron-builder for packaging/signing | Over-engineered for a simple alarm app |

#### Wails (Go + Web Frontend)

| Pros | Cons |
|------|------|
| Go backend — simple, fast, great stdlib | No mobile support (desktop only) |
| Small bundles (~8–15 MB) | Smaller ecosystem than Tauri/Electron |
| Uses OS-native WebView | Less mature plugin system |
| Good IPC model | Fewer contributors/community resources |
| Familiar for Go developers | WebView rendering inconsistencies |
| Simple build pipeline | No built-in auto-update |

#### Flutter (Dart)

| Pros | Cons |
|------|------|
| Best mobile support (iOS + Android, mature) | Requires rewriting frontend in Dart (no React reuse) |
| Beautiful custom UI, Skia rendering engine | Dart language (not widely adopted outside Flutter) |
| Single codebase: desktop + mobile | Custom rendering = not truly native look |
| Google-backed, very active community | Desktop support less mature than mobile |
| Hot reload for rapid development | Larger bundles than Tauri (~15–30 MB) |
| Material Design + Cupertino widgets built-in | System tray support via plugins only |

#### Go + CEF (Chromium Embedded Framework)

| Pros | Cons |
|------|------|
| Full Chromium control | Massive bundle (~150+ MB, like Electron) |
| Go backend performance | No mobile support |
| Flexible embedding | Complex build/packaging pipeline |
| — | High memory usage (~200+ MB) |
| — | Small community, limited documentation |
| — | Manual implementation for tray, notifications, updates |

#### Fyne (Pure Go)

| Pros | Cons |
|------|------|
| Pure Go — no web tech, no JS | Custom widget look (not native appearance) |
| Small binary, low memory | Limited mobile support (basic) |
| Consistent UI across platforms | Smaller ecosystem and community |
| Simple API | Limited system tray support |
| — | No auto-update mechanism |
| — | Fewer UI widgets than web frameworks |

---

## Recommendation

**Tauri 2.x** is the recommended framework for the Alarm App:

| Factor | Why Tauri Wins |
|--------|---------------|
| Platform coverage | Desktop (macOS/Windows/Linux) + Mobile (iOS/Android) from one codebase |
| Frontend reuse | Existing React + Vite + Tailwind + shadcn/ui frontend works directly |
| Performance | Smallest bundle, lowest RAM, fastest startup |
| Alarm reliability | Rust backend provides reliable timers, audio, and notification handling |
| Native integration | Built-in plugins for notifications, system tray, file system, auto-update |
| Security | Rust memory safety, granular API permissions |
| macOS-first fit | Excellent macOS support, native WebView (WKWebView), menu bar integration |

**Flutter** is the runner-up if mobile is prioritized over desktop, but requires a full Dart rewrite.

---

## Rollout Strategy

| Phase | Platform | Timeline |
|-------|----------|----------|
| Phase 1 | macOS desktop | First release |
| Phase 2 | Windows + Linux desktop | Second release |
| Phase 3 | iOS + Android mobile | Third release |

---

## Architecture Overview (Tauri)

```
┌─────────────────────────────────────────┐
│              Frontend (WebView)          │
│   React 18 + Vite + Tailwind + shadcn   │
│         TypeScript UI Layer             │
├─────────────────────────────────────────┤
│           Tauri IPC Bridge              │
│    invoke() / events / commands         │
├─────────────────────────────────────────┤
│           Backend (Rust Core)           │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ Alarm    │ │ Audio    │ │ Storage │ │
│  │ Engine   │ │ Manager  │ │ (SQLite)│ │
│  ├──────────┤ ├──────────┤ ├─────────┤ │
│  │ Notif.   │ │ System   │ │ Config  │ │
│  │ Manager  │ │ Tray     │ │ Manager │ │
│  └──────────┘ └──────────┘ └─────────┘ │
├─────────────────────────────────────────┤
│        Operating System APIs            │
│  macOS / Windows / Linux / iOS / Android│
└─────────────────────────────────────────┘
```

---

## Key Technical Decisions

| Decision | Web App (Previous) | Native App (New) |
|----------|-------------------|------------------|
| Storage | localStorage | SQLite via Tauri plugin |
| Audio | Web Audio API | Native audio via Tauri plugin / Rust crate |
| Notifications | Browser Notification API | OS-native notifications via Tauri plugin |
| Background execution | setInterval (throttled in background tabs) | Rust background thread (reliable) |
| Vibration | navigator.vibrate (browser only) | Native haptics API (mobile) |
| System tray | Not available | Tauri system tray plugin |
| Auto-update | Not applicable | Tauri updater plugin |
| Wake lock | Wake Lock API (limited support) | Native power management API |
| File export | Blob download | Native file dialog via Tauri |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Data Model | `./01-data-model.md` |
| Design System | `./02-design-system.md` |
| File Structure | `./03-file-structure.md` |
| Platform Constraints | `./04-platform-constraints.md` |
| Alarm Firing | `../02-features/03-alarm-firing.md` |
| Sound & Vibration | `../02-features/05-sound-and-vibration.md` |
