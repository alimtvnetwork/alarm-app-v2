# Personalization

**Version:** 1.2.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** Low  
**Priority:** P2/P3

---

## Keywords

`personalization`, `themes`, `quotes`, `streak`, `music`, `skins`, `native`

---

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

### Wake-Up Streak Tracker (P2)

- Count consecutive days waking on time (dismissed without excessive snoozing)
- Calculated from SQLite `AlarmEvents` table (dismiss timestamps, snooze counts)
- Calendar view with streak visualization
- Streak resets if snooze limit exceeded
- Gamification: badges for milestones (7 days, 30 days, 100 days)

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

## Cross-References

| Reference | Location |
|-----------|----------|
| Theme System | `./09-theme-system.md` |
| Design System | `../01-fundamentals/02-design-system.md` |
| Analytics | `./13-analytics.md` |
| Tauri Architecture | `../01-fundamentals/06-tauri-architecture-and-framework-comparison.md` |
