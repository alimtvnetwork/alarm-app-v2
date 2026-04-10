# Memory: index.md
Updated: 4m ago

# Project Memory

## Core
Spec-only repository — project renamed to "Spec". Malaysia timezone (UTC+8).
File naming: {NN}-{kebab-case}.md for specs, kebab-case for memories.
Never touch .release folder. Code changes must bump at least minor version.
Consolidated files preferred over per-item for memory/suggestions/plans.
Specs must be self-contained for AI handoff. No boilerplate endings.
Validate code against linter-scripts/ rules (21 CODE RED + 5 STYLE). Max 15 lines/function, no nested if, no magic strings/numbers.
Before fixing any identifier: grep ALL occurrences across entire spec tree. Fix ALL, not just one file.

## Memories
- [Coding Guidelines Summary](mem://design/coding-guidelines-summary) — 10 categories, ~100+ files, key universal rules (naming, booleans, errors, types, enums, caching, async)
- [AI Coding Guidelines Plan](mem://feature/ai-coding-guidelines-plan) — 5-phase plan: audit → gap analysis → design → implementation → quality
- [Spec Authoring Conventions](mem://preference/spec-authoring-conventions) — Folder rules, overview requirements, memory folder conventions, templates
- [Alarm App Spec](mem://feature/alarm-app-spec) — 14 feature specs, warm minimal design, P0-P3 priority matrix, localStorage-based
- [Linter & Validation Rules](mem://feature/linter-validation-rules) — All 21 CODE RED + 5 STYLE rules, thresholds, skip patterns, linter configs, known gaps
- [Alarm App Spec Issues Audit](mem://feature/alarm-app-spec-issues) — 77 issues (40 open, 37 resolved) across 8 categories. 6 discovery phases done, Fix Phases 1-8 done.
- [Spec Guideline Compliance Rules](mem://preference/spec-guideline-compliance-rules) — Complete set of rules from top-8 spec folders: file naming, metadata, PascalCase keys, DB naming, Rust serde, boolean prefixes, magic values, variable naming
- [Spec Fix Root Cause Analysis](mem://preference/spec-fix-root-cause-analysis) — Why snake_case regressions keep recurring: scattered duplication, prose not treated as code, no cross-file grep before fixes
