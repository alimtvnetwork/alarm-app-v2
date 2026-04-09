# Doom & Retro Game Research

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`doom`, `retro`, `fps`, `raycasting`, `software-rendering`, `1993`, `c++`, `rust`, `wgpu`, `id-tech`, `boomer-shooter`

---

## Purpose

How Doom (1993) was built, what made it revolutionary, and how to build similar retro-style games today. Covers raycasting, software rendering, BSP trees, and modern alternatives to C for retro game development.

---

## 1. How Doom (1993) Was Built

### Technical Overview

| Aspect | Detail |
|--------|--------|
| **Language** | C (ANSI C, compiled with Watcom C on DOS) |
| **Rendering** | Software renderer — no GPU, no OpenGL, no hardware acceleration |
| **Technique** | BSP tree traversal + raycasting for walls, sprites rendered as billboards |
| **Resolution** | 320×200 pixels |
| **Frame rate** | 35 FPS (fixed timestep, 1/35 second ticks) |
| **Level format** | WAD files — custom binary format for maps, textures, sounds |
| **Audio** | OPL FM synthesis (AdLib), digital sound effects via DMA |
| **Team** | 4–6 people (John Carmack, John Romero, Adrian Carmack, Tom Hall, others) |
| **Dev time** | ~12–18 months |
| **Lines of code** | ~40,000 lines of C |

### Why It Was Revolutionary

1. **Not true 3D** — Doom's world is actually 2D with height information. There are no rooms above rooms. This constraint made the renderer extremely fast.
2. **BSP trees** — Binary Space Partitioning sorted geometry front-to-back, eliminating overdraw. This was Carmack's key innovation for Doom (he read the concept from a 1969 paper).
3. **No GPU** — Everything was drawn pixel-by-pixel by the CPU. Columns of wall pixels were drawn top-to-bottom using texture mapping lookup tables.
4. **Variable height floors/ceilings** — Unlike Wolfenstein 3D (flat floors), Doom had stairs, platforms, and height variation.
5. **Modding** — WAD file format allowed anyone to create levels, textures, and mods. This created an enormous community.

### Doom's Rendering Pipeline (Simplified)

```
1. Build BSP tree from level geometry (done at compile time by node builder)
2. Walk BSP tree front-to-back from player position
3. For each subsector visible:
   a. Draw walls as vertical columns (texture-mapped)
   b. Draw floors/ceilings as horizontal spans (flat-mapped)
   c. Mark screen columns as "filled" — stop drawing behind them
4. Draw sprites (enemies, items) sorted by distance, clipped to visible columns
5. Apply light diminishing based on distance (sector light level)
6. Blit framebuffer to screen via VGA Mode 13h (320×200, 256 colors)
```

---

## 2. Raycasting vs BSP vs Modern Rendering

| Technique | Used By | How It Works | Limitations |
|-----------|---------|-------------|-------------|
| **Raycasting** | Wolfenstein 3D | Cast one ray per screen column, find wall intersection, draw textured column | Flat floors/ceilings only, 90° walls only |
| **BSP rendering** | Doom, Quake | Pre-sorted geometry tree, walk front-to-back | No rooms above rooms (Doom), complex node builder |
| **Software 3D** | Quake | Full 3D triangle rasterization on CPU | Very CPU-intensive, limited poly count |
| **Hardware OpenGL** | Quake II+ | GPU rasterizes triangles, texture mapping | Requires GPU, more complex setup |
| **Modern GPU (Vulkan/DX12)** | Current games | Massive parallelism, PBR, ray tracing | Complex API, overkill for retro |

---

## 3. Building a Doom-Like Game Today

### Option A: Rust + wgpu (Recommended)

| Aspect | Detail |
|--------|--------|
| **Language** | Rust |
| **Rendering** | wgpu (renders to Vulkan/Metal/DX12/WebGPU) |
| **Approach** | Render Doom-style geometry as actual 3D (low-poly walls as quads) with retro shaders |
| **Level format** | Custom or parse Doom WAD files (libraries exist) |
| **Physics** | Rapier 2D (Doom physics is 2D) |
| **Audio** | kira or rodio |
| **Benefits** | Memory safe, compiles to WASM (playable in browser), modern tooling |
| **Effort** | 6–12 months (solo) |

### Option B: C/C++ + OpenGL/Vulkan (Classic)

| Aspect | Detail |
|--------|--------|
| **Language** | C or C++ |
| **Rendering** | OpenGL (simpler) or Vulkan (modern) |
| **Approach** | Software renderer for authenticity, or OpenGL for speed |
| **Level format** | Custom or WAD-compatible |
| **Physics** | Custom (Doom's physics are simple — AABB collision, sector-based height) |
| **Audio** | miniaudio or SoLoud |
| **Benefits** | Most tutorials and references are C/C++, closest to original Doom |
| **Effort** | 6–12 months (solo) |

### Option C: Godot 4 with Retro Shaders

| Aspect | Detail |
|--------|--------|
| **Language** | GDScript or C# |
| **Rendering** | Godot's Vulkan renderer with custom shaders for pixelation, color banding |
| **Approach** | Build levels in Godot editor, apply retro post-processing |
| **Level format** | Godot scenes (or import from external tools) |
| **Physics** | Godot Physics (built-in) |
| **Audio** | Godot AudioServer (built-in) |
| **Benefits** | Fastest development, built-in editor, export everywhere |
| **Effort** | 3–6 months (solo) |

### Option D: Software Renderer (Authentic Retro)

| Aspect | Detail |
|--------|--------|
| **Language** | C, Rust, or C++ |
| **Rendering** | Software renderer — draw pixels to a framebuffer, upload to GPU as texture |
| **Approach** | Write your own raycaster or BSP renderer — most educational |
| **Level format** | Custom |
| **Benefits** | Deep understanding of how old games worked, unique authentic look |
| **Drawback** | Slow development, limited resolution/effects |
| **Effort** | 8–18 months (solo) |

---

## 4. Modern Retro FPS ("Boomer Shooter") Landscape

### Successful Modern Retro FPS Games

| Game | Year | Engine | Language | Visual Style |
|------|:----:|--------|----------|-------------|
| **DUSK** | 2018 | GameMaker | GML | Low-poly, vertex lighting |
| **ULTRAKILL** | 2020 | Unity | C# | PSX-style, low-res textures |
| **Prodeus** | 2022 | Custom | C++ | Software-rendered aesthetic + modern 3D |
| **Ion Fury** | 2019 | Build Engine | C | Actual retro engine (Duke 3D) |
| **Wrath: Aeon of Ruin** | 2024 | Quake 1 (Darkplaces) | C/QuakeC | Actual Quake 1 engine |
| **Cultic** | 2022 | Custom (GZDoom-like) | C++ | Doom/Build aesthetic |
| **Turbo Overkill** | 2023 | Unreal Engine 4 | C++/BP | Retro shaders on modern engine |
| **Selaco** | 2024 | GZDoom | ZScript | Runs ON the Doom engine (GZDoom) |

### Key Observations

1. **You don't need C++ to make a retro FPS** — DUSK used GameMaker, ULTRAKILL used Unity
2. **Retro aesthetic ≠ retro technology** — Modern engines with retro shaders are the most common approach
3. **Actual retro engines still work** — Ion Fury and Selaco prove that Build Engine and GZDoom are viable for commercial games in 2024
4. **Custom renderers matter for unique visual identity** — Prodeus built custom to achieve its specific look

---

## 5. Retro Rendering Techniques

### Achieving the Retro Look on Modern Hardware

| Technique | How | Used By |
|-----------|-----|---------|
| **Resolution downscaling** | Render at 320×200 or 640×480, upscale to display | Most retro FPS |
| **Point filtering** | Use nearest-neighbor instead of bilinear texture filtering | Universal retro technique |
| **Limited color palette** | Quantize colors to 256 or fewer | DUSK, Prodeus |
| **Vertex snapping** | Snap vertices to grid to simulate PSX vertex jitter | ULTRAKILL |
| **Affine texture mapping** | Skip perspective correction for warpy textures | PSX-style games |
| **Dithering** | Ordered dithering for color banding | Retro PC look |
| **Fog / distance fade** | Linear fog to hide draw distance (like Doom's light diminishing) | Most retro FPS |
| **Billboard sprites** | 2D sprites for enemies/items instead of 3D models | DUSK, Doom-likes |
| **Sector lighting** | Per-sector flat lighting instead of per-pixel | Doom/Build style |

---

## 6. C++ vs Rust vs Godot for Doom-Like

| Criterion | C++ | Rust | Godot |
|-----------|:---:|:---:|:---:|
| **Authenticity** | ✅ Closest to original | ⚠️ Different paradigm | ❌ Modern engine feel |
| **Performance** | ✅ Maximum | ✅ Equal to C++ | ⚠️ Good enough |
| **Memory safety** | ❌ Manual | ✅ Compiler-enforced | ✅ GC |
| **Development speed** | ⚠️ Slow | ⚠️ Slow (initially) | ✅ Fast |
| **Browser deployment** | ⚠️ Emscripten | ✅ WASM native | ✅ HTML5 export |
| **Learning value** | ✅ Industry standard | ✅ Modern systems | ⚠️ Engine-specific |
| **Editor / level tools** | ❌ Must build | ❌ Must build | ✅ Built-in |
| **Tutorials available** | ✅ Many | ⚠️ Few | ✅ Growing |
| **Recommended if** | You want maximum authenticity or C++ expertise | You want safety + performance + WASM | You want to ship fastest |

---

## 7. Resources for Doom-Like Development

### Key References

| Resource | Type | URL / Location |
|----------|------|----------------|
| Doom source code (id Software) | Source code | github.com/id-Software/DOOM |
| Fabien Sanglard's "Game Engine Black Book: Doom" | Book | Physical/digital book |
| Lode's Raycasting Tutorial | Tutorial | lodev.org/cgtutor/raycasting.html |
| Bisqwit's Doom-style renderer (YouTube) | Video series | YouTube |
| Handmade Hero (Casey Muratori) | Video series | handmadehero.org |
| "Build Your Own Doom" tutorials | Various | Multiple blog posts and YouTube |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Custom Engine Research | `./03-custom-engine-research.md` |
| Genre Recommendations | `./05-genre-recommendations.md` |
| Language Comparison | `./02-language-comparison.md` |
| 3D Direction | `./09-3d-game-direction.md` |
| Game Dev Overview | `./00-overview.md` |
