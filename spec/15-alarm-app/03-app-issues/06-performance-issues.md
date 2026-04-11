# Performance Issues

**Version:** 1.0.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None  
**Source:** AI Feasibility Analysis v1.0.0

---

## Keywords

`performance`, `startup`, `memory`, `webview`, `budget`

---

## Issue Registry

### PERF-STARTUP-001 — 2-second startup budget may be exceeded

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 45% → 0% |
| **Status** | ✅ Resolved |

**Description:** SQLite init + migration check + alarm scan + audio init + tray setup + WebView init. On HDD systems this chain may exceed the 2s NFR target.

**Root Cause:** Sequential initialization assumed.

**Resolution:** Already resolved by `01-fundamentals/07-startup-sequence.md` v1.0.0 which parallelizes startup via `tokio::join!` (tray + logging + WebView run concurrently), lazy audio init (only on first alarm fire), and total budget of <750ms — well under the 2s NFR.

---

### PERF-MEMORY-001 — 150MB idle memory budget tight with WebView

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 55% → 0% |
| **Status** | ✅ Resolved |

**Description:** WebView2 alone uses ~80–120MB on Windows. Adding Rust runtime + SQLite may exceed the 150MB idle budget.

**Root Cause:** WebView overhead is outside app control.

**Resolution:** Revised NFR to 200MB idle target in `01-fundamentals/04-platform-constraints.md` v1.3.0 under "Memory Budget" section. Added component memory breakdown, `React.lazy()` route splitting, audio sink disposal, paginated history, and WebView hide-on-minimize strategy.

---

*Performance issues — created: 2026-04-08*
