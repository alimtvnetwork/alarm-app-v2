# Memory Index

**Updated:** 2026-04-08  
**Version:** 1.0.0  
**Status:** Active

---

## Overview

Canonical index of all memory files for the Spec project (formerly unnamed). This file is the single source of truth for the memory tree.

---

## Core Rules

- Spec-only repository — no application code in production (React app is for docs viewer UI only)
- File naming: `{NN}-{kebab-case}.md` for specs, kebab-case for memories
- Never touch `.release` folder. Code changes must bump at least minor version.
- Malaysia timezone (UTC+8) for all timestamps.
- Specs must be self-contained for AI handoff — clear, explicit, no ambiguity.
- Consolidated files preferred over per-item files for memory/suggestions/plans.

---

## Memories

### Constraints
- [Coding Guidelines Summary](constraints/coding-guidelines-summary.md) — Condensed rules from all 10 coding guideline categories for AI code generation

### Planned
- [AI Coding Guidelines Plan](planned/ai-coding-guidelines-plan.md) — Detailed execution plan for building best-in-class AI coding guidelines

### Spec Management
- [Spec Authoring Conventions](spec-management/spec-authoring-conventions.md) — Key conventions from the Spec Authoring Guide

### Project
- [Project Status](project/project-status.md) — Current project state and rename tracking
