# Content Gaps

**Version:** 1.0.0  
**Updated:** 2026-04-09

---

## Summary

Missing content, incomplete specifications, and undefined patterns that will cause AI to guess or improvise.

---

## CG-001: No Frontend State Management Pattern Defined

**Severity:** 🟡 Medium  
**Status:** 🔴 Open

**Problem:** The spec defines React + TypeScript frontend but never specifies whether to use Zustand, Redux, Context API, or React Query. AI will pick arbitrarily.

**Affected files:** `06-tauri-architecture-and-framework-comparison.md`, all feature specs

---

## CG-002: DST Logic Hardcoded to US Spring-Forward (3:00 AM)

**Severity:** 🔴 Critical  
**Location:** `02-features/03-alarm-firing.md`  
**Status:** 🔴 Open

**Problem:** DST fallback is hardcoded to 3:00 AM — only correct for US. EU spring-forward is 1:00→2:00 AM, some regions have 0:00→1:00 AM. Malaysia (UTC+8) has no DST at all.

---

## CG-003: Error Enum Incomplete

**Severity:** 🟡 Medium  
**Location:** `01-fundamentals/04-platform-constraints.md`  
**Status:** 🔴 Open

**Missing variants referenced elsewhere:**
- `SymlinkRejected` — referenced in security issues
- `ConcurrentModification` — referenced in concurrency guide

---

## CG-004: No Serde Serialization Attributes Specified

**Severity:** 🔴 Critical  
**Location:** `01-fundamentals/01-data-model.md`  
**Status:** 🔴 Open

**Problem:** Rust structs need `#[serde(rename_all = "PascalCase")]` to match the coding guideline, but no serde attributes are shown anywhere in the spec. AI will use default snake_case serialization.

---

## Issues Found So Far: 4
## Open: 4 | Resolved: 0
