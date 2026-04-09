# UX/UI Issues

**Version:** 1.1.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** Low  
**Source:** AI Feasibility Analysis v1.0.0

---

## Keywords

`ux`, `ui`, `timezone`, `dst`, `challenge`, `edge-case`

---

## Issue Registry

### UX-DST-001 — DST transition alarm handling undefined

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 40% → 0% |
| **Status** | ✅ Resolved |

**Description:** Alarm set for 2:30 AM during spring-forward doesn't exist (clocks jump from 2:00 to 3:00). Spec doesn't specify behavior — skip? fire at 3:00? fire at 1:30?

**Root Cause:** Missing edge case specification.

**Resolution:** Added full DST handling rules to `01-fundamentals/01-data-model.md` (v1.3.0) and Rust pseudocode with `resolve_local_to_utc()` function to `02-features/03-alarm-firing.md` (v1.4.0). Spring-forward fires at next valid minute, fall-back fires on first occurrence only. Includes 5 test cases.

---

### UX-TZ-001 — Timezone change invalidates nextFireTime

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 30% → 0% |
| **Status** | ✅ Resolved |

**Description:** If user travels and timezone changes, ISO 8601 `nextFireTime` stored as absolute UTC may fire at the wrong local time.

**Root Cause:** `nextFireTime` stored as absolute time vs local time ambiguity.

**Resolution:** Added `on_timezone_change()` function to `02-features/03-alarm-firing.md` (v1.4.0) that recalculates all `nextFireTime` values when system timezone changes. Timezone stored in `settings` table as IANA string. Alarms always fire at configured local time.

---

### UX-CHALLENGE-001 — Math challenge difficulty not calibrated

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 60% → 0% |
| **Status** | ✅ Resolved |

**Description:** "Hard" = "147 ÷ 3" — this is trivial for some users, impossible for others at 6 AM. No adaptive difficulty.

**Root Cause:** Subjective difficulty levels.

**Resolution:** Added calibrated difficulty tiers to `02-features/06-dismissal-challenges.md` v1.2.0:

- **Easy:** Addition/subtraction, operands 1–20 (e.g., `12 + 7`). Target solve: <5s.
- **Medium:** Multiplication, one operand 2–12, other 10–50 (e.g., `23 × 4`). Target solve: <10s.
- **Hard:** Two-step problems (e.g., `(15 × 3) + 12`). Target solve: <20s.
- **Custom (P2):** User sets operand ranges and operation types.
- Solve time logged in `alarm_events.metadata` JSON for future adaptive calibration (P3).
- All tiers use integer-only answers (no decimals). Division problems are pre-validated to have integer results.

---

*UX/UI issues — updated: 2026-04-09*
