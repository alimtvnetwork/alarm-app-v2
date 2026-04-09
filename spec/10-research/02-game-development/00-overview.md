# Game Development Research

**Version:** 1.0.0  
**Status:** Active  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`game-development`, `engine`, `framework`, `comparison`, `unity`, `unreal`, `godot`, `bevy`, `custom-engine`, `2D`, `3D`, `mobile`, `PC`, `Linux`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| AI Confidence assigned | ✅ |
| Ambiguity assigned | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |

---

## Purpose

Comprehensive research into game development technologies — engines, languages, frameworks, and custom engine paths. Evaluates options by genre (strategy, retro FPS, mobile, 3D), platform (PC, Linux, mobile, cross-platform), and development approach (existing engine vs custom engine vs app shell). Written generically for any team evaluating game development technology choices.

---

## Quick Decision Guide

| If you want to build... | Best choice | Runner-up |
|------------------------|-------------|-----------|
| 3D game (any genre) | Unreal Engine 5 or Godot 4 | Bevy (Rust) |
| 2D game (any genre) | Godot 4 | Bevy, Love2D, or Ebitengine |
| Mobile game | Unity or Godot 4 | Defold, Flutter+Flame |
| Strategy game (Age of Empires-like) | Godot 4 or custom C++/Rust | Unity |
| Doom-like retro FPS | Custom Rust+wgpu or C++ | Godot 4 with retro shaders |
| Linux-first game | Godot 4 | Bevy (Rust) |
| Browser game | Phaser, Three.js, or PixiJS | Godot 4 (HTML5 export) |
| Card/board/UI-heavy game | Godot 4, or Tauri/Electron | Flutter+Flame |
| Custom engine (learning) | Rust + wgpu | C++ + Vulkan/OpenGL |
| Production custom engine | C++ + Vulkan (industry standard) | Rust + wgpu (emerging) |

---

## Document Inventory

| # | File | Description |
|---|------|-------------|
| 01 | `01-engine-comparison.md` | Deep-dive comparison of 14+ game engines — Unity, Unreal, Godot, Bevy, Fyrox, Ebitengine, Raylib, SDL2, and more |
| 02 | `02-language-comparison.md` | Game development ecosystems by language — C++, Rust, Go, C#, GDScript, Dart, JavaScript |
| 03 | `03-custom-engine-research.md` | Build vs buy analysis — what a custom engine requires, feasibility by genre, historical examples |
| 04 | `04-framework-and-library-map.md` | Per-language matrix of rendering, ECS, physics, audio, input, UI, and networking libraries |
| 05 | `05-genre-recommendations.md` | Best technology choices by game genre — strategy, FPS, mobile, 3D, indie, browser |
| 06 | `06-platform-recommendations.md` | Best choices by target platform — PC, Linux, mobile, cross-platform, console |
| 07 | `07-app-shell-feasibility.md` | Can Tauri, Electron, or Wails be used for games? When practical, when not |
| 08 | `08-doom-and-retro-research.md` | How Doom 1993 was built, modern retro approaches, raycasting, software rendering |
| 09 | `09-3d-game-direction.md` | Entering 3D game development — engines vs frameworks vs custom, rendering pipelines |
| 10 | `10-final-summary.md` | Generic + game-specific recommendations, decision matrices, cost-benefit analysis |
| 11 | `11-game-framework-analysis.md` | Multi-dimensional framework evaluation — DX, security, UI/UX, performance, community, learning curve |

---

## Diagrams

| File | Description |
|------|-------------|
| `../diagrams/04-engine-scoring.mmd` | Engine scoring comparison chart |
| `../diagrams/05-game-decision-flow.mmd` | Decision flowchart: genre → platform → engine/language |
| `../diagrams/06-language-ecosystem-map.mmd` | Language → available game dev tools mapping |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Research Root | `../00-overview.md` |
| Platform Research | `../01-platform-research/00-overview.md` |
| PWA Gaming Research | `../01-platform-research/04-pwa-research.md` — Section 5: PWA for Gaming (APIs, engines, feasibility by genre) |
| PWA Feasibility Diagram | `../diagrams/07-pwa-feasibility.mmd` — Decision flow for PWA vs native |
| Diagrams | `../diagrams/` |
