# How Desktop Frameworks Work — A Beginner's Guide

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`beginner`, `explainer`, `tauri`, `electron`, `wails`, `rust`, `golang`, `webview`, `chromium`, `architecture`, `why-rust`, `language-lock`

---

## Purpose

Beginner-friendly explanation of **how Tauri, Electron, and Wails actually work**, why each one is locked to a specific backend language, and what the practical differences are. Written so someone with zero experience in desktop app development can understand the concepts.

---

## 1. The Big Picture — What Are We Even Doing?

When you build a web app (React, Vue, etc.), it runs in a **browser**. The browser handles everything: rendering the HTML/CSS, running your JavaScript, playing audio, sending notifications. But it's sandboxed — the browser won't let your code access the real file system, system tray, or native OS APIs.

A **desktop app framework** solves this by giving your web app a **backend process** that can talk to the operating system directly:

```
┌─────────────────────────────────────────────────┐
│  YOUR APP                                       │
│                                                 │
│  ┌─────────────────────────────────┐            │
│  │  FRONTEND (what the user sees)  │            │
│  │  HTML + CSS + JavaScript        │            │
│  │  React / Vue / Svelte / etc.    │            │
│  │  Runs inside a "WebView"        │            │
│  └──────────────┬──────────────────┘            │
│                 │  Messages (IPC)                │
│                 ▼                                │
│  ┌─────────────────────────────────┐            │
│  │  BACKEND (talks to the OS)      │            │
│  │  Written in Rust / Go / Node.js │            │
│  │  Can do anything a native app   │            │
│  │  can do: files, audio, tray,    │            │
│  │  notifications, etc.            │            │
│  └──────────────┬──────────────────┘            │
│                 │                                │
│                 ▼                                │
│  ┌─────────────────────────────────┐            │
│  │  OPERATING SYSTEM               │            │
│  │  macOS / Windows / Linux        │            │
│  └─────────────────────────────────┘            │
└─────────────────────────────────────────────────┘
```

**Key insight:** Every desktop framework has TWO parts:
1. **Frontend** — Your web UI (React, Vue, etc.) running inside some kind of browser window
2. **Backend** — A native process written in a specific programming language that handles OS-level things

The frontend and backend talk to each other using **IPC** (Inter-Process Communication) — basically sending messages back and forth like texting.

---

## 2. The Three Frameworks Explained

### 2.1 Electron — "Ship an entire Chrome browser with your app"

**Backend language:** JavaScript / Node.js  
**How the UI renders:** Bundled Chromium (a full copy of the Chrome browser)

#### How it works, step by step:

1. When a user opens your Electron app, it starts **two things**:
   - A **Node.js process** (the "main process") — this is your backend. It can read files, show notifications, create system tray icons, etc.
   - A **Chromium browser window** (the "renderer process") — this shows your React/Vue UI. It's literally Chrome, but without the address bar.

2. Your React code runs inside this Chromium window. It looks and works exactly like it does in a regular Chrome browser — because it IS Chrome.

3. When your frontend needs to do something native (e.g., "save a file to disk"), it sends a message to the Node.js backend via IPC. The backend does the work and sends the result back.

#### Why it's JavaScript/Node.js:

Electron was built by GitHub (for the Atom editor) in 2013. The whole point was: "Let web developers build desktop apps without learning a new language." Since web developers already know JavaScript, and Node.js is JavaScript for the backend, using Node.js was the obvious choice.

**You can't swap Node.js for Go or Rust** because:
- Chromium's internals are deeply integrated with Node.js via V8 (the JS engine)
- The IPC system is designed around Node.js APIs
- Electron IS Chromium + Node.js fused together — that's the product

#### The trade-off:

```
GOOD:  Same language everywhere (JavaScript)
GOOD:  Rendering is 100% consistent (it's always Chrome)
GOOD:  Massive ecosystem (anything in npm works)

BAD:   Your app ships a FULL copy of Chrome (~150-300 MB)
BAD:   Chrome is a memory hog (~150-500 MB RAM)
BAD:   No mobile support at all
BAD:   Slow startup (loading Chrome takes 2-5 seconds)
```

#### Real-world examples:
VS Code, Slack, Discord, Figma, Notion, Spotify (desktop), WhatsApp Desktop — these are all Electron apps.

---

### 2.2 Tauri — "Use the browser already on the user's computer"

**Backend language:** Rust  
**How the UI renders:** OS-native WebView (the browser engine built into the operating system)

#### How it works, step by step:

1. When a user opens your Tauri app, it starts **two things**:
   - A **Rust process** — this is your backend. Handles files, audio, notifications, tray, etc.
   - A **WebView window** — this shows your React/Vue UI, but instead of shipping Chrome, it uses the browser engine **already installed on the user's OS**:
     - macOS → WKWebView (Safari's engine)
     - Windows → WebView2 (Edge/Chromium engine, pre-installed on Windows 10+)
     - Linux → webkit2gtk (WebKit engine)

2. Your React code runs inside this WebView. It works almost identically to a regular browser, but the WebView is much lighter than a full Chrome.

3. When your frontend needs native access, it calls `invoke('command_name', { data })`. This sends a message to the Rust backend, which does the work and returns the result.

#### Why it's Rust (and why you can't use Go):

This is the key question. Here's why Tauri chose Rust and why you can't swap it:

**Reason 1: Tauri's core IS written in Rust**

Tauri isn't a "bring your own language" tool. The entire Tauri framework — the WebView management, the IPC bridge, the plugin system, the security sandbox, the build pipeline — is written in Rust. When you write "backend code" for a Tauri app, you're writing Rust functions that plug into this Rust framework.

Think of it like this: You can't use Java inside a Python library. Tauri is a Rust library, so your backend code must be Rust.

**Reason 2: Rust's unique strengths are WHY Tauri exists**

The Tauri team specifically chose Rust because of properties no other language has:

| Property | What it means | Why it matters for a desktop app |
|----------|--------------|----------------------------------|
| **Memory safety without garbage collector** | Rust prevents crashes and memory leaks at compile time, without needing a garbage collector (GC) | No random pauses, no memory leaks, no crashes — your alarm timer never misses |
| **Tiny binary size** | Rust compiles to very small native binaries | Tauri apps are 3-10 MB vs Electron's 150-300 MB |
| **Zero-cost abstractions** | High-level code compiles to the same efficiency as hand-written low-level code | Backend runs with minimal CPU and RAM |
| **No runtime** | Rust doesn't need a runtime environment (unlike Node.js, Go, or Dart) | Nothing extra to bundle — just your code |
| **Fearless concurrency** | Rust's ownership system prevents data races at compile time | Background threads (timers, audio) are guaranteed safe |

**Reason 3: It's a framework architecture decision, not a limitation**

Go has its own strengths (goroutines, simplicity, fast compilation). But:
- Go requires a **garbage collector** → periodic pauses, higher memory
- Go binaries are larger (~8-15 MB minimum due to Go runtime)
- Go can't be embedded into Rust's framework architecture

If you want Go as your backend language → use **Wails** (see below). Wails is essentially "Tauri but with Go instead of Rust."

**Analogy:** Tauri is a Rust building. You can decorate the rooms however you want (React, Vue, Svelte for the UI), but the walls, plumbing, and electrical are Rust. You can't swap the plumbing for Go plumbing — you'd need a different building (Wails).

#### The trade-off:

```
GOOD:  Tiny apps (3-10 MB)
GOOD:  Very low RAM (30-80 MB)
GOOD:  Mobile support (iOS + Android in v2)
GOOD:  Extremely reliable background processing
GOOD:  Your existing React/Vue frontend works as-is

BAD:   Rust is hard to learn (steep learning curve)
BAD:   WebView rendering can vary slightly between OS
BAD:   Smaller community than Electron (but growing fast)
```

---

### 2.3 Wails — "Tauri, but with Go instead of Rust"

**Backend language:** Go  
**How the UI renders:** OS-native WebView (same approach as Tauri)

#### How it works, step by step:

1. When a user opens your Wails app, it starts:
   - A **Go process** — your backend
   - A **WebView window** — your React/Vue UI (same native WebView approach as Tauri)

2. You write Go functions (structs and methods) and Wails automatically generates TypeScript bindings for them. Your React code can call these Go functions directly.

3. The architecture is nearly identical to Tauri, but the backend is Go instead of Rust.

#### Why it's Go:

Wails was created specifically for Go developers who wanted the "native WebView" approach (like Tauri) but didn't want to learn Rust. The Wails framework is written in Go, so your backend code must also be Go.

#### How Wails compares to Tauri:

| Criterion | **Tauri** (Rust) | **Wails** (Go) |
|-----------|:---:|:---:|
| Backend language | Rust (steep learning curve) | Go (much simpler to learn) |
| Binary size | ~3–10 MB | ~8–15 MB (Go runtime included) |
| RAM usage | ~30–80 MB | ~40–100 MB |
| Mobile support | ✅ iOS + Android (v2) | ❌ Desktop only |
| Plugin ecosystem | Rich (notifications, tray, updater, etc.) | Smaller (growing) |
| Auto-update | ✅ Built-in | ❌ Manual |
| Background threads | Rust async (tokio) — guaranteed safe | Go goroutines — simple and powerful |
| Build speed | Slower (Rust compilation) | Faster (Go compiles in seconds) |
| Community size | ~85K GitHub stars | ~25K GitHub stars |
| Commercial backing | CrabNebula (funded) | Community-driven |

#### The trade-off:

```
GOOD:  Go is much easier to learn than Rust
GOOD:  Small apps (8-15 MB)
GOOD:  Go goroutines are excellent for concurrent tasks
GOOD:  Fast build times (seconds, not minutes)
GOOD:  Your existing React/Vue frontend works as-is

BAD:   No mobile support — desktop only
BAD:   Smaller plugin ecosystem
BAD:   No built-in auto-update
BAD:   Go's garbage collector adds slight memory overhead vs Rust
BAD:   Smaller community and fewer resources
```

---

## 3. The Key Difference — WebView vs Bundled Chromium

This is the single most important architectural difference to understand:

### Electron's Approach: "Bundle Chrome"

```
Your Electron App (200 MB download)
├── Your code (5 MB)
├── Chromium browser (150 MB)     ← Entire Chrome engine shipped with your app
├── Node.js runtime (40 MB)       ← Full Node.js runtime
└── Other dependencies (5 MB)
```

Every Electron app ships its own copy of Chrome. If you have Slack, VS Code, and Discord installed, you have THREE copies of Chrome on your computer (plus your actual Chrome browser = four). This is why Electron apps use so much disk space and RAM.

**Benefit:** Rendering is 100% identical on every computer — you control the exact Chrome version.

### Tauri/Wails Approach: "Use what's already there"

```
Your Tauri App (5 MB download)
├── Your code (3 MB)
├── Rust backend binary (2 MB)
└── (No browser shipped — uses OS WebView at runtime)

At runtime:
├── macOS → uses WKWebView (Safari engine, pre-installed)
├── Windows → uses WebView2 (Edge engine, pre-installed on Win 10+)
└── Linux → uses webkit2gtk (must be installed, usually is)
```

No browser is shipped. The app uses whatever browser engine the OS provides.

**Benefit:** Tiny app size, low RAM. Your app is just your code + a small binary.  
**Risk:** The WebView version varies per OS/device, so rendering might differ very slightly (e.g., an old macOS might have an older Safari engine with CSS quirks).

---

## 4. Why You Can't Mix Languages

A common question: "Can I use Tauri with Go?" or "Can I use Electron with Rust?" Here's why the answer is no:

### Each framework is a monolithic system

| Framework | The framework itself is written in... | So your backend code must be... |
|-----------|--------------------------------------|--------------------------------|
| **Tauri** | Rust | Rust |
| **Electron** | C++ (Chromium) + JavaScript (Node.js) | JavaScript / Node.js |
| **Wails** | Go | Go |
| **Flutter** | C++ (engine) + Dart (framework) | Dart |

The framework isn't a generic "plug any language" system. It's a **complete architecture** where:
- The build system compiles your code with the framework
- The IPC bridge is designed for one language's type system
- Plugins are written in the framework's language
- Error handling, async patterns, and memory management follow that language's conventions

### What if you really want Go with Tauri's features?

Your options:
1. **Use Wails** — it's the Go equivalent of Tauri (native WebView, small binary). You lose mobile support and some plugins.
2. **Use Tauri + learn minimal Rust** — Most Tauri backend code is simple (calling plugins, handling IPC). You don't need to be a Rust expert.
3. **Use Tauri + sidecar** — Tauri supports launching external processes ("sidecars"). You could write a Go binary and have Tauri launch it alongside the Rust backend. But this adds complexity.

### Language comparison for desktop app backends

| Aspect | **Rust** (Tauri) | **Go** (Wails) | **JavaScript** (Electron) |
|--------|:---:|:---:|:---:|
| Learning difficulty | 🔴 Hard (6-12 months to be productive) | 🟢 Easy (2-4 weeks for basics) | 🟢 Easy (most web devs already know it) |
| Runtime required | No (compiles to native) | Yes (Go runtime, ~5-8 MB) | Yes (Node.js + V8, ~40 MB) |
| Memory management | Manual (compiler-checked ownership) | Automatic (garbage collector) | Automatic (garbage collector) |
| Concurrency model | `async`/`await` with tokio (fearless concurrency) | Goroutines (simple, lightweight) | Event loop + async/await (single-threaded) |
| Error handling | `Result<T, E>` (forced by compiler) | `if err != nil` (convention, not forced) | `try/catch` (can be ignored) |
| Type safety | Extreme (compiler catches almost everything) | Moderate (typed, but less strict) | Weak (even with TypeScript, runtime types exist) |
| Binary size | Smallest | Small | Largest (ships Node.js + Chromium) |
| Ecosystem for desktop | Growing (crates.io) | Moderate (Go modules) | Massive (npm) |
| Build speed | 🔴 Slow (minutes for full build) | 🟢 Fast (seconds) | 🟢 Fast (seconds) |
| Debugging | Moderate (LLDB, rust-analyzer) | Easy (delve, VS Code) | Easy (Chrome DevTools, VS Code) |

---

## 5. How IPC (Communication) Works in Each

IPC is how your React frontend talks to the native backend. Here's how each framework handles it:

### Electron IPC

```javascript
// Frontend (React)
const result = await window.electronAPI.readFile('/path/to/file');

// Backend (main.js — Node.js)
const { ipcMain } = require('electron');
ipcMain.handle('read-file', async (event, path) => {
  const fs = require('fs');
  return fs.readFileSync(path, 'utf-8');
});

// Preload script (bridges frontend ↔ backend)
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (path) => ipcRenderer.invoke('read-file', path),
});
```

### Tauri IPC

```typescript
// Frontend (React)
import { invoke } from '@tauri-apps/api/core';
const result = await invoke('read_file', { path: '/path/to/file' });

// Backend (src-tauri/src/lib.rs — Rust)
#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}
```

### Wails IPC

```typescript
// Frontend (React)
import { ReadFile } from '../wailsjs/go/main/App';
const result = await ReadFile('/path/to/file');

// Backend (app.go — Go)
func (a *App) ReadFile(path string) (string, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return "", err
    }
    return string(data), nil
}
```

Notice how each framework's IPC is designed around its backend language:
- Electron: JavaScript callbacks and Promises
- Tauri: Rust `Result<T, E>` return types with `#[tauri::command]` macro
- Wails: Go methods with `(value, error)` return pattern

You can't swap the backend language because the **IPC bridge is language-specific**.

---

## 6. Decision Flowchart — Which Framework Should You Use?

| Question | Answer → Use This |
|----------|-------------------|
| Do you need mobile (iOS/Android)? | **Yes** → Tauri 2.x or Flutter |
| | **No** → Any of the three |
| Does your team know Rust? | **Yes** → Tauri |
| | **No, but willing to learn** → Tauri (worth the investment) |
| | **No, and not willing** → Wails (Go) or Electron (JS) |
| Does your team know Go? | **Yes** → Wails (if desktop-only) |
| Do you care about bundle size / RAM? | **Yes** → Tauri (smallest) or Wails (small) |
| | **No** → Electron (biggest ecosystem) |
| Do you need maximum ecosystem / community? | **Yes** → Electron |
| Do you need consistent rendering on all OS? | **Yes** → Electron (ships Chromium) |
| | **No, slight variations OK** → Tauri or Wails (native WebView) |
| Is this a simple utility app? | **Yes** → Wails (simplest Go backend) |
| Is this a complex app with background tasks? | **Yes** → Tauri (Rust reliability + tokio) |

---

## 7. Summary Table

| | **Electron** | **Tauri** | **Wails** |
|---|:---:|:---:|:---:|
| **Backend** | Node.js (JavaScript) | Rust | Go |
| **Frontend** | Web (React/Vue/etc.) | Web (React/Vue/etc.) | Web (React/Vue/etc.) |
| **Browser** | Ships Chromium | Uses OS WebView | Uses OS WebView |
| **App size** | 150-300 MB | 3-10 MB | 8-15 MB |
| **RAM** | 150-500 MB | 30-80 MB | 40-100 MB |
| **Mobile** | ❌ No | ✅ Yes (v2) | ❌ No |
| **Learning curve** | 🟢 Easy | 🔴 Hard (Rust) | 🟡 Easy-Medium |
| **Ecosystem** | 🟢 Massive | 🟡 Growing | 🔴 Small |
| **Best for** | Desktop apps where size/RAM don't matter | All-platform apps with small footprint | Desktop-only Go apps |
| **Think of it as** | "Chrome wrapped around your app" | "Lean native shell for your web app" | "Tauri's simpler Go cousin" |

---

## 8. Common Misconceptions

| Misconception | Reality |
|---------------|---------|
| "Tauri is just a lighter Electron" | No — they have fundamentally different architectures. Electron ships Chromium; Tauri uses native WebViews. The backend languages are different. They share almost no code. |
| "I can use any language with Tauri" | No — Tauri's core, plugins, and IPC are Rust. Your backend must be Rust. You can launch sidecar processes in other languages, but the main app logic is Rust. |
| "Electron apps are bad" | No — VS Code (Electron) is one of the best apps ever made. Electron is fine when RAM/size isn't a priority and you want maximum ecosystem maturity. |
| "Wails is a copy of Tauri" | No — Wails predates Tauri's stable release. They independently arrived at the same "native WebView + compiled backend" architecture but with different languages. |
| "WebView apps look worse than Electron" | Not really — modern OS WebViews (especially macOS WKWebView and Windows WebView2) render CSS/JS nearly identically to Chrome. The differences are edge cases. |
| "Rust is too hard for app development" | Depends. For Tauri, most backend code is simple `#[tauri::command]` functions. You don't need advanced Rust. The hard parts (lifetimes, borrow checker) rarely come up in typical app backends. |
| "Go is too simple for complex apps" | No — Go's simplicity is its strength. Goroutines handle concurrency elegantly. Many large-scale systems (Docker, Kubernetes) are written in Go. |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Framework Comparison (detailed specs) | `./01-framework-comparison.md` |
| Development Velocity | `./02-development-velocity.md` |
| Recommendation | `./03-recommendation.md` |
| PWA Research | `./04-pwa-research.md` |
| Capacitor Hybrid Research | `./05-capacitor-hybrid-research.md` |
| Architecture Diagram | `../diagrams/08-framework-architecture.mmd` |
| Platform Research Overview | `./00-overview.md` |
