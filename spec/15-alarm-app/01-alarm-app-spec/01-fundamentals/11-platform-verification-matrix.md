# Platform Verification Matrix

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`platform`, `verification`, `testing`, `matrix`, `runtime`, `fallback`, `compatibility`

---

## Purpose

Exhaustive mapping of every platform-dependent behavior to a testable assertion, expected result per OS, test method, and fallback. Without this, AI will implement happy-path code that fails silently on specific platforms.

---

## Alarm Engine Timing

| Feature | macOS | Windows | Linux | Test Method | Fallback |
|---------|-------|---------|-------|-------------|----------|
| 30s check interval accuracy | `tokio::time::sleep` — reliable ±50ms | Same | Same | Unit test: measure 10 consecutive intervals, assert all within ±100ms of 30s | Log drift. If >500ms drift, log `WARN` and continue |
| Snooze expiry precision | `tokio::time::sleep_until()` — ±10ms | Same | Same | Integration test: snooze 1min, assert fires within ±500ms | Re-check immediately on wake |
| Missed alarm detection on wake | `NSWorkspace` `NSWorkspaceDidWakeNotification` | `WM_POWERBROADCAST` `PBT_APMRESUMEAUTOMATIC` | `org.freedesktop.login1.Manager` `PrepareForSleep(false)` | E2E: simulate sleep→wake, verify missed alarm fires within 5s | Fallback: 30s polling loop detects alarms with `NextFireTime < now` |
| Timer survives app minimize | ✅ Rust thread not affected | ✅ Same | ✅ Same | E2E: minimize window, wait for alarm, verify fires | N/A — guaranteed by Rust threading |

---

## Audio Playback

| Feature | macOS | Windows | Linux | Test Method | Fallback |
|---------|-------|---------|-------|-------------|----------|
| Default audio output | Core Audio via `rodio` | WASAPI via `rodio` | PulseAudio/ALSA via `rodio` | Integration test: `OutputStream::try_default()` succeeds | Error E4 → show overlay without audio + OS notification |
| Audio while app unfocused | ✅ Rust-side, not WebView | ✅ Same | ✅ Same | E2E: unfocus app, trigger alarm, verify audio plays | N/A — guaranteed by Rust audio |
| Gradual volume ramp | `Sink::set_volume()` 0.0→1.0 over N seconds | Same | Same | Unit test: assert volume at 0%, 50%, 100% of duration | If `set_volume` fails, play at full volume |
| Audio session category | Must set `.playback` category via `objc2` to prevent ducking | Not needed | Not needed | macOS-only test: verify audio plays over other apps | Without category, audio may be ducked by music apps |
| Custom sound file formats | WAV, MP3, OGG, FLAC via `rodio` | Same | Same (FLAC may need `gstreamer`) | Integration test: play each format, assert no error | Error E3 → fall back to `classic-beep` |

---

## Notifications

| Feature | macOS | Windows | Linux | Test Method | Fallback |
|---------|-------|---------|-------|-------------|----------|
| Permission request | `UNUserNotificationCenter.requestAuthorization()` via `tauri-plugin-notification` | Notifications allowed by default (can be disabled in Settings) | Varies by DE — most allow by default | E2E: call `.request_permission()`, assert returns `granted` or `denied` | Error E8 → in-app overlay only, show one-time hint |
| Permission check | `.is_permission_granted()` → `bool` | Same | Same | Unit test: mock permission state, verify behavior | If check fails, assume denied → overlay fallback |
| Notification display | Native `NSUserNotification` banner | Toast notification (Win10+) | `notify-send` or D-Bus `org.freedesktop.Notifications` | E2E: fire notification, verify shown (manual or screenshot) | Overlay is always shown regardless of notification |
| Action buttons in notification | Supported (UNNotificationAction) | Supported (Win10+ toast buttons) | ⚠️ Not reliably supported across all DEs | E2E: verify snooze/dismiss buttons appear on macOS + Windows | Linux: notification is informational only, user must interact via overlay |

---

## System Tray

| Feature | macOS | Windows | Linux | Test Method | Fallback |
|---------|-------|---------|-------|-------------|----------|
| Tray icon display | `NSStatusItem` — menu bar icon | System tray icon (taskbar) | `AppIndicator` or `StatusNotifierItem` | E2E: verify tray icon visible after app start | Error E9 → window-only mode, log warning |
| Tray icon format | Template icon (`.png`, 22×22 @1x, 44×44 @2x, monochrome) | `.ico` (16×16, 32×32, 48×48 multi-res) | `.png` (22×22, 44×44) | CI: validate icon files exist in correct formats | Missing icon → use text fallback or hide tray |
| Tray menu items | "Next alarm: 7:30 AM", "Toggle [alarm name]", "Quit" | Same | Same (if DE supports menus) | E2E: right-click tray, verify menu items | Menu missing → tray icon is click-to-show-window only |
| Click behavior | Left-click: show/hide window. Right-click: menu | Left-click: show window. Right-click: menu | Left-click: show window (varies by DE) | E2E per platform | Always fallback to show window |

---

## WebView CSS Compatibility

| CSS Feature | Safari WebKit (macOS) | WebView2 / Chromium (Windows) | WebKitGTK (Linux) | Action |
|-------------|:---:|:---:|:---:|--------|
| `backdrop-filter: blur()` | ✅ Safari 9+ | ✅ Chrome 76+ | ⚠️ WebKitGTK 2.40+ only | Use `@supports` with solid fallback |
| `gap` in Flexbox | ✅ Safari 14.1+ | ✅ Chrome 84+ | ✅ WebKitGTK 2.38+ | Safe to use |
| CSS Grid | ✅ | ✅ | ✅ | Safe to use |
| Custom properties (variables) | ✅ | ✅ | ✅ | Safe to use |
| `clamp()` | ✅ Safari 13.1+ | ✅ Chrome 79+ | ✅ WebKitGTK 2.28+ | Safe to use |
| `aspect-ratio` | ✅ Safari 15+ | ✅ Chrome 88+ | ⚠️ WebKitGTK 2.36+ | Use with fallback padding trick |
| `container-queries` | ⚠️ Safari 16+ | ✅ Chrome 105+ | ❌ Not in WebKitGTK <2.42 | **Do NOT use** |
| `@layer` | ⚠️ Safari 15.4+ | ✅ Chrome 99+ | ❌ Not in WebKitGTK <2.40 | **Do NOT use** |
| `color-mix()` | ⚠️ Safari 16.2+ | ✅ Chrome 111+ | ❌ Not in WebKitGTK <2.42 | **Do NOT use** |
| `light-dark()` | ❌ Safari 17.5+ | ✅ Chrome 123+ | ❌ | **Do NOT use** — use `prefers-color-scheme` |
| `prefers-color-scheme` | ✅ | ✅ | ✅ | Safe — use for theme detection |
| Smooth scrolling | ✅ | ✅ | ✅ | Safe to use |
| `transition` / `animation` | ✅ | ✅ | ✅ | Safe to use |

### Minimum WebView Versions

| Platform | Engine | Minimum Version | How Enforced |
|----------|--------|----------------|--------------|
| macOS | Safari WebKit | macOS 12+ (Safari 15+) | Tauri `minimumSystemVersion` in `tauri.conf.json` |
| Windows | WebView2 | Evergreen (auto-updates) | Tauri bundles WebView2 bootstrapper |
| Linux | WebKitGTK | 2.38+ | Document as system requirement; check at startup |

---

## Alarm Timing Precision

| Scenario | Expected Behavior | Tolerance | OS API | Test Method |
|----------|------------------|-----------|--------|-------------|
| Normal tick (30s interval) | Engine checks alarms every 30s | ±100ms | `tokio::time::sleep(Duration::from_secs(30))` | Measure 100 ticks, assert max jitter <200ms |
| Snooze expiry (exact time) | Fire at exact snooze end time | ±500ms | `tokio::time::sleep_until(Instant)` | Set 60s snooze, measure actual fire time |
| DST spring-forward | 2:30 AM alarm → skipped → fires at 3:00 AM (next valid) | Exact | `chrono-tz` + `croner` | Unit test with `America/New_York` at DST boundary |
| DST fall-back | 1:30 AM alarm → fires once (first occurrence) | Exact | `chrono-tz` disambiguation | Unit test: verify fires at first 1:30 AM, not second |
| System clock change | Detect NTP jump, recalculate `NextFireTime` | <30s delay | 30s polling detects `now` jump | Integration test: mock clock jump, verify recalculation |
| Resume from sleep | Fire all missed alarms within 5s of wake | <5s | Platform wake listener | E2E: simulate sleep, verify missed alarm fires on wake |

---

## Tray Icon Asset Requirements

| Platform | Format | Sizes | Color Mode | File Location |
|----------|--------|-------|------------|---------------|
| macOS | `.png` (template image) | 22×22 @1x, 44×44 @2x | **Monochrome** (black with alpha). macOS auto-inverts for dark menu bar | `src-tauri/icons/tray-icon.png`, `tray-icon@2x.png` |
| Windows | `.ico` (multi-resolution) | 16×16, 32×32, 48×48 embedded in single `.ico` | Full color (light + dark variants recommended) | `src-tauri/icons/tray-icon.ico` |
| Linux | `.png` | 22×22 @1x, 44×44 @2x | Full color (some DEs invert, some don't) | `src-tauri/icons/tray-icon.png` |

### Icon Design Rules

1. **macOS template icons must be monochrome.** Use black (#000000) with varying alpha for shading. macOS automatically applies vibrancy and inverts for dark mode
2. **Windows `.ico` must contain all 3 sizes.** Use a tool like `imagemagick` to combine: `convert 16.png 32.png 48.png tray-icon.ico`
3. **All icons must be recognizable at 16×16.** Simplify design — avoid fine details that disappear at small sizes
4. **Test in both light and dark system themes** on all platforms

---

## Notification Permission Flow

### macOS

```
App Launch → Check `.is_permission_granted()`
  ├── true → Ready (notifications will show)
  ├── false → On first alarm creation:
  │     └── Call `.request_permission()`
  │           ├── Granted → Store flag, enable notifications
  │           └── Denied → Show one-time hint:
  │                 "Enable notifications in System Settings → Notifications → Alarm App"
  └── "not-determined" → Same as false (request on first alarm)
```

**Note:** macOS only shows the system permission prompt **once**. After denial, the user must manually enable in System Settings. The app cannot re-request.

### Windows

```
App Launch → Notifications enabled by default (Windows 10+)
  ├── User can disable via Settings → System → Notifications → Alarm App
  └── Check via `.is_permission_granted()` — if false:
        └── Show hint: "Enable notifications in Windows Settings → System → Notifications"
```

**Note:** Windows does not require an explicit permission prompt. Focus Assist / Do Not Disturb may suppress notifications — the app should document this.

### Linux

```
App Launch → Check `.is_permission_granted()`
  ├── Most DEs allow notifications by default
  └── If D-Bus notification service unavailable:
        └── Log warning, fall back to in-app overlay only
```

**Note:** Linux notification behavior varies significantly by desktop environment (GNOME, KDE, XFCE). Some DEs don't support action buttons. The app must not depend on notification actions — overlay is the primary dismissal UI.

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Platform Constraints | `./04-platform-constraints.md` |
| Design System (icons) | `./02-design-system.md` |
| Test Strategy | `./09-test-strategy.md` |
| Alarm Firing | `../02-features/03-alarm-firing.md` |
| Sound & Vibration | `../02-features/05-sound-and-vibration.md` |
| Dependency Lock | `./10-dependency-lock.md` |

---

*Platform Verification Matrix — v1.0.0 — 2026-04-10*
