# Framework & Library Map

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`framework`, `library`, `rendering`, `ecs`, `physics`, `audio`, `input`, `ui`, `networking`, `per-language`, `matrix`

---

## Purpose

Per-language matrix of available game development libraries across all critical categories: rendering, ECS, physics, audio, input, UI, networking, and math. Answers: "For language X, what libraries exist for task Y?"

---

## 1. Rendering Libraries

| Library | Language | 2D | 3D | API Level | GPU Backend |
|---------|---------|:--:|:--:|-----------|-------------|
| **wgpu** | Rust | ✅ | ✅ | Mid-level | Vulkan, Metal, DX12, WebGPU |
| **vulkano** | Rust | ✅ | ✅ | Low-level | Vulkan only |
| **ash** | Rust | ✅ | ✅ | Low-level (raw) | Vulkan only |
| **rend3** | Rust | ❌ | ✅ | High-level | wgpu-based |
| **bgfx** | C/C++ | ✅ | ✅ | Mid-level | Vulkan, Metal, DX11/12, OpenGL |
| **sokol** | C | ✅ | ✅ | Mid-level | Metal, DX11, OpenGL, WebGPU |
| **Vulkan API** | C/C++ | ✅ | ✅ | Low-level (raw) | Vulkan |
| **DirectX 12** | C++ | ✅ | ✅ | Low-level | DX12 (Windows only) |
| **OpenGL** | C/C++ | ✅ | ✅ | Mid-level | OpenGL (legacy) |
| **Metal** | Swift/ObjC | ✅ | ✅ | Low-level | Metal (Apple only) |
| **go-gl** | Go | ✅ | ✅ | Low-level | OpenGL bindings |
| **Ebitengine** | Go | ✅ | ❌ | High-level | OpenGL, Metal (abstracted) |
| **Three.js** | JS | ❌ | ✅ | High-level | WebGL 2.0, WebGPU |
| **PixiJS** | JS | ✅ | ❌ | High-level | WebGL 2.0 |
| **regl** | JS | ✅ | ✅ | Mid-level | WebGL |
| **Silk.NET** | C# | ✅ | ✅ | Low-level | Vulkan, OpenGL, DX bindings |

---

## 2. ECS (Entity Component System) Libraries

| Library | Language | Archetype | Sparse Set | Parallelism | Notes |
|---------|---------|:---------:|:----------:|:-----------:|-------|
| **Bevy ECS** | Rust | ✅ | ❌ | ✅ Auto | Part of Bevy engine, excellent performance |
| **hecs** | Rust | ✅ | ❌ | ⚠️ Manual | Minimal, no dependencies |
| **legion** | Rust | ✅ | ❌ | ✅ Auto | Feature-rich, slightly complex |
| **specs** | Rust | ❌ | ✅ | ✅ Auto | Older, being replaced by Bevy ECS |
| **EnTT** | C++ | ✅ | ✅ | ⚠️ Manual | Industry standard for C++ ECS |
| **flecs** | C/C++ | ✅ | ❌ | ✅ Built-in | Very feature-rich, query system |
| **Unity DOTS** | C# | ✅ | ❌ | ✅ Job System | Official Unity ECS |
| **Arch** | C# | ✅ | ❌ | ⚠️ Manual | Lightweight .NET ECS |
| **bitecs** | JS | ❌ | ✅ | ❌ | Ultra-fast for JS, typed arrays |
| **miniplex** | JS/TS | ❌ | ✅ | ❌ | React-friendly ECS |
| **donburi** | Go | ✅ | ❌ | ⚠️ Manual | Go ECS, used with Ebitengine |
| **arche** | Go | ✅ | ❌ | ⚠️ Manual | Newer Go ECS |

---

## 3. Physics Libraries

| Library | Language | 2D | 3D | Deterministic | Notes |
|---------|---------|:--:|:--:|:------------:|-------|
| **Rapier** | Rust | ✅ | ✅ | ✅ | Best Rust physics — also compiles to WASM |
| **nphysics** | Rust | ✅ | ✅ | ⚠️ | Predecessor to Rapier, now maintained |
| **Box2D** | C++ | ✅ | ❌ | ✅ | Industry standard 2D physics |
| **Bullet** | C++ | ❌ | ✅ | ⚠️ | Used in many AAA games |
| **Jolt Physics** | C++ | ❌ | ✅ | ⚠️ | Horizon Forbidden West engine, open-sourced |
| **PhysX** | C++ | ❌ | ✅ | ⚠️ | NVIDIA, used in Unreal/Unity |
| **Chipmunk2D** | C | ✅ | ❌ | ✅ | Lightweight, good API |
| **Matter.js** | JS | ✅ | ❌ | ❌ | Popular web 2D physics |
| **Cannon-es** | JS | ❌ | ✅ | ❌ | Web 3D physics |
| **Ammo.js** | JS (WASM) | ❌ | ✅ | ⚠️ | Bullet compiled to WASM |
| **Forge2D** | Dart | ✅ | ❌ | ❌ | Box2D port for Flutter/Flame |
| **box2d-go** | Go | ✅ | ❌ | ✅ | Box2D bindings |
| **Godot Physics** | GDScript/C# | ✅ | ✅ | ⚠️ | Built into Godot |
| **Unity Physics** | C# | ✅ | ✅ | ✅ | DOTS-based, deterministic |

---

## 4. Audio Libraries

| Library | Language | Spatial | Streaming | Effects | Notes |
|---------|---------|:------:|:---------:|:-------:|-------|
| **rodio** | Rust | ❌ | ✅ | ⚠️ Basic | Simple, works well |
| **kira** | Rust | ✅ | ✅ | ✅ | Best Rust game audio — tweening, spatial |
| **cpal** | Rust | ❌ | ✅ | ❌ | Low-level audio I/O |
| **oddio** | Rust | ✅ | ✅ | ✅ | Spatial audio focused |
| **FMOD** | C/C++ | ✅ | ✅ | ✅ | Industry standard (commercial license) |
| **Wwise** | C/C++ | ✅ | ✅ | ✅ | AAA standard (commercial license) |
| **OpenAL** | C | ✅ | ✅ | ✅ | Open standard, cross-platform |
| **miniaudio** | C | ✅ | ✅ | ⚠️ | Single-header, excellent |
| **SoLoud** | C++ | ✅ | ✅ | ✅ | Free, easy API |
| **Howler.js** | JS | ✅ | ✅ | ✅ | Web audio abstraction |
| **Web Audio API** | JS | ✅ | ✅ | ✅ | Browser built-in |
| **Oto** | Go | ❌ | ✅ | ❌ | Low-level Go audio |
| **beep** | Go | ❌ | ✅ | ✅ | Higher-level Go audio |

---

## 5. Input Libraries

| Library | Language | Keyboard | Mouse | Gamepad | Touch | Notes |
|---------|---------|:--------:|:-----:|:-------:|:-----:|-------|
| **winit** | Rust | ✅ | ✅ | ❌ | ✅ | Window + input (use gilrs for gamepad) |
| **gilrs** | Rust | ❌ | ❌ | ✅ | ❌ | Gamepad-only, cross-platform |
| **SDL2** | C/C++ | ✅ | ✅ | ✅ | ✅ | Full input handling |
| **GLFW** | C | ✅ | ✅ | ✅ | ❌ | Window + keyboard + mouse + gamepad |
| **Gamepad API** | JS | ❌ | ❌ | ✅ | ❌ | Browser gamepad |
| **DOM Events** | JS | ✅ | ✅ | ❌ | ✅ | Browser input |
| **Ebitengine** | Go | ✅ | ✅ | ✅ | ✅ | Built into engine |

---

## 6. UI Libraries (In-Game)

| Library | Language | Immediate | Retained | Theming | Notes |
|---------|---------|:---------:|:--------:|:-------:|-------|
| **egui** | Rust | ✅ | ❌ | ✅ | Best Rust immediate-mode UI |
| **iced** | Rust | ❌ | ✅ | ✅ | Elm-inspired, not ideal for games |
| **bevy_ui** | Rust | ❌ | ✅ | ⚠️ | Bevy built-in, flexbox-based |
| **Dear ImGui** | C++ | ✅ | ❌ | ✅ | Industry standard debug/tool UI |
| **RmlUi** | C++ | ❌ | ✅ | ✅ | HTML/CSS-like game UI |
| **Nuklear** | C | ✅ | ❌ | ✅ | Single-header, minimal |
| **Godot Controls** | GDScript | ❌ | ✅ | ✅ | Best built-in game UI system |
| **Unity UGUI** | C# | ❌ | ✅ | ✅ | Mature, widely used |
| **React/HTML** | JS | ❌ | ✅ | ✅ | DOM overlay on canvas |

---

## 7. Networking Libraries

| Library | Language | Protocol | Reliability | Prediction | Notes |
|---------|---------|----------|:-----------:|:----------:|-------|
| **naia** | Rust | UDP | ✅ | ✅ | Game networking focused |
| **renet** | Rust | UDP | ✅ | ⚠️ | Simple reliable UDP |
| **Quinn** | Rust | QUIC | ✅ | ❌ | QUIC implementation |
| **ENet** | C | UDP | ✅ | ❌ | Classic game networking |
| **GameNetworkingSockets** | C++ | UDP | ✅ | ⚠️ | Valve's networking library |
| **RakNet** | C++ | UDP | ✅ | ⚠️ | Classic, used in many games |
| **Mirror** | C# | TCP/UDP | ✅ | ✅ | Unity multiplayer framework |
| **Photon** | C# | UDP | ✅ | ✅ | Commercial, very mature |
| **Colyseus** | JS | WebSocket | ✅ | ⚠️ | Node.js game server |
| **Socket.IO** | JS | WebSocket | ✅ | ❌ | General real-time |

---

## 8. Math Libraries

| Library | Language | Vectors | Matrices | Quaternions | SIMD | Notes |
|---------|---------|:-------:|:--------:|:-----------:|:----:|-------|
| **glam** | Rust | ✅ | ✅ | ✅ | ✅ | Bevy default, fastest Rust math |
| **nalgebra** | Rust | ✅ | ✅ | ✅ | ✅ | Full linear algebra |
| **GLM** | C++ | ✅ | ✅ | ✅ | ✅ | GLSL-style, very popular |
| **Eigen** | C++ | ✅ | ✅ | ✅ | ✅ | Scientific + game math |
| **DirectXMath** | C++ | ✅ | ✅ | ✅ | ✅ | Windows-focused, SIMD |
| **gl-matrix** | JS | ✅ | ✅ | ✅ | ❌ | Standard web 3D math |
| **System.Numerics** | C# | ✅ | ✅ | ✅ | ✅ | .NET built-in |
| **gonum** | Go | ✅ | ✅ | ❌ | ⚠️ | Scientific computing |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Language Comparison | `./02-language-comparison.md` |
| Engine Comparison | `./01-engine-comparison.md` |
| Custom Engine Research | `./03-custom-engine-research.md` |
| Game Dev Overview | `./00-overview.md` |
