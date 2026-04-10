# Fundamentals

**Version:** 1.4.0  
**Status:** Active  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`architecture`, `data-model`, `design`, `platform`, `file-structure`, `tauri`, `native`, `startup`, `devops`

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

Core architectural decisions, data model definitions, design system tokens, file structure, platform strategy, startup sequence, DevOps setup, and cross-platform constraints for the Alarm App (Tauri 2.x native application).

---

## Document Inventory

| # | File | Description |
|---|------|-------------|
| 01 | `01-data-model.md` | Alarm and AlarmGroup interfaces, SQLite schema, validation rules, migration strategy, Rust data mapping |
| 02 | `02-design-system.md` | Color palette, typography, spacing, component styling |
| 03 | `03-file-structure.md` | Source file organization, Tauri capabilities manifest, Cargo.toml dependencies, i18n enforcement |
| 04 | `04-platform-constraints.md` | Cross-platform native constraints, mitigations, error handling strategy, WebView CSS, memory budget |
| 05 | `05-platform-strategy.md` | ⚠️ SUPERSEDED — Legacy platform strategy (superseded by `../../../10-research/01-platform-research/`) |
| 06 | `06-tauri-architecture-and-framework-comparison.md` | Tauri 2.x architecture — Rust backend, IPC commands, plugin system, build pipeline, framework comparison |
| 07 | `07-startup-sequence.md` | App initialization order — DB, migrations, tray, engine, missed alarm check |
| 08 | `08-devops-setup-guide.md` | Code signing (macOS/Windows), CI/CD pipeline, auto-update key management |
| 09 | `09-test-strategy.md` | Test layers (Rust unit/integration, frontend, E2E), coverage targets, CI integration |
| 10 | `10-dependency-lock.md` | Exact version pins for all Rust crates and npm packages, API surface, breaking change notes |
| 11 | `11-platform-verification-matrix.md` | Feature × Platform × Behavior × Test Method × Fallback for all runtime-dependent features |

---

## Cross-References

_See parent folder's `00-overview.md` for broader context._
