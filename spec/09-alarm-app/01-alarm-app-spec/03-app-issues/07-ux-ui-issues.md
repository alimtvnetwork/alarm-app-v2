# UX/UI Issues

**Version:** 1.0.0  
**Updated:** 2026-04-08  
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
| **Likelihood** | 40% |
| **Status** | Open |

**Description:** Alarm set for 2:30 AM during spring-forward doesn't exist (clocks jump from 2:00 to 3:00). Spec doesn't specify behavior — skip? fire at 3:00? fire at 1:30?

**Root Cause:** Missing edge case specification.

**Suggested Fix:** Define rule: if target local time is skipped during DST, fire at the next valid minute (e.g., 2:30 → 3:00). If target time occurs twice during fall-back, fire on the first occurrence only. Document in data model spec.

---

### UX-TZ-001 — Timezone change invalidates nextFireTime

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 30% |
| **Status** | Open |

**Description:** If user travels and timezone changes, ISO 8601 `nextFireTime` stored as absolute UTC may fire at the wrong local time.

**Root Cause:** `nextFireTime` stored as absolute time vs local time ambiguity.

**Suggested Fix:** Store alarm time as **local time** (`HH:MM`) + **timezone** (`IANA string`). Calculate `nextFireTime` on each alarm check using current system timezone. Recalculate all `nextFireTime` values when system timezone changes (listen for OS timezone change event).

---

### UX-CHALLENGE-001 — Math challenge difficulty not calibrated

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 60% |
| **Status** | Open |

**Description:** "Hard" = "147 ÷ 3" — this is trivial for some users, impossible for others at 6 AM. No adaptive difficulty.

**Root Cause:** Subjective difficulty levels.

**Suggested Fix:** Keep fixed tiers for v1.0 (Easy/Medium/Hard). Add "Custom" tier in P2+ that lets users set operand ranges. Track average solve time in `alarm_events` for future adaptive calibration.

---

*UX/UI issues — created: 2026-04-08*
