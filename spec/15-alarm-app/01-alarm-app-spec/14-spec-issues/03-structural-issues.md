# Structural Issues

**Version:** 1.0.0  
**Updated:** 2026-04-09

---

## Summary

Folder structure, file naming, and metadata header violations per `spec/01-spec-authoring-guide/`.

---

## SI-001: `reference/` Folder Missing Numeric Prefix

**Severity:** 🟡 Medium  
**Location:** `spec/15-alarm-app/01-alarm-app-spec/reference/`  
**Rule Violated:** `01-spec-authoring-guide/01-folder-structure.md` — all folders need `{NN}-` prefix  
**Status:** 🔴 Open

**Current:** `reference/`  
**Required:** e.g. `15-reference/` or appropriate number

---

## SI-002: Reference Files Missing Version/Updated Headers

**Severity:** 🟡 Medium  
**Location:** `reference/alarm-app-features.md`, `reference/alarm-clock-features.md`  
**Rule Violated:** `02-naming-conventions.md` — every `.md` must have Version + Updated  
**Status:** 🔴 Open

---

## SI-003: `10-ai-handoff-readiness-report.md` Missing Updated Header

**Severity:** 🟢 Low  
**Status:** 🔴 Open

---

## SI-004: Files 09–13 Sit at Module Root Without Subfolder

**Severity:** 🟡 Medium  
**Status:** 🔴 Open

**Current layout:**
```
01-alarm-app-spec/
  01-fundamentals/
  02-features/
  03-app-issues/
  09-ai-handoff-reliability-report.md   ← root-level
  10-ai-handoff-readiness-report.md     ← root-level
  11-atomic-task-breakdown.md           ← root-level
  12-platform-and-concurrency-guide.md  ← root-level
  13-ai-cheat-sheet.md                  ← root-level
```

**Observation:** These could be grouped into `04-ai-handoff/` or similar. However, the spec authoring guide allows flat files at module root. **Decision needed.**

---

## SI-005: `reference/` Folder Missing `00-overview.md`

**Severity:** 🟡 Medium  
**Rule Violated:** Every folder needs `00-overview.md`  
**Status:** 🔴 Open

---

## Issues Found So Far: 5
## Open: 5 | Resolved: 0
