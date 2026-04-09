# Final Summary & Recommendations

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`summary`, `recommendation`, `decision`, `scoring`, `game-development`, `engine`, `language`, `platform`, `genre`

---

## Purpose

Final consolidated recommendations for game development technology choices. Combines insights from all research files into actionable decision guidance — both generic (any team, any game) and game-specific (by genre, platform, and scope).

---

## 1. Generic Recommendations

### The Universal Decision Framework

```
Step 1: What type of game? (genre)
Step 2: What platform(s)? (PC, mobile, web, console)
Step 3: What's your team's language expertise?
Step 4: Do you need a visual editor?
Step 5: How important is shipping quickly?
```

### If You Want to Ship a Game

| Priority | Recommendation |
|----------|---------------|
| **Fastest path** | Godot 4 (GDScript) — free, editor, exports everywhere, great for 2D and indie 3D |
| **Most ecosystem** | Unity (C#) — largest asset store, most tutorials, best mobile |
| **Best 3D quality** | Unreal Engine 5 (C++) — Nanite, Lumen, best renderer |
| **Best for Rust devs** | Bevy — growing fast, ECS, compiles to WASM |
| **Best for web** | Phaser (2D) or Three.js/Babylon.js (3D) |

### If You Want to Learn Game Development

| Priority | Recommendation |
|----------|---------------|
| **Easiest start** | Godot 4 + GDScript (Python-like, instant feedback) |
| **Understanding fundamentals** | Custom engine in Rust (wgpu) or C (Raylib) |
| **Understanding rendering** | Write a software renderer or raycaster |
| **Industry-standard skills** | Unreal Engine 5 (Blueprint + C++) |

### If You Want to Build an Engine

| Priority | Recommendation |
|----------|---------------|
| **Modern + safe** | Rust + wgpu + Rapier + kira |
| **Industry standard** | C++ + Vulkan + Jolt/Bullet + FMOD |
| **Minimalist** | C + Raylib (or C + sokol) |
| **Don't** | Unless engine development IS the goal — use an existing engine to ship games |

---

## 2. Engine Scoring Summary

*From `01-engine-comparison.md` — condensed final scores:*

| Engine | 2D | 3D | Editor | Free | Mobile | Web | Linux | Score |
|--------|:--:|:--:|:------:|:----:|:------:|:---:|:-----:|:-----:|
| **Godot 4** | 10 | 7 | 9 | 10 | 8 | 8 | 10 | **72** |
| **Unity** | 8 | 8 | 10 | 5 | 10 | 5 | 6 | **52** |
| **Unreal 5** | 3 | 10 | 10 | 7 | 7 | 2 | 5 | **44** |
| **Bevy** | 8 | 6 | 2 | 10 | 3 | 8 | 10 | **47** |
| **Ebitengine** | 8 | 2 | 1 | 10 | 7 | 8 | 10 | **46** |
| **Raylib** | 7 | 5 | 1 | 10 | 4 | 6 | 10 | **43** |
| **MonoGame** | 8 | 5 | 2 | 10 | 7 | 2 | 8 | **42** |

*Scoring: Each criterion 0–10, weighted equally for this summary. See `01-engine-comparison.md` for full weighted analysis.*

---

## 3. Game-Specific Recommendations

### By Genre

| Genre | Best Choice | Runner-up | Key Reason |
|-------|-------------|-----------|------------|
| **2D Platformer** | Godot 4 | Bevy, MonoGame | Best 2D engine, free, built-in editor |
| **2D Strategy / RTS** | Godot 4 | Custom C++/Rust | Strong UI, good pathfinding support |
| **Retro FPS (Doom-like)** | Custom Rust+wgpu | Godot 4 + retro shaders | Full control over retro aesthetic |
| **3D Action (indie)** | Godot 4 | Bevy | Free, growing 3D, editor |
| **3D AAA** | Unreal Engine 5 | — | Nothing else matches UE5 fidelity |
| **Mobile Casual** | Unity | Godot 4, Flame | Best mobile deployment + monetization |
| **Browser Game (2D)** | Phaser 3 | PixiJS | Most popular, largest community |
| **Browser Game (3D)** | Three.js / Babylon.js | PlayCanvas | Mature, well-documented |
| **Card / Board Game** | Godot 4 or Tauri+web | Unity | UI-heavy, low rendering need |
| **Visual Novel** | Ren'Py or Godot 4 | Tauri + web | Purpose-built tools exist |
| **Voxel (Minecraft-like)** | Custom Rust+wgpu | Custom C++ | Engines aren't optimized for voxels |
| **Factory Sim (Factorio-like)** | Custom C++ or Rust | Godot 4 | Extreme simulation scale |

### By Platform

| Platform | Best Choice | Runner-up | Key Reason |
|----------|-------------|-----------|------------|
| **PC (Windows)** | Unreal 5 / Godot 4 | Unity, Bevy | Best rendering + distribution |
| **Linux-first** | Godot 4 | Bevy (Rust) | Native Linux, Vulkan, open source |
| **Mobile (iOS+Android)** | Unity | Godot 4 | Most mature mobile pipeline |
| **Web / Browser** | Phaser / Three.js | Godot HTML5 | Native web, instant play |
| **Cross-platform (all)** | Godot 4 | Unity | Free, exports to 7 platforms |
| **Console** | Unreal 5 / Unity | — | Only engines with console SDK support |
| **Steam Deck** | Godot 4 | Any Vulkan-based | SteamOS = Linux + Vulkan |

### By Team Background

| Team Knows | Path |
|-----------|------|
| Nothing (complete beginner) | Godot 4 + GDScript |
| JavaScript / TypeScript | Phaser (2D) or Three.js (3D) → graduate to Godot |
| Python | GDScript (Godot) — nearly identical syntax |
| C++ | Unreal Engine, or custom engine |
| Rust | Bevy, or custom with wgpu |
| Go | Ebitengine (2D only), or learn Godot |
| C# / .NET | Unity or Godot (C# mode) |
| Java / Kotlin | Unity (C# ≈ Java), or libGDX |

---

## 4. Cost-Benefit Analysis

| Approach | Time to Ship | Cost | Risk | Control | Learning |
|----------|:---:|:---:|:---:|:---:|:---:|
| **Godot 4** | 3–12 months | $0 | Low | Medium | High (engine concepts) |
| **Unity** | 3–12 months | $0–$2K/yr | Low | Medium | High (industry tool) |
| **Unreal 5** | 6–24 months | 5% royalties >$1M | Low-Medium | Medium-High | Very High (AAA pipeline) |
| **Bevy (Rust)** | 6–18 months | $0 | Medium | High | Very High (Rust + ECS) |
| **Custom Engine (Rust)** | 18–48 months | $0 | Very High | Maximum | Maximum |
| **Custom Engine (C++)** | 18–48 months | $0 | Very High | Maximum | Maximum |
| **Phaser (web)** | 1–6 months | $0 | Low | Medium | Medium |
| **Tauri + web game** | 2–8 months | $0 | Low | Medium-High | Medium |

---

## 5. Anti-Recommendations (Common Mistakes)

| Mistake | Why It's Wrong | Instead |
|---------|---------------|---------|
| "I'll build a custom engine then make my game" | Engine dev takes 2–5 years — most people never start the game | Use an existing engine, make the game first |
| "Unity is the only option" | Godot is free, growing, and better for many use cases | Evaluate Godot, especially for 2D and indie 3D |
| "C++ is required for game dev" | C# (Unity/Godot), GDScript, Rust (Bevy), JS (Phaser) all work | Choose based on game type and team skills |
| "Web games can't be real games" | Krunker.io, CrossCode, and many commercial games prove otherwise | Web is great for casual-to-midcore |
| "I need Unreal for my indie game" | Unreal is over-engineered for most indie projects | Use Godot or Unity unless you need AAA rendering |
| "Go/Dart/Java are good for games" | They work for simple/casual, but lack the ecosystem | Use them only if your game is casual and your team knows nothing else |

---

## 6. Final Decision Flowchart

```
START: I want to make a game

Q1: What genre?
  → Strategy/RTS → Godot 4 or Custom C++/Rust
  → Retro FPS → Custom Rust+wgpu or Godot 4
  → Mobile casual → Unity or Godot 4
  → Browser game → Phaser (2D) or Three.js (3D)
  → 3D AAA → Unreal Engine 5
  → 3D indie → Godot 4
  → Card/board/UI → Godot 4 or Tauri+web
  → Voxel/simulation → Custom Rust or C++

Q2: What platform?
  → PC/Linux → Godot 4 or Unreal 5
  → Mobile → Unity or Godot 4
  → Web → Phaser/Three.js or Godot HTML5
  → Console → Unity or Unreal 5
  → All → Godot 4

Q3: What language do you know?
  → None → Learn GDScript (Godot)
  → JS/TS → Phaser/Three.js → later Godot
  → Python → GDScript (Godot)
  → C++ → Unreal or custom engine
  → Rust → Bevy or custom wgpu
  → C# → Unity or Godot C#
  → Go → Ebitengine (2D only)
```

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Engine Comparison | `./01-engine-comparison.md` |
| Language Comparison | `./02-language-comparison.md` |
| Custom Engine Research | `./03-custom-engine-research.md` |
| Framework & Library Map | `./04-framework-and-library-map.md` |
| Genre Recommendations | `./05-genre-recommendations.md` |
| Platform Recommendations | `./06-platform-recommendations.md` |
| App Shell Feasibility | `./07-app-shell-feasibility.md` |
| Doom Research | `./08-doom-and-retro-research.md` |
| 3D Direction | `./09-3d-game-direction.md` |
| Game Dev Overview | `./00-overview.md` |
