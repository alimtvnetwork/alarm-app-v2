# Features

**Version:** 1.3.0  
**Status:** Active  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`features`, `alarm`, `clock`, `sleep`, `dismissal`, `groups`, `native`, `tauri`, `rust`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| AI Confidence assigned | ✅ |
| Ambiguity assigned | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |

---

## Purpose

All feature specifications for the Alarm App (Tauri 2.x native application), organized by functional domain. Each feature spec defines behavior, acceptance criteria, and native implementation approach (Rust backend, SQLite storage, OS APIs).

---

## Document Inventory

| # | File | Priority | Description |
|---|------|----------|-------------|
| 01 | `01-alarm-crud.md` | P0 | Create, read, update, delete alarms (SQLite via Tauri IPC) |
| 02 | `02-alarm-scheduling.md` | P0 | Repeat/recurring schedules, one-time alarms |
| 03 | `03-alarm-firing.md` | P0 | Rust background thread time matching, native overlay, dismiss/snooze |
| 04 | `04-snooze-system.md` | P0 | Snooze duration, limits, SQLite state tracking |
| 05 | `05-sound-and-vibration.md` | P0/P1 | Native audio (rodio), volume ramp, platform haptics |
| 06 | `06-dismissal-challenges.md` | P1/P2 | Math, native accelerometer shake, typing, QR scan |
| 07 | `07-alarm-groups.md` | P1 | Group CRUD, master toggle, SQLite persistence |
| 08 | `08-clock-display.md` | P0 | Analog SVG + digital clock, countdown |
| 09 | `09-theme-system.md` | P0 | Dark/light/system theme (OS appearance events) |
| 10 | `10-export-import.md` | P1 | JSON/CSV/iCal export/import via native file dialog |
| 11 | `11-sleep-wellness.md` | P2 | Bedtime reminder, sleep calculator, mood logging, native audio |
| 12 | `12-smart-features.md` | P3 | System tray, location alarms, webhooks, native APIs |
| 13 | `13-analytics.md` | P2/P3 | Alarm history log (filterable, CSV export), analytics reports |
| 14 | `14-personalization.md` | P2/P3 | Themes, quotes, streak tracker, native music integration |
| 15 | `15-keyboard-shortcuts.md` | P1 | Full keyboard shortcut system (global + in-app) |
| 16 | `16-accessibility-and-nfr.md` | P0/P1 | WCAG 2.1 AA, performance budgets, i18n, offline-first |
| 17 | `17-ui-layouts.md` | P0 | Alarm list, alarm form, and settings screen UI layouts, component trees, responsive behavior |
| 99 | `99-consistency-report.md` | — | Folder health check |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Parent overview | `../00-overview.md` |
| Tauri Architecture | `../01-fundamentals/06-tauri-architecture-and-framework-comparison.md` |
| Data Model | `../01-fundamentals/01-data-model.md` |
