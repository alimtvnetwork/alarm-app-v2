# Personalization

**Version:** 1.4.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** Low  
**Priority:** P2/P3

---

## Keywords

`personalization`, `themes`, `quotes`, `streak`, `music`, `skins`, `native`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ✅ |


## Description

Visual customization, motivational features, and engagement tools. All preferences persisted in SQLite `Settings` table; streak data in `AlarmEvents`.

---

## Native Implementation

| Aspect | Web (Previous) | Native (Tauri) |
|--------|---------------|----------------|
| Theme/skin storage | localStorage | SQLite `Settings` table |
| Custom backgrounds | CSS background-image | Native file picker + app data directory |
| Streak data | localStorage | SQLite `AlarmEvents` table queries |
| Music integration | Web Audio API | Native audio APIs / OS media frameworks |
| Quote storage | Bundled JSON | SQLite or bundled asset file |

---

## Features

### Themes & Skins (P2)

- Beyond light/dark: gradient, minimal, retro, nature-inspired
- Custom accent color picker — persisted in SQLite `Settings`
- Clock font style options: digital, analog, minimal
- Custom background images — selected via native file dialog (`tauri-plugin-dialog`), copied to app data directory

### Motivational Quotes on Dismiss (P2)

- After alarm dismissal, display a daily motivational quote
- Curated library bundled as JSON asset, rotates daily
- Users can save favorites or add custom quotes — stored in SQLite

### Quote IPC Commands

| Command | Payload | Returns |
|---------|---------|---------|
| `get_daily_quote` | `void` | `{ Text: string, Author: string }` |
| `save_favorite_quote` | `{ Text: string, Author: string }` | `void` |
| `add_custom_quote` | `{ Text: string, Author: string }` | `{ QuoteId: string }` |

### Theme & Background IPC Commands

| Command | Payload | Returns |
|---------|---------|---------|
| `update_setting` | `{ Key: "ThemeSkin", Value: string }` | `void` |
| `update_setting` | `{ Key: "AccentColor", Value: string }` | `void` |
| `set_custom_background` | `{ FilePath: string }` | `{ SavedPath: string }` |
| `clear_custom_background` | `void` | `void` |

> **Note:** Theme/skin and accent color use the existing `update_setting` IPC command (see `09-theme-system.md`). Custom background requires dedicated commands because the file must be copied to the app data directory.

### Wake-Up Streak Tracker (P2)

- Count consecutive days waking on time (dismissed without excessive snoozing)
- Calculated from SQLite `AlarmEvents` table (dismiss timestamps, snooze counts)
- Calendar view with streak visualization
- Streak resets if snooze limit exceeded
- Gamification: badges for milestones (7 days, 30 days, 100 days)

### Streak IPC Commands

| Command | Payload | Returns |
|---------|---------|---------|
| `get_streak_data` | `void` | `{ CurrentStreak: number, LongestStreak: number, CalendarDays: string[] }` |
| `get_streak_calendar` | `{ Month: number, Year: number }` | `{ Days: { Date: string, IsOnTime: boolean }[] }` |

### Music Service Integration (P3)

- Connect Spotify, Apple Music, or YouTube Music
- Native HTTP client (Rust `reqwest`) — no CORS restrictions
- OAuth flow via system browser + deep link callback
- Use any song/playlist as alarm sound
- Gradual volume increase applied to music playback via native audio

### Shared / Group Alarms (P3)

- Share alarm via link or code
- Requires optional network feature — uses Rust HTTP client
- Group members all get the same alarm
- Useful for coordinating group activities

---

## Acceptance Criteria

- [ ] Theme/skin selection persisted in SQLite `Settings` table via `update_setting` IPC
- [ ] Custom accent color picker saves hex value to Settings
- [ ] Custom background image selected via native file dialog, copied to app data dir
- [ ] `get_daily_quote` returns a different quote each day (rotating through bundled library)
- [ ] Users can save favorites and add custom quotes via IPC
- [ ] Streak calculated from `AlarmEvents` — resets if snooze limit exceeded
- [ ] Streak calendar view shows consecutive on-time wake days
- [ ] Music integration uses OAuth via system browser + deep link callback

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Theme System | `./09-theme-system.md` |
| Design System | `../01-fundamentals/02-design-system.md` |
| Analytics | `./13-analytics.md` |
| Tauri Architecture | `../01-fundamentals/06-tauri-architecture-and-framework-comparison.md` |
| Domain Enums | `../01-fundamentals/01-data-model.md` → Domain Enums section |
