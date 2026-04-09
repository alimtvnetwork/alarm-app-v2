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
10-research/                    ← Folder number: 10
├── 00-overview.md              ← This file
├── diagrams/                   ← Legacy (kept for reference)
├── 01-platform-research/
│   ├── 00-overview.md
│   ├── 01-framework-comparison.md
│   ├── ...
│   └── diagrams/
│       ├── 01-framework-scoring.mmd
│       ├── 02-tauri-architecture.mmd
│       ├── 03-development-velocity.mmd
│       ├── 07-pwa-feasibility.mmd
│       ├── 08-framework-architecture.mmd
│       └── images/              ← Rendered PNGs
└── 02-game-development/
    ├── 00-overview.md
    ├── 01-engine-comparison.md
    ├── ...
    └── diagrams/
        ├── 04-engine-scoring.mmd
        ├── 05-game-decision-flow.mmd
        ├── 06-language-ecosystem-map.mmd
        └── images/              ← Rendered PNGs
```

---

## Diagram Convention

Each research subfolder has its own `diagrams/` folder with an `images/` subfolder. Diagrams use mind-map style with annotation nodes explaining WHY, benchmarks, trade-offs, and when to avoid. Clear over clever — self-explanatory without reading the full spec.

---

## Research Areas

| # | Area | Description |
|---|------|-------------|
| 01 | [Platform Research](./01-platform-research/00-overview.md) | Cross-platform desktop + mobile framework evaluation — Tauri, Electron, Wails, Flutter, Go+CEF, Fyne |
| 02 | [Game Development](./02-game-development/00-overview.md) | Game engines, languages, custom engines, genre/platform recommendations |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Spec Root | `../00-overview.md` |
