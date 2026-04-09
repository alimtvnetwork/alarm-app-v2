# Platform Research

**Version:** 1.0.0  
**Status:** Active  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`platform`, `cross-platform`, `framework`, `native`, `desktop`, `mobile`, `tauri`, `electron`, `wails`, `flutter`, `comparison`

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

Comprehensive research into cross-platform application frameworks for building native desktop and mobile applications with a web-technology frontend. This research is **framework-agnostic in its evaluation** — it assesses each option on its own merits before making a recommendation. Applicable to any project that needs:

- Native desktop apps (macOS, Windows, Linux)
- Optional mobile apps (iOS, Android)
- Web frontend code reuse (React, Vue, Svelte, etc.)
- Native OS integration (notifications, system tray, audio, file system)
- Small bundle size and low memory footprint

---

## Document Inventory

| # | File | Description |
|---|------|-------------|
| 01 | `01-framework-comparison.md` | Deep-dive comparison of 6 frameworks — architecture, pros/cons, platform support, ecosystem maturity |
| 02 | `02-development-velocity.md` | Development speed analysis — learning curve, iteration speed, time-to-MVP, team ramp-up |
| 03 | `03-recommendation.md` | Final recommendation with scoring, risk analysis, decision record, and rollout strategy |

---

## Quick Summary

| Framework | Best For | Avoid When |
|-----------|----------|------------|
| **Tauri 2.x** | Full-stack native apps with web frontend reuse, small footprint | Team has zero Rust experience and no time to learn |
| **Electron** | Maximum ecosystem maturity, consistent rendering | Bundle size or memory matters, mobile needed |
| **Wails** | Go teams wanting desktop apps with web frontend | Mobile support needed, or system tray is critical |
| **Flutter** | Mobile-first apps with desktop as secondary | Existing React/Vue frontend you want to reuse |
| **Go + CEF** | Full Chromium control with Go backend | Anything — too niche for most projects |
| **Fyne** | Simple Go utility apps | Feature-rich apps needing audio, tray, or native look |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Research Root | `../00-overview.md` |
| Diagrams | `../diagrams/` |
