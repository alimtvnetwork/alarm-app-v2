
# Readiness Score: 98 → 100 — Root Cause Analysis & Atomic Task Plan

## Gap 1: Platform Runtime Testing (-1 point)

### Root Cause
The spec documents platform-specific behaviors (alarm firing, tray icons, WebView CSS, notification permissions) but has **no verification matrix** mapping each claim to a testable assertion. An AI implementing this spec must guess which behaviors need runtime guards.

### Why It Causes Failure
- AI won't know which CSS properties need `-webkit-` prefixes without a definitive list
- Alarm firing precision assumptions (±1s) are stated but not tied to specific OS APIs
- Tray icon rendering differences (macOS template icons vs Windows ICO) are mentioned in prose but not in a structured checklist

### Atomic Tasks

| # | Task | Output |
|---|------|--------|
| 1.1 | Create `01-fundamentals/10-platform-verification-matrix.md` — exhaustive table: Feature × Platform × Expected Behavior × Test Method × Fallback | New spec file |
| 1.2 | Add WebView CSS compatibility table to `04-platform-constraints.md` — property, Safari/WebView2 support, polyfill | Section addition |
| 1.3 | Add alarm timing precision spec to `03-alarm-firing.md` — OS timer API, tolerance, drift handling per platform | Section addition |
| 1.4 | Add tray icon asset requirements to `02-design-system.md` — format, size, template mode per OS | Section addition |
| 1.5 | Add notification permission flow to `03-alarm-firing.md` — macOS first-launch prompt, Windows registry, Linux D-Bus | Section addition |
| 1.6 | Update `09-test-strategy.md` — add platform-specific E2E test cases referencing the verification matrix | Section addition |

---

## Gap 2: Third-Party API Surface (-1 point)

### Root Cause
The spec references 6 Tauri plugins and 3 Rust crates by name but **doesn't pin exact versions or document the specific API surface used**. An AI will `cargo add` the latest version, which may have breaking changes.

### Why It Causes Failure
- `tauri-plugin-notification` API changed between 2.0.0-beta and 2.0.0 stable
- `tauri-plugin-autostart` had a permission model change in 2.x
- `refinery` migration macro syntax varies by version
- AI will cargo add without version pins → compilation errors → debugging spiral

### Atomic Tasks

| # | Task | Output |
|---|------|--------|
| 2.1 | Create `01-fundamentals/11-dependency-lock.md` — every crate/plugin with exact version, API methods used, and known breaking changes | New spec file |
| 2.2 | Add `[dependencies]` block to `03-file-structure.md` Cargo.toml section — pin every dependency with `=x.y.z` | Section update |
| 2.3 | Document exact Tauri plugin API signatures used in `06-tauri-architecture.md` — function name, params, return type, version | Section addition |
| 2.4 | Add npm `package.json` dependency pins to `03-file-structure.md` — every frontend dep with exact version | Section update |
| 2.5 | Create version compatibility test checklist in `09-test-strategy.md` — `cargo check` assertions for each pinned dep | Section addition |

---

## Execution Plan

| Phase | Tasks | Est. Effort | Dependency |
|-------|-------|-------------|------------|
| Phase A | 2.1, 2.2, 2.3, 2.4 | Dependency research + pinning | None — can start immediately |
| Phase B | 1.1, 1.2, 1.3, 1.4, 1.5 | Platform behavior documentation | None — parallel with Phase A |
| Phase C | 1.6, 2.5 | Test strategy updates | After A + B |

**Total: 11 atomic tasks across 3 phases → 98 → 100/100**
