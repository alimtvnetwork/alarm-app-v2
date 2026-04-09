# Research

**Version:** 2.0.0  
**Status:** Active  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`research`, `analysis`, `evaluation`, `comparison`, `decision`, `framework`, `platform`, `architecture`, `velocity`

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

Research documents supporting key technology and architecture decisions. Each research area lives in its own subfolder with evaluation criteria, alternatives analysis, scoring, risk assessment, and final recommendations. Documents are written to be **generic and reusable** — applicable to any project considering similar technology choices, with project-specific context noted where relevant.

A `diagrams/` folder contains visual architecture and comparison diagrams in Mermaid format.

---

## Folder Structure

```
10-research/
├── 00-overview.md              ← This file
├── diagrams/                   ← Mermaid diagrams (.mmd)
│   ├── 01-framework-scoring.mmd
│   ├── 02-tauri-architecture.mmd
│   └── 03-development-velocity.mmd
└── 01-platform-research/       ← Cross-platform framework research
    ├── 00-overview.md
    ├── 01-framework-comparison.md
    ├── 02-development-velocity.md
    └── 03-recommendation.md
```

---

## Research Areas

| # | Area | Description |
|---|------|-------------|
| 01 | [Platform Research](./01-platform-research/00-overview.md) | Cross-platform desktop + mobile framework evaluation — Tauri, Electron, Wails, Flutter, Go+CEF, Fyne |

---

## Diagrams

| File | Description |
|------|-------------|
| [Framework Scoring](./diagrams/01-framework-scoring.mmd) | Radar chart comparing 6 frameworks across 9 criteria |
| [Tauri Architecture](./diagrams/02-tauri-architecture.mmd) | System architecture for Tauri 2.x applications |
| [Development Velocity](./diagrams/03-development-velocity.mmd) | Timeline comparison of framework development speed |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Spec Root | `../00-overview.md` |
