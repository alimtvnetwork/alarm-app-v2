# Fundamentals

**Version:** 1.2.0  
**Status:** Active  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`architecture`, `data-model`, `design`, `platform`, `file-structure`, `tauri`, `native`, `startup`

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

Core architectural decisions, data model definitions, design system tokens, file structure, platform strategy, startup sequence, and cross-platform constraints for the Alarm App (Tauri 2.x native application).

---

## Document Inventory

| # | File | Description |
|---|------|-------------|
| 01 | `01-data-model.md` | Alarm and AlarmGroup interfaces, SQLite schema, validation rules |
| 02 | `02-design-system.md` | Color palette, typography, spacing, component styling |
| 03 | `03-file-structure.md` | Source file organization, Tauri capabilities manifest, Cargo.toml dependencies |
| 04 | `04-platform-constraints.md` | Cross-platform native constraints and mitigations |
| 05 | `05-platform-strategy.md` | Legacy platform strategy (superseded by `../../../10-research/01-platform-research/`) |
| 06 | `06-tauri-architecture-and-framework-comparison.md` | Tauri 2.x architecture — Rust backend, IPC commands, plugin system, build pipeline, framework comparison |
| 07 | `07-startup-sequence.md` | App initialization order — DB, migrations, tray, engine, missed alarm check |

---

## Cross-References

_See parent folder's `00-overview.md` for broader context._
