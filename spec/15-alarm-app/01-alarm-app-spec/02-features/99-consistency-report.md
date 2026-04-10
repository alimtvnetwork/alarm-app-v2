# Consistency Report: Features

**Version:** 1.5.0  
**Generated:** 2026-04-09  
**Health Score:** 100/100 (A+)

---

## File Inventory

| # | File | Version | Status |
|---|------|---------|--------|
| 1 | `00-overview.md` | 1.2.0 | ✅ Present |
| 2 | `01-alarm-crud.md` | 1.6.0 | ✅ Updated (undo stack, soft-delete timer, keyboard a11y) |
| 3 | `02-alarm-scheduling.md` | 1.0.0 | ✅ Present |
| 4 | `03-alarm-firing.md` | 1.5.0 | ✅ Updated (DST, wake-events, queue, multi-monitor overlay) |
| 5 | `04-snooze-system.md` | 1.3.0 | ✅ Updated (exact-time tokio::sleep_until) |
| 6 | `05-sound-and-vibration.md` | 1.4.0 | ✅ Updated (validation, fallback, audio sessions, gradual volume) |
| 7 | `06-dismissal-challenges.md` | 1.2.0 | ✅ Updated (calibrated difficulty tiers, solve time logging) |
| 8 | `07-alarm-groups.md` | 1.2.0 | ✅ Updated (IsPreviousEnabled group toggle) |
| 9 | `08-clock-display.md` | 1.1.0 | ✅ Present |
| 10 | `09-theme-system.md` | 1.1.0 | ✅ Present |
| 11 | `10-export-import.md` | 1.3.0 | ✅ Updated (privacy warning dialog, SEC-EXPORT-001) |
| 12 | `11-sleep-wellness.md` | 1.1.0 | ✅ Present |
| 13 | `12-smart-features.md` | 1.2.0 | ✅ Updated (SSRF protection, webhook validation) |
| 14 | `13-analytics.md` | 1.2.0 | ✅ Present |
| 15 | `14-personalization.md` | 1.1.0 | ✅ Present |
| 16 | `15-keyboard-shortcuts.md` | 1.0.0 | ✅ Present |
| 17 | `16-accessibility-and-nfr.md` | 1.0.0 | ✅ Present |

---

## Checks

| Check | Status |
|-------|--------|
| `00-overview.md` present | ✅ |
| `99-consistency-report.md` present | ✅ |
| Lowercase kebab-case naming | ✅ |
| Numeric prefixes sequential (01–16) | ✅ |
| All 17 files listed in overview | ✅ |
| No stale cross-references | ✅ |
| `@dnd-kit/core` in CRUD spec ↔ FE-DND-001 | ✅ |
| `croner` crate in firing spec ↔ data model | ✅ |
| WCAG keyboard alternative ↔ FE-A11Y-001 | ✅ |
| Undo stack in CRUD ↔ FE-STATE-002 | ✅ |
| Multi-monitor overlay in firing ↔ FE-OVERLAY-001 | ✅ |
| Gradual volume algorithm in sound ↔ BE-AUDIO-001/BE-VOLUME-001 | ✅ |
| macOS audio session in sound ↔ BE-AUDIO-003 | ✅ |
| Custom sound validation in sound ↔ BE-AUDIO-002/SEC-SOUND-001/SEC-PATH-001 | ✅ |
| SSRF protection in smart features ↔ SEC-WEBHOOK-001 | ✅ |
| Export privacy warning ↔ SEC-EXPORT-001 | ✅ |
| Challenge calibration ↔ UX-CHALLENGE-001 | ✅ |
| Group toggle state ↔ FE-STATE-001 | ✅ |

---

## v1.5.0 Changes

- `01-alarm-crud.md` → v1.6.0: undo stack (max 5, independent timers, stacking toasts)
- `03-alarm-firing.md` → v1.5.0: multi-monitor overlay (current_monitor / primary), FE-OVERLAY-001
- `05-sound-and-vibration.md` → v1.4.0: validate_custom_sound(), resolve_sound_path(), platform audio sessions, gradual volume algorithm
- `06-dismissal-challenges.md` → v1.2.0: calibrated math tiers with operand rules and solve time logging
- `10-export-import.md` → v1.3.0: export privacy warning dialog

---

## Summary

- **Errors:** 0
- **Health Score:** 100/100 (A+)
