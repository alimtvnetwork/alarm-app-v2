# Memory: constraints/coding-guidelines-summary

**Updated:** 2026-04-08  
**Version:** 1.0.0  
**Status:** Active

---

## Overview

Condensed summary of the entire coding guidelines tree at `spec/02-coding-guidelines/03-coding-guidelines-spec/`. This project has 10 guideline categories with ~100+ spec files.

---

## Category Inventory

| #   | Category             | Files | Key Topics                                                                                                                                                              |
| --- | -------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | Cross-Language       | ~35   | Boolean principles, code style, DRY, naming, typing, complexity, casting, regex, mutation, null safety, nesting, SOLID, slugs, magic values, variable naming            |
| 02  | TypeScript           | ~13   | Enums (6 enum specs), type safety remediation, promise/await, discriminated unions, ESLint enforcement                                                                  |
| 03  | Golang               | ~13   | Enum specification (sub-module), boolean standards, HTTP method enum, defer rules, string/slice internals, severity taxonomy, standards reference (sub-module, 6 files) |
| 04  | PHP                  | ~13   | Enums, forbidden patterns, naming, spacing/imports, response array standard, ResponseKeyType, PHP-Go consistency audit, standards reference (sub-module, 5 files)       |
| 05  | Rust                 | ~8    | Naming, error handling, async patterns, memory safety, testing, FFI/platform                                                                                            |
| 06  | AI Optimization      | ~7    | Anti-hallucination rules (40 rules), AI quick-reference checklist, common AI mistakes (20 examples), condensed master guidelines, enum naming quick reference           |
| 07  | C#                   | ~6    | Naming, method design, error handling, type safety                                                                                                                      |
| 08  | File/Folder Naming   | ~6    | Per-language file naming (PHP/WP, Go, TS/JS, Rust, C#)                                                                                                                  |
| 09  | Security             | ~3    | Axios version control, dependency pinning                                                                                                                               |
| 10  | Database Conventions | ~8    | Naming (PascalCase), schema design, ORM/views, testing, REST API format, split DB pattern                                                                               |

## Additional Root Files

- `consolidated-review-guide.md` — Full code review guide with examples
- `consolidated-review-guide-condensed.md` — One-liner bullet-point checklist (~210 lines)

## Key Cross-Language Rules (Universal)

1. **Naming:** PascalCase for classes/enums/DB/JSON, camelCase for vars/methods, `Id` not `ID`
2. **Booleans:** `is`/`has` prefix mandatory, no negatives, no `!fn()`, no bool params
3. **Code style:** Zero nested `if`, 15-line function max, max 3 params, blank before return
4. **Errors:** Never swallow, Go uses `apperror.Result[T]`, PHP uses `Throwable`
5. **Types:** No `any`/`interface{}`/`unknown`, single return value (Go), generics over untyped
6. **Enums:** PascalCase + `Type` suffix, `Invalid` zero value (Go), never magic strings
7. **Caching:** Never cache errors as success, always TTL, invalidate on mutation
8. **Async:** Independent calls must be parallel (`Promise.all`, `errgroup`)

## Cross-References

| Reference        | Location                                                                                |
| ---------------- | --------------------------------------------------------------------------------------- |
| Guidelines Root  | `spec/02-coding-guidelines/03-coding-guidelines-spec/00-overview.md`                    |
| AI Optimization  | `spec/02-coding-guidelines/03-coding-guidelines-spec/06-ai-optimization/00-overview.md` |
| Condensed Review | `spec/02-coding-guidelines/consolidated-review-guide-condensed.md`                      |
