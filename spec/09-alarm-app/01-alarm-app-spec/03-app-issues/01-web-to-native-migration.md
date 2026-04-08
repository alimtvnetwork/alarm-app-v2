# Issue: Web-to-Native Migration

**Version:** 1.0.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None  
**Status:** Open  
**Type:** Migration / Refactor

---

## Keywords

`migration`, `web-app`, `native`, `cross-platform`, `breaking-change`

---

## Summary

The Alarm App spec was originally written for a browser-based web app using localStorage, Web Audio API, Notification API, and other browser-specific technologies. The app must be redesigned as a cross-platform native application (macOS first, then Windows/Linux/iOS/Android). All web-specific references must be updated.

---

## Affected Files & Issues

### 1. `spec/09-alarm-app/00-overview.md`

| Line | Current (Web) | Required (Native) |
|------|---------------|-------------------|
| 13 | Keywords: `pwa`, `web-app` | Replace with `native`, `cross-platform`, `tauri` |
| 31 | "web application built with React, Vite, and Tailwind CSS" | "cross-platform native application built with Tauri, React, Vite, and Tailwind CSS" |

### 2. `spec/09-alarm-app/01-alarm-app-spec/00-overview.md`

| Line | Current (Web) | Required (Native) |
|------|---------------|-------------------|
| 44 | `Web Audio API — Alarm sound playback` | `Native Audio — Alarm sound playback (Rust/Tauri plugin)` |
| 45 | `Notification API — System notifications` | `OS Notifications — System notifications (Tauri notification plugin)` |
| 46 | `localStorage — Data persistence` | `SQLite — Data persistence (Tauri SQL plugin)` |
| 84 | `PWA` in P3 features | Replace with `System Tray` or `Auto-Update` |
| 92 | "Architecture, data model, design system, web constraints" | "Architecture, data model, design system, platform constraints" |
| — | Missing from tech stack | Add `Tauri 2.x — Cross-platform runtime` and `Rust — Backend/native layer` |

### 3. `spec/09-alarm-app/01-alarm-app-spec/01-fundamentals/01-data-model.md`

| Line | Current (Web) | Required (Native) |
|------|---------------|-------------------|
| 18 | "localStorage keys" in purpose | "storage schema" |
| 67–75 | Storage Keys section references localStorage | Replace with SQLite tables or Tauri store plugin |
| 101 | Cross-ref: "Web API Constraints" | Rename to "Platform Constraints" |

### 4. `spec/09-alarm-app/01-alarm-app-spec/01-fundamentals/03-file-structure.md`

| Line | Current (Web) | Required (Native) |
|------|---------------|-------------------|
| 30 | `useAlarms.ts — CRUD, toggle, group toggle, localStorage sync` | `useAlarms.ts — CRUD, toggle, group toggle, native storage sync` |
| 31 | `useTheme.ts — Theme state + localStorage + class toggle` | `useTheme.ts — Theme state + native storage + class toggle` |
| — | Missing | Add `src-tauri/` directory structure (Rust backend) |

### 5. `spec/09-alarm-app/01-alarm-app-spec/01-fundamentals/04-web-api-constraints.md`

| Issue | Detail |
|-------|--------|
| Entire file | Written for browser APIs. Must be rewritten as `04-platform-constraints.md` covering native OS differences across macOS/Windows/Linux/iOS/Android |
| Title | "Web API Constraints" → "Platform Constraints" |
| Content | Replace browser mitigations with native API approaches |

### 6. `spec/09-alarm-app/01-alarm-app-spec/02-features/01-alarm-crud.md`

| Line | Current (Web) | Required (Native) |
|------|---------------|-------------------|
| 30 | "All changes persist to localStorage immediately" | "All changes persist to native storage immediately" |
| 46 | "useAlarms — Provides CRUD operations, toggle, localStorage sync" | "useAlarms — Provides CRUD operations, toggle, native storage sync" |

### 7. `spec/09-alarm-app/01-alarm-app-spec/02-features/03-alarm-firing.md`

| Line | Current (Web) | Required (Native) |
|------|---------------|-------------------|
| 25 | "1-second setInterval" | "Rust background thread timer" |
| 27 | "Play alarm sound via Web Audio API" | "Play alarm sound via native audio (Rust)" |
| 29 | "Fire system notification via Notification API" | "Fire OS notification via Tauri notification plugin" |
| 48 | "Audio plays immediately on fire (Web Audio API)" | "Audio plays immediately on fire (native audio)" |

### 8. `spec/09-alarm-app/01-alarm-app-spec/02-features/04-snooze-system.md`

| Line | Current (Web) | Required (Native) |
|------|---------------|-------------------|
| 42 | "Stored in localStorage under snooze-state" | "Stored in native storage" |
| 61 | "Snooze state persists across page refresh" | "Snooze state persists across app restart" |

### 9. `spec/09-alarm-app/01-alarm-app-spec/02-features/05-sound-and-vibration.md`

| Line | Current (Web) | Required (Native) |
|------|---------------|-------------------|
| 42 | "Web Audio API GainNode with linearRampToValueAtTime" | "Native audio gain control via Rust" |
| 51 | "navigator.vibrate — toggle hidden on unsupported browsers" | "Native haptics API — feature-detected per platform" |
| 60 | "Gradual volume works via Web Audio API gain ramp" | "Gradual volume works via native audio gain control" |
| 71 | Cross-ref: "Web API Constraints" | "Platform Constraints" |

### 10. `spec/09-alarm-app/01-alarm-app-spec/02-features/06-dismissal-challenges.md`

| Line | Current (Web) | Required (Native) |
|------|---------------|-------------------|
| 46 | "Uses DeviceMotionEvent — feature-detected" | "Uses native accelerometer API — feature-detected per platform" |
| 63 | "Uses DeviceMotionEvent for step estimation" | "Uses native pedometer / motion API" |

### 11. `spec/09-alarm-app/01-alarm-app-spec/02-features/07-alarm-groups.md`

| Line | Current (Web) | Required (Native) |
|------|---------------|-------------------|
| 46 | "Stored as group-toggle-state in localStorage" | "Stored in native storage" |
| 65 | "Groups persist in localStorage" | "Groups persist in native storage" |

### 12. `spec/09-alarm-app/01-alarm-app-spec/02-features/08-clock-display.md`

| Line | Current (Web) | Required (Native) |
|------|---------------|-------------------|
| 37 | "12/24-hour format toggle (persisted to localStorage)" | "12/24-hour format toggle (persisted to native storage)" |

### 13. `spec/09-alarm-app/01-alarm-app-spec/02-features/09-theme-system.md`

| Line | Current (Web) | Required (Native) |
|------|---------------|-------------------|
| 36 | "Theme stored in localStorage key theme" | "Theme stored in native storage" |
| 37 | "Applies .dark class to `<html>` element" | OK (still applies in Tauri WebView) |
| 39 | "matchMedia('prefers-color-scheme: dark')" | OK (works in Tauri WebView) |

### 14. `spec/09-alarm-app/01-alarm-app-spec/02-features/12-smart-features.md`

| Line | Current (Web) | Required (Native) |
|------|---------------|-------------------|
| 35 | "Browser support varies; requires HTTPS" | "Uses native GPS/location services" |
| 43–48 | PWA section | Replace with "System Tray / Menu Bar" or remove |
| 52 | "Web Speech API" | "Native speech recognition API" |
| 68 | Cross-ref: "Web API Constraints" | "Platform Constraints" |

### 15. `spec/09-alarm-app/01-alarm-app-spec/02-features/13-analytics.md`

| Line | Current (Web) | Required (Native) |
|------|---------------|-------------------|
| 53 | "All analytics data stored in localStorage under alarm-analytics" | "All analytics data stored in SQLite" |

### 16. `spec/09-alarm-app/01-alarm-app-spec/01-fundamentals/00-overview.md`

| Line | Current (Web) | Required (Native) |
|------|---------------|-------------------|
| 42 | Document Inventory: "04 — web-api-constraints.md — Browser API limitations" | "04 — platform-constraints.md — Platform API differences and mitigations" |
| — | Missing | Add "05 — platform-strategy.md — Framework comparison and rollout" |

### 17. Reference files

| File | Issue |
|------|-------|
| `reference/alarm-app-features.md` line 20 | "browser support varies" → "platform support varies" |
| `reference/alarm-app-features.md` line 97 | "browser support varies" → "platform support varies" |
| `reference/alarm-clock-features.md` | Review for browser-specific references |

---

## Migration Priority

| Priority | Tasks |
|----------|-------|
| **P0** | Update overview files, tech stack, data model storage references |
| **P1** | Rewrite web-api-constraints → platform-constraints, update firing/sound/snooze specs |
| **P2** | Update secondary feature specs (challenges, groups, clock, analytics) |
| **P3** | Update reference documents, add Tauri architecture doc |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Platform Strategy | `../01-fundamentals/05-platform-strategy.md` |
| All Feature Specs | `../02-features/00-overview.md` |
