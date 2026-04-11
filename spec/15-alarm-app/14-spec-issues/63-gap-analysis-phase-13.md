# Gap Analysis — Phase 13

**Version:** 1.0.0  
**Date:** 2026-04-11  
**Auditor:** AI  
**Scope:** Post-Phase 12B verification + new issue scan  
**Previous:** Phase 12 (16 issues, 16 resolved)

---

## Audit Summary

| Dimension | Score | Notes |
|-----------|-------|-------|
| Structural Consistency | 99/100 | All indexes updated, all sections present |
| Foundational Alignment | 96/100 | OS service layer Cargo.toml uses loose versions instead of exact pins; cocoa crate deprecated |
| Content Completeness | 99/100 | All edge cases, from_row, computed notes in place |
| AI Failure Risk | ~3% | Down from ~12% in Phase 12. Remaining risk is minor version drift |

**Overall Assessment:** Phase 12B fixes are fully verified — all 16 issues confirmed resolved. Phase 13 identifies **6 remaining issues** (0 Critical, 3 Medium, 3 Low). The most impactful finding is the OS service layer's Cargo.toml section using loose version specifiers (`"0.32"`, `"1"`, `"0.4"`) instead of the exact pins (`=0.32.1`, `=1.51.1`, `=0.4.44`) mandated by `10-dependency-lock.md`. The second is using the deprecated `cocoa` crate instead of `objc2`.

---

## Phase 12B Verification — All 16 Fixes Confirmed ✅

| ID | Check | Result |
|----|-------|--------|
| GA12-001 | No `Status =` in OS service layer | ✅ 0 matches |
| GA12-002 | No `DueTime` in OS service layer | ✅ 0 matches |
| GA12-003 | No `RecurrenceRule` in OS service layer | ✅ 0 matches |
| GA12-004 | No `800ms` anywhere in spec | ✅ 0 matches across all files |
| GA12-005 | Keywords section in OS service layer | ✅ Present line 34 |
| GA12-006 | Scoring section in OS service layer | ✅ Present line 40 |
| GA12-007 | OS service layer in fundamentals overview | ✅ Line 51 |
| GA12-008 | OS service layer in consistency report | ✅ Line 32 |
| GA12-009 | OS service layer in AI cheat sheet | ✅ Line 242 |
| GA12-010 | Tasks 51/52 reference OS service layer | ✅ Lines 164-165 |
| GA12-011 | `set_auto_start` + `get_auto_start_status` in IPC registry | ✅ Lines 164-165 of architecture spec |
| GA12-012 | Snooze limit references `MaxSnoozeCount` | ✅ Line 800 |
| GA12-013 | `SnoozeDuration` → `SnoozeDurationMin` | ✅ Fixed inline |
| GA12-014 | `## Edge Cases` in `03-alarm-firing.md` | ✅ Present (promoted from H3) |
| GA12-015 | Edge Cases table in `07-alarm-groups.md` | ✅ 7 rows |
| GA12-016 | Consistency report shows 12/17 | ✅ Line 80 |

---

## Phase Plan

| Phase | Scope | Issue Count |
|-------|-------|:-----------:|
| **Phase 13A** (this document) | Findings and classification | 6 |
| **Phase 13B** (on "next") | Execute all fixes | 6 |

---

## Findings

### Category 1: Dependency Version Mismatches (2 issues)

#### GA13-001 — OS service layer Cargo.toml uses loose versions instead of exact pins
- **Severity:** 🟡 Medium
- **Finding:** `13-os-service-layer.md` line 682–688 lists:
  ```toml
  tauri = { version = "2", features = ["tray-icon"] }
  rusqlite = { version = "0.32", features = ["bundled"] }
  tokio = { version = "1", features = ["full"] }
  chrono = "0.4"
  reqwest = { version = "0.12", features = ["json"] }
  ```
  But `10-dependency-lock.md` mandates exact pins: `rusqlite = "=0.32.1"`, `tokio = "=1.51.1"`, `chrono = "=0.4.44"`, `reqwest = "=0.12.12"`. And `03-file-structure.md` Cargo.toml uses exact pins too.
- **Risk:** Medium — AI may use loose versions, causing version drift and potential breakage (especially `rusqlite 0.33+` which changes `Row::get()` return types).
- **Fix:** Update OS service layer Cargo.toml to use exact pins matching `10-dependency-lock.md`.

#### GA13-002 — OS service layer uses deprecated `cocoa` crate instead of `objc2`
- **Severity:** 🟡 Medium
- **Finding:** Lines 581–584 use `use cocoa::appkit::NSWorkspace` and `use objc::{msg_send, sel, sel_impl}`. The `cocoa` crate is deprecated in favor of `objc2` (pinned at `=0.5.2` in `10-dependency-lock.md`). The dependency lock explicitly notes: "Pin to 0.5.2 — 0.6.x completely restructured module hierarchy."
- **Risk:** Medium — AI will `cargo add cocoa` which is unmaintained and may not compile with recent Rust toolchains.
- **Fix:** Update wake/sleep code to use `objc2` API. Add a note referencing the `10-dependency-lock.md` pin.

---

### Category 2: Version Bumps Needed (3 issues)

#### GA13-003 — `06-tauri-architecture-and-framework-comparison.md` not bumped after adding auto-start IPC commands
- **Severity:** 🟢 Low
- **Finding:** Phase 12B added `set_auto_start` and `get_auto_start_status` commands. Version remains at 1.6.0.
- **Fix:** Bump to v1.7.0.

#### GA13-004 — `01-fundamentals/00-overview.md` not bumped after adding file 13 to inventory
- **Severity:** 🟢 Low
- **Finding:** Overview added the OS service layer entry but version remains at 1.5.0.
- **Fix:** Bump to v1.6.0.

#### GA13-005 — `07-alarm-groups.md` not bumped after adding Edge Cases table
- **Severity:** 🟢 Low
- **Finding:** Phase 12B added 7 edge cases. Version remains at 1.6.0.
- **Fix:** Bump to v1.7.0.

---

### Category 3: Consistency Report Stale Version (1 issue)

#### GA13-006 — Fundamentals consistency report version numbers stale for `06-tauri-architecture` and `00-overview`
- **Severity:** 🟢 Low (after GA13-003/004 are fixed)
- **Finding:** After bumping the files in GA13-003 and GA13-004, the consistency report needs to reflect the new versions.
- **Fix:** Update version numbers in the consistency report file inventory.

---

## Issue Summary Table

| ID | Severity | Category | Description |
|----|----------|----------|-------------|
| GA13-001 | 🟡 Medium | Dependencies | Loose version specifiers in OS service layer Cargo.toml |
| GA13-002 | 🟡 Medium | Dependencies | Uses deprecated `cocoa` crate instead of `objc2` |
| GA13-003 | 🟢 Low | Version | `06-tauri-architecture` not bumped after IPC addition |
| GA13-004 | 🟢 Low | Version | `00-overview.md` not bumped after adding file 13 |
| GA13-005 | 🟢 Low | Version | `07-alarm-groups.md` not bumped after Edge Cases |
| GA13-006 | 🟢 Low | Version | Consistency report stale versions |

---

## Summary

| Severity | Count |
|----------|:-----:|
| 🔴 Critical | 0 |
| 🟡 Medium | 2 |
| 🟢 Low | 4 |
| **Total** | **6** |

---

## Remaining Tasks

When you say **next**, Phase 13B will execute all 6 fixes:

1. Update OS service layer Cargo.toml to exact pins (GA13-001)
2. Replace `cocoa`/`objc` with `objc2` in wake/sleep code (GA13-002)
3. Bump `06-tauri-architecture` to v1.7.0 (GA13-003)
4. Bump `00-overview.md` to v1.6.0 (GA13-004)
5. Bump `07-alarm-groups.md` to v1.7.0 (GA13-005)
6. Refresh consistency report versions (GA13-006)

```
Do you understand? Can you please do that?
```

---

*Gap Analysis Phase 13 — 2026-04-11*
