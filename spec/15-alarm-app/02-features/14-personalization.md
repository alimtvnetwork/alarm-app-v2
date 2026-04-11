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
| `get_daily_quote` | `void` | `Quote` |
| `save_favorite_quote` | `{ QuoteId: string }` | `void` |
| `add_custom_quote` | `{ Text: string, Author: string }` | `Quote` |

### Theme & Background IPC Commands

| Command | Payload | Returns |
|---------|---------|---------|
| `update_setting` | `{ Key: "ThemeSkin", Value: string }` | `void` |
| `update_setting` | `{ Key: "AccentColor", Value: string }` | `void` |
| `set_custom_background` | `{ FilePath: string }` | `{ SavedPath: string }` |
| `clear_custom_background` | `void` | `void` |

> **Note:** Theme/skin and accent color use the existing `update_setting` IPC command (see `09-theme-system.md`). Custom background requires dedicated commands because the file must be copied to the app data directory.

### Rust Structs

```rust
#[derive(Debug, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct SaveFavoriteQuotePayload {
    pub quote_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct AddCustomQuotePayload {
    pub text: String,
    pub author: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct UpdateSettingPayload {
    pub key: String,
    pub value: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct SetCustomBackgroundPayload {
    pub file_path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "PascalCase")]
pub struct CustomBackgroundResponse {
    pub saved_path: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct GetStreakCalendarPayload {
    pub month: u32,  // 1–12
    pub year: u32,
}
```

### Wake-Up Streak Tracker (P2)

- Count consecutive days waking on time (dismissed without excessive snoozing)
- Calculated from SQLite `AlarmEvents` table (dismiss timestamps, snooze counts)
- Calendar view with streak visualization
- Streak resets if snooze limit exceeded
- Gamification: badges for milestones (7 days, 30 days, 100 days)

### Streak IPC Commands

| Command | Payload | Returns |
|---------|---------|---------|
| `get_streak_data` | `void` | `StreakData` |
| `get_streak_calendar` | `{ Month: number, Year: number }` | `StreakCalendarDay[]` |

> **Note:** `Quote`, `StreakData`, and `StreakCalendarDay` interfaces defined in `01-data-model.md`.

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

## Edge Cases

> **Resolves CG-002.** Edge cases for Personalization features.

| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| 1 | Streak calculation across timezone change (travel) | Streak uses alarm's local fire time; timezone change does not break streak if alarm was dismissed on-time in the original zone |
| 2 | Streak calculation when alarm missed one day | Streak resets to 0; next on-time dismissal starts new streak at 1 |
| 3 | Streak calculation when snooze limit exceeded | Streak resets — excessive snoozing counts as not "on time" |
| 4 | `get_streak_calendar` with Month = 0 or Month = 13 | Return `Validation` error — Month must be 1–12 |
| 5 | `add_custom_quote` with empty Text | Return `Validation` error — Text must be non-empty |
| 6 | `add_custom_quote` with Text > 500 chars | Return `Validation` error — Text exceeds maximum length |
| 7 | `save_favorite_quote` with non-existent QuoteId | Return `Validation` error — QuoteId not found |
| 8 | `get_daily_quote` when bundled quote library is empty | Return a hardcoded fallback quote ("Good morning!") — never return null |
| 9 | Custom background image file deleted after selection | Show default background; log warning; clear `SavedPath` setting |
| 10 | Theme skin conflicts with custom accent color | Accent color overrides theme skin's default accent; no conflict — skin provides layout, accent provides color |
| 11 | `set_custom_background` with unsupported image format | Return `Validation` error — only PNG, JPG, JPEG, WEBP allowed |
| 12 | Streak badge milestone (7/30/100 days) — display timing | Badge notification shown once on the day the milestone is reached; persisted to prevent re-showing |

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
