# Alarm App Spec

**Version:** 1.1.0  
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
  label: string
  enabled: boolean
  recurringDays: number[] (0=Sun..6=Sat, empty = one-time)
  groupId: string | null
  snoozeDurationMin: number (default 5)
}

AlarmGroup {
  id: string (uuid)
  name: string
  enabled: boolean
}

Storage: SQLite database (via Tauri SQL plugin)
Tables:
  alarms        → Alarm records
  alarm_groups  → AlarmGroup records
  settings      → Key-value config (theme, preferences)
  snooze_state  → Active snooze tracking
```

---

## Priority Matrix

| Priority | Features |
|----------|----------|
| **P0 — Must Have** | Alarm CRUD, Labels, Snooze, Repeat Schedule, Sound Selection, Dark Mode, Clock Display |
| **P1 — Should Have** | Gradual Volume, Quick Alarm, Countdown Display, Vibration, Math Challenge, Groups, Export/Import |
| **P2 — Nice to Have** | Bedtime Reminder, Sleep Calculator, Streak Tracker, Shake/Type Challenges, Themes |
| **P3 — Future** | Weather Briefing, Location Alarms, Webhooks, Analytics, Music Integration, iOS/Android |

---

## Module Inventory

| # | Module | Description |
|---|--------|-------------|
| 01 | [Fundamentals](./01-fundamentals/00-overview.md) | Architecture, data model, design system, platform strategy |
| 02 | [Features](./02-features/00-overview.md) | All feature specifications |
| 03 | [App Issues](./03-app-issues/00-overview.md) | Bug tracking, fixes, retrospectives |

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
