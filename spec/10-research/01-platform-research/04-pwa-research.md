# Progressive Web App (PWA) Research

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`pwa`, `progressive-web-app`, `service-worker`, `offline`, `installable`, `uber`, `ride-sharing`, `gaming`, `webgl`, `web-api`, `comparison`, `native`

---

## Purpose

Comprehensive research into Progressive Web Apps (PWAs) as a platform strategy — covering architecture, capabilities, limitations, real-world feasibility for complex apps (Uber-type), and gaming use cases. Compared against native frameworks evaluated in `01-framework-comparison.md`.

---

## 1. What Is a PWA?

A Progressive Web App is a web application enhanced with modern browser APIs to deliver app-like experiences:

- **Service Workers** — Background scripts that intercept network requests, enabling offline support, caching, and push notifications
- **Web App Manifest** — JSON file declaring app name, icons, theme color, and display mode (`standalone`, `fullscreen`)
- **HTTPS** — Required for service worker registration and security
- **Installable** — Users can "Add to Home Screen" on mobile or install via browser on desktop

**Key distinction:** A PWA is NOT a framework. It's a set of browser capabilities layered on top of any web app (React, Vue, Svelte, vanilla JS, etc.).

---

## 2. PWA vs Native Frameworks — Comparison

| Criterion | **PWA** | **Tauri 2.x** | **Electron** | **Flutter** | **Capacitor** |
|-----------|:-------:|:---:|:---:|:---:|:---:|
| **Installation** | Browser install / Home Screen | OS installer | OS installer | App Store | App Store |
| **App Store** | ❌ Not required (⚠️ limited iOS) | ❌ Direct | ❌ Direct | ✅ Full | ✅ Full |
| **Offline Support** | ✅ Service worker | ✅ Native | ✅ Native | ✅ Native | ✅ SW + native |
| **Bundle Size** | 0 MB (served from web) | ~3–10 MB | ~150–300 MB | ~15–30 MB | ~5–15 MB |
| **Push Notifications** | ✅ Web Push (⚠️ iOS) | ✅ Native | ✅ Native | ✅ Native | ✅ Native |
| **Background Processing** | ⚠️ Limited | ✅ Full (Rust) | ✅ Full (Node) | ✅ Full | ⚠️ Limited |
| **File System Access** | ⚠️ Chrome only | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Camera / Mic** | ✅ MediaDevices | ✅ Plugin | ✅ Node | ✅ Plugin | ✅ Plugin |
| **Geolocation** | ✅ Geolocation API | ✅ Plugin | ✅ Node | ✅ Plugin | ✅ Plugin |
| **Bluetooth / USB / NFC** | ⚠️ Chrome only | ✅ Rust | ⚠️ Node | ✅ Plugin | ✅ Plugin |
| **Local Database** | ✅ IndexedDB, OPFS | ✅ SQLite | ✅ sqlite3 | ✅ sqflite | ✅ SQLite |
| **System Tray** | ❌ | ✅ Built-in | ✅ Built-in | ⚠️ Plugin | ❌ |
| **Auto-Update** | ✅ Automatic (web deploy) | ✅ Plugin | ✅ Plugin | ❌ Manual | ✅ Store |
| **Performance** | Moderate (browser) | High (native Rust) | Moderate (Chromium) | High (Skia) | Moderate |
| **Dev Speed** | ⚡ Fastest | 🔧 Moderate | 🔧 Moderate | 🔧 Moderate | ⚡ Fast |

---

## 3. PWA Pros and Cons

### Pros

| Advantage | Detail |
|-----------|--------|
| **Zero install friction** | Users visit a URL → instant app. No store, no download. |
| **Automatic updates** | Deploy to server → every user gets update immediately. |
| **Cross-platform by default** | One codebase on every device with a modern browser. |
| **No app store fees** | No 15–30% revenue cut. No review delays. |
| **SEO-friendly** | Content is indexable by search engines. |
| **Tiny footprint** | No binary to download. App shell caches in KB. |
| **Instant sharing** | Share a URL → recipient has the full app. |
| **Web ecosystem** | Entire npm ecosystem, React/Vue/Svelte, millions of libraries. |
| **Progressive enhancement** | Works as basic website on old browsers, enhanced on modern. |
| **Fastest time-to-market** | Web devs build PWAs immediately — no new language or tooling. |

### Cons

| Limitation | Detail |
|------------|--------|
| **iOS Safari restrictions** | No background sync, limited push (iOS 16.4+), 50 MB storage cap, no Bluetooth/USB/NFC. |
| **No App Store presence** | Cannot list in App Store / Play Store unless wrapped (Capacitor/TWA). |
| **Limited background execution** | Service workers killed when not in use. No persistent tasks. |
| **No native OS integration** | No system tray, global shortcuts, native menus, inter-app communication. |
| **Browser-dependent APIs** | Many advanced APIs are Chrome-only. Firefox and Safari lag. |
| **Performance ceiling** | JS in browser sandbox cannot match native Rust/C++/Dart. |
| **Storage quotas** | Browsers can evict cached data under storage pressure. |
| **No hardware acceleration control** | No direct GPU compute, custom audio pipelines, or low-level hardware. |
| **UX gaps on iOS** | Limited splash screen, badge count, haptic feedback, lock screen widgets. |
| **Enterprise concerns** | No MDM support, no enterprise distribution channels. |

---

## 4. Can We Build an Uber-Type App with PWA?

### Short Answer

**Yes, partially.** A PWA can handle 70–80% of Uber's functionality, but critical features require native capabilities.

### Feature-by-Feature Feasibility

| Feature | PWA? | Notes |
|---------|:---:|-------|
| Map display (Google Maps / Mapbox) | ✅ | Web map SDKs work perfectly. |
| Real-time GPS tracking | ✅ | Geolocation API works in foreground. |
| **Background GPS tracking** | ❌ | **Service workers cannot access Geolocation. Tracking stops when backgrounded. Dealbreaker for driver apps.** |
| Push notifications (rider) | ✅ | Web Push on Android. iOS 16.4+ with limitations. |
| Push notifications (driver) | ⚠️ | Reliability issues vs native APNs/FCM. |
| Payment processing | ✅ | Stripe, PayPal, Payment Request API all work. |
| In-app chat | ✅ | WebSocket / WebRTC works fully. |
| Phone call integration | ⚠️ | `tel:` links yes. VoIP / in-app calling no. |
| Camera (photo, document scan) | ✅ | MediaDevices API works. |
| Biometric auth | ⚠️ | WebAuthn supports it, inconsistent across browsers. |
| Offline mode | ⚠️ | Can cache UI shell. Cannot process payments offline. |
| **Background audio (driver alerts)** | ❌ | **Audio stops when PWA is backgrounded.** |
| **Always-on connection** | ❌ | **WebSocket killed when backgrounded on mobile.** |
| Deep links / URL schemes | ⚠️ | Android yes. iOS PWA very limited. |
| App Store presence | ❌ | Not listed unless wrapped (Capacitor/TWA). |

### Verdict

| Component | Viability | Recommendation |
|-----------|:---:|---------------|
| **Rider app** | ⚠️ 75% | PWA for MVP. Misses background push reliability and iOS deep links. |
| **Driver app** | ❌ 30% | **Requires background GPS, always-on WebSocket, reliable push. PWA cannot deliver.** |
| **Admin dashboard** | ✅ 100% | Pure web — PWA is ideal. |
| **Merchant portal** | ✅ 95% | Mostly form-based. PWA works well. |

### Recommended Architecture

| Component | Technology |
|-----------|-----------|
| Rider App | PWA for MVP → Capacitor for production with store listing |
| Driver App | Native (Swift/Kotlin) or Capacitor + native plugins |
| Admin Panel | PWA (web dashboard) |
| Merchant App | PWA or Capacitor hybrid |

### Real-World Examples

| Company | Approach | Result |
|---------|----------|--------|
| **Uber Lite** | PWA-like web | India market, rider-only, limited features |
| **Twitter Lite** | PWA | 65% more pages/session, 75% more tweets |
| **Starbucks** | PWA | 2x daily active users |
| **Pinterest** | PWA | 60% more engagement, 44% more ad revenue |
| **Ola (India)** | PWA rider booking | Lightweight for low-end phones, rider-only |

> **Key takeaway:** PWA is viable for rider/consumer apps (especially MVPs and low-end device markets). Driver/provider apps require native background capabilities that PWAs cannot deliver.

---

## 5. PWA for Gaming

### Browser Gaming APIs

| API | Purpose | Support |
|-----|---------|:---:|
| **WebGL 2.0** | 3D rendering (OpenGL ES 3.0) | ✅ All modern |
| **WebGPU** | Next-gen GPU (Vulkan/Metal/DX12 level) | ⚠️ Chrome 113+ |
| **Canvas 2D** | 2D rendering | ✅ All |
| **Web Audio API** | Spatial audio, effects | ✅ All modern |
| **Gamepad API** | Controller input | ✅ Chrome/Firefox/Edge |
| **Pointer Lock API** | FPS mouse capture | ✅ All modern |
| **WebAssembly** | Near-native compiled code | ✅ All modern |
| **Web Workers** | Multi-threaded computation | ✅ All modern |
| **WebXR** | VR/AR | ⚠️ Chrome, Quest Browser |
| **WebTransport / WebRTC** | Low-latency multiplayer | ⚠️ Emerging |

### Game Type Feasibility

| Game Type | PWA? | Notes |
|-----------|:---:|-------|
| Casual / Puzzle | ✅ Excellent | 2048, Wordle, Candy Crush-like |
| Card / Board | ✅ Excellent | Chess, Solitaire, Hearthstone-like |
| 2D Platformer | ✅ Very Good | Canvas/WebGL handles well |
| 2D Strategy / RTS | ✅ Good | WebGL + WASM sufficient |
| Turn-based RPG | ✅ Good | UI-heavy, light rendering |
| Retro / Pixel Art | ✅ Excellent | Minimal GPU needed |
| Multiplayer (turn-based) | ✅ Good | WebSocket sufficient |
| Multiplayer (real-time) | ⚠️ Moderate | Latency concerns (.io games work) |
| 3D Low-Poly | ⚠️ Moderate | WebGL 2.0 OK, mobile may struggle |
| 3D Mid-Fidelity | ⚠️ Moderate | WebGPU needed, WASM for logic |
| 3D High-Fidelity | ❌ Poor | Cannot match native GPU access |
| Competitive FPS | ❌ Poor | Input latency, frame timing issues |
| Open World 3D | ❌ Poor | Memory limits, streaming limits |

### PWA Gaming Engines / Frameworks

| Engine | Lang | 2D | 3D | PWA-Ready |
|--------|------|:--:|:--:|:---------:|
| **Phaser 3** | JS/TS | ✅ | ❌ | ✅ |
| **PixiJS** | JS/TS | ✅ | ❌ | ✅ |
| **Three.js** | JS/TS | ❌ | ✅ | ✅ |
| **Babylon.js** | JS/TS | ❌ | ✅ | ✅ |
| **PlayCanvas** | JS/TS | ❌ | ✅ | ✅ |
| **Excalibur.js** | TS | ✅ | ❌ | ✅ |
| **Godot (HTML5)** | GDScript | ✅ | ✅ | ⚠️ |
| **Unity (WebGL)** | C# | ✅ | ✅ | ⚠️ |
| **Bevy (WASM)** | Rust | ✅ | ✅ | ✅ |

### PWA Gaming Pros

| Advantage | Detail |
|-----------|--------|
| Zero install | Click a link and play instantly |
| Cross-platform | Same game on desktop, mobile, tablet |
| Instant updates | Deploy → all players get it |
| Offline play | Service worker caches game assets |
| No revenue share | No 30% cut to stores |
| SEO / discoverability | Games indexable, shareable via URL |
| WASM performance | Near-native for game logic (C++/Rust compile to WASM) |

### PWA Gaming Cons

| Limitation | Detail |
|------------|--------|
| Performance ceiling | Cannot match native GPU/CPU access |
| Memory limits | WASM typically capped at 2–4 GB |
| Mobile GPU throttling | Browsers throttle GPU to save battery |
| Audio limitations | Requires user gesture to start; stops when minimized |
| Input limitations | No raw input; Gamepad API has latency |
| Storage limits | ~50 MB on iOS Safari, dynamic on Chrome |
| No game services | No Steam, Game Center, Play Games integration |
| Shader limits | WebGL 2.0 = GLSL ES 3.0 only. No compute shaders or ray tracing. WebGPU improves this. |

### PWA vs Native Gaming

| Criterion | PWA | Native (Unity/Unreal/Godot) |
|-----------|:---:|:---:|
| Distribution | URL (instant) | App Store / Steam |
| Install size | 0 MB (streamed) | 50 MB – 50 GB |
| Update speed | Instant | Minutes to hours |
| Max render quality | Mid-tier (WebGL/WebGPU) | AAA (Vulkan/Metal/DX12) |
| CPU performance | ~70–90% via WASM | 100% native |
| GPU performance | ~50–70% | 100% direct access |
| Multiplayer | WebSocket / WebRTC | Raw TCP/UDP |
| Gamepad | ⚠️ Latency | ✅ Low latency |
| Dev speed | ⚡ Fastest | 🔧 Moderate |

### Successful PWA / Browser Games

| Game | Type | Players |
|------|------|:---:|
| **Wordle** | Puzzle | 300M+ peak |
| **agar.io** | Real-time multiplayer | 10M+ |
| **slither.io** | Real-time multiplayer | 50M+ |
| **krunker.io** | FPS multiplayer | 15M+ |
| **CrossCode** | Action RPG | Commercial (also on Steam) |

> **Key takeaway:** PWAs excel for casual, 2D, puzzle, card, and lightweight multiplayer games. Mid-tier 3D is feasible but compromised. AAA 3D, competitive FPS, and VR require native engines.

---

## 6. PWA Scoring Against Native Frameworks

| Factor | Weight | PWA | Tauri | Electron | Flutter | Capacitor |
|--------|:------:|:---:|:-----:|:--------:|:-------:|:---------:|
| Platform coverage | ×3 | 9 | 10 | 6 | 10 | 9 |
| Frontend code reuse | ×3 | 10 | 10 | 10 | 0 | 10 |
| Bundle size | ×2 | 10 | 10 | 2 | 7 | 8 |
| Memory usage | ×2 | 9 | 9 | 3 | 6 | 7 |
| Offline capability | ×2 | 7 | 9 | 9 | 9 | 8 |
| Background processing | ×2 | 3 | 9 | 8 | 8 | 5 |
| Native OS integration | ×2 | 2 | 9 | 8 | 7 | 6 |
| App Store distribution | ×1 | 1 | 3 | 3 | 9 | 9 |
| Development speed | ×2 | 10 | 7 | 8 | 7 | 9 |
| Push notifications | ×1 | 6 | 9 | 9 | 9 | 9 |
| **Weighted Total** | **/240** | **149** | **213** | **146** | **156** | **183** |
| **Percentage** | | **62%** | **89%** | **61%** | **65%** | **76%** |

### When to Choose PWA

| Scenario | PWA? | Why |
|----------|:---:|-----|
| MVP / prototype | ✅ | Fastest to market |
| Content app (news, docs) | ✅ | SEO, offline reading |
| E-commerce | ✅ | No store fees, instant access |
| Internal business tool | ✅ | Instant deploy, no install |
| Casual / puzzle game | ✅ | Instant play, cross-platform |
| Ride-sharing (rider) | ⚠️ | MVP yes, limited background |
| Ride-sharing (driver) | ❌ | Needs background GPS |
| High-fidelity 3D game | ❌ | Performance ceiling |
| Desktop utility (tray, system) | ❌ | No native OS integration |

---

## 7. PWA Implementation Example (Vite + React)

### 1. Install

```bash
npm install -D vite-plugin-pwa
```

### 2. Configure `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallbackDenylist: [/^\/~oauth/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
      manifest: {
        name: 'My App',
        short_name: 'MyApp',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
```

### 3. Guard against iframe/preview registration

```typescript
// src/main.tsx — prevent SW issues in Lovable preview
const isInIframe = (() => {
  try { return window.self !== window.top; }
  catch { return true; }
})();

const isPreviewHost =
  window.location.hostname.includes('id-preview--') ||
  window.location.hostname.includes('lovableproject.com');

if (isPreviewHost || isInIframe) {
  navigator.serviceWorker?.getRegistrations().then(regs =>
    regs.forEach(r => r.unregister())
  );
}
```

### 4. Install prompt component

```typescript
import { useState, useEffect } from 'react';

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!prompt) return null;
  return (
    <button onClick={() => { prompt.prompt(); setPrompt(null); }}>
      Install App
    </button>
  );
}
```

### Cache Strategies Reference

| Strategy | Use When | Example |
|----------|----------|---------|
| CacheFirst | Static assets | Fonts, images, CSS |
| NetworkFirst | Frequently changing data | API responses, feeds |
| StaleWhileRevalidate | Slightly stale OK | Blog posts, listings |
| NetworkOnly | Must be fresh | Auth, payments |
| CacheOnly | Fully offline content | App shell, offline page |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Platform Research Overview | `./00-overview.md` |
| Framework Comparison | `./01-framework-comparison.md` |
| Development Velocity | `./02-development-velocity.md` |
| Recommendation | `./03-recommendation.md` |
| Game Development Research | `../02-game-development/00-overview.md` |
| Diagrams | `../diagrams/` |
