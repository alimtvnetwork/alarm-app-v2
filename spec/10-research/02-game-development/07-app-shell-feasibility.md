# App Shell Feasibility for Games (Tauri / Electron / Wails)

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`tauri`, `electron`, `wails`, `game`, `app-shell`, `webview`, `feasibility`, `performance`, `canvas`, `webgl`

---

## Purpose

Can Tauri, Electron, or Wails be used to build games? When is it practical, when is it not? Evaluates rendering performance, input latency, audio capabilities, and game-type suitability for each app shell framework.

---

## 1. How App Shells Work for Games

```
┌──────────────────────────────────┐
│         App Shell (Tauri/        │
│         Electron/Wails)          │
│  ┌────────────────────────────┐  │
│  │   WebView / Chromium       │  │
│  │  ┌──────────────────────┐  │  │
│  │  │  Canvas / WebGL      │  │  │  ← Game renders here
│  │  │  (game loop running  │  │  │
│  │  │   in browser context)│  │  │
│  │  └──────────────────────┘  │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Native Backend            │  │  ← System access (file I/O,
│  │  (Rust / Node / Go)        │  │     audio, networking)
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

The game runs inside the WebView as a web application (Canvas 2D or WebGL). The native backend handles system-level features. Communication between frontend and backend happens via IPC.

---

## 2. Framework Comparison for Gaming

| Criterion | **Tauri** | **Electron** | **Wails** |
|-----------|:---:|:---:|:---:|
| **Rendering context** | OS WebView (WKWebView / WebView2 / webkit2gtk) | Bundled Chromium | OS WebView |
| **WebGL 2.0** | ✅ | ✅ | ✅ |
| **WebGPU** | ⚠️ Depends on OS WebView | ✅ (Chromium ships it) | ⚠️ Depends on OS WebView |
| **Canvas 2D** | ✅ | ✅ | ✅ |
| **Frame rate (60 FPS)** | ✅ Achievable | ✅ Achievable | ✅ Achievable |
| **Input latency** | ~1–3 ms overhead vs native | ~1–3 ms overhead | ~1–3 ms overhead |
| **Audio** | ✅ Web Audio + Rust audio crates via IPC | ✅ Web Audio + Node audio | ✅ Web Audio + Go audio |
| **Native file system** | ✅ Rust backend | ✅ Node.js | ✅ Go backend |
| **Background threads** | ✅ Rust tokio | ✅ Node workers | ✅ Go goroutines |
| **Bundle size** | ~10–20 MB (game + assets) | ~160–310 MB | ~15–25 MB |
| **Memory** | ~50–120 MB | ~200–500 MB | ~60–130 MB |

---

## 3. What Works

| Game Type | Tauri | Electron | Wails | Why |
|-----------|:---:|:---:|:---:|-----|
| Card games | ✅ | ✅ | ✅ | DOM/Canvas sufficient, minimal rendering |
| Board games | ✅ | ✅ | ✅ | Turn-based, UI-heavy |
| Visual novels | ✅ | ✅ | ✅ | Images + text + choices |
| Puzzle games | ✅ | ✅ | ✅ | Simple rendering, logic-heavy |
| 2D casual | ✅ | ✅ | ✅ | Canvas/WebGL handles sprites well |
| Idle / incremental | ✅ | ✅ | ✅ | Minimal rendering |
| Text adventures | ✅ | ✅ | ✅ | Pure DOM |
| Turn-based strategy | ✅ | ✅ | ✅ | No real-time rendering pressure |
| 2D retro (pixel art) | ✅ | ✅ | ✅ | Low-res rendering, efficient |

---

## 4. What Doesn't Work

| Game Type | Tauri | Electron | Wails | Why Not |
|-----------|:---:|:---:|:---:|---------|
| 3D FPS | ❌ | ❌ | ❌ | Input latency, WebView rendering overhead, no raw mouse |
| AAA 3D | ❌ | ❌ | ❌ | WebGL performance ceiling, memory limits |
| Real-time competitive | ❌ | ❌ | ❌ | Frame timing inconsistency, input latency |
| Open world | ❌ | ❌ | ❌ | Asset streaming, memory management |
| VR/AR | ❌ | ❌ | ❌ | No WebXR in Tauri/Wails WebView, latency |
| Physics-heavy simulation | ⚠️ | ⚠️ | ⚠️ | CPU-bound — WASM helps but still limited |

---

## 5. Performance Characteristics

### Frame Rate Benchmarks (Approximate)

| Scenario | Tauri / Wails (WebView) | Electron (Chromium) | Native Engine |
|----------|:---:|:---:|:---:|
| 100 sprites (Canvas 2D) | 60 FPS | 60 FPS | 60 FPS |
| 1,000 sprites (WebGL) | 60 FPS | 60 FPS | 60 FPS |
| 10,000 sprites (WebGL) | 45–60 FPS | 55–60 FPS | 60 FPS |
| Simple 3D scene (WebGL) | 60 FPS | 60 FPS | 60 FPS |
| Complex 3D (many draw calls) | 20–40 FPS | 30–50 FPS | 60 FPS |
| Particle systems (5K+) | 30–50 FPS | 40–55 FPS | 60 FPS |

### Input Latency

| Input Method | App Shell Overhead | Notes |
|-------------|:---:|-------|
| Keyboard (DOM events) | ~1–3 ms | Negligible for most games |
| Mouse (DOM events) | ~1–3 ms | Fine for casual, problematic for competitive FPS |
| Gamepad (Gamepad API) | ~5–10 ms | Higher latency than native gamepad |
| Touch | ~1–3 ms | Fine for mobile-style games |

---

## 6. Tauri-Specific Advantages for Games

| Feature | Benefit for Games |
|---------|------------------|
| Rust backend | Heavy computation (pathfinding, AI, world gen) runs in Rust at native speed |
| Small bundle | Game + engine + assets can ship under 20 MB |
| IPC for native audio | Use Rust audio crates (rodio, kira) for low-latency audio via IPC |
| File system access | Save games, load mods, manage asset files natively |
| System tray | Background game servers, notification area for multiplayer |
| WASM bridge | Game logic in Rust → compiled to WASM → runs in WebView, OR runs natively |
| Multi-platform | Desktop + mobile from one codebase |

### Recommended Tauri Game Architecture

```
Frontend (WebView):
  └── Phaser / PixiJS / Three.js (rendering)
  └── Game UI (React/Svelte components)
  └── requestAnimationFrame game loop

Backend (Rust):
  └── Game state management (if server-authoritative)
  └── File I/O (save/load)
  └── Audio playback (kira/rodio)
  └── Networking (tokio + UDP/TCP)
  └── Heavy computation (pathfinding, world gen, AI)

IPC Bridge:
  └── invoke() for commands (save, load, compute)
  └── emit()/listen() for events (audio triggers, state updates)
```

---

## 7. When to Use App Shell vs Game Engine

| Scenario | Use App Shell | Use Game Engine |
|----------|:---:|:---:|
| Game is primarily UI with game elements | ✅ | ❌ |
| Existing web game you want to distribute as desktop app | ✅ | ❌ |
| Card/board game with rich interface | ✅ | ❌ |
| Casual 2D game with web tech | ✅ | ❌ |
| Need native file system + networking + web rendering | ✅ | ❌ |
| Real-time 3D game | ❌ | ✅ |
| Performance-critical gameplay | ❌ | ✅ |
| Competitive multiplayer | ❌ | ✅ |
| Complex physics simulation | ❌ | ✅ |
| Large-scale open world | ❌ | ✅ |

---

## 8. Real-World Examples of App Shell Games

| Game / Project | Shell | Type | Notes |
|---------------|-------|------|-------|
| **Pokémon Showdown** (desktop) | Electron | Turn-based battle sim | Web game wrapped in Electron |
| **Lichess Desktop** | Electron/Tauri | Chess | Web chess client as desktop app |
| **.io games (desktop clients)** | Electron | Real-time multiplayer | Some .io games ship Electron clients |
| **Visual novel engines** | Electron/Tauri | VN | Ren'Py web exports wrapped in app shell |
| **Trading card games** | Electron | Card game | UI-heavy, turn-based — perfect fit |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Platform Research (Tauri/Electron/Wails) | `../01-platform-research/01-framework-comparison.md` |
| PWA Gaming | `../01-platform-research/04-pwa-research.md` |
| Genre Recommendations | `./05-genre-recommendations.md` |
| Platform Recommendations | `./06-platform-recommendations.md` |
| Game Dev Overview | `./00-overview.md` |
