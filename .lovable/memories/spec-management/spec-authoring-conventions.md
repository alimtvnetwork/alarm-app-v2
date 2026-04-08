# Memory: spec-management/spec-authoring-conventions

**Updated:** 2026-04-08  
**Version:** 1.0.0  
**Status:** Active

---

## Overview

Key conventions extracted from `spec/01-spec-authoring-guide/` for quick reference.

---

## Folder Rules

- Every module folder needs `00-overview.md` and `99-consistency-report.md`
- Files: `{NN}-{kebab-case}.md` with two-digit zero-padded prefix
- Folders: `{NN}-{kebab-case}/` — same convention
- Reserved prefixes: 00 (overview), 96 (AI context), 97 (acceptance criteria), 98 (changelog), 99 (consistency report)
- Max depth: 3 levels
- Root folders 01–07 are fixed and mandatory

## Overview File Requirements

Every `00-overview.md` must include:
1. Title (H1), Version, Updated, AI Confidence, Ambiguity
2. Keywords section
3. Scoring table (5 criteria)
4. Numbered file inventory table
5. Cross-references table

## Memory Folder Rules

- Single canonical location: `.lovable/memories/`
- Folders use kebab-case WITHOUT numeric prefixes
- Files use kebab-case, numeric prefixes optional
- Max 2 levels deep: `memories/{category}/{file}.md`
- Always update `00-memory-index.md` when adding/removing files

## Templates

- CLI modules: 3-folder pattern (`01-backend/`, `02-frontend/`, `03-deploy/`)
- App/WP modules: `01-fundamentals.md`, `02-features/`, `03-issues/`
- Non-CLI: flat or multi-category

## Cross-References

| Reference | Location |
|-----------|----------|
| Spec Authoring Guide | `spec/01-spec-authoring-guide/00-overview.md` |
| Folder Structure | `spec/01-spec-authoring-guide/01-folder-structure.md` |
| Naming Conventions | `spec/01-spec-authoring-guide/02-naming-conventions.md` |
| Memory Guide | `spec/01-spec-authoring-guide/07-memory-folder-guide.md` |
