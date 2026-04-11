# Structural Issues

**Version:** 1.0.0  
**Updated:** 2026-04-09

---

## Summary

Folder structure, file naming, and metadata header violations per `spec/01-spec-authoring-guide/`.

---

## SI-001: `reference/` Folder Missing Numeric Prefix

**Severity:** 🟡 Medium  
**Location:** `spec/15-alarm-app/reference/` (now `15-reference/`)  
**Rule Violated:** `01-spec-authoring-guide/01-folder-structure.md` — all folders need `{NN}-` prefix  
**Status:** ✅ Resolved — renamed `reference/` → `15-reference/` in Fix Phase 20

**Resolution:** Folder renamed with numeric prefix. `00-overview.md` created inside. Parent overview updated with correct paths.

---

## SI-002: Reference Files Missing Version/Updated Headers

**Severity:** 🟡 Medium  
**Location:** `reference/alarm-app-features.md`, `reference/alarm-clock-features.md`  
**Rule Violated:** `02-naming-conventions.md` — every `.md` must have Version + Updated  
**Status:** ✅ Resolved — added `Version: 1.0.0` and `Updated: 2026-04-10` headers to both reference files in Fix Phase 20

---

## SI-003: `10-ai-handoff-readiness-report.md` Missing Updated Header

**Severity:** 🟢 Low  
**Status:** ✅ Resolved — changed `Generated` → `Updated` header on readiness report in Fix Phase 20

---

## SI-004: Files 09–13 Sit at Module Root Without Subfolder

**Severity:** 🟡 Medium  
**Status:** ✅ Resolved — closed as "by design" in Fix Phase 20

**Resolution:** The spec authoring guide explicitly allows flat files at module root for standalone documents that don't form a cohesive sub-module. Files 09–13 are each self-contained reference documents (reliability report, readiness report, task breakdown, concurrency guide, cheat sheet) that don't need a shared overview. They are now listed in the parent `00-overview.md` module inventory with proper descriptions.

---

## SI-005: `reference/` Folder Missing `00-overview.md`

**Severity:** 🟡 Medium  
**Rule Violated:** Every folder needs `00-overview.md`  
**Status:** ✅ Resolved — `00-overview.md` created in `15-reference/` in Fix Phase 20

---

## Issues Found So Far: 5
## Open: 0 | Resolved: 5
