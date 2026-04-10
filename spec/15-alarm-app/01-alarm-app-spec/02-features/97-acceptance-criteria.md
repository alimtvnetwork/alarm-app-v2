# Feature Acceptance Criteria — Consolidated Rollup

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Purpose:** Single document collecting all testable acceptance criteria from the 16 feature specs  
**Resolves:** P14-001

> **Usage:** AI agents implementing features should verify every checkbox below. Each criterion links to its source spec for implementation details.

---

## 01 — Alarm CRUD (`01-alarm-crud.md`)

- [ ] User can create an alarm with time, label, date, repeat pattern, snooze, sound, and group
- [ ] User can edit any field of an existing alarm
- [ ] User can duplicate an alarm with one click
- [ ] User can soft-delete an alarm with 5-second undo toast
- [ ] Undo restores the alarm fully (all fields preserved)
- [ ] User can toggle an alarm on/off without opening the edit form
- [ ] User can drag-and-drop alarms between groups
- [ ] Alarm list shows all alarms sorted by time within each group
- [ ] All changes persist to SQLite immediately via Tauri IPC commands
- [ ] `NextFireTime` is recomputed on create, edit, toggle, and duplicate
- [ ] Empty state shown when no alarms exist

## 02 — Alarm Scheduling (`02-alarm-scheduling.md`)

- [ ] Day selection via pill toggles for Mon–Sun
- [ ] Shortcut buttons: Weekdays, Weekends, Daily
- [ ] One-time alarms (`Type = "once"`) auto-disable after firing
- [ ] Recurring alarms fire every matching day/interval indefinitely
- [ ] "Alarm in X hours Y minutes" countdown updates in real time
- [ ] `NextFireTime` recomputed correctly after every fire event (DST-aware)
- [ ] Interval alarms fire every N minutes from last fire time
- [ ] Cron alarms fire on next cron match (P2)
- [ ] Quick Alarm buttons create correct one-time alarms (P1)

## 03 — Alarm Firing (`03-alarm-firing.md`)

- [ ] Alarm fires within 30 seconds of `NextFireTime`
- [ ] Native audio plays immediately on fire (Rust backend)
- [ ] Full-screen overlay blocks all other interaction
- [ ] Dismiss stops audio and closes overlay
- [ ] Snooze stops audio and re-triggers after configured duration
- [ ] OS notification fires alongside in-app overlay
- [ ] One-time alarms auto-disable after firing
- [ ] `NextFireTime` recomputed after every fire event
- [ ] Missed alarms detected and surfaced on app launch
- [ ] Missed alarms detected and surfaced on system wake (all 3 platforms)
- [ ] Missed alarms logged with `Type = AlarmEventType.Missed` in `AlarmEvents`
- [ ] Auto-dismiss stops alarm after configured minutes if unacknowledged
- [ ] Only one alarm overlay can be active at a time (queue if multiple fire simultaneously)
- [ ] Queued alarms fire in FIFO order (earliest `NextFireTime` first)
- [ ] Queue badge shows count of pending alarms on overlay

## 04 — Snooze System (`04-snooze-system.md`)

- [ ] Snooze delays alarm by per-alarm configured duration
- [ ] Snooze count displayed on overlay
- [ ] Snooze button hidden when `MaxSnoozeCount` reached
- [ ] Snooze button never shown when `MaxSnoozeCount = 0`
- [ ] Snooze state persists across app restart
- [ ] Dismissing clears snooze state from SQLite
- [ ] Each snooze event logged in `AlarmEvents` table

## 05 — Sound & Vibration (`05-sound-and-vibration.md`)

- [ ] Sound preview button plays selected sound briefly (via Rust audio backend)
- [ ] Each alarm stores its own sound selection (built-in key or file path)
- [ ] User can select a custom local audio file via native file dialog
- [ ] Custom sound validation: extension, size (<10MB), no symlinks, no system paths
- [ ] Missing custom sound falls back to `classic-beep` with warning in overlay
- [ ] Custom sound file path persists in SQLite
- [ ] Gradual volume works via native audio volume ramp (quadratic curve)
- [ ] macOS audio session set to Playback + DuckOthers (plays through DND)
- [ ] Vibration fires on supported platforms (mobile) when enabled
- [ ] Vibration toggle hidden on desktop platforms

## 06 — Dismissal Challenges (`06-dismissal-challenges.md`)

- [ ] Math challenge generates integer-only answers for all difficulty levels
- [ ] Wrong answer keeps alarm ringing; correct answer dismisses
- [ ] Solve time logged to `AlarmEvents.ChallengeSolveTimeSec` on successful dismissal
- [ ] Hard problems use formula `(a × b) + c` with operands in specified ranges and result > 0
- [ ] Challenge type configurable per alarm via `ChallengeType` enum (never raw strings)
- [ ] Desktop hides shake and step counter options (feature-detected at runtime)
- [ ] `get_challenge` returns `null` when no challenge configured
- [ ] `submit_challenge_answer` returns `{ Correct: false }` on wrong answer without dismissing

## 07 — Alarm Groups (`07-alarm-groups.md`)

- [ ] Create, rename, delete groups
- [ ] Assign alarms to groups during create/edit
- [ ] Master toggle disables/enables all group alarms
- [ ] Deleting group preserves alarms (moved to ungrouped)
- [ ] Groups persist in SQLite database

## 08 — Clock Display (`08-clock-display.md`)

- [ ] Analog clock renders with smooth second hand animation
- [ ] Digital time updates every second
- [ ] Date and day of week displayed
- [ ] Countdown shows time to next alarm
- [ ] 12/24-hour toggle persists across app restarts

## 09 — Theme System (`09-theme-system.md`)

- [ ] Theme toggle switches between light, dark, system
- [ ] System mode follows OS preference
- [ ] Theme persists across app restarts
- [ ] All components properly themed (no hardcoded colors)
- [ ] Smooth transition between themes (150ms)

## 10 — Export / Import (`10-export-import.md`)

- [ ] Export supports JSON, CSV, and iCal formats
- [ ] Export allows selecting individual alarms, groups, or all
- [ ] Export shows privacy warning dialog before writing file
- [ ] Import supports JSON, CSV, and iCal formats
- [ ] Import shows preview before applying
- [ ] Duplicate handling: skip, overwrite, or rename
- [ ] Merge mode adds new alarms alongside existing
- [ ] Replace mode clears existing data (with confirmation)
- [ ] Invalid files show descriptive error toast
- [ ] Import preserves all alarm settings
- [ ] iCal export generates valid `VEVENT`s with `RRULE`
- [ ] Works offline (no network dependency)

## 11 — Sleep & Wellness (`11-sleep-wellness.md`)

- [ ] Bedtime reminder sends OS-native notification 15–30 min before configured bedtime
- [ ] Sleep calculator shows optimal bedtimes based on 90-minute cycles for a given wake time
- [ ] Sleep quality prompt appears after alarm dismissal (optional, configurable)
- [ ] Quality (1–5), mood, and notes logged to `AlarmEvents` table via IPC
- [ ] Ambient sounds play via Rust `rodio` and auto-stop after configured duration
- [ ] `stop_ambient` immediately stops playback
- [ ] Sleep cycle tracking hidden on desktop (feature-detected at runtime)
- [ ] All IPC payload keys use PascalCase (`AlarmId`, `Quality`, `Sound`, `DurationMin`)

## 12 — Smart Features (`12-smart-features.md`)

- [ ] Webhook URL validated with 5 SSRF checks (HTTPS, blocked hosts, private IP, standard port, valid URL)
- [ ] `WebhookError` enum used for all validation failures (never raw strings)
- [ ] Webhook HTTP client: 5s timeout, no redirects, 1KB max response, 1 retry
- [ ] Weather briefing shows temp, rain chance, wind after alarm dismissal (when configured)
- [ ] Location-based alarms hidden on desktop (no GPS); visible on mobile
- [ ] Voice commands support: set, edit, delete, toggle (when platform speech API available)
- [ ] Multi-timezone alarms show both local and target time in alarm list

## 13 — Analytics & History (`13-analytics.md`)

- [ ] All alarm events (fired, snoozed, dismissed, missed) logged automatically
- [ ] History view filterable by date range, group, event type, and alarm
- [ ] History sortable by date, label, snooze count
- [ ] History exportable as CSV via native save dialog
- [ ] History clearable (all or before a date)
- [ ] Analytics reports show snooze trends and wake-up patterns

## 14 — Personalization (`14-personalization.md`)

- [ ] Theme/skin selection persisted in SQLite `Settings` table via `update_setting` IPC
- [ ] Custom accent color picker saves hex value to Settings
- [ ] Custom background image selected via native file dialog, copied to app data dir
- [ ] `get_daily_quote` returns a different quote each day (rotating through bundled library)
- [ ] Users can save favorites and add custom quotes via IPC
- [ ] Streak calculated from `AlarmEvents` — resets if snooze limit exceeded
- [ ] Streak calendar view shows consecutive on-time wake days
- [ ] Music integration uses OAuth via system browser + deep link callback

## 15 — Keyboard Shortcuts (`15-keyboard-shortcuts.md`)

- [ ] All listed shortcuts functional on macOS, Windows, and Linux
- [ ] Platform-appropriate modifier key displayed (⌘ vs Ctrl)
- [ ] Shortcuts work when alarm list is focused
- [ ] Overlay shortcuts (S, Enter, Esc) only active when overlay is visible
- [ ] Tooltips show shortcut hints on buttons
- [ ] No conflicts with OS-level shortcuts
- [ ] Shortcuts disabled when a text input field is focused

## 16 — Accessibility & NFR (`16-accessibility-and-nfr.md`)

- [ ] Full keyboard navigation for all features
- [ ] Screen reader announces alarm states and events
- [ ] 4.5:1 contrast ratio on all text (both themes)
- [ ] `prefers-reduced-motion` respected
- [ ] Startup < 750ms on target hardware
- [ ] Idle memory < 200 MB
- [ ] Idle CPU ~0%
- [ ] App bundle < 50 MB
- [ ] 100% offline functionality
- [ ] All strings extracted to locale files (i18n-ready)

---

## Summary

| Feature | Criteria Count |
|---------|:-:|
| 01 Alarm CRUD | 11 |
| 02 Scheduling | 9 |
| 03 Firing | 15 |
| 04 Snooze | 7 |
| 05 Sound | 10 |
| 06 Challenges | 8 |
| 07 Groups | 5 |
| 08 Clock | 5 |
| 09 Theme | 5 |
| 10 Export/Import | 12 |
| 11 Sleep & Wellness | 8 |
| 12 Smart Features | 7 |
| 13 Analytics | 6 |
| 14 Personalization | 8 |
| 15 Keyboard Shortcuts | 7 |
| 16 Accessibility & NFR | 10 |
| **Total** | **133** |

---

*Feature acceptance criteria rollup — created: 2026-04-10*
