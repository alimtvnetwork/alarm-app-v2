# Memory: planned/ai-coding-guidelines-plan

**Updated:** 2026-04-08  
**Version:** 1.0.0  
**Status:** Active

---

## Overview

Detailed execution plan for building a best-in-class AI coding guideline that minimizes hallucination and provides all necessary details for AI to generate high-quality code. This plan covers analysis, gap identification, consolidation, and creation of new content.

---

## Current State Assessment

### Strengths
- **AI Optimization suite already exists** (06-ai-optimization) with 40 anti-hallucination rules, 20 common mistakes, condensed guidelines, and enum reference
- **Comprehensive language coverage**: Go, TypeScript, PHP, Rust, C# (5 languages + cross-language)
- **Condensed review guide** exists at root level (~210 lines)
- **Structured code examples** with ❌/✅ patterns throughout
- **Error handling is thorough** with CODE RED designations

### Gaps & Issues Identified
1. **Fragmentation**: Rules are spread across ~100+ files in 10 categories — AI must navigate deep folder trees
2. **Redundancy**: Master guidelines, condensed guidelines, review guide, and AI optimization overlap significantly
3. **Missing C# in AI optimization**: Anti-hallucination rules added C# (Category 7) but common mistakes doc doesn't cover C#
4. **Rust under-represented in AI docs**: Rust has its own category (05) but no AI optimization coverage
5. **No single "AI prompt-ready" document**: Despite condensed docs, there's no one file an AI can load to get ALL rules
6. **Security section is thin**: Only Axios version control — no broader security coding patterns
7. **Database conventions not in AI optimization**: PascalCase DB rules aren't in anti-hallucination rules
8. **File/folder naming not in AI optimization**: Per-language naming not covered in anti-hallucination

---

## Execution Plan — Atomic Tasks

### Phase 1: Deep Audit (Read & Analyze — No Changes)

| # | Task | Files to Read | Purpose |
|---|------|---------------|---------|
| 1.1 | Read all cross-language files (01) | ~35 files in `01-cross-language/` | Identify every unique rule |
| 1.2 | Read all TypeScript files (02) | ~13 files in `02-typescript/` | Catalog TS-specific rules |
| 1.3 | Read all Golang files (03) | ~13 files in `03-golang/` | Catalog Go-specific rules, enum sub-module |
| 1.4 | Read all PHP files (04) | ~13 files in `04-php/` | Catalog PHP-specific rules |
| 1.5 | Read all Rust files (05) | ~8 files in `05-rust/` | Catalog Rust-specific rules |
| 1.6 | Read all AI optimization files (06) | ~7 files in `06-ai-optimization/` | Map existing anti-hallucination coverage |
| 1.7 | Read all C# files (07) | ~6 files in `07-csharp/` | Catalog C#-specific rules |
| 1.8 | Read file/folder naming (08) | ~6 files in `08-file-folder-naming/` | Catalog naming rules per language |
| 1.9 | Read security files (09) | ~3 files in `09-security/` | Catalog security rules |
| 1.10 | Read database conventions (10) | ~8 files in `10-database-conventions/` | Catalog DB rules |
| 1.11 | Read consolidated review guides | 2 root files | Map against categories |
| 1.12 | Cross-reference audit | All `00-overview.md` + `99-consistency-report.md` | Identify broken links, stale references |

### Phase 2: Gap Analysis & Rule Catalog

| # | Task | Deliverable |
|---|------|-------------|
| 2.1 | Build master rule catalog | Spreadsheet/table of ALL unique rules with source file, category, and language scope |
| 2.2 | Identify rule overlaps | Map which rules appear in multiple files (dedup candidates) |
| 2.3 | Identify missing anti-hallucination rules | Rules in language specs not covered by `06-ai-optimization/01-anti-hallucination-rules.md` |
| 2.4 | Identify missing common mistakes | Patterns from language specs not covered by `06-ai-optimization/03-common-ai-mistakes.md` |
| 2.5 | Identify Rust/C# AI optimization gaps | Missing Rust and C# coverage in AI optimization suite |
| 2.6 | Identify database/security/naming gaps | Rules from 08/09/10 not in AI optimization |
| 2.7 | Audit consistency reports | Check all `99-consistency-report.md` files are current |

### Phase 3: Design the Best-in-Class AI Coding Guideline

| # | Task | Deliverable |
|---|------|-------------|
| 3.1 | Design document architecture | Outline of the new/improved AI coding guideline structure |
| 3.2 | Define the "AI-ready single file" format | Template for a single loadable file per AI context window |
| 3.3 | Define anti-hallucination rule expansion | New rules to add from gap analysis |
| 3.4 | Define common mistakes expansion | New mistake examples from gap analysis |
| 3.5 | Design cross-language vs per-language split | Which rules go where for optimal AI consumption |
| 3.6 | Design the AI quick-reference v2 | Updated checklist incorporating all categories |
| 3.7 | Define version bumping strategy | How to version the updated docs |

### Phase 4: Implementation (Spec Writing)

| # | Task | Deliverable |
|---|------|-------------|
| 4.1 | Update `01-anti-hallucination-rules.md` | Add missing rules (Rust, DB, file naming, security) |
| 4.2 | Update `03-common-ai-mistakes.md` | Add Rust, C#, DB, and caching mistake examples |
| 4.3 | Update `02-ai-quick-reference-checklist.md` | Expand to cover all 10 categories |
| 4.4 | Update `04-condensed-master-guidelines.md` | Add missing sections (Rust, C#, file naming, security, DB) |
| 4.5 | Create `06-rust-ai-reference.md` | Rust-specific AI optimization rules |
| 4.6 | Create `07-csharp-ai-reference.md` | C#-specific AI optimization rules |
| 4.7 | Create `08-database-ai-reference.md` | Database convention AI rules |
| 4.8 | Create `09-security-ai-reference.md` | Security coding AI rules |
| 4.9 | Update `00-overview.md` for AI optimization | Add new files to inventory |
| 4.10 | Update `97-acceptance-criteria.md` | Add criteria for new content |

### Phase 5: Consolidation & Quality

| # | Task | Deliverable |
|---|------|-------------|
| 5.1 | Update consolidated review guides | Sync root-level review guides with all changes |
| 5.2 | Fix all broken cross-references | Audit and repair all links |
| 5.3 | Update all `99-consistency-report.md` files | Refresh all consistency reports |
| 5.4 | Update `00-overview.md` at every level | Ensure file inventories are accurate |
| 5.5 | Version bump all modified files | At least minor version on all changes |
| 5.6 | Final cross-reference validation | Run link scanner, zero broken links |
| 5.7 | Update this memory file | Mark plan as complete |

---

## File Reference Issues Found During Planning

| Issue | Location | Fix Needed |
|-------|----------|------------|
| Duplicate `99-consistency-report.md` rows in overview tables | `01-cross-language/04-code-style/00-overview.md` line 47-49, `03-golang/04-golang-standards-reference/00-overview.md` lines 44-47, `04-php/07-php-standards-reference/00-overview.md` lines 43-46, `01-cross-language/15-master-coding-guidelines/00-overview.md` lines 45-47 | Remove duplicate rows from Document Inventory tables |
| Redirect files at folder level | `15-master-coding-guidelines.md` (line-level redirect to subfolder), `04-golang-standards-reference.md` (same), `07-php-standards-reference.md` (same) | These redirect files coexist with their subfolder equivalents — expected pattern but should be documented |

---

## Priority Order

1. **Phase 1** — Must complete before any changes (read everything)
2. **Phase 2** — Gap analysis drives all implementation decisions
3. **Phase 3** — Design before writing
4. **Phase 4** — Core implementation
5. **Phase 5** — Quality assurance and finalization

---

## Success Criteria

- [ ] Every coding rule in the repo is represented in the AI optimization suite
- [ ] An AI loading `04-condensed-master-guidelines.md` can generate compliant code for any supported language
- [ ] Zero broken cross-references
- [ ] All anti-hallucination rules have ❌/✅ examples
- [ ] All common AI mistakes have before/after code
- [ ] All consistency reports are current
- [ ] All overview files have accurate file inventories

---

## Cross-References

| Reference | Location |
|-----------|----------|
| AI Optimization Overview | `spec/02-coding-guidelines/03-coding-guidelines-spec/06-ai-optimization/00-overview.md` |
| Anti-Hallucination Rules | `spec/02-coding-guidelines/03-coding-guidelines-spec/06-ai-optimization/01-anti-hallucination-rules.md` |
| Common AI Mistakes | `spec/02-coding-guidelines/03-coding-guidelines-spec/06-ai-optimization/03-common-ai-mistakes.md` |
| Condensed Master Guidelines | `spec/02-coding-guidelines/03-coding-guidelines-spec/06-ai-optimization/04-condensed-master-guidelines.md` |
| Coding Guidelines Summary | `.lovable/memories/constraints/coding-guidelines-summary.md` |
