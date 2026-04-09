# Game Development Framework Analysis

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`framework`, `analysis`, `unity`, `unreal`, `godot`, `phaser`, `bevy`, `three.js`, `babylon.js`, `gamemaker`, `security`, `performance`, `ui-ux`, `learning-curve`, `comparison`

---

## Purpose

Comprehensive multi-dimensional evaluation of game development frameworks, analysing each through six critical lenses: developer experience (DX), security posture, UI/UX capabilities, performance characteristics, community & support ecosystem, and learning curve. This file extends `01-engine-comparison.md` (which covers feature matrices and scoring) with deeper qualitative analysis, real-world evidence, and a final recommendation with reasoning.

---

## 1. Frameworks Evaluated

| Framework | Type | Language | Primary Use |
|-----------|------|----------|-------------|
| **Unity 6** | Full engine + editor | C# | 2D/3D, mobile, console, VR/AR |
| **Unreal Engine 5** | Full engine + editor | C++, Blueprints | AAA 3D, film, simulation |
| **Godot 4.5** | Full engine + editor | GDScript, C#, C++ | 2D, indie 3D, open-source |
| **GameMaker** | 2D engine + editor | GML | 2D indie, pixel art |
| **Bevy** | ECS framework (code-only) | Rust | Performance-critical, custom |
| **Phaser 3** | 2D web framework | JavaScript | Browser 2D games |
| **Three.js** | 3D rendering library | JavaScript | Browser 3D, WebGL |
| **Babylon.js** | 3D game engine (web) | JavaScript/TypeScript | Browser 3D, WebXR |

---

## 2. Developer Experience (DX)

How productive can a developer be day-to-day?

| Framework | Editor | Hot Reload | Project Setup | Iteration Speed | Debugging |
|-----------|--------|:----------:|:-------------:|:---------------:|:---------:|
| **Unity** | ✅ Mature, full-featured | ✅ Partial (domain reload) | 5 min (template) | Medium (30–120s builds) | ✅ VS/Rider integration |
| **Unreal** | ✅ Mature, complex | ⚠️ Unreliable (C++ live coding) | 10 min (template) | Slow (60–300s full rebuild) | ✅ But complex |
| **Godot** | ✅ Lightweight, fast | ✅ Scene reload | 30 sec | Very fast (1–5s) | ✅ Built-in debugger |
| **GameMaker** | ✅ Purpose-built for 2D | ✅ Immediate | 1 min | Very fast | ⚠️ Basic |
| **Bevy** | ❌ No editor | ⚠️ Experimental | 5 min (cargo) | Fast (3–15s incremental) | ✅ Rust tooling |
| **Phaser** | ❌ No editor | ✅ Browser refresh | 2 min (npm) | Instant | ✅ Browser DevTools |
| **Three.js** | ❌ No editor (3rd-party: drei) | ✅ Vite HMR | 2 min | Instant | ✅ Browser DevTools |
| **Babylon.js** | ⚠️ Playground + Inspector | ✅ Browser refresh | 3 min | Fast | ✅ Built-in Inspector |

### DX Verdict

- **Fastest iteration:** Godot (2-sec editor launch, instant scene reload)
- **Most tooling:** Unity (largest asset store, VS/Rider, profilers, animation)
- **Most accessible:** Phaser/Three.js (browser DevTools, no install)
- **Most frustrating:** Unreal (C++ compile times, editor RAM usage)

---

## 3. Security Analysis

Game frameworks handle user input, network data, file I/O, and code execution. Security matters more than most developers assume.

### 3.1 Known Vulnerabilities

| Framework | Notable CVEs | Severity | Status |
|-----------|-------------|----------|--------|
| **Unity** | **CVE-2025-59489** — Runtime command injection via debug parameters (`-xrsdk-pre-init-library`, `-dataFolder`). Affects all versions since 2017.01. Allows loading arbitrary DLLs/SOs. | **Critical** | Patched Oct 2025. All published Unity games must be recompiled. Valve patched Steam client. Microsoft confirmed Xbox unaffected. |
| **Unreal** | Occasional C++ memory safety issues; Epic's bug bounty covers critical vulns. No major public CVEs in recent years targeting game builds. | Low-Medium | Active security team |
| **Godot** | No major CVEs. Open-source audit trail. GDScript is sandboxed. | Low | Community-audited |
| **Phaser** | Inherits browser security model. No engine-level CVEs. | Low | Browser-sandboxed |
| **Three.js / Babylon.js** | WebGL context exploits possible (GPU driver bugs). Rare but documented WebGL-based attacks. | Low | Browser-sandboxed |
| **Bevy** | Rust memory safety eliminates entire vulnerability classes (buffer overflows, use-after-free). | Very Low | Language-level safety |
| **GameMaker** | No major public CVEs. Closed-source runtime. | Low | Proprietary |

### 3.2 Security Model Comparison

| Factor | Unity | Unreal | Godot | Web Frameworks | Bevy |
|--------|:-----:|:------:|:-----:|:--------------:|:----:|
| Memory safety | ❌ C# is managed but runtime is C++ | ❌ C++ — manual memory | ✅ GDScript sandboxed | ✅ JS sandboxed | ✅ Rust ownership model |
| Network code safety | ⚠️ Depends on implementation | ⚠️ Depends on implementation | ⚠️ Depends on implementation | ✅ Browser enforces CORS/CSP | ✅ Rust type safety |
| Supply chain risk | ⚠️ Asset Store — unvetted 3rd-party code | ⚠️ Marketplace — similar risk | ⚠️ Smaller asset library | ⚠️ npm ecosystem risks | ⚠️ crates.io, but Rust compile-time checks |
| Code signing / DRM | ✅ Supports IL2CPP obfuscation | ✅ Pak encryption, custom DRM | ⚠️ Basic — open-source, easier to reverse | N/A (client-side) | ❌ No built-in |
| Sandboxing | ❌ Full OS access | ❌ Full OS access | ❌ Full OS access | ✅ Browser sandbox | ❌ Full OS access |

### 3.3 Security Verdict

- **Most secure runtime:** Web frameworks (Phaser, Three.js, Babylon.js) — browser sandbox isolates from OS
- **Most secure language:** Bevy (Rust) — eliminates memory corruption by design
- **Highest risk event (2024–2026):** Unity CVE-2025-59489 — affected every Unity game built since 2017
- **Best practice:** All frameworks require secure networking implementation regardless of engine choice. Never trust client-side data.

**References:**
- [Kaspersky: CVE-2025-59489 Analysis](https://www.kaspersky.com/blog/update-unity-games-cve-2025-59489/54542/)
- [Unity Security Remediation Guide](https://unity.com/security/sept-2025-01/remediation)
- [BrightCoding: WebGL Security 2025](https://www.blog.brightcoding.dev/2025/11/04/the-ultimate-guide-to-3d-rendering-engines-for-web-browsers-power-security-performance-in-2025)

---

## 4. UI/UX Capabilities

How well does each framework support building game interfaces, menus, HUDs, animations, and visual effects?

| Capability | Unity | Unreal | Godot | GameMaker | Phaser | Three.js | Babylon.js | Bevy |
|-----------|:-----:|:------:|:-----:|:---------:|:------:|:--------:|:----------:|:----:|
| Built-in UI system | ✅ UI Toolkit + uGUI | ✅ UMG (Slate) | ✅ Control nodes | ⚠️ Basic | ⚠️ DOM overlay | ❌ Use HTML/CSS | ✅ GUI system | ⚠️ bevy_ui (basic) |
| Animation tools | ✅ Animator, Timeline, DOTween | ✅ Sequencer, Control Rig | ✅ AnimationPlayer, Tween | ✅ Sprite editor | ⚠️ Tweens only | ⚠️ Manual / GSAP | ✅ Built-in animations | ⚠️ Basic |
| Particle systems | ✅ VFX Graph, Shuriken | ✅ Niagara (best) | ✅ GPU Particles (v4) | ⚠️ Basic | ⚠️ Plugin needed | ⚠️ Third-party | ✅ Built-in | ⚠️ Plugin |
| Shader authoring | ✅ Shader Graph | ✅ Material Editor | ✅ Visual Shader editor | ⚠️ GLSL manual | ⚠️ Manual GLSL | ✅ ShaderMaterial | ✅ Node Material Editor | ✅ WGSL shaders |
| 2D graphics | ✅ Strong (SpriteRenderer, Tilemap) | ❌ Paper2D abandoned | ✅ Best-in-class | ✅ Purpose-built | ✅ Purpose-built | ⚠️ Not designed for 2D | ⚠️ Not designed for 2D | ✅ Good |
| 3D rendering quality | ✅ Good (URP/HDRP) | ✅ Best (Nanite, Lumen) | ⚠️ Improving | ❌ N/A | ❌ N/A | ✅ Good (WebGL2/WebGPU) | ✅ Very good (WebGPU) | ⚠️ Growing |
| Responsive/adaptive | ✅ Canvas Scaler | ✅ DPI scaling | ✅ Anchors, containers | ⚠️ Manual | ✅ Scale Manager | ✅ Responsive canvas | ✅ Responsive engine | ⚠️ Manual |

### UI/UX Verdict

- **Best overall UI toolkit:** Unity (UI Toolkit is CSS-like, familiar to web devs)
- **Best visual effects:** Unreal (Niagara particle system, Lumen GI — nothing else compares)
- **Best 2D graphics:** Godot (dedicated 2D pipeline, not bolted onto 3D)
- **Best web UI:** Babylon.js (full GUI system with built-in controls, inspector)
- **Weakest UI:** Bevy (bevy_ui is pre-1.0 and limited; community alternatives exist)

---

## 5. Performance Characteristics

### 5.1 Runtime Performance

| Framework | Rendering | Physics | Memory (editor) | Memory (runtime) | Build Size |
|-----------|:---------:|:-------:|:----------------:|:----------------:|:----------:|
| **Unity** | Good (URP 60fps mobile) | ✅ Unity Physics + DOTS | 1–4 GB | 50–200 MB | 50 MB+ |
| **Unreal** | Excellent (Nanite/Lumen) | ✅ Chaos Physics | 4–16 GB | 200 MB–2 GB | 100 MB+ |
| **Godot** | Good (Vulkan/OpenGL) | ✅ Godot Physics / Jolt | 200–600 MB | 20–80 MB | 20 MB+ |
| **GameMaker** | Good (2D optimised) | ⚠️ Basic | 500 MB–1 GB | 30–100 MB | 15 MB+ |
| **Bevy** | Good (wgpu) | ✅ Rapier | N/A | 10–50 MB | 5–20 MB |
| **Phaser** | Good (WebGL/Canvas) | ✅ Arcade/Matter.js | N/A | 5–30 MB (browser) | 1–5 MB |
| **Three.js** | Good (WebGL2/WebGPU) | ⚠️ Third-party | N/A | 10–50 MB (browser) | 2–10 MB |
| **Babylon.js** | Very good (WebGPU) | ✅ Built-in (Havok/Ammo) | N/A | 15–60 MB (browser) | 3–15 MB |

### 5.2 Cross-Platform Support

| Platform | Unity | Unreal | Godot | GameMaker | Bevy | Phaser | Three.js | Babylon.js |
|----------|:-----:|:------:|:-----:|:---------:|:----:|:------:|:--------:|:----------:|
| Windows | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| macOS | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Linux | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| iOS | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ PWA | ⚠️ PWA | ⚠️ PWA |
| Android | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ PWA | ⚠️ PWA | ⚠️ PWA |
| Web | ✅ WebGL | ⚠️ (Pixel Streaming) | ✅ HTML5 | ✅ HTML5 | ✅ WASM | ✅ Native | ✅ Native | ✅ Native |
| Console | ✅ All | ✅ All | ⚠️ 3rd-party | ✅ All | ❌ | ❌ | ❌ | ❌ |
| VR/AR | ✅ | ✅ | ⚠️ | ❌ | ⚠️ | ❌ | ⚠️ WebXR | ✅ WebXR |

### 5.3 Performance Verdict

- **Best raw performance:** Unreal (Nanite/Lumen for 3D), Bevy (Rust zero-cost abstractions)
- **Best performance-per-watt (mobile):** Unity (optimised mobile pipeline, IL2CPP)
- **Lightest footprint:** Phaser (< 5 MB total), Bevy (< 20 MB)
- **Heaviest:** Unreal (editor 4–16 GB, 100 MB+ minimum builds)
- **Best web performance:** Babylon.js (WebGPU support, built-in physics, optimised pipeline)

---

## 6. Community & Support Ecosystem

| Factor | Unity | Unreal | Godot | GameMaker | Bevy | Phaser | Three.js | Babylon.js |
|--------|:-----:|:------:|:-----:|:---------:|:----:|:------:|:--------:|:----------:|
| GitHub stars | N/A (closed) | N/A (source-avail) | 93K+ | N/A | 37K+ | 37K+ | 103K+ | 23K+ |
| Discord / community size | 500K+ | 300K+ | 200K+ | 50K+ | 30K+ | 20K+ | 50K+ | 15K+ |
| Stack Overflow questions | 200K+ | 80K+ | 30K+ | 15K+ | 5K+ | 20K+ | 60K+ | 10K+ |
| Asset marketplace | ✅ 100K+ assets | ✅ Marketplace | ⚠️ Asset Library (growing) | ⚠️ Marketplace (small) | ⚠️ crates.io | ⚠️ npm | ✅ npm + examples | ⚠️ npm |
| Tutorials / courses | ✅ Thousands | ✅ Hundreds | ✅ Hundreds (growing fast) | ⚠️ Moderate | ⚠️ Growing | ✅ Many | ✅ Many | ⚠️ Moderate |
| Paid support | ✅ Unity Pro support | ✅ Epic custom licensing | ❌ Community only | ⚠️ Email support | ❌ Community only | ❌ Community only | ❌ Community only | ✅ Microsoft backing |
| Books published | 50+ | 30+ | 10+ | 10+ | 3+ | 10+ | 20+ | 5+ |
| Job market demand | ✅ Highest | ✅ High (AAA) | ⚠️ Growing | ⚠️ Niche | ⚠️ Niche (Rust) | ⚠️ Web dev roles | ✅ Web 3D roles | ⚠️ Enterprise |

### Community Verdict

- **Largest ecosystem:** Unity (most tutorials, assets, jobs, community answers)
- **Fastest growing:** Godot (community doubled 2023–2025 post-Unity controversy)
- **Best corporate backing:** Babylon.js (Microsoft), Unreal (Epic Games)
- **Most transferable skills:** Three.js / Babylon.js (JavaScript → web dev career)

---

## 7. Learning Curve

| Framework | Time to "Hello World" | Time to Ship Simple Game | Time to Be Productive | Prerequisites |
|-----------|:---------------------:|:------------------------:|:---------------------:|---------------|
| **Unity** | 30 min | 2–4 weeks | 2–3 months | C# basics |
| **Unreal** | 1 hour | 1–2 months | 6–12 months | C++ or Blueprints |
| **Godot** | 15 min | 1–2 weeks | 1–2 months | None (GDScript is beginner-friendly) |
| **GameMaker** | 15 min | 1–2 weeks | 1–2 months | None (GML is simple) |
| **Bevy** | 1 hour | 1–2 months | 3–6 months | Rust (steep), ECS concepts |
| **Phaser** | 10 min | 3–7 days | 2–4 weeks | JavaScript basics |
| **Three.js** | 20 min | 1–3 weeks | 1–3 months | JavaScript, 3D math basics |
| **Babylon.js** | 20 min | 1–3 weeks | 1–3 months | JavaScript/TypeScript |

### Learning Curve Verdict

- **Easiest to learn:** Phaser (web devs already know JS, instant browser feedback)
- **Easiest full engine:** Godot (GDScript ≈ Python, lightweight editor, fast feedback loop)
- **Steepest:** Unreal (C++ complexity, enormous API surface, long compile times)
- **Best for career growth:** Unity (most job postings), Unreal (AAA studios), Three.js (web industry)

---

## 8. Licensing & Cost

| Framework | License | Cost | Revenue Threshold | Hidden Costs |
|-----------|---------|------|:-----------------:|-------------|
| **Unity** | Proprietary | Free (Personal) / $399+/yr | Must upgrade at $200K revenue | Asset Store purchases, Pro features |
| **Unreal** | Custom EULA | Free | 5% royalty above $1M gross | Marketplace, C++ talent is expensive |
| **Godot** | MIT | Free forever | None | Custom tooling time |
| **GameMaker** | Proprietary | Free tier / $5–$10/month | None | Console export tiers |
| **Bevy** | MIT/Apache | Free forever | None | Rust learning investment |
| **Phaser** | MIT | Free forever | None | None |
| **Three.js** | MIT | Free forever | None | None |
| **Babylon.js** | Apache 2.0 | Free forever | None | None |

### Cost Verdict

- **Cheapest total cost:** Godot, Phaser, Three.js, Bevy (zero cost, zero royalties, zero restrictions)
- **Best value for commercial games:** Godot (no fees ever, full-featured engine)
- **Most expensive at scale:** Unity (subscription + potential revenue-based upgrades)
- **Most expensive to develop with:** Unreal (C++ talent commands premium salaries)

---

## 9. Consolidated Scoring

Each criterion scored 1–10. Total out of 60.

| Framework | DX | Security | UI/UX | Performance | Community | Learning | **Total** | **%** |
|-----------|:--:|:--------:|:-----:|:-----------:|:---------:|:--------:|:---------:|:-----:|
| **Godot 4.5** | 9 | 8 | 8 | 7 | 7 | 9 | **48** | **80%** |
| **Unity 6** | 7 | 5 | 9 | 8 | 10 | 7 | **46** | **77%** |
| **Phaser 3** | 8 | 9 | 6 | 6 | 7 | 10 | **46** | **77%** |
| **Babylon.js** | 7 | 9 | 8 | 7 | 6 | 7 | **44** | **73%** |
| **Unreal 5** | 5 | 7 | 9 | 10 | 8 | 3 | **42** | **70%** |
| **Three.js** | 7 | 9 | 5 | 7 | 8 | 6 | **42** | **70%** |
| **Bevy** | 6 | 10 | 4 | 9 | 5 | 4 | **38** | **63%** |
| **GameMaker** | 7 | 7 | 5 | 6 | 4 | 9 | **38** | **63%** |

> **Scoring notes:** Security scores reflect both language-level safety and known vulnerability history. Unity's score of 5 reflects CVE-2025-59489 severity. Bevy's 10 reflects Rust's elimination of entire vulnerability classes. Learning scores inversely weighted (easier = higher).

---

## 10. Final Recommendation

### 🏆 Overall Winner: Godot 4.5

**Why Godot is recommended as the default choice:**

1. **Zero cost, zero risk** — MIT license means no licensing surprises (unlike Unity's 2023 controversy). No royalties. No revenue thresholds. Complete freedom to modify the engine source.

2. **Best developer experience for the cost** — The editor launches in 2–3 seconds (vs Unity's 30–120s, Unreal's 60–180s). Scene reload is instant. GDScript is learnable in days.

3. **Best 2D engine available** — Dedicated 2D rendering pipeline (not a 3D engine pretending to be 2D). Tilemap, physics, lighting all purpose-built for 2D.

4. **Strong and improving 3D** — Vulkan renderer in v4+, PBR materials, GPU particles. Not Unreal-level, but sufficient for indie and mid-tier 3D games.

5. **Security posture** — No major CVEs. GDScript sandboxed. Open-source means community audit. Contrast with Unity's critical CVE-2025-59489 that affected all games since 2017.

6. **Fastest-growing community** — Community doubled post-2023 Unity controversy. Tutorials, plugins, and documentation improving rapidly.

7. **Cross-platform** — Exports to Windows, macOS, Linux, iOS, Android, and Web from one codebase. Console support available via W4 Games (third-party).

### When NOT to use Godot

| Scenario | Better Choice | Why |
|----------|---------------|-----|
| AAA 3D with photorealistic graphics | **Unreal Engine 5** | Nanite + Lumen are unmatched; no other engine produces this fidelity |
| Mobile-first with monetisation (ads, IAP) | **Unity** | Most mature mobile pipeline, best ad network integrations, largest mobile game portfolio |
| Console-first (PS5, Xbox, Switch) | **Unity or Unreal** | Official console SDK support; Godot requires expensive third-party solutions |
| Browser game (2D) with web dev team | **Phaser 3** | Zero install for players, instant browser feedback, JavaScript already known |
| Browser 3D or WebXR | **Babylon.js** | Full game engine in the browser with WebGPU, physics, WebXR, Microsoft backing |
| Performance-critical custom engine | **Bevy (Rust)** | Memory safety + zero-cost abstractions + ECS architecture for max throughput |
| Simple 2D pixel art with console target | **GameMaker** | Purpose-built for 2D, official console export, affordable |
| Team of C++ veterans targeting AAA | **Unreal Engine 5** | C++ skills transfer directly; Blueprints for designers; industry-standard pipeline |
| Team of Rust developers | **Bevy** | Native Rust ECS engine, growing ecosystem, compiles to WASM |

### Decision Matrix (Quick Reference)

```
I want to make a game →
  ├─ 2D game?
  │   ├─ Browser only → Phaser 3
  │   ├─ Console needed → GameMaker or Unity
  │   ├─ Open source → Godot 4 ← RECOMMENDED
  │   └─ Rust → Bevy
  ├─ 3D game?
  │   ├─ AAA quality → Unreal Engine 5
  │   ├─ Browser → Babylon.js or Three.js
  │   ├─ Indie → Godot 4 ← RECOMMENDED
  │   └─ Rust → Bevy
  ├─ Mobile?
  │   ├─ Monetisation-heavy → Unity
  │   └─ Simple/casual → Godot 4 ← RECOMMENDED
  └─ Learning?
      ├─ Complete beginner → Godot 4 (GDScript) ← RECOMMENDED
      ├─ Know JavaScript → Phaser 3
      └─ Know C++ → Unreal (Blueprints first)
```

---

## 11. Evidence & References

| Source | URL | Relevance |
|--------|-----|-----------|
| BIX Tech — Engine Risk Comparison 2026 | [bix-tech.com](https://bix-tech.com/are-game-engines-still-safe-bets-in-2026-a-practical-risk-comparison-of-unity-unreal-engine-and-godot/) | Licensing risk, vendor lock-in analysis |
| Ocean View Games — Engine Comparison 2026 | [dev.to](https://dev.to/oceanviewgames/which-game-engine-should-you-use-unity-vs-unreal-vs-godot-2026-4ndj) | Practical project-based comparison |
| Godot vs Unity 2026 | [tech-insider.org](https://tech-insider.org/godot-vs-unity-2026/) | Head-to-head analysis with benchmarks |
| Godot 4.5 vs Unity 6.3 for 2D | [gamineai.com](https://gamineai.com/blog/godot-4-5-stable-vs-unity-6-3-for-2d-games-2026) | 2D-specific performance and workflow |
| RocketBrush — Godot Performance vs Unity | [thithtoolwin.com](https://www.thithtoolwin.com/godot-vs-unity-performance-insights-from-rocketbrush-studio/) | Real studio experience, benchmarks |
| SpicyTricks — Engine Comparison 2026 | [spicytricks.com](https://www.spicytricks.com/unity-vs-unreal-vs-godot-2026) | Cost and career considerations |
| Unity CVE-2025-59489 (Kaspersky) | [kaspersky.com](https://www.kaspersky.com/blog/update-unity-games-cve-2025-59489/54542/) | Critical security vulnerability analysis |
| Unity Security Remediation | [unity.com](https://unity.com/security/sept-2025-01/remediation) | Official patch guidance |
| Three.js vs Babylon.js vs PlayCanvas 2026 | [utsubo.com](https://www.utsubo.com/blog/threejs-vs-babylonjs-vs-playcanvas-comparison) | Web 3D framework comparison |
| BabylonJS vs ThreeJS Learning 2026 | [vocal.media](https://vocal.media/01/babylon-js-vs-three-js-the-easiest-to-learn-in-2026) | Learning curve analysis |
| BrightCoding — WebGL Security 2025 | [brightcoding.dev](https://www.blog.brightcoding.dev/2025/11/04/the-ultimate-guide-to-3d-rendering-engines-for-web-browsers-power-security-performance-in-2025) | Web rendering security analysis |
| Godot Official | [godotengine.org](https://godotengine.org/) | Engine documentation |
| Unity Official | [unity.com](https://unity.com/) | Engine documentation |
| Unreal Official | [unrealengine.com](https://www.unrealengine.com/) | Engine documentation |
| Bevy Official | [bevyengine.org](https://bevyengine.org/) | Engine documentation |
| Phaser Official | [phaser.io](https://phaser.io/) | Framework documentation |
| Babylon.js Official | [babylonjs.com](https://www.babylonjs.com/) | Engine documentation |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Game Dev Overview | `./00-overview.md` |
| Engine Feature Comparison | `./01-engine-comparison.md` |
| Language Comparison | `./02-language-comparison.md` |
| Genre Recommendations | `./05-genre-recommendations.md` |
| Platform Recommendations | `./06-platform-recommendations.md` |
| Final Summary | `./10-final-summary.md` |
| Engine Scoring Diagram | `./diagrams/04-engine-scoring.mmd` |
| Language Ecosystem Map | `./diagrams/06-language-ecosystem-map.mmd` |
