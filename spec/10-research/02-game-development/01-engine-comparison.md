# Engine Comparison

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`engine`, `unity`, `unreal`, `godot`, `bevy`, `fyrox`, `ebitengine`, `raylib`, `sdl2`, `defold`, `comparison`, `game-engine`

---

## Purpose

Side-by-side evaluation of game engines and frameworks available today. Covers commercial engines (Unity, Unreal), open-source engines (Godot, Bevy, Fyrox), lightweight frameworks (Raylib, SDL2, Love2D, Ebitengine), and specialized options (Defold, Cocos2d-x, MonoGame, Stride). Each is assessed on rendering, editor tooling, asset pipelines, platform support, licensing, community, and suitability for different game types.

---

## 1. Overview Matrix

| Engine | Language | 2D | 3D | Editor | Open Source | License | Platforms |
|--------|----------|:--:|:--:|:------:|:-----------:|---------|-----------|
| **Unity** | C# | ✅ | ✅ | ✅ Mature | ❌ | Free tier + revenue share (>$200K) | Windows, macOS, Linux, iOS, Android, Console, Web |
| **Unreal Engine 5** | C++, Blueprints | ⚠️ | ✅ | ✅ Mature | ⚠️ Source available | Free + 5% royalty (>$1M) | Windows, macOS, Linux, iOS, Android, Console |
| **Godot 4** | GDScript, C#, C++ | ✅ | ✅ | ✅ Good | ✅ MIT | Free, no royalties | Windows, macOS, Linux, iOS, Android, Web, Console (via third-party) |
| **Bevy** | Rust | ✅ | ✅ | ❌ None yet | ✅ MIT/Apache | Free | Windows, macOS, Linux, Web (WASM), iOS, Android (experimental) |
| **Fyrox** | Rust | ✅ | ✅ | ✅ Built-in | ✅ MIT | Free | Windows, macOS, Linux, Web (WASM) |
| **Ebitengine** | Go | ✅ | ⚠️ Basic | ❌ None | ✅ Apache 2.0 | Free | Windows, macOS, Linux, iOS, Android, Web (WASM), Nintendo Switch |
| **Raylib** | C (bindings: Rust, Go, etc.) | ✅ | ✅ Basic | ❌ None | ✅ zlib | Free | Windows, macOS, Linux, Web, Android, Raspberry Pi |
| **SDL2** | C (bindings everywhere) | ✅ | ⚠️ (with OpenGL) | ❌ None | ✅ zlib | Free | Windows, macOS, Linux, iOS, Android, Web |
| **Love2D** | Lua | ✅ | ❌ | ❌ None | ✅ zlib | Free | Windows, macOS, Linux, iOS, Android, Web |
| **Defold** | Lua | ✅ | ✅ Basic | ✅ Built-in | ✅ Custom OSS | Free | Windows, macOS, Linux, iOS, Android, Web, Console |
| **Cocos2d-x** | C++ | ✅ | ✅ Basic | ✅ Cocos Creator | ✅ MIT | Free | Windows, macOS, Linux, iOS, Android, Web |
| **MonoGame** | C# | ✅ | ✅ Basic | ❌ None | ✅ MIT | Free | Windows, macOS, Linux, iOS, Android, Console |
| **Stride** | C# | ✅ | ✅ | ✅ Built-in | ✅ MIT | Free | Windows, Linux (partial) |
| **Macroquad** | Rust | ✅ | ⚠️ Basic | ❌ None | ✅ MIT/Apache | Free | Windows, macOS, Linux, Web (WASM), Android, iOS |
| **Phaser** | JavaScript | ✅ | ❌ | ❌ None | ✅ MIT | Free | Web (browser) |
| **Three.js** | JavaScript | ⚠️ | ✅ | ❌ None | ✅ MIT | Free | Web (browser) |
| **PixiJS** | JavaScript | ✅ | ❌ | ❌ None | ✅ MIT | Free | Web (browser) |
| **Flame** | Dart (Flutter) | ✅ | ❌ | ❌ None | ✅ MIT | Free | iOS, Android, Web, Desktop |

---

## 2. Detailed Engine Analysis

### 2.1 Unity (C#)

**What it is:** The most widely used commercial game engine. Full-featured editor, massive asset store, excellent documentation. Powers thousands of shipped games across all platforms including consoles.

| Pros | Cons |
|------|------|
| Most mature editor and asset pipeline in the industry | Revenue share model ($200K+ threshold) — licensing concerns |
| Massive Asset Store — buy ready-made components | Runtime install pricing controversy (partially reversed, trust damaged) |
| Excellent 2D and 3D support | Bloated for small games — minimum build ~50 MB |
| Supports every platform including all consoles | Closed source — dependent on Unity Technologies |
| Largest community, most tutorials, most Stack Overflow answers | C# only (no Rust, Go, C++ integration without plugins) |
| Visual scripting (Bolt), animation tools, physics built-in | Performance ceiling for ultra-demanding 3D (vs Unreal) |
| Hot reload in editor | Mobile build pipeline can be fragile |
| 15+ years of battle-tested production use | — |

**Best for:** Mobile games, indie 2D/3D, rapid prototyping, solo developers, small teams, cross-platform games.

**Avoid when:** You want no licensing/royalty obligations, need AAA 3D rendering, or want full source control.

---

### 2.2 Unreal Engine 5 (C++, Blueprints)

**What it is:** The industry-standard engine for AAA and high-fidelity 3D games. Created by Epic Games. Features Nanite (virtualized geometry), Lumen (global illumination), and MetaHuman.

| Pros | Cons |
|------|------|
| Best 3D rendering available (Nanite, Lumen, virtual shadow maps) | Extremely steep learning curve — complex C++ codebase |
| Source available — can modify engine code | 5% royalty above $1M revenue |
| Blueprints visual scripting — non-programmers can contribute | Very heavy: editor uses 8+ GB RAM, builds are large |
| Mature animation, physics, networking, AI tools | 2D support is an afterthought |
| Console support out of the box (PlayStation, Xbox, Switch) | C++ compile times are slow (minutes for full rebuild) |
| MetaHuman, Quixel Megascans integration | Over-engineered for small/indie games |
| Industry standard — skills transfer to studio jobs | Team of 1–3 will struggle with the complexity |
| — | Linux editor support exists but is less polished |

**Best for:** AAA and AA 3D games, realistic rendering, cinematic experiences, large teams, console targeting.

**Avoid when:** Making 2D games, small team/solo, want fast iteration, or building mobile-first.

---

### 2.3 Godot 4 (GDScript, C#, C++)

**What it is:** Fully open-source (MIT license) game engine with growing 2D and 3D capabilities. Lightweight, fast editor, no royalties. The most popular open-source alternative to Unity.

| Pros | Cons |
|------|------|
| Completely free — MIT license, no royalties, no revenue share | 3D rendering less mature than Unity or Unreal |
| Lightweight editor (~40 MB download, launches in seconds) | Smaller asset marketplace than Unity |
| Excellent 2D engine — best-in-class for 2D games | Console export requires third-party solutions (W4 Games) |
| GDScript is beginner-friendly (Python-like) | GDScript is niche — skills don't transfer outside Godot |
| C# support (via .NET) for experienced developers | C# integration is newer, some gaps |
| Scene-based architecture is intuitive | 3D performance not suitable for AAA-scale worlds |
| Active community, rapid development (major releases yearly) | Documentation gaps for advanced 3D features |
| HTML5 export for browser games | Physics engine less robust than Unity/Unreal |
| Full source code — can modify anything | — |

**Best for:** 2D games (best engine), indie 3D, open-source projects, learning game dev, Linux-first development, solo/small teams.

**Avoid when:** Targeting AAA 3D fidelity, need robust console pipeline, or need a massive asset store.

---

### 2.4 Bevy (Rust)

**What it is:** A data-driven, ECS-first game engine written in Rust. Modern architecture, excellent performance, and growing ecosystem. No visual editor yet — code-driven development.

| Pros | Cons |
|------|------|
| Written in Rust — memory safety, fearless concurrency | **No visual editor** — everything is code (editor planned) |
| ECS architecture is modern and performant | Rust learning curve is steep |
| Excellent 2D and growing 3D support | Still pre-1.0 — breaking API changes between versions |
| Hot reloading support (experimental) | Smaller community than Unity/Godot/Unreal |
| WASM support for browser games | Asset pipeline is basic compared to commercial engines |
| Plugin ecosystem growing (physics, UI, networking) | No console support |
| MIT/Apache dual license — fully free | 3D features still catching up to Godot |
| Fast compile times for Rust (incremental) | Not production-proven for large commercial games yet |
| Excellent documentation and learning resources | — |

**Best for:** Rust developers, performance-critical games, ECS enthusiasts, 2D games, developers who prefer code over visual editors, experimental/indie projects.

**Avoid when:** You need a visual editor now, targeting consoles, or need a production-proven engine for a commercial release.

---

### 2.5 Fyrox (Rust)

**What it is:** A Rust game engine with a built-in visual editor (FyroxEd). More traditional architecture than Bevy — closer to Godot's scene/node model.

| Pros | Cons |
|------|------|
| Has a visual editor (FyroxEd) — unlike Bevy | Much smaller community than Bevy |
| Scene/node architecture familiar to Godot/Unity users | Less mature than Bevy in many areas |
| 3D rendering with PBR, shadows, post-processing | Fewer plugins and resources |
| Written in Rust — same safety benefits as Bevy | Documentation is thinner |
| MIT license | Breaking changes as engine evolves |

**Best for:** Rust developers who want a visual editor and traditional engine architecture.

---

### 2.6 Ebitengine (Go)

**What it is:** A simple, production-ready 2D game engine for Go. Extremely easy to learn. Used for commercial games on Nintendo Switch.

| Pros | Cons |
|------|------|
| Dead-simple API — productive in hours, not weeks | **2D only** — no 3D support |
| Go is easy to learn | No visual editor |
| Production-proven (shipped on Nintendo Switch) | Limited rendering features for complex 2D |
| Excellent cross-platform (desktop, mobile, web, Switch) | Small community |
| WASM support for browser games | No physics engine built-in |
| Very small binaries | Not suitable for complex games |

**Best for:** Simple 2D games, Go developers, game jams, browser games, mobile games.

---

### 2.7 Raylib (C, with bindings)

**What it is:** A minimal C library for game programming. No engine — just a clean, simple API for rendering, input, audio, and window management. Bindings exist for 50+ languages including Rust, Go, Python.

| Pros | Cons |
|------|------|
| Extremely simple API — learn in a day | Not an engine — you build everything yourself |
| Bindings for 50+ languages | No editor, no asset pipeline, no scene system |
| Excellent for learning game programming | Not suitable for large production games |
| Very small footprint | Limited 3D features (basic) |
| Great documentation and examples | — |

**Best for:** Learning, prototyping, game jams, retro-style games, educational projects.

---

### 2.8 SDL2 (C, with bindings)

**What it is:** The industry-standard low-level multimedia library. Handles window creation, input, audio, and rendering context setup. Not a game engine — a foundation layer. Used by Valve, countless indie games, and many engines internally.

| Pros | Cons |
|------|------|
| Industry standard — used by Valve, many engines | Not an engine — provides no game logic framework |
| Rock-solid stability and cross-platform support | You must build everything on top (or pair with OpenGL/Vulkan) |
| Bindings for every language | No editor, no scene system, no asset pipeline |
| Battle-tested for decades | More boilerplate than Raylib for simple games |
| Excellent for building custom engines | — |

**Best for:** Custom engine foundation, low-level control, building on top of with OpenGL/Vulkan.

---

## 3. Scoring Comparison

Each criterion scored 0–10.

| Factor | Unity | Unreal | Godot | Bevy | Fyrox | Ebitengine | Raylib |
|--------|:-----:|:------:|:-----:|:----:|:-----:|:----------:|:------:|
| 2D capability | 8 | 3 | 10 | 8 | 6 | 9 | 7 |
| 3D capability | 9 | 10 | 7 | 5 | 6 | 1 | 4 |
| Editor maturity | 10 | 10 | 8 | 0 | 5 | 0 | 0 |
| Asset pipeline | 10 | 10 | 7 | 3 | 4 | 1 | 1 |
| Cross-platform | 10 | 9 | 8 | 7 | 5 | 9 | 8 |
| Mobile support | 10 | 8 | 7 | 3 | 2 | 8 | 5 |
| Linux support | 7 | 6 | 10 | 10 | 9 | 9 | 9 |
| Console support | 10 | 10 | 4 | 0 | 0 | 5 | 0 |
| Community size | 10 | 9 | 8 | 6 | 2 | 3 | 5 |
| Learning curve (10=easy) | 7 | 3 | 9 | 4 | 4 | 9 | 8 |
| Performance | 7 | 10 | 7 | 9 | 8 | 7 | 8 |
| Licensing freedom | 5 | 4 | 10 | 10 | 10 | 10 | 10 |
| Documentation | 9 | 8 | 7 | 7 | 4 | 6 | 8 |
| **Total (/130)** | **112** | **100** | **102** | **72** | **65** | **77** | **73** |
| **Percentage** | **86%** | **77%** | **78%** | **55%** | **50%** | **59%** | **56%** |

### Ranking by Total Score

| Rank | Engine | Score | Best Use Case |
|------|--------|:-----:|---------------|
| 🥇 1st | **Unity** | 112/130 (86%) | Most versatile — 2D, 3D, mobile, console, everything |
| 🥈 2nd | **Godot 4** | 102/130 (78%) | Best open-source option — excellent 2D, good 3D, free |
| 🥉 3rd | **Unreal 5** | 100/130 (77%) | Best 3D rendering — AAA fidelity, large teams |
| 4th | **Ebitengine** | 77/130 (59%) | Simplest 2D engine — Go, fast to learn, production-ready |
| 5th | **Raylib** | 73/130 (56%) | Best for learning — simple, multi-language, great docs |
| 6th | **Bevy** | 72/130 (55%) | Best Rust engine — modern ECS, growing fast, no editor yet |
| 7th | **Fyrox** | 65/130 (50%) | Rust alternative with editor — smaller community |

> **Note:** Scores are for general-purpose evaluation. A project-specific evaluation may weight criteria differently — see `05-genre-recommendations.md` and `06-platform-recommendations.md`.

---

## 4. Licensing Comparison

| Engine | License Type | Cost | Revenue Threshold | Source Access |
|--------|-------------|------|:-----------------:|:-------------:|
| **Unity** | Proprietary + free tier | Free (Personal) / $2K+/yr (Pro) | $200K revenue → must use Plus/Pro | ❌ Closed |
| **Unreal 5** | Custom EULA | Free to use | 5% royalty above $1M gross | ⚠️ Source available (not OSS) |
| **Godot 4** | MIT | Free | None — no royalties ever | ✅ Full OSS |
| **Bevy** | MIT / Apache 2.0 | Free | None | ✅ Full OSS |
| **Fyrox** | MIT | Free | None | ✅ Full OSS |
| **Ebitengine** | Apache 2.0 | Free | None | ✅ Full OSS |
| **Raylib** | zlib | Free | None | ✅ Full OSS |
| **SDL2** | zlib | Free | None | ✅ Full OSS |
| **Love2D** | zlib | Free | None | ✅ Full OSS |
| **Defold** | Custom OSS | Free | None | ✅ Full OSS |

---

## 5. Startup Time & Iteration Speed

| Engine | Editor Launch | New Project Setup | Hot Reload | Build Time (dev) | Iteration Feel |
|--------|:------------:|:-----------------:|:----------:|:----------------:|:--------------:|
| **Unity** | 30–120 sec | 5 min (template) | ✅ Partial | 10–60 sec | Medium |
| **Unreal** | 60–180 sec | 10 min (template) | ✅ Live coding | 30–300 sec | Slow |
| **Godot** | 2–5 sec | 30 sec | ✅ Scene reload | 1–5 sec | Very fast |
| **Bevy** | N/A (code) | 5 min (cargo) | ⚠️ Experimental | 3–15 sec (incremental Rust) | Fast (after setup) |
| **Ebitengine** | N/A (code) | 1 min (go mod) | ❌ Restart | 1–3 sec (Go compiles fast) | Very fast |
| **Raylib** | N/A (code) | 1 min | ❌ Restart | < 1 sec (C compiles instantly) | Fastest |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Game Dev Overview | `./00-overview.md` |
| Language Comparison | `./02-language-comparison.md` |
| Custom Engine Research | `./03-custom-engine-research.md` |
| Genre Recommendations | `./05-genre-recommendations.md` |
| Engine Scoring Diagram | `../diagrams/04-engine-scoring.mmd` |
