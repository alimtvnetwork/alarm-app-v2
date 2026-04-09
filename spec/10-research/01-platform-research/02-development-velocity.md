# Development Velocity Analysis

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`velocity`, `development-speed`, `learning-curve`, `time-to-mvp`, `iteration`, `productivity`, `team-ramp-up`

---

## Purpose

Analyzes how fast you can build and iterate with each cross-platform framework. Covers learning curve, time-to-first-build, iteration speed, debugging experience, team ramp-up, and realistic time-to-MVP estimates. This is critical for project planning and framework selection.

---

## 1. Learning Curve

| Framework | Language | Difficulty | Time to Competency | Notes |
|-----------|----------|:----------:|:-------------------:|-------|
| **Electron** | JavaScript / Node | ★☆☆☆☆ Easy | 1–2 weeks | Web devs are productive immediately. IPC is the only new concept. |
| **Wails** | Go | ★★☆☆☆ Moderate | 2–3 weeks | Go is simple to learn. Wails API is small. WebView quirks take time. |
| **Flutter** | Dart | ★★★☆☆ Moderate | 3–5 weeks | Dart is easy but the widget system, state management, and platform channels take time. |
| **Tauri 2.x** | Rust | ★★★★☆ Steep | 4–8 weeks | Rust's ownership model is genuinely hard. Once learned, productivity is high. |
| **Fyne** | Go | ★★☆☆☆ Moderate | 2–3 weeks | Simple API, but limited capabilities means hitting walls quickly. |
| **Go + CEF** | Go + C bindings | ★★★★★ Very steep | 8–12 weeks | Low-level C interop, minimal docs, manual everything. |

### Learning Curve Breakdown — Tauri vs Electron

| Concept | Electron | Tauri |
|---------|----------|-------|
| "Hello World" build | 5 minutes | 15 minutes (Rust compile) |
| IPC communication | 1 day (simple JS) | 2–3 days (Rust types + commands) |
| System tray | 1 day | 1 day (plugin) |
| SQLite integration | 1 day (better-sqlite3) | 1–2 days (plugin + migrations) |
| Background processing | 1 day (Node workers) | 3–5 days (tokio async Rust) |
| Native audio | 1 day (Node libs) | 2–3 days (rodio crate) |
| Debugging | Chrome DevTools (familiar) | DevTools + rust-analyzer + LLDB |
| **Total ramp-up** | **~1–2 weeks** | **~4–6 weeks** |

---

## 2. Iteration Speed

How fast can you make changes and see results during development?

| Framework | Hot Reload | Build Time (dev) | Build Time (prod) | Feedback Loop |
|-----------|:----------:|:-----------------:|:------------------:|:-------------:|
| **Electron** | ✅ Instant (Vite HMR) | < 1 sec | 30–60 sec | ★★★★★ Fastest |
| **Tauri** | ✅ Frontend HMR + Rust recompile | Frontend: < 1 sec, Rust: 5–30 sec | 1–3 min | ★★★★☆ Fast (frontend), ★★★☆☆ Moderate (backend) |
| **Wails** | ✅ Frontend HMR + Go recompile | Frontend: < 1 sec, Go: 2–5 sec | 30–60 sec | ★★★★☆ Fast |
| **Flutter** | ✅ Hot reload (sub-second) | < 1 sec (hot reload) | 1–3 min | ★★★★★ Fastest |
| **Fyne** | ❌ Manual restart | 2–5 sec | 10–30 sec | ★★★☆☆ Moderate |
| **Go + CEF** | ⚠️ Manual | 10–30 sec | 2–5 min | ★★☆☆☆ Slow |

### Tauri Split Feedback Loop

Tauri has a **split development model** that's important to understand:

| Change Type | Tool | Feedback Time | Notes |
|-------------|------|:-------------:|-------|
| UI component (React) | Vite HMR | < 1 sec | Same as any web app — instant |
| CSS / styling | Vite HMR | < 1 sec | Instant — Tailwind JIT |
| TypeScript types | Vite HMR | < 1 sec | Type errors shown in IDE |
| Rust IPC command (new) | cargo rebuild | 5–30 sec | First compile is slow; incremental is faster |
| Rust logic change | cargo rebuild | 3–10 sec | Incremental compile |
| Tauri config change | Full restart | 10–30 sec | `tauri.conf.json` changes need restart |

**Key insight:** 80% of development time is frontend (React), which has the same instant feedback loop as any web app. The Rust compilation overhead only applies to backend logic changes.

---

## 3. Time-to-MVP Estimates

Realistic estimates for a solo developer building a native app with core features (CRUD, local storage, notifications, system tray, basic UI).

| Framework | Time to MVP | Breakdown | Confidence |
|-----------|:-----------:|-----------|:----------:|
| **Electron** | 2–4 weeks | Week 1: setup + CRUD. Week 2: notifications + tray. Week 3–4: polish + packaging. | High |
| **Wails** | 3–5 weeks | Week 1–2: setup + CRUD. Week 3: notifications (manual). Week 4–5: tray (manual) + packaging. | Medium |
| **Flutter** | 4–6 weeks | Week 1–2: learn Dart + Flutter. Week 3–4: CRUD + state management. Week 5–6: native plugins + packaging. | Medium |
| **Tauri** | 4–8 weeks | Week 1–3: learn Rust basics. Week 4–5: CRUD + IPC. Week 6–7: plugins (tray, notifications). Week 8: packaging. | Medium |
| **Fyne** | 3–5 weeks | Week 1–2: setup + CRUD. Week 3–4: custom UI (limited). Week 5: packaging. But missing features. | Low |
| **Go + CEF** | 8–12 weeks | Weeks 1–4: CEF setup + build pipeline. Weeks 5–8: features. Weeks 9–12: packaging + signing. | Low |

### Time-to-MVP with Existing React Frontend

If you already have a React + Tailwind + shadcn/ui frontend:

| Framework | Frontend Reuse | Time Saved | Adjusted MVP |
|-----------|:--------------:|:----------:|:------------:|
| **Tauri** | ✅ 100% reuse | 2–3 weeks | **2–5 weeks** |
| **Electron** | ✅ 100% reuse | 1–2 weeks | **1–2 weeks** |
| **Wails** | ✅ 100% reuse | 1–2 weeks | **2–3 weeks** |
| **Flutter** | ❌ Full rewrite | 0 | 4–6 weeks |
| **Go + CEF** | ✅ 100% reuse | 1–2 weeks | **6–10 weeks** |
| **Fyne** | ❌ Full rewrite | 0 | 3–5 weeks |

---

## 4. AI-Assisted Development Factor

How well does each framework work with AI code generation (GitHub Copilot, ChatGPT, Claude, etc.)?

| Framework | AI Code Quality | Training Data | AI Productivity Boost | Notes |
|-----------|:---------------:|:-------------:|:---------------------:|-------|
| **Electron** | ★★★★★ | Massive (JS/Node) | Very high | AI generates excellent Electron code due to vast training data |
| **Flutter** | ★★★★☆ | Large (Dart) | High | Good Dart/Flutter generation, but less than JS |
| **Tauri** | ★★★☆☆ | Moderate (Rust) | Moderate | AI can struggle with Rust ownership, lifetimes, async patterns |
| **Wails** | ★★★☆☆ | Moderate (Go) | Moderate | Go is simple enough that AI generates decent code |
| **Fyne** | ★★☆☆☆ | Small | Low | Niche framework — AI often generates incorrect Fyne code |
| **Go + CEF** | ★☆☆☆☆ | Very small | Very low | Almost no training data — AI cannot help much |

### Mitigating AI Limitations with Tauri/Rust

| Strategy | Impact |
|----------|--------|
| Provide exact function signatures and types in specs | AI can generate correct implementations |
| Use well-documented crates (tokio, serde, rodio) | AI has training data for popular crates |
| Keep Rust modules small and focused | Reduces ownership/lifetime complexity |
| Write comprehensive IPC command docs | AI generates correct frontend ↔ backend bindings |
| Include example code in specs | AI learns project patterns from examples |

---

## 5. Debugging Experience

| Framework | Frontend Debug | Backend Debug | Integrated Debug | Overall |
|-----------|:--------------:|:-------------:|:----------------:|:-------:|
| **Electron** | Chrome DevTools | Chrome DevTools (Node) | ✅ Same tooling | ★★★★★ |
| **Tauri** | Chrome DevTools (WebView) | LLDB / rust-analyzer | ⚠️ Split tooling | ★★★☆☆ |
| **Wails** | Chrome DevTools (WebView) | Delve (Go debugger) | ⚠️ Split tooling | ★★★☆☆ |
| **Flutter** | Flutter DevTools | Flutter DevTools | ✅ Same tooling | ★★★★☆ |
| **Fyne** | None (custom UI) | Delve | ⚠️ Limited | ★★☆☆☆ |
| **Go + CEF** | Chrome DevTools | Delve | ⚠️ Complex | ★★☆☆☆ |

---

## 6. Team Scaling Considerations

| Factor | Tauri | Electron | Wails | Flutter |
|--------|:-----:|:--------:|:-----:|:-------:|
| Hiring pool (developers available) | Small (Rust) | Very large (JS) | Medium (Go) | Large (Dart/Flutter) |
| Onboarding time for new devs | 4–8 weeks | 1–2 weeks | 2–3 weeks | 3–5 weeks |
| Code review complexity | High (Rust ownership) | Low (JS) | Low (Go) | Medium (Dart) |
| Frontend/backend skill split | Yes (TS + Rust) | No (all JS) | Yes (TS + Go) | No (all Dart) |
| Contribution barrier | High | Low | Medium | Medium |

---

## 7. Long-Term Velocity

After the initial learning curve, how does velocity change over time?

| Timeframe | Tauri | Electron | Wails | Flutter |
|-----------|:-----:|:--------:|:-----:|:-------:|
| Month 1 | ★★☆☆☆ (learning Rust) | ★★★★★ | ★★★★☆ | ★★★☆☆ (learning Dart) |
| Month 3 | ★★★★☆ (Rust fluency growing) | ★★★★★ | ★★★★☆ | ★★★★☆ |
| Month 6 | ★★★★★ (compiler catches bugs) | ★★★★☆ (runtime bugs pile up) | ★★★★☆ | ★★★★★ |
| Month 12+ | ★★★★★ (fewer bugs, safer refactors) | ★★★☆☆ (tech debt grows) | ★★★★☆ | ★★★★★ |

**Key insight:** Tauri (Rust) has a **front-loaded cost** — slow at first, but Rust's compiler catches entire categories of bugs that would become runtime issues in JS/Go. Over 6+ months, Tauri projects typically have fewer production bugs and safer refactoring.

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Framework Comparison | `./01-framework-comparison.md` |
| Recommendation | `./03-recommendation.md` |
| Velocity Diagram | `../diagrams/03-development-velocity.mmd` |
