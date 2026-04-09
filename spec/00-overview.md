# Specification Root

**Version:** 1.0.0  
**Updated:** 2026-04-08  
**AI Confidence:** Production-Ready  
**Ambiguity:** None

---

## Purpose

Root index for the entire specification tree. Each top-level folder contains a domain-specific specification module with its own overview, acceptance criteria, and consistency report.

---

## Module Inventory

| # | Module | Description |
|---|--------|-------------|
| 01 | [Spec Authoring Guide](./01-spec-authoring-guide/00-overview.md) | Rules for writing and maintaining spec documents |
| 02 | [Coding Guidelines](./02-coding-guidelines/00-overview.md) | Cross-language coding standards (Go, TS, PHP, Rust, C#) |
| 03 | [Error Management](./03-error-manage-spec/04-error-manage-spec/00-overview.md) | Error capture, modal UI, and resolution workflows |
| 04 | [Split DB Architecture](./04-split-db-architecture/00-overview.md) | SQLite partitioning and migration patterns |
| 05 | [Seedable Config](./05-seedable-config-architecture/00-overview.md) | Configuration seeding and feature management |
| 06 | [Design System](./06-design-system/00-overview.md) | Theme variables, typography, spacing, and component patterns |
| 07 | [Docs Viewer UI](./07-docs-viewer-ui/00-overview.md) | Specification viewer React application |
| 08 | [Code Block System](./08-code-block-system/00-overview.md) | Rich code block rendering — syntax highlighting, interactions, styling |
| 09 | [Alarm App](./09-alarm-app/00-overview.md) | Warm, minimal alarm clock native app — alarms, groups, themes, sleep tools |
| 10 | [Research](./10-research/00-overview.md) | Technology evaluations, framework comparisons, decision records |

---

## Supporting Files

| File | Purpose |
|------|---------|
| [folder-structure-root.md](./folder-structure-root.md) | Mandatory root folder structure — AI instruction (read first) |
| [spec-index.md](./spec-index.md) | Auto-generated flat index of all spec files |
| [health-dashboard.md](./health-dashboard.md) | Spec tree health metrics and broken link report |
| [dashboard-data.json](./dashboard-data.json) | Machine-readable health data |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Spec Authoring Guide | `./01-spec-authoring-guide/00-overview.md` |
| Coding Guidelines | `./02-coding-guidelines/00-overview.md` |
| Error Management | `./03-error-manage-spec/00-overview.md` |
| Design System | `./06-design-system/00-overview.md` |
