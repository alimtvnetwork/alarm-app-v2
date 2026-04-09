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
| **Likelihood** | 45% |
| **Status** | Open |

**Description:** SQLite init + migration check + alarm scan + audio init + tray setup + WebView init. On HDD systems this chain may exceed the 2s NFR target.

**Root Cause:** Sequential initialization assumed.

**Suggested Fix:** Parallelize startup: WebView init + SQLite init run concurrently. Audio init is lazy (only when first alarm fires). Tray setup can happen after window shows. Use `tokio::join!` for concurrent init.

---

### PERF-MEMORY-001 — 150MB idle memory budget tight with WebView

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 55% |
| **Status** | Open |

**Description:** WebView2 alone uses ~80–120MB on Windows. Adding Rust runtime + SQLite may exceed the 150MB idle budget.

**Root Cause:** WebView overhead is outside app control.

**Suggested Fix:** Revise NFR to 200MB idle target. Minimize React bundle size. Use `React.lazy()` for settings/history views. Consider hiding (not destroying) WebView when minimized to tray.

---

*Performance issues — created: 2026-04-08*
