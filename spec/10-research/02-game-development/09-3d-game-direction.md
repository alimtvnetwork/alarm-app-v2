# 3D Game Development Direction

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`3d`, `rendering`, `vulkan`, `wgpu`, `pbr`, `engine`, `custom`, `unreal`, `godot`, `bevy`, `pipeline`

---

## Purpose

Research into entering 3D game development — comparing existing engines vs frameworks vs custom engine approaches. Covers rendering pipelines, what 3D requires beyond 2D, and recommendations by scope and team size.

---

## 1. What 3D Game Development Requires (Beyond 2D)

| Requirement | 2D | 3D | Complexity Increase |
|-------------|:--:|:--:|:---:|
| Rendering pipeline | Sprites, tilemaps | PBR, shadows, lighting, post-processing | 10–50× |
| Camera system | Simple 2D scroll | Perspective/orthographic, orbit, FPS, cinematic | 5× |
| Asset creation | Pixel art, sprites | 3D models, textures, materials, rigging, animation | 10–20× |
| Physics | 2D AABB, circles | 3D convex hulls, mesh colliders, joints | 5–10× |
| Level design | 2D tilemaps, rooms | 3D environments, terrain, architecture | 5–10× |
| Lighting | Flat or per-sprite | Real-time shadows, GI, ambient occlusion | 10–50× |
| Animation | Sprite sheets | Skeletal animation, blend trees, IK, ragdoll | 10× |
| Performance | Mostly CPU-bound | GPU-bound, draw calls, shader optimization | 5× |
| Audio | 2D panning | 3D spatial audio, HRTF, reverb zones | 3× |
| Math | 2D vectors, matrices | Quaternions, 4×4 matrices, basis vectors | 3× |

**Key takeaway:** 3D game development is 5–50× more complex than 2D depending on the subsystem. This is why existing engines are strongly recommended for 3D.

---

## 2. Paths into 3D Game Development

### Path A: Existing 3D Engine (Recommended)

```
Choose Unreal, Godot, or Unity → Learn the engine → Build your game
```

| Pros | Cons |
|------|------|
| Editor, renderer, physics, audio included | Constrained by engine architecture |
| Years of development already done for you | Must learn engine-specific workflows |
| Tutorials, community, asset stores | Engine updates may break your project |
| Ship to all platforms | Licensing considerations (Unreal royalties, Unity fees) |

**Time to first playable:** 1–4 weeks  
**Time to ship:** 6–24 months

### Path B: 3D Framework (Bevy, MonoGame, Raylib)

```
Choose a framework → Build engine-like systems on top → Build your game
```

| Pros | Cons |
|------|------|
| More control than full engine | Must build many systems yourself |
| Lighter weight, less bloat | No visual editor (or primitive one) |
| Code-driven workflow | Slower development than full engine |
| Open source, no licensing fees | Smaller community, fewer tutorials |

**Time to first playable:** 1–3 months  
**Time to ship:** 12–36 months

### Path C: Custom 3D Engine

```
Choose language + rendering API → Build everything → Maybe ship a game someday
```

| Pros | Cons |
|------|------|
| Total control | 2–5+ years before game development starts |
| Deep learning | Most custom engines never ship a game |
| Unique technology | Must build editor, asset pipeline, everything |
| Fun (if engine dev is the goal) | Enormous scope — easy to get lost |

**Time to first playable:** 6–24 months  
**Time to ship:** 3–10+ years

---

## 3. 3D Engine Comparison

| Engine | Rendering Quality | Editor | Learning Curve | Cost | Best For |
|--------|:---:|:---:|:---:|:---:|----------|
| **Unreal 5** | ✅✅✅ AAA | ✅✅✅ | Steep | 5% royalties after $1M | High-fidelity 3D, AAA-adjacent |
| **Godot 4** | ✅✅ Good | ✅✅ Good | Moderate | Free (MIT) | Indie 3D, learning, Linux |
| **Unity** | ✅✅ Good | ✅✅✅ | Moderate | Complex pricing | Mobile 3D, indie, VR |
| **Bevy** | ✅ Growing | ❌ None | Steep (Rust) | Free (MIT) | Rust devs, ECS architecture |
| **Fyrox** | ✅ Good | ✅ Basic | Steep (Rust) | Free (MIT) | Rust devs wanting an editor |
| **Three.js** | ✅ Good (web) | ❌ None | Low | Free (MIT) | Web 3D, visualization |
| **Babylon.js** | ✅✅ Good (web) | ✅ Cloud editor | Low | Free (Apache) | Web 3D games |

---

## 4. Modern 3D Rendering Pipeline

### What a Modern 3D Renderer Does

```
Per Frame:
  1. Scene traversal — determine what's visible (frustum culling, occlusion)
  2. Shadow pass — render scene from each light's perspective into shadow maps
  3. G-Buffer pass (deferred) — render geometry into position/normal/albedo buffers
  4. Lighting pass — compute lighting using G-Buffer + shadow maps
  5. Post-processing — bloom, tone mapping, SSAO, motion blur, anti-aliasing
  6. UI overlay — draw HUD, menus on top
  7. Present — send final image to display
```

### Rendering Techniques by Fidelity Level

| Technique | Low (retro) | Medium (indie) | High (AAA) |
|-----------|:---:|:---:|:---:|
| Lighting | Per-vertex, baked | Per-pixel, PBR | GI (Lumen), ray tracing |
| Shadows | None or baked | Shadow maps (PCF) | Cascaded shadow maps, PCSS |
| Anti-aliasing | None | MSAA | TAA, DLSS/FSR |
| Ambient occlusion | None | SSAO | GTAO, ray-traced AO |
| Reflections | None | Cubemaps | SSR, ray-traced reflections |
| Global illumination | None | Light probes | Lumen, DDGI, ray-traced |
| Draw call management | Simple | Frustum culling | Nanite (virtual geometry) |

### GPU API Comparison for Custom Renderers

| API | Difficulty | Performance | Platforms | Notes |
|-----|:---:|:---:|----------|-------|
| **Vulkan** | Very High | Maximum | Win, Linux, Android, Mac (MoltenVK) | Industry standard for custom engines |
| **wgpu** | Medium | High | All (Vulkan, Metal, DX12, WebGPU) | Best abstraction — recommended for Rust |
| **DirectX 12** | Very High | Maximum | Windows, Xbox | Windows/Xbox only |
| **Metal** | High | Maximum | macOS, iOS | Apple only |
| **OpenGL** | Low | Good | All (legacy) | Deprecated on macOS, still works elsewhere |
| **bgfx** | Medium | High | All | C/C++ rendering abstraction |
| **sokol** | Medium | Good | All | Single-header C, simpler than bgfx |
| **WebGL 2.0** | Low | Moderate | Browsers | OpenGL ES 3.0 in browser |
| **WebGPU** | Medium | Good | Modern browsers | Future of web GPU |

---

## 5. Recommended 3D Path by Scenario

| Scenario | Recommended | Why |
|----------|-------------|-----|
| **"I want to ship a 3D game"** | Unreal 5 or Godot 4 | Use what exists — don't reinvent the wheel |
| **"I want to learn 3D rendering"** | Custom Rust + wgpu | Best learning experience with modern tooling |
| **"I want indie 3D, free engine"** | Godot 4 | MIT licensed, growing 3D, great editor |
| **"I want AAA-quality graphics"** | Unreal Engine 5 | Nothing else comes close (Nanite, Lumen) |
| **"I want 3D in browser"** | Three.js or Babylon.js | Mature, well-documented, WebGL/WebGPU |
| **"I want Rust + 3D"** | Bevy | Growing fast, ECS architecture, wgpu-based |
| **"I want stylized/low-poly 3D"** | Godot 4 or Unity | Both handle stylized well, fast development |
| **"I want VR"** | Unity or Unreal | Most mature VR SDK support |
| **"I want 3D + WASM (browser)"** | Bevy (compiles to WASM) | Rust 3D in browser |

---

## 6. 3D Development Learning Path

### Stage 1: Fundamentals (1–2 months)

1. Linear algebra basics (vectors, matrices, dot/cross product)
2. Coordinate systems (world, view, projection)
3. Basic rendering concepts (vertices, triangles, textures, shaders)
4. Camera math (perspective projection, view matrix)

### Stage 2: First 3D Project (2–4 months)

1. Pick an engine (Godot 4 recommended for learning)
2. Build a simple 3D scene (room, lighting, character)
3. Implement basic character controller (FPS or third-person)
4. Add collision and physics
5. Ship a small playable demo

### Stage 3: Intermediate (4–12 months)

1. Understand PBR (physically-based rendering)
2. Learn shader programming (GLSL, WGSL, or engine-specific)
3. Implement more complex gameplay systems
4. Learn 3D asset creation basics (Blender)
5. Optimize for performance (profiling, draw call reduction)

### Stage 4: Advanced / Engine Development (12+ months)

1. Write a custom renderer (wgpu or Vulkan)
2. Implement shadow mapping, deferred rendering
3. Build scene management (ECS, spatial hashing, BVH)
4. Implement skeletal animation
5. Build an asset pipeline (model import, texture compression)

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Engine Comparison | `./01-engine-comparison.md` |
| Custom Engine Research | `./03-custom-engine-research.md` |
| Doom Research | `./08-doom-and-retro-research.md` |
| Language Comparison | `./02-language-comparison.md` |
| Genre Recommendations | `./05-genre-recommendations.md` |
| Game Dev Overview | `./00-overview.md` |
