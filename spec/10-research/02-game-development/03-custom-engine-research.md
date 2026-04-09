# Custom Engine Research — Build vs Buy

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`custom-engine`, `build-vs-buy`, `engine-development`, `rendering`, `c++`, `rust`, `vulkan`, `wgpu`, `architecture`

---

## Purpose

Analyzes when building a custom game engine makes sense versus using an existing one. Covers what a custom engine requires, feasibility by genre, historical examples, modern approaches, and realistic timelines.

---

## 1. What Does a Game Engine Actually Do?

A game engine is a collection of systems that together allow a game to run:

| System | Responsibility | Complexity |
|--------|---------------|:---:|
| **Rendering** | Draw 2D/3D graphics to screen | Very High |
| **Input** | Keyboard, mouse, gamepad, touch | Low |
| **Audio** | Sound effects, music, spatial audio | Medium |
| **Physics** | Collision detection, rigid body dynamics | High |
| **ECS / Scene** | Entity management, component architecture | Medium |
| **Asset Pipeline** | Load models, textures, audio, levels | High |
| **UI** | Menus, HUD, dialogs, text rendering | Medium |
| **Scripting** | Hot-reloadable game logic (optional) | Medium |
| **Networking** | Multiplayer, state sync, prediction | Very High |
| **Animation** | Skeletal, sprite sheet, procedural | High |
| **Editor** | Visual level design, property editing | Very High |
| **Save/Load** | Serialization, checkpoints, save files | Low |
| **Build/Deploy** | Package for target platforms | Medium |

### The Editor Problem

The editor is often 50–70% of the total engine development effort. Games like Unreal, Unity, and Godot are valuable primarily because of their editors — not just their runtimes. Building a custom engine without an editor means all level design happens in code or external tools, which is viable for some genres but crippling for others.

---

## 2. Build vs Buy Decision Matrix

| Factor | Build Custom | Use Existing Engine |
|--------|:---:|:---:|
| **Time to first playable** | 6–24 months | 1–4 weeks |
| **Total control over architecture** | ✅ Complete | ❌ Constrained by engine design |
| **Performance optimization** | ✅ Can optimize everything | ⚠️ Limited to engine's architecture |
| **Learning value** | ✅ Enormous | ⚠️ Learn the engine, not the fundamentals |
| **Team size needed** | 2–10+ (engine + game) | 1–5 (game only) |
| **Maintenance burden** | ✅ You own it forever | ❌ Engine updates may break things |
| **Licensing cost** | $0 | $0–royalties (Unity/Unreal) |
| **Shipping probability** | ~10–20% (most custom engines never ship a game) | ~40–60% |
| **Editor** | Must build or go without | ✅ Included |
| **Platform support** | Must implement per-platform | ✅ Built-in multi-platform |
| **Community / plugins** | ❌ None | ✅ Large ecosystem |

---

## 3. When to Build a Custom Engine

### Good Reasons

| Reason | Example |
|--------|---------|
| **Learning** | You want to deeply understand how games work at the lowest level |
| **Extreme performance** | You need deterministic frame times with zero GC, zero allocations (competitive FPS, VR) |
| **Novel rendering** | Your game has a unique visual style that existing engines don't support well (voxel, ray marching, ASCII) |
| **Minimal scope** | You're building a very specific game type and need only 20% of what an engine provides |
| **Long-term studio** | You're building a studio and want to own your technology stack for decades |
| **Embedded / unusual target** | Your target platform isn't supported by existing engines (custom hardware, retro consoles) |

### Bad Reasons

| Reason | Why It's Bad |
|--------|-------------|
| "I don't like Unity's UI" | Learn Godot instead — it takes days, not years |
| "Existing engines are bloated" | Use a lightweight engine (Raylib, Love2D) — still faster than custom |
| "I want full control" | You'll spend 90% of time on engine plumbing, 10% on your actual game |
| "It can't be that hard" | It is. See section 4. |
| "Commercial engines have licensing issues" | Godot is MIT licensed, Bevy is MIT/Apache — both free forever |

---

## 4. What Building a Custom Engine Actually Requires

### Minimum Viable Engine (2D Game)

| Component | Effort (solo dev) | Libraries You'd Use |
|-----------|:-----------------:|---------------------|
| Window + input | 1–2 weeks | SDL2, GLFW, winit (Rust) |
| 2D rendering (sprites, tilemaps) | 2–4 weeks | OpenGL/wgpu + custom, or sokol |
| Audio playback | 1 week | miniaudio, rodio, SoLoud |
| Basic physics (AABB collision) | 1–2 weeks | Custom, or Box2D/Rapier |
| Asset loading (images, audio) | 1 week | stb_image, image crate |
| Game loop + timing | 2–3 days | Custom (fixed timestep) |
| Text rendering | 1–2 weeks | FreeType + custom atlas, or fontdue |
| Basic UI (menus, buttons) | 2–4 weeks | egui, Dear ImGui, or custom |
| Save/load system | 1 week | JSON/MessagePack serialization |
| **Total** | **~3–5 months** | |

### Production Engine (3D Game)

| Component | Effort (small team) | Notes |
|-----------|:-------------------:|-------|
| Everything above | 3–5 months | Foundation |
| 3D renderer (PBR, shadows, lights) | 6–12 months | wgpu/Vulkan + custom pipeline |
| Skeletal animation | 2–3 months | ozz-animation or custom |
| 3D physics | 2–4 months | Jolt, Rapier 3D, or Bullet |
| Scene graph / ECS | 1–2 months | Custom or hecs/flecs |
| Level editor | 6–12 months | This is the biggest time sink |
| Material system | 1–2 months | Shader graph or code-based |
| LOD / culling / streaming | 2–3 months | Octree, frustum culling |
| Networking (multiplayer) | 3–6 months | QUIC/UDP + state sync |
| Platform abstraction | 1–2 months | Per-platform windowing, input, audio |
| **Total** | **~2–4 years** | With a team of 2–5 |

---

## 5. Historical Examples

| Game/Engine | Language | Custom Engine? | Time to Ship | Team Size | Result |
|-------------|---------|:-:|:-:|:-:|--------|
| **Doom (1993)** | C | ✅ Yes | ~2 years | 4 (Carmack + 3) | Revolutionary — defined FPS genre |
| **Quake (1996)** | C | ✅ Yes | ~2 years | 5–6 | First true 3D FPS engine |
| **Minecraft (2009)** | Java | ✅ Yes (LWJGL) | ~6 months (alpha) | 1 (Notch) | Best-selling game ever |
| **Celeste (2018)** | C# | ❌ MonoGame | ~2 years | 2–4 | Critical acclaim, commercial success |
| **Hollow Knight (2017)** | C# | ❌ Unity | ~3 years | 3 | Massive indie success |
| **Stardew Valley (2016)** | C# | ❌ MonoGame (XNA) | ~4.5 years | 1 | 30M+ copies sold |
| **Noita (2019)** | C++ | ✅ Yes | ~4 years | 3 | Novel pixel physics — required custom engine |
| **Teardown (2022)** | C++ | ✅ Yes | ~4 years | 1 (Dennis Gustafsson) | Voxel destruction — required custom engine |
| **Factorio (2020)** | C++ | ✅ Yes | ~8 years | ~10 | Custom engine for massive simulation |

### Lessons

1. **Minecraft proves a custom engine can win** — but Notch used Java + LWJGL (high-level, fast iteration), not C++ from scratch
2. **Noita, Teardown, Factorio needed custom engines** — their core mechanics (pixel physics, voxel destruction, factory simulation) couldn't be done well in Unity/Unreal
3. **Celeste, Hollow Knight, Stardew Valley used existing engines** — their innovations were in gameplay and art, not technology
4. **The vast majority of commercially successful indie games use existing engines**

---

## 6. Modern Custom Engine Approaches

### Approach A: Rust + wgpu (Recommended Modern Path)

```
Rust + wgpu + winit + egui + rapier + rodio
```

| Pros | Cons |
|------|------|
| Memory safety — no crashes from C++ memory bugs | Rust learning curve |
| wgpu abstracts Vulkan/Metal/DX12/WebGPU | Smaller ecosystem than C++ |
| Compiles to native + WASM (browser) | Slower compile times |
| Excellent package manager (Cargo) | Fewer game dev tutorials |
| Growing community (Bevy ecosystem) | No shipped AAA titles yet |

### Approach B: C++ + Vulkan (Industry Standard)

```
C++ + Vulkan/DX12 + SDL2 + ImGui + Bullet/Jolt + FMOD
```

| Pros | Cons |
|------|------|
| Industry standard — most game engines are C++ | Memory safety nightmare |
| Maximum ecosystem of game libraries | Complex build systems |
| Vulkan/DX12 give lowest-level GPU control | Very verbose API (Vulkan init is 1000+ lines) |
| Every platform is supported | Slow compile times |
| Most game dev books and courses target C++ | Easy to introduce subtle bugs |

### Approach C: C + Raylib (Minimalist)

```
C + Raylib (includes rendering, audio, input, math)
```

| Pros | Cons |
|------|------|
| Raylib handles window, rendering, audio, input in one library | C lacks modern language features |
| Extremely simple API — beginner-friendly | No ECS, no physics (add Box2D separately) |
| Small binaries, very fast compilation | Not suitable for complex 3D |
| Great for game jams and prototypes | Limited to what Raylib provides |

---

## 7. Feasibility by Game Type

| Game Type | Custom Engine Feasible? | Recommended Approach | Time (solo) |
|-----------|:---:|---|:---:|
| Retro 2D platformer | ✅ Yes | Rust+wgpu or C+Raylib | 3–6 months |
| Doom-like retro FPS | ✅ Yes | Rust+wgpu or C++ | 6–12 months |
| 2D strategy / RTS | ⚠️ Possible | Godot recommended instead | 12–18 months |
| Voxel game (Minecraft-like) | ✅ Yes (beneficial) | Rust+wgpu or C++ | 12–24 months |
| Pixel physics (Noita-like) | ✅ Yes (required) | C++ or Rust | 18–36 months |
| 3D open world | ❌ Not feasible solo | Use Unreal or Godot | 3–5+ years |
| Competitive multiplayer FPS | ❌ Not feasible solo | Use Unreal | 2–4+ years |
| Mobile casual | ❌ Not worth it | Use Unity, Godot, or Flame | Overkill |
| Visual novel | ❌ Massive overkill | Use Ren'Py or Godot | Unnecessary |

---

## 8. Decision Flowchart

```
START: Should I build a custom engine?

Q1: Is your game's core mechanic impossible or very hard in existing engines?
  → YES: Consider custom engine (Noita, Teardown, Factorio cases)
  → NO: Go to Q2

Q2: Is learning engine development your primary goal?
  → YES: Build custom, but expect to not ship a game
  → NO: Go to Q3

Q3: Are you building a long-term studio technology stack?
  → YES: Consider custom, budget 2–4 years
  → NO: Go to Q4

Q4: Do you need to ship a game?
  → YES: Use an existing engine (Godot, Unity, Unreal, Bevy)
  → NO: Build whatever interests you — it's a learning project
```

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Engine Comparison | `./01-engine-comparison.md` |
| Language Comparison | `./02-language-comparison.md` |
| Doom Research | `./08-doom-and-retro-research.md` |
| 3D Direction | `./09-3d-game-direction.md` |
| Game Dev Overview | `./00-overview.md` |
