# Implementation Handoff Guide

**Version:** 1.0.0  
**Updated:** 2026-04-11  
**Purpose:** Self-contained guide for AI agents implementing this spec in Cursor, Windsurf, or VS Code  
**Spec Version:** v3.0.0 RC  
**AI Success Rate:** 95–97% full-stack, 98%+ backend

---

## Keywords

`handoff`, `implementation`, `cursor`, `windsurf`, `vscode`, `ai-agent`, `execution`

---

## Quick Start

### Step 1: Copy the entire `spec/15-alarm-app/` folder into your project

The spec is **63+ files** and fully self-contained. Place it at the root of your new Tauri project (e.g., `alarm-app/spec/`).

### Step 2: Read these files FIRST (in this order)

| Order | File | Why |
|:-----:|------|-----|
| 1 | `13-ai-cheat-sheet.md` | One-page reference — tech stack, critical patterns, error rules, startup sequence |
| 2 | `01-fundamentals/01-data-model.md` | ALL data types, SQLite schema (7 tables), Rust structs, TypeScript interfaces, 13 domain enums |
| 3 | `01-fundamentals/03-file-structure.md` | Exact file/folder layout, `Cargo.toml` dependencies (pinned), npm packages (pinned) |
| 4 | `11-atomic-task-breakdown.md` | 62 tasks in dependency order across 12 phases — this IS the implementation plan |
| 5 | `01-fundamentals/06-tauri-architecture-and-framework-comparison.md` | Tauri 2.x architecture, IPC command registry (40+ commands), plugin versions |

### Step 3: Execute tasks from `11-atomic-task-breakdown.md`

Follow tasks **strictly in order**. Each task references the exact spec file containing the implementation details.

---

## Reading Order by Phase

When you reach each implementation phase, read the corresponding spec files:

### Phase 1–2: Scaffolding + Data Layer
- `01-fundamentals/03-file-structure.md` — project structure, Cargo.toml, npm deps
- `01-fundamentals/01-data-model.md` — schema, structs, enums, validation rules
- `01-fundamentals/04-platform-constraints.md` — error enums, `safeInvoke()`, memory budget

### Phase 3: Scheduling Engine (⚠️ HIGHEST RISK)
- `02-features/03-alarm-firing.md` — DST resolution, `compute_next_fire_time()`, wake listeners, alarm queue
- **CRITICAL:** Copy the `resolve_local_to_utc()` and `compute_next_fire_time()` Rust code character-for-character. Do NOT improvise.

### Phase 4: Snooze
- `02-features/04-snooze-system.md` — snooze timer, crash recovery, max snooze limits

### Phase 5: Audio
- `02-features/05-sound-and-vibration.md` — `rodio` playback, volume ramp (quadratic t²), custom sound validation, macOS audio session

### Phase 6: Wake Detection (⚠️ HIGH RISK)
- `02-features/03-alarm-firing.md` → WakeListener sections — copy the `objc2`, `windows`, and `zbus` FFI code
- `12-platform-and-concurrency-guide.md` — race conditions, platform gotchas

### Phase 7: Startup
- `01-fundamentals/07-startup-sequence.md` — 9-step boot sequence with timing budget
- `01-fundamentals/12-logging-and-telemetry.md` — structured JSON logging, rotation, retention

### Phase 8–9: Frontend
- `02-features/01-alarm-crud.md` — CRUD, undo stack, drag-and-drop, ARIA
- `02-features/08-clock-display.md` — analog SVG + digital clock
- `02-features/09-theme-system.md` — light/dark/system theme
- `02-features/17-ui-layouts.md` — component trees, responsive layouts
- `01-fundamentals/02-design-system.md` — color palette, typography, spacing

### Phase 10: System Integration
- `02-features/10-export-import.md` — JSON/CSV/iCal export, import with merge/replace
- `02-features/15-keyboard-shortcuts.md` — global + in-app shortcuts

### Phase 11–12: Testing + CI/CD
- `01-fundamentals/09-test-strategy.md` — 6 test layers, coverage targets
- `01-fundamentals/08-devops-setup-guide.md` — CI/CD, code signing, auto-update

---

## Critical Rules (Do NOT Violate)

1. **Engine loop NEVER crashes** — wrap every tick in `match`, log errors, continue
2. **Copy DST code verbatim** — `resolve_local_to_utc()` is the #1 risk area
3. **Zero magic strings** — use the 13 domain enums for ALL type comparisons
4. **PascalCase for SQLite** — all table names, column names, and IPC payload keys
5. **snake_case for Rust** — internal code only, `#[serde(rename_all = "PascalCase")]` on all IPC structs
6. **camelCase for TypeScript** — internal variables/functions only, interfaces use PascalCase keys to match IPC
7. **`safeInvoke()` for ALL IPC** — never raw `invoke()`, always 5s timeout + error toast
8. **Missing sound → `classic-beep`** — an alarm must NEVER be silent
9. **Boolean naming** — `is_enabled`, `is_vibration_on`, `is_favorite` (positive framing, `is_`/`has_` prefix)
10. **Dependencies pinned** — use exact versions from `01-fundamentals/10-dependency-lock.md`

---

## Design Direction

| Property | Value |
|----------|-------|
| Light palette | `#faf8f5` cream, `#f0ebe3` linen, `#c9b99a` tan, `#8b7355` brown |
| Dark palette | `#2a2420` charcoal, `#3d3530` warm gray, `#8b7355` muted tan, `#f0ebe3` cream text |
| Heading font | Outfit |
| Body font | Figtree |
| Border radius | 0.75rem (12px) |
| Style | Soft rounded corners, warm box-shadows, generous whitespace, cozy minimal |

---

## Acceptance Criteria

The spec includes **229 acceptance criteria** (157 feature + 72 fundamental) in two consolidated files:
- `02-features/97-acceptance-criteria.md`
- `01-fundamentals/97-acceptance-criteria.md`

Every implemented feature must pass its acceptance criteria before moving to the next phase.

---

## What the AI Agent Should NOT Do

1. **Do NOT skip phases** — dependencies between tasks are real
2. **Do NOT improvise DST/timezone handling** — copy from spec
3. **Do NOT use `localStorage`** — all persistence is SQLite via Tauri IPC
4. **Do NOT use raw string comparisons** — use domain enums
5. **Do NOT add dependencies** not in `10-dependency-lock.md` without justification
6. **Do NOT implement P3 features first** — follow priority order (P0 → P1 → P2 → P3)
7. **Do NOT skip `capabilities/default.json`** — without it, ALL IPC calls fail silently

---

## Human-Only Tasks (Cannot Be Done by AI)

| Task | Reference |
|------|-----------|
| Apple Developer enrollment ($99/year) | `08-devops-setup-guide.md` |
| macOS code signing certificate creation | `08-devops-setup-guide.md` |
| Windows EV code signing certificate purchase | `08-devops-setup-guide.md` |
| GitHub Actions secrets setup | `08-devops-setup-guide.md` |
| Tauri updater keypair generation | `08-devops-setup-guide.md` |

---

## File Inventory (63+ files)

| Folder | Count | Contents |
|--------|:-----:|---------|
| `01-fundamentals/` | 14 | Architecture, data model, design, file structure, platform, startup, testing, logging |
| `02-features/` | 20 | 17 feature specs + acceptance criteria + consistency report |
| `03-app-issues/` | 5 | Historical issue tracking (all resolved) |
| `14-spec-issues/` | 11+ | Gap analysis phases 6–11 (all resolved) |
| Root | 13 | Overview, changelog, readiness report, cheat sheet, task breakdown, guides |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| AI Cheat Sheet | `13-ai-cheat-sheet.md` |
| Atomic Task Breakdown | `11-atomic-task-breakdown.md` |
| AI Handoff Readiness Report | `10-ai-handoff-readiness-report.md` |
| Platform & Concurrency Guide | `12-platform-and-concurrency-guide.md` |
| Changelog | `98-changelog.md` |

---

*Implementation Handoff Guide v1.0.0 — created: 2026-04-11*
