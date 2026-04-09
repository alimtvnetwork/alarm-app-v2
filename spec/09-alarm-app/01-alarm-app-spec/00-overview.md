# Alarm App Spec

**Version:** 1.3.0  
**Status:** Active  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** Low

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
| SQLite | Data persistence (via Tauri plugin) |
| Native Audio | Alarm sound playback (Rust crate / OS API) |
| OS Notifications | System notifications (Tauri notification plugin) |
| System Tray | Menu bar / tray integration (Tauri tray plugin) |

---

## Data Model

```
Alarm {
  id: string (uuid)
  time: string (HH:MM, 24h)
  date: string | null (YYYY-MM-DD, for date-specific alarms)
  label: string
  enabled: boolean
  repeat: RepeatPattern (once|daily|weekly|interval|cron)
  groupId: string | null
  snoozeDurationMin: number (default 5)
  maxSnoozeCount: number (default 3, 0 = disabled)
  soundFile: string (built-in key or custom file path)
  gradualVolume: boolean
  autoDismissMin: number (0 = disabled)
  nextFireTime: string | null (precomputed)
  deletedAt: string | null (soft-delete)
  createdAt / updatedAt: ISO timestamps
}

RepeatPattern {
  type: "once" | "daily" | "weekly" | "interval" | "cron"
  daysOfWeek: number[] (for weekly)
  intervalMinutes: number (for interval)
  cronExpression: string (for cron)
}

AlarmGroup {
  id: string (uuid)
  name: string
  color: string (hex)
  enabled: boolean
}

Storage: SQLite database (via Tauri SQL plugin)
Tables:
  alarms        → Alarm records (with soft-delete, nextFireTime)
  alarm_groups  → AlarmGroup records (with color)
  settings      → Key-value config (theme, locale, defaults)
  snooze_state  → Active snooze tracking
  alarm_events  → Alarm history log (fired, snoozed, dismissed, missed)
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
| 01 | [Fundamentals](./01-fundamentals/00-overview.md) | Architecture, data model, design system, platform strategy |
| 02 | [Features](./02-features/00-overview.md) | All feature specifications |
| 03 | [App Issues](./03-app-issues/00-overview.md) | Bug tracking, fixes, retrospectives (32 issues) |
| 98 | [Changelog](./98-changelog.md) | Version history and change log |

---

## Reference Documents

| File | Description |
|------|-------------|
| [alarm-app-features.md](./reference/alarm-app-features.md) | Original feature overview (170 features, categorized) |
| [alarm-clock-features.md](./reference/alarm-clock-features.md) | Extended feature reference (67 features, 10 categories) |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Parent module | `../00-overview.md` |
| Design System | `../../06-design-system/00-overview.md` |
| Coding Guidelines | `../../02-coding-guidelines/00-overview.md` |
