
# Game Development Research Plan

## Folder Structure

```
spec/10-research/02-game-development/
├── 00-overview.md                    ← Index + purpose + quick summary
├── 01-engine-comparison.md           ← Unity, Unreal, Godot, Bevy, etc.
├── 02-language-comparison.md         ← C++, Rust, Go, C#, Dart, JS — game dev ecosystems
├── 03-custom-engine-research.md      ← Build vs buy, what's needed, feasibility by genre
├── 04-framework-and-library-map.md   ← Rendering libs, ECS, physics, audio, input per language
├── 05-genre-recommendations.md       ← Strategy, Doom-like, mobile, 3D, indie, browser
├── 06-platform-recommendations.md    ← PC, Linux, mobile, cross-platform, console
├── 07-app-shell-feasibility.md       ← Tauri, Electron, Wails for games — when practical
├── 08-doom-and-retro-research.md     ← Raycasting, software rendering, retro 3D — modern options
├── 09-3d-game-direction.md           ← Entering 3D: engines vs frameworks vs custom
├── 10-final-summary.md              ← Generic + game-specific recommendations, decision matrix
└── diagrams/
    ├── 01-engine-scoring.mmd
    ├── 02-decision-flow.mmd
    └── 03-language-ecosystem-map.mmd
```

## Phase Plan

### Phase 1: Engine Comparison (01-engine-comparison.md)
- **Engines**: Unity, Unreal Engine 5, Godot 4, Bevy (Rust), Fyrox (Rust), Macroquad (Rust), Ebitengine (Go), Raylib, SDL2, Love2D, Defold, Cocos2d-x, MonoGame, Stride
- **Criteria**: Language, 2D/3D, editor maturity, asset pipeline, cross-platform export, Linux support, mobile support, licensing/cost, community size, learning curve, performance

### Phase 2: Language Comparison (02-language-comparison.md)
- **Languages**: C++ (industry standard), Rust (Bevy, wgpu), Go (Ebitengine, Raylib-go), C# (Unity, Godot, MonoGame), GDScript (Godot), Dart (Flame/Flutter), JavaScript/TypeScript (PixiJS, Three.js, Phaser)
- **Per language**: Available engines, rendering libs, ECS options, tooling, performance profile, learning curve, 2D/3D suitability, production readiness

### Phase 3: Custom Engine Research (03-custom-engine-research.md)
- Build vs use existing — decision framework
- What a custom engine requires (renderer, physics, audio, input, UI, asset pipeline, editor, save system, networking)
- Feasibility by genre and team size
- Historical examples (id Tech, Source, in-house engines)
- Modern custom engine paths: Rust+wgpu, C+++Vulkan/OpenGL, Go+OpenGL

### Phase 4: Framework & Library Map (04-framework-and-library-map.md)
- Per-language matrix of: rendering (wgpu, OpenGL, Vulkan, Metal, DirectX), ECS (legion, hecs, flecs), physics (rapier, box2d, bullet), audio (rodio, OpenAL, FMOD), input, UI, networking
- Which combinations are production-tested

### Phase 5: Genre Recommendations (05-genre-recommendations.md)
- Strategy (Age of Empires-like): large maps, pathfinding, AI, networking
- Retro/Doom-like: raycasting, lightweight 3D, fast iteration
- Mobile: touch input, small bundle, battery, monetization SDKs
- 3D AAA-adjacent: modern rendering, PBR, large worlds
- Indie/experimental: rapid prototyping, small team
- Browser/desktop-shell: HTML5 games, Electron/Tauri wrapped

### Phase 6: Platform Recommendations (06-platform-recommendations.md)
- PC (Windows primary), Linux-first, macOS, mobile (iOS/Android), cross-platform, console (overview only)
- Best engine/language per platform

### Phase 7: App Shell Feasibility (07-app-shell-feasibility.md)
- Can Tauri/Electron/Wails be used for games?
- Performance ceiling, rendering limits, input latency
- Where it works: card games, visual novels, UI-heavy games, turn-based
- Where it fails: real-time action, physics-heavy, 3D

### Phase 8: Doom & Retro Research (08-doom-and-retro-research.md)
- How Doom 1993 was built (C, software renderer, BSP)
- Modern equivalents: Rust+wgpu raycaster, C++ with modern OpenGL, Godot retro shader
- Pseudo-3D and raycasting approaches today
- When C++ is still the best choice vs Rust/Go alternatives

### Phase 9: 3D Game Direction (09-3d-game-direction.md)
- Entry paths: existing engine (Unreal, Godot, Bevy) vs framework (wgpu, three.js) vs custom
- Rendering pipeline complexity (forward vs deferred, PBR, shadows, post-processing)
- Recommended path by team size and scope

### Phase 10: Final Summary (10-final-summary.md)
- Generic decision matrix (language × engine × platform × genre)
- Game-specific recommendations per scenario
- "If you want to build X, choose Y because Z" format
- Cost-benefit and ROI analysis

### Phase 11: Diagrams
- Engine scoring radar/ranking chart
- Decision flowchart (genre → platform → engine/language)
- Language ecosystem map (language → available tools)

## Execution

Each phase = 1 "next" step. I'll create 2-3 files per step to keep quality high.
