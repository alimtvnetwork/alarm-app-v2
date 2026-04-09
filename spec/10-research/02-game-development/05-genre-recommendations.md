# Genre-Specific Recommendations

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`genre`, `strategy`, `fps`, `mobile`, `3d`, `2d`, `indie`, `browser`, `recommendation`, `age-of-empires`, `doom`

---

## Purpose

Best technology choices organized by game genre. For each genre: what matters most, what engine/language to use, what to avoid, and real-world examples.

---

## 1. Strategy Games (Age of Empires / Civilization-like)

### What Matters

- Large entity counts (hundreds to thousands of units on screen)
- Pathfinding performance (A* / flow fields on large grids)
- Networking for multiplayer (deterministic lockstep or client-server)
- UI complexity (build menus, tech trees, minimaps, resource displays)
- Map rendering (large tilemaps or terrain with fog of war)

### Recommended

| Choice | Engine/Language | Why |
|--------|----------------|-----|
| **Best** | Godot 4 (GDScript/C#) | Excellent 2D, strong UI system, free, editor included |
| **Runner-up** | Custom C++/Rust engine | If you need extreme entity counts (10K+ units) |
| **Also good** | Unity (C#) | Mature, lots of RTS tutorials and assets |
| **Avoid** | Unreal Engine | Overkill for 2D RTS, designed for 3D FPS |
| **Avoid** | Browser/JS | Performance insufficient for large-scale strategy |

### Key Libraries (if custom)

- **ECS:** flecs (C++), Bevy ECS (Rust) — essential for mass entity management
- **Pathfinding:** custom flow fields or A* on grid (build your own — game-specific)
- **Networking:** deterministic lockstep (requires fixed-point math, no floats)

### Examples

| Game | Engine | Notes |
|------|--------|-------|
| Age of Empires II DE | Custom (Genie engine, C++) | Remastered with modern rendering |
| Civilization VI | Custom (C++) | Always custom for Civ series |
| Factorio | Custom (C++) | Extreme simulation scale required custom |
| Northgard | Unity | Indie RTS success on Unity |
| Mindustry | Java (libGDX) | Open source, simple engine sufficient |

---

## 2. Retro FPS / Doom-like

### What Matters

- Fast rendering (software-style or low-poly 3D)
- Tight input response (mouse look, movement)
- Level design tools (or simple level formats)
- Modding support (optional but historically important)
- Small scope — retro FPS games are typically short

### Recommended

| Choice | Engine/Language | Why |
|--------|----------------|-----|
| **Best** | Custom Rust + wgpu | Full control, retro rendering, safety, WASM for browser |
| **Runner-up** | Godot 4 with retro shaders | Fast to prototype, built-in editor, export everywhere |
| **Also good** | Custom C++ + Vulkan/OpenGL | Industry-proven path, maximum control |
| **Also good** | Raylib (C) | Dead-simple 3D, perfect for jam-style retro FPS |
| **Avoid** | Unity/Unreal | Massively over-engineered for retro aesthetic |

### Examples

| Game | Engine | Notes |
|------|--------|-------|
| DUSK | Custom (GameMaker!) | Proves you don't need a AAA engine |
| ULTRAKILL | Unity | Exception — Unity works when dev is experienced |
| Prodeus | Custom (C++) | Custom renderer for retro look |
| Ion Fury | Build Engine (EDuke32) | Literal retro engine reuse |
| Wrath: Aeon of Ruin | Quake 1 engine (Darkplaces) | Retro engine reuse |

---

## 3. Mobile Games (Casual / Mid-Core)

### What Matters

- Small binary size (users abandon large downloads)
- Battery efficiency (no constant GPU thrashing)
- Touch input (gestures, swipes, taps)
- Monetization integration (ads, in-app purchases)
- Fast load times
- Both iOS and Android from one codebase

### Recommended

| Choice | Engine/Language | Why |
|--------|----------------|-----|
| **Best** | Unity (C#) | Most mature mobile deployment, huge asset store |
| **Runner-up** | Godot 4 (GDScript) | Free, growing mobile support, small binary |
| **Also good** | Flutter + Flame (Dart) | If app-first with casual game elements |
| **Also good** | PWA (Phaser/JS) | Zero install, instant play, good for casual |
| **Avoid** | Unreal Engine | Binary too large for casual mobile |
| **Avoid** | Custom C++/Rust | Overkill — spend time on game design, not engine |

### Examples

| Game | Engine | Notes |
|------|--------|-------|
| Clash Royale | Unity | Supercell uses Unity for mobile |
| Monument Valley | Unity | Beautiful mobile puzzle game |
| Alto's Odyssey | Unity | Atmospheric runner |
| Wordle | Web (PWA) | Massively viral, zero install |

---

## 4. PC Games (General)

### What Matters

- Rendering quality (players expect modern graphics on PC)
- Keyboard + mouse + gamepad support
- Modding support (Steam Workshop integration)
- Steam integration (achievements, cloud saves, multiplayer)
- Performance across hardware ranges

### Recommended

| Choice | Engine/Language | Why |
|--------|----------------|-----|
| **Best (3D)** | Unreal Engine 5 (C++) | Best 3D renderer, Nanite/Lumen, proven |
| **Best (2D/indie)** | Godot 4 | Free, lightweight, excellent for indie scope |
| **Runner-up (3D)** | Godot 4 (Vulkan renderer) | Growing 3D capability, free |
| **Runner-up (2D)** | Unity (C#) or MonoGame | Mature, huge ecosystem |
| **Custom** | Rust + Bevy or C++ | When you need specific tech (voxels, simulations) |

---

## 5. Linux-First Games

### What Matters

- Native Linux binary (not Proton/Wine)
- Vulkan or OpenGL rendering (no DirectX)
- Wayland + X11 support
- Distro-agnostic packaging (AppImage, Flatpak, Snap, or Steam)
- No Windows-only middleware

### Recommended

| Choice | Engine/Language | Why |
|--------|----------------|-----|
| **Best** | Godot 4 | Native Linux support, Vulkan renderer, open source |
| **Runner-up** | Bevy (Rust) | Cross-platform by default, wgpu uses Vulkan on Linux |
| **Also good** | Custom Rust + wgpu | Vulkan/OpenGL on Linux, no platform lock-in |
| **Also good** | Ebitengine (Go) | Simple 2D, Linux support built-in |
| **Avoid** | Unreal Engine | Linux support exists but is second-class |
| **Avoid** | Unity | Linux editor is experimental, export is OK |

### Packaging

| Format | Recommendation |
|--------|---------------|
| Steam | Best distribution — handles updates, dependencies, Proton |
| Flatpak | Best for non-Steam Linux distribution |
| AppImage | Simple single-file distribution |
| .deb / .rpm | Distro-specific, maintenance burden |
| Snap | Works but controversial in Linux community |
| Itch.io | Good for indie — simple upload, optional client |

---

## 6. 3D Games (General)

*See also: `09-3d-game-direction.md` for in-depth 3D analysis.*

### What Matters

- Rendering pipeline (PBR, shadows, global illumination)
- Asset pipeline (model import, texture compression, LOD)
- Animation system (skeletal, blend trees, IK)
- Editor / level design tools
- Performance optimization (culling, LOD, streaming)

### Recommended

| Scope | Best Choice | Why |
|-------|-------------|-----|
| AAA / high-fidelity | Unreal Engine 5 | Nanite, Lumen, MetaHuman, Chaos physics |
| Indie 3D | Godot 4 | Free, Vulkan renderer, growing fast |
| Stylized / low-poly | Godot 4 or Unity | Both handle stylized 3D well |
| Voxel / procedural | Custom (Rust/C++) | Engines aren't optimized for voxel rendering |
| Learning 3D | Godot 4 | Lowest barrier to entry, free |

---

## 7. Browser / Web Games

### What Matters

- Instant loading (no download)
- Cross-platform (any device with a browser)
- WebGL 2.0 / WebGPU compatibility
- Small asset sizes (streamed, compressed)
- Monetization (web ads, web payments)

### Recommended

| Game Type | Best Choice | Why |
|-----------|-------------|-----|
| 2D casual | Phaser 3 (JS/TS) | Most popular, huge community |
| 2D pixel art | Phaser 3 or PixiJS | Excellent sprite performance |
| 3D | Three.js or Babylon.js | Mature, well-documented |
| .io multiplayer | Custom (Canvas + WebSocket) | Lightweight, low latency |
| Complex 2D | Godot 4 (HTML5 export) | Full engine in browser via WASM |
| Complex 3D | Babylon.js or PlayCanvas | Feature-rich, editor available |

---

## 8. Lightweight / Experimental Indie

### What Matters

- Development speed (solo or 2-person team)
- Uniqueness of game feel
- Art style freedom
- Low-budget feasibility

### Recommended

| Choice | Why |
|--------|-----|
| Godot 4 | Free, fast iteration, built-in everything |
| Bevy (Rust) | If you want Rust + ECS architecture |
| LÖVE (Love2D) | Ultra-simple Lua 2D framework — great for jams |
| Raylib | C simplicity, batteries included |
| Phaser | Web-based, instant sharing |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Engine Comparison | `./01-engine-comparison.md` |
| Language Comparison | `./02-language-comparison.md` |
| Platform Recommendations | `./06-platform-recommendations.md` |
| App Shell Feasibility | `./07-app-shell-feasibility.md` |
| Doom Research | `./08-doom-and-retro-research.md` |
| Game Dev Overview | `./00-overview.md` |
