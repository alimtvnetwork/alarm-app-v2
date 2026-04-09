# Framework Recommendation

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`recommendation`, `decision`, `scoring`, `risk`, `rollout`, `tauri`, `framework`, `selection`

---

## Purpose

Final framework recommendation based on the comparison and velocity analyses. Includes weighted scoring, risk matrix, decision record, and phased rollout strategy. Written generically — adaptable to any project selecting a cross-platform native framework.

---

## 1. Weighted Scoring

Each criterion is scored 0–10 and weighted by importance for a typical native app project.

| Factor | Weight | Tauri | Electron | Wails | Flutter | Go+CEF | Fyne |
|--------|:------:|:-----:|:--------:|:-----:|:-------:|:------:|:----:|
| Platform coverage (5 OS) | ×3 | 10 | 6 | 6 | 10 | 6 | 7 |
| Frontend code reuse | ×3 | 10 | 10 | 10 | 0 | 10 | 0 |
| Bundle size | ×2 | 10 | 2 | 8 | 7 | 2 | 8 |
| Memory efficiency | ×2 | 10 | 3 | 8 | 6 | 2 | 9 |
| Background task reliability | ×3 | 10 | 5 | 8 | 7 | 5 | 7 |
| Native integration (tray, notif, audio) | ×3 | 9 | 8 | 7 | 6 | 4 | 4 |
| Developer velocity (time-to-MVP) | ×2 | 6 | 10 | 8 | 5 | 2 | 6 |
| AI code generation quality | ×1 | 6 | 10 | 7 | 8 | 2 | 4 |
| Ecosystem & community | ×1 | 7 | 10 | 5 | 9 | 2 | 4 |
| Security model | ×2 | 10 | 5 | 7 | 8 | 4 | 6 |
| Long-term maintainability | ×2 | 10 | 6 | 7 | 8 | 3 | 5 |
| **Weighted Total** | **/240** | **214** | **152** | **174** | **153** | **100** | **130** |
| **Percentage** | — | **89%** | **63%** | **73%** | **64%** | **42%** | **54%** |

### Final Ranking

| Rank | Framework | Score | Percentage | Best For |
|------|-----------|:-----:|:----------:|----------|
| 🥇 1st | **Tauri 2.x** | 214/240 | 89% | Full-stack native apps with web frontend reuse, reliability-critical features |
| 🥈 2nd | **Wails** | 174/240 | 73% | Desktop-only Go projects prioritizing simplicity |
| 🥉 3rd | **Flutter** | 153/240 | 64% | Mobile-first projects willing to rewrite in Dart |
| 4th | **Electron** | 152/240 | 63% | Teams needing maximum ecosystem maturity, desktop-only |
| 5th | **Fyne** | 130/240 | 54% | Simple Go utilities |
| 6th | **Go + CEF** | 100/240 | 42% | Not recommended for most projects |

---

## 2. Risk Analysis

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|:----------:|:------:|-----------|
| Rust learning curve delays initial delivery | Medium | Medium | Front-load learning with focused Rust exercises; 80% of dev is frontend (instant iteration) |
| WebView CSS inconsistencies across platforms | Medium | Low | Use Tailwind utility classes; test on all target WebViews during development |
| macOS WKWebView rendering quirks | Low | Low | Platform-specific CSS overrides; test early on macOS |
| Linux webkit2gtk version fragmentation | Medium | Medium | Set minimum version requirement (2.36+); document in install guide |
| Tauri mobile plugins lag behind desktop | Medium | Low | Mobile is a later phase — plugins will mature by then |
| Native audio crate differences across OS | Low | Medium | Abstract behind a trait; implement platform-specific fallbacks |
| SQLite migration failures on app updates | Low | High | Use versioned migrations (e.g., `refinery`); backup before migration |
| Rust async complexity (tokio) | Medium | Medium | Keep async code in well-defined modules; follow documented patterns |

### Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|:----------:|:------:|-----------|
| Apple notarization rejection | Low | High | Follow Apple guidelines; test with `xcrun notarytool` before release |
| Windows SmartScreen warnings | Medium | Medium | Use EV code signing certificate |
| Auto-update delivery failures | Low | Medium | Provide manual download fallback |
| App Store rejection (mobile) | Medium | Medium | Review platform guidelines early |

### AI-Assisted Development Risks

| Risk | Likelihood | Impact | Mitigation |
|------|:----------:|:------:|-----------|
| AI generates incorrect Rust code | High | High | Provide exact function signatures, types, and examples in specs |
| AI cannot compile/test Rust code | High | High | Use CI/CD for compilation checks; define test patterns in spec |
| AI mishandles platform-specific code (`#[cfg]`) | Medium | Medium | Document platform branching patterns with examples |
| AI struggles with Rust async/ownership | Medium | High | Provide copy-paste async patterns for common operations |

---

## 3. Decision Matrix — When to Choose What

### Choose Tauri When:

- ✅ You need desktop + mobile from one codebase
- ✅ You have an existing React/Vue/Svelte frontend
- ✅ Bundle size and memory matter (always-running apps)
- ✅ You need reliable background processing (timers, schedulers)
- ✅ Security is a priority (financial, health, personal data)
- ✅ You're willing to invest in Rust learning for long-term quality

### Choose Electron When:

- ✅ Desktop-only is acceptable (no mobile roadmap)
- ✅ Your entire team is JavaScript/Node — no one knows Rust or Go
- ✅ You need consistent pixel-perfect rendering across all desktops
- ✅ Ecosystem maturity and available libraries matter most
- ✅ Speed of initial development is the #1 priority
- ❌ Don't choose if: mobile is planned, bundle size matters, or app runs continuously

### Choose Flutter When:

- ✅ Mobile is the primary target (iOS + Android first)
- ✅ You're starting a brand new project (no existing web frontend)
- ✅ You want pixel-perfect consistent UI everywhere
- ✅ Google ecosystem alignment (Firebase, Material Design)
- ❌ Don't choose if: you have a React frontend you want to reuse

### Choose Wails When:

- ✅ Your team knows Go and wants to stay in Go
- ✅ Desktop-only is fine (no mobile needed)
- ✅ You want the simplest possible native app architecture
- ✅ Small bundle size matters but you don't want Rust complexity
- ❌ Don't choose if: system tray or auto-update is critical

---

## 4. Rollout Strategy Template

A phased approach that works for most cross-platform projects:

| Phase | Platform | Focus | Typical Timeline |
|-------|----------|-------|:----------------:|
| Phase 1 | Primary desktop OS | Full feature set, core UX | 2–3 months |
| Phase 2 | Additional desktop OS | Platform-specific adaptations, testing | 1–2 months |
| Phase 3 | Mobile (iOS + Android) | Mobile-specific UI, touch gestures, native APIs | 2–4 months |

### Phase Transition Checklist

| Step | Description |
|------|-------------|
| ✅ Core features stable on Phase 1 platform | All P0 features working and tested |
| ✅ CI/CD pipeline producing signed builds | Automated build + signing for Phase 1 |
| ✅ Auto-update mechanism verified | Users can receive updates seamlessly |
| ✅ Platform-specific code isolated | `#[cfg]` / platform modules cleanly separated |
| ✅ Test coverage on platform-specific code | Unit tests for each platform branch |
| ✅ Phase 2 platform WebView/runtime tested | Verify rendering and behavior on target OS |

---

## 5. Decision Record

| # | Decision | Date | Rationale |
|---|----------|------|-----------|
| D1 | **Tauri 2.x is the primary recommendation** | 2026-04-09 | Highest weighted score (89%), only framework satisfying all hard requirements |
| D2 | **Electron rejected as primary choice** | 2026-04-09 | Background timer throttling, no mobile, excessive resource usage for always-running apps |
| D3 | **Flutter rejected as primary choice** | 2026-04-09 | Requires full frontend rewrite, less mature desktop tray support |
| D4 | **Wails is the recommended fallback** | 2026-04-09 | Second-highest score (73%), simplest architecture, but lacks mobile and tray |
| D5 | **Go+CEF and Fyne not recommended** | 2026-04-09 | Both too limited — CEF is heavy with no benefits over Electron; Fyne lacks critical features |

---

## 6. Cost-Benefit Summary

| Framework | Upfront Cost | Long-term Benefit | ROI Timeline |
|-----------|:------------:|:-----------------:|:------------:|
| **Tauri** | High (Rust learning) | Very high (safety, performance, 5 platforms) | 3–6 months |
| **Electron** | Low (JS everywhere) | Medium (tech debt, no mobile, heavy) | Immediate, but diminishing |
| **Wails** | Medium (Go learning) | Medium (solid desktop, no mobile) | 1–2 months |
| **Flutter** | High (Dart + rewrite) | High (best mobile, good desktop) | 3–6 months |

**Bottom line:** Tauri has the highest upfront investment but the best long-term return — especially for projects that need reliability, security, and cross-platform reach.

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Framework Comparison | `./01-framework-comparison.md` |
| Development Velocity | `./02-development-velocity.md` |
| Scoring Diagram | `../diagrams/01-framework-scoring.mmd` |
