# Platform-Specific Recommendations

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`platform`, `pc`, `linux`, `mobile`, `cross-platform`, `console`, `steam`, `android`, `ios`, `distribution`

---

## Purpose

Best game development choices organized by target platform. Covers rendering API compatibility, distribution channels, platform-specific gotchas, and recommended engines/languages per platform.

---

## 1. Platform Support Matrix

| Engine / Framework | Windows | macOS | Linux | iOS | Android | Web | Console | Steam |
|-------------------|:-------:|:-----:|:-----:|:---:|:-------:|:---:|:-------:|:-----:|
| **Unreal 5** | ✅ | ✅ | ⚠️ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Unity** | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| **Godot 4** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| **Bevy (Rust)** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | ❌ | ✅ |
| **Ebitengine (Go)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Phaser (JS)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Raylib (C)** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **MonoGame (C#)** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Custom Rust+wgpu** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | ❌ | ✅ |
| **Custom C++** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |

---

## 2. PC (Windows) Development

### Rendering APIs Available

| API | Status | Notes |
|-----|:------:|-------|
| DirectX 12 | ✅ Primary | Best Windows performance, required for Xbox |
| DirectX 11 | ✅ Legacy | Wide compatibility, still dominant |
| Vulkan | ✅ | Cross-platform alternative to DX12 |
| OpenGL | ⚠️ Legacy | Deprecated on newer Windows, still works |

### Distribution

| Channel | Revenue Share | Notes |
|---------|:---:|-------|
| **Steam** | 70/30 → 75/25 → 80/20 | Dominant PC platform, scales with revenue |
| **Epic Games Store** | 88/12 | Lower cut, smaller audience |
| **GOG** | 70/30 | DRM-free, niche but loyal audience |
| **Itch.io** | You choose (0–100%) | Best for indie, small audience |
| **Direct (website)** | 100% – payment fees | Full control, no audience |

### Recommendation

**Use Vulkan or DX12 via an engine abstraction (wgpu, bgfx, or engine-provided).** Don't write DX12 or Vulkan directly unless building a custom engine.

---

## 3. Linux Development

### Rendering APIs Available

| API | Status | Notes |
|-----|:------:|-------|
| Vulkan | ✅ Primary | Best performance, modern |
| OpenGL | ✅ Legacy | Widely supported, Mesa drivers |
| DirectX | ❌ | Not available (DXVK translates, but that's Proton) |

### Linux-Specific Concerns

| Concern | Solution |
|---------|---------|
| Display server (X11 vs Wayland) | Use SDL2, GLFW, or winit — they abstract both |
| Audio (PulseAudio vs PipeWire vs ALSA) | Use miniaudio, rodio, or SDL_Audio — they abstract all |
| Packaging | Flatpak or AppImage for distro-agnostic distribution |
| GPU drivers | Mesa (AMD/Intel) excellent, NVIDIA proprietary varies |
| Steam Deck | SteamOS is Arch Linux — Vulkan games run natively |

### Recommendation

**Godot 4 is the best choice for Linux-first game development.** Open source, Vulkan renderer, native Linux editor, exports to Flatpak/AppImage. Bevy (Rust) is the best alternative for custom engine work on Linux.

---

## 4. Mobile Development (iOS + Android)

### Platform Constraints

| Constraint | iOS | Android |
|-----------|:---:|:-------:|
| GPU API | Metal only | Vulkan + OpenGL ES |
| App size limit | 4 GB (App Store) | 150 MB (Play Store, expansion files for more) |
| Background execution | Restricted | Restricted (battery optimization) |
| App Store review | 1–7 days | Hours to days |
| Revenue share | 15–30% | 15–30% |
| Minimum OS | iOS 15+ typical | Android 7+ (API 24+) typical |

### Recommended Engines

| Engine | iOS | Android | Binary Size | Notes |
|--------|:---:|:-------:|:-----------:|-------|
| **Unity** | ✅ Best | ✅ Best | ~40–80 MB | Most mature mobile engine |
| **Godot 4** | ✅ Good | ✅ Good | ~30–50 MB | Growing mobile support |
| **Flutter/Flame** | ✅ Good | ✅ Good | ~15–30 MB | App+game hybrid |
| **Bevy** | ⚠️ Experimental | ⚠️ Experimental | ~10–20 MB | Not production-ready for mobile |
| **Ebitengine** | ✅ Good | ✅ Good | ~10–15 MB | Excellent for simple 2D mobile |

### Recommendation

**Unity for production mobile games. Godot 4 for indie/free games. Flutter/Flame for app-first with casual game elements.**

---

## 5. Cross-Platform (Ship Everywhere)

### Best Cross-Platform Coverage

| Engine | Platforms from One Codebase | Effort Level |
|--------|:---:|:---:|
| **Godot 4** | 7 (Win, Mac, Linux, iOS, Android, Web, Console*) | Low |
| **Unity** | 7+ (all platforms including consoles) | Low |
| **Bevy** | 5 (Win, Mac, Linux, Web, + experimental mobile) | Medium |
| **Ebitengine** | 6 (Win, Mac, Linux, iOS, Android, Web) | Low |
| **Custom Rust+wgpu** | 5 (Win, Mac, Linux, Web, + experimental mobile) | High |
| **Unreal 5** | 6+ (all desktop + mobile + consoles) | Medium |

*Console requires separate agreements with platform holders (Sony, Microsoft, Nintendo).

### Recommendation

**Godot 4 or Unity for maximum cross-platform coverage with minimum effort.** For custom engines, Rust+wgpu provides the broadest reach (native + WASM browser) with the least platform-specific code.

---

## 6. Console Development

### Requirements

| Requirement | Details |
|------------|---------|
| **DevKit** | Physical hardware from platform holder ($2,500–$10,000+) |
| **NDA** | Must sign NDA with Sony, Microsoft, or Nintendo |
| **SDK** | Platform-specific C/C++ SDK (not public) |
| **Certification** | Must pass platform holder's technical requirements |
| **Engine support** | Unity and Unreal have built-in console export. Godot has community efforts. Custom engines require SDK integration. |

### Realistic Console Paths

| Path | Difficulty | Cost |
|------|:---:|:---:|
| Unity → Console export | Low | $0 (Unity handles SDK integration) |
| Unreal → Console export | Low | $0 (Epic handles SDK integration) |
| Godot → Console | High | Community ports exist but unofficial |
| Custom engine → Console | Very High | Must integrate SDK yourself, pass cert |
| Bevy → Console | Not feasible yet | No SDK integration exists |

### Recommendation

**If console is required, use Unity or Unreal.** Everything else requires significant porting effort.

---

## 7. Web / Browser

*See also: `../01-platform-research/04-pwa-research.md` for PWA gaming research.*

### Recommendation

**Phaser 3 for 2D, Three.js/Babylon.js for 3D, or Godot HTML5 export for full engine features.** All support PWA wrapping for offline play and installation.

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Genre Recommendations | `./05-genre-recommendations.md` |
| App Shell Feasibility | `./07-app-shell-feasibility.md` |
| PWA Gaming | `../01-platform-research/04-pwa-research.md` |
| Engine Comparison | `./01-engine-comparison.md` |
| Game Dev Overview | `./00-overview.md` |
