# Alarm App Spec

**Version:** 1.6.0  
**Status:** ✅ Complete — Ready for AI Handoff (Near-100% Coverage)  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`alarm`, `app`, `specification`, `features`, `architecture`, `tauri`, `cross-platform`, `native`

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

Complete application specification for the Alarm App — a cross-platform native application targeting macOS first, then Windows, Linux, iOS, and Android. Organized into fundamentals (architecture, data model, design, platform strategy), features (all functional specs), and app issues (bugs, fixes, retrospectives).

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| Tauri 2.x | Native app framework (Rust backend + WebView frontend) |
| Rust | Backend logic — alarm engine, audio, notifications, storage |
| React 18 | UI framework (runs in OS WebView) |
| Vite 5 | Frontend build tool |
| TypeScript 5 | Type safety |
| Tailwind CSS v3 | Styling |
| shadcn/ui | Component library |
| SQLite | Data persistence (via rusqlite + refinery migrations) |
| Native Audio | Alarm sound playback (Rust crate / OS API) |
| OS Notifications | System notifications (Tauri notification plugin) |
| System Tray | Menu bar / tray integration (Tauri tray plugin) |

---

## Data Model

```
Alarm {
  AlarmId: string (uuid)
  Time: string (HH:MM, 24h)
  Date: string | null (YYYY-MM-DD, for date-specific alarms)
  Label: string
  IsEnabled: boolean
  Repeat: RepeatPattern (once|daily|weekly|interval|cron)
  GroupId: string | null
  SnoozeDurationMin: number (default 5)
  MaxSnoozeCount: number (default 3, 0 = disabled)
  SoundFile: string (built-in key or custom file path)
  IsGradualVolume: boolean
  AutoDismissMin: number (0 = disabled)
  NextFireTime: string | null (precomputed)
  DeletedAt: string | null (soft-delete)
  CreatedAt / UpdatedAt: ISO timestamps
}

RepeatPattern {
  Type: "once" | "daily" | "weekly" | "interval" | "cron"
  DaysOfWeek: number[] (for weekly)
  IntervalMinutes: number (for interval)
  CronExpression: string (for cron)
}

AlarmGroup {
  GroupId: string (uuid)
  Name: string
  Color: string (hex)
  IsEnabled: boolean
}

Storage: SQLite database (via rusqlite + refinery migrations)
Tables:
  Alarms        → Alarm records (with soft-delete, NextFireTime)
  AlarmGroups   → AlarmGroup records (with color)
  Settings      → Key-value config (theme, locale, defaults)
  SnoozeState   → Active snooze tracking
  AlarmEvents   → Alarm history log (fired, snoozed, dismissed, missed)
```

---

## Priority Matrix

| Priority | Features |
|----------|----------|
| **P0 — Must Have** | Alarm CRUD (soft-delete, duplicate, drag-drop), Snooze (per-alarm max), Repeat Patterns (daily/weekly/interval/cron), Sound Selection (built-in + custom), Dark Mode, Clock Display, Missed Alarm Recovery, Auto-Dismiss |
| **P1 — Should Have** | Gradual Volume, Keyboard Shortcuts, Groups (color-coded), Export/Import (JSON/CSV/iCal), Accessibility (WCAG 2.1 AA), Math Challenge |
| **P2 — Nice to Have** | Alarm History Log (filterable, CSV export), Bedtime Reminder, Sleep Calculator, Streak Tracker, Shake/Type Challenges, Themes, i18n |
| **P3 — Future** | Analytics Reports, Weather Briefing, Location Alarms, Webhooks, Music Integration, Cloud Sync, World Clock, Stopwatch/Timer, Pomodoro, Voice Assistant, Calendar Overlay, OS Widgets, iOS/Android |

---

## Module Inventory

| # | Module | Description |
|---|--------|-------------|
| 01 | [Fundamentals](./01-fundamentals/00-overview.md) | Architecture, data model, design system, platform strategy, startup, devops, tests (10 docs) |
| 02 | [Features](./02-features/00-overview.md) | All feature specifications (17 docs) |
| 03 | [App Issues](./03-app-issues/00-overview.md) | Bug tracking — 43/43 issues resolved |
| 09 | [AI Handoff Reliability Report](./09-ai-handoff-reliability-report.md) | 94-task failure analysis (superseded by 62-task breakdown), top 15 risk points |
| 10 | [AI Handoff Readiness Report](./10-ai-handoff-readiness-report.md) | 96/100 readiness score, implementation order |
| 11 | [Atomic Task Breakdown](./11-atomic-task-breakdown.md) | **Authoritative** 62 dependency-ordered tasks, effort estimates, risk levels |
| 12 | [Platform & Concurrency Guide](./12-platform-and-concurrency-guide.md) | Platform gotchas, race condition safeguards, async safety, error recovery |
| 13 | [AI Cheat Sheet](./13-ai-cheat-sheet.md) | Single-page quick reference for AI coding agents |
| 14 | [Spec Issues](./14-spec-issues/00-overview.md) | Audit tracker — 95 issues found, 77 resolved |
| 15 | [Reference](./15-reference/00-overview.md) | Feature inventories and planning references |
| 98 | [Changelog](./98-changelog.md) | Version history v1.0.0–v1.7.0 |

---

## Reference Documents

| File | Description |
|------|-------------|
| [alarm-app-features.md](./15-reference/alarm-app-features.md) | Original feature overview (170 features, categorized) |
| [alarm-clock-features.md](./15-reference/alarm-clock-features.md) | Extended feature reference (67 features, 10 categories) |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Parent module | `../00-overview.md` |
| Design System | `../../06-design-system/00-overview.md` |
| Coding Guidelines | `../../02-coding-guidelines/00-overview.md` |
