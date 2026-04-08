# Folder Structure Root — AI Instruction

**Version:** 1.0.0  
**Updated:** 2026-04-07  
**Type:** AI Instruction — Structural Rule  
**Priority:** Critical — Read Before Any Spec Work

---

## Purpose

This file defines the **mandatory root folder structure** for the `spec/` directory. Any AI agent, contributor, or automation that reads, creates, reorganizes, or validates specifications **MUST** follow this structure first.

When this spec package is shared, copied, or dropped into another environment, this file is the **first structural reference** that must be read and enforced.

---

## AI Instruction

```
IMPORTANT — AI INSTRUCTION:

1. Read this file BEFORE creating, reorganizing, or validating any spec folder.
2. Verify that ALL required root folders listed below exist and are in the correct order.
3. If any required folder is missing, create it immediately with at least a 00-overview.md inside.
4. If folders are out of order or misnumbered, reorganize them to match this structure.
5. All additional folders and files MUST come AFTER the required base structure.
6. After any restructuring, update ALL cross-references that point to renamed or moved folders.
7. If ambiguity exists about folder placement, ASK before making structural assumptions.
8. Do NOT insert new folders before or between the required base folders unless this file is explicitly updated.
```

---

## Required Root Folder Structure

The following folders form the **structural anchor** of the entire spec system. They MUST always exist at the root of `spec/` in this exact order and numbering:

| # | Folder | Purpose | Mandatory |
|---|--------|---------|-----------|
| 01 | `01-spec-authoring-guide/` | How to write, structure, and maintain specifications. The meta-guide for the entire spec system. | ✅ Yes |
| 02 | `02-coding-guidelines/` | Cross-language and language-specific coding standards, style rules, and enforcement policies. | ✅ Yes |
| 03 | `03-error-manage-spec/` | Error management architecture, error codes, error handling patterns across all projects. | ✅ Yes |
| 04 | `04-split-db-architecture/` | Split database pattern — separating operational and configuration databases. | ✅ Yes |
| 05 | `05-seedable-config-architecture/` | Seedable configuration system with changelog-based versioning. | ✅ Yes |
| 06 | `06-design-system/` | Design system tokens, component standards, theming, and UI consistency rules. | ✅ Yes |
| 07 | `07-docs-viewer-ui/` | Documentation viewer UI specifications, rendering rules, and component behavior. | ✅ Yes |

---

## Rules

### Rule 1 — Required Folders Are Fixed

The seven folders above are **fixed and mandatory**. Their numbering (01–07) and naming MUST NOT change unless this file is explicitly updated and all cross-references are audited.

### Rule 2 — All Later Folders Follow After

Any additional spec folders (CLI tools, WordPress plugins, research, utilities, etc.) MUST use numbers **08 and above**. They MUST NOT be inserted before or between the required base folders.

### Rule 3 — Numbering Must Be Sequential

New folders added after the base structure should use the **next available number** after the highest existing folder. Gaps in numbering are acceptable for historical reasons but should not be introduced intentionally.

### Rule 4 — Naming Must Be Lowercase Kebab-Case

All folder names MUST follow the pattern `{NN}-{kebab-case-name}/` where:
- `NN` is a zero-padded two-digit number
- The name is all lowercase with words separated by hyphens
- No spaces, underscores, or camelCase

### Rule 5 — Every Folder Must Have `00-overview.md`

Every root folder (required or additional) MUST contain a `00-overview.md` file as its entry point. See the [Spec Authoring Guide](./01-spec-authoring-guide/00-overview.md) for the required overview format.

### Rule 6 — Cross-References Must Be Updated After Restructuring

If any folder is renamed, renumbered, or moved:
1. Grep the entire `spec/` and `.lovable/` trees for references to the old path
2. Update every reference to use the new path
3. Run the link scanner (`node scripts/generate-dashboard-data.cjs`) to verify zero broken links
4. Update `spec/00-overview.md` and any consistency reports

### Rule 7 — Root Files

The following root-level files MUST also exist alongside the required folders:

| File | Purpose |
|------|---------|
| `00-overview.md` | Master index linking every module |
| `folder-structure-root.md` | This file — structural anchor and AI instruction |
| `99-consistency-report.md` | Root-level health report |

---

## Validation Checklist

Before any spec generation, restructuring, or audit, verify:

- [ ] All seven required root folders exist
- [ ] Required folders are numbered 01–07 in the correct order
- [ ] No unauthorized folders exist before number 08
- [ ] All folders use lowercase kebab-case naming
- [ ] Every folder contains `00-overview.md`
- [ ] Root-level `00-overview.md` and `99-consistency-report.md` exist
- [ ] All cross-references resolve correctly
- [ ] No broken links reported by the dashboard scanner

---

## Example — Correct Root Structure

```
spec/
├── 00-overview.md
├── folder-structure-root.md          ← THIS FILE
├── 99-consistency-report.md
│
├── 01-spec-authoring-guide/          ← REQUIRED (1 of 7)
├── 02-coding-guidelines/             ← REQUIRED (2 of 7)
├── 03-error-manage-spec/             ← REQUIRED (3 of 7)
├── 04-split-db-architecture/         ← REQUIRED (4 of 7)
├── 05-seedable-config-architecture/  ← REQUIRED (5 of 7)
├── 06-design-system/                 ← REQUIRED (6 of 7)
├── 07-docs-viewer-ui/                ← REQUIRED (7 of 7)
│
├── 08-some-future-module/            ← Additional (starts at 08+)
├── 09-gsearch-cli/
├── 10-brun-cli/
└── ...
```

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Spec Authoring Guide | [01-spec-authoring-guide/00-overview.md](./01-spec-authoring-guide/00-overview.md) |
| Folder Structure Details | [01-spec-authoring-guide/01-folder-structure.md](./01-spec-authoring-guide/01-folder-structure.md) |
| Naming Conventions | [01-spec-authoring-guide/02-naming-conventions.md](./01-spec-authoring-guide/02-naming-conventions.md) |
| Master Index | [00-overview.md](./00-overview.md) |

---

```
IMPORTANT — AI INSTRUCTION:
- This file is the FIRST structural reference for the spec system.
- Read this file before any folder creation, reorganization, or validation.
- The seven required root folders (01–07) are mandatory and fixed.
- All additional folders start at number 08 or above.
- After restructuring, always update cross-references and run the link scanner.
- If uncertain about folder placement, ask before proceeding.
```
