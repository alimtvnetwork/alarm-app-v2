# Alarm App — Complete Feature Overview

**Version:** 1.0.0  
**Updated:** 2026-04-10

A comprehensive guide to all possible features for a modern cross-platform native alarm application (Tauri 2.x — macOS, Windows, Linux, iOS, Android).

---

## 1. Core Features

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Multiple Alarms** | Create, edit, duplicate, and soft-delete multiple independent alarms | Low |
| **On/Off Toggle** | Quickly enable or disable individual alarms without deleting them | Low |
| **Repeat Patterns** | Schedule alarms: once, daily, weekly (select days), custom interval, or cron expression | Medium |
| **Date-Specific Alarms** | Fire on a specific calendar date (e.g., 2026-12-25 at 08:00) | Low |
| **Alarm Labels** | Assign custom names/labels to each alarm for easy identification | Low |
| **Snooze** | Dismiss temporarily with per-alarm configurable duration (1–30 min) and max snooze count (0–10) | Low |
| **Sound Selection** | Choose from 10 built-in tones or select any local `.mp3`/`.wav`/`.ogg` file | Low |
| **Volume Control** | Set the alarm volume independently from device volume | Low |
| **12/24-Hour Format** | Toggle between 12-hour (AM/PM) and 24-hour time display | Low |
| **Alarm Preview** | "Time until alarm" indicator showing how long until the next alarm fires | Low |
| **Vibration** | Trigger device vibration alongside or instead of sound (mobile: native haptics; desktop: N/A) | Low |
| **Soft-Delete with Undo** | Delete sets `DeletedAt` timestamp; 5-second undo toast before permanent removal | Low |
| **Duplicate Alarm** | One-click clone of any alarm with new UUID and "(Copy)" label suffix | Low |
| **Auto-Dismiss** | Optional auto-stop after N minutes (1–60) if alarm is unacknowledged | Low |

---

## 2. Intermediate Features

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Gradual Wake-Up** | Alarm volume increases slowly over a set period (15, 30, or 60 seconds) | Medium |
| **Custom Snooze Duration** | Per-alarm snooze interval (1–30 minutes) and max snooze count | Low |
| **Bedtime Reminder** | Notify the user when it's time to go to bed based on their wake-up alarm and desired sleep duration | Medium |
| **Sleep Duration Calculator** | Given a desired wake-up time, suggest optimal bedtime based on 90-minute sleep cycles | Medium |
| **Alarm Groups** | Organize alarms into color-coded groups (e.g., "Work", "Gym", "Weekend") for batch management | Medium |
| **Drag-and-Drop** | Drag alarms between groups; reorder within the alarm list | Medium |
| **Quick Alarm / Timer** | Set a one-off alarm for "X minutes from now" without configuring a full alarm | Low |
| **Countdown Display** | Show a live countdown timer to the next scheduled alarm | Low |
| **Alarm History** | Persistent log of past alarms: when they fired, dismissed, snoozed, or missed — filterable and CSV-exportable | Medium |
| **Keyboard Shortcuts** | Full keyboard navigation: ⌘/Ctrl+N (new), Space (toggle), S (snooze), Enter/Esc (dismiss), etc. | Medium |

---

## 3. Advanced Features

### 3.1 Missed Alarm Recovery (Critical)

Desktop computers sleep and shut down — alarms must never be silently lost.

| Aspect | Implementation |
|--------|---------------|
| **`NextFireTime` persistence** | Every enabled alarm stores precomputed `NextFireTime` in SQLite |
| **App launch check** | Query `WHERE NextFireTime < now AND IsEnabled = 1` → fire missed alarm notifications |
| **System wake detection** | macOS: `NSWorkspace.didWakeNotification`, Windows: `WM_POWERBROADCAST`, Linux: `systemd-logind` |
| **30-second tick** | Background Rust thread checks every 30 seconds |
| **Guarantee** | If computer was off 6 AM–9 AM with 7 AM alarm → user sees "Missed: 7:00 AM" at 9 AM |

### 3.2 Dismissal Challenges

Force the user to complete a task before the alarm can be dismissed.

| Challenge Type | Description | Complexity |
|----------------|-------------|------------|
| **Math Puzzle** | Solve a math problem (difficulty: easy → hard) to dismiss | Medium |
| **QR/Barcode Scan** | Scan a specific QR code (e.g., placed in the bathroom) to dismiss | High |
| **Shake to Dismiss** | Shake the device a set number of times to dismiss (mobile only — native accelerometer) | Medium |
| **Typing Challenge** | Type a displayed sentence or phrase accurately | Medium |
| **Photo Match** | Take a photo of a specific location or object to dismiss | High |
| **Memory Game** | Complete a short memory or pattern-matching game | Medium |
| **Steps Counter** | Walk a certain number of steps before the alarm stops (mobile only — native pedometer) | High |

### 3.3 Smart & Social Features

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Smart Alarm (Sleep Cycle)** | Wake the user during their lightest sleep phase within a time window (mobile: native motion sensors) | High |
| **Alarm Routines** | Chain multiple actions after alarm dismissal: show weather → play music → open a checklist | High |
| **Shared/Social Alarms** | Create alarms shared with friends or family; everyone gets notified | High |
| **Location-Based Alarm** | Trigger an alarm when arriving at or leaving a specific location (native GPS/geofencing) | High |
| **Spotify/Music Integration** | Use a song from a music service as the alarm sound (native HTTP — no CORS) | Medium |

### 3.4 Sleep Analytics

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Sleep Statistics** | Track sleep duration, consistency, and quality over time with charts (SQLite storage) | High |
| **Sleep Score** | Calculate a daily sleep score based on duration, consistency, and snooze usage | High |
| **Weekly/Monthly Reports** | Summarized sleep reports with trends and recommendations | High |
| **Export Data** | Export sleep data as CSV or PDF via native file dialog | Medium |

---

## 4. Engagement & Lifestyle Features

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Motivational Quotes** | Display an inspiring quote on the alarm screen each morning | Low |
| **Weather Preview** | Show current weather and forecast when the alarm fires (native HTTP API) | Medium |
| **Morning News Headlines** | Display top news headlines on the alarm/dismiss screen | Medium |
| **Daily Checklist** | Show a customizable morning routine checklist after alarm dismissal | Medium |
| **Habit Tracker Integration** | Mark morning habits as complete (e.g., "Drank water", "Stretched") | Medium |
| **Birthday/Event Alarms** | Special alarm types for birthdays, holidays, or calendar events | Medium |

---

## 5. UX & Design Features

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Dark / Light Theme** | Toggle between dark and light modes; auto-detect OS preference (native appearance events) | Low |
| **Custom Accent Colors** | Let users pick their preferred accent/highlight color | Low |
| **Analog Clock Face** | Display time as an analog clock in addition to digital | Medium |
| **Animations & Transitions** | Smooth animations for alarm creation, toggling, and dismissal | Low |
| **Haptic Feedback** | Subtle vibration feedback on interactions (mobile only — native haptics) | Low |
| **Accessibility (a11y)** | WCAG 2.1 AA: screen reader support, keyboard navigation, 4.5:1 contrast, ARIA labels, `prefers-reduced-motion` | Medium |
| **Responsive Design** | Fully responsive layout optimized for mobile, tablet, and desktop | Low |
| **System Tray / Menu Bar** | Native system tray icon with quick controls, next alarm on hover, imminent badge (<5 min) | Medium |
| **Drag & Drop Reorder** | Reorder alarms and drag between groups | Medium |
| **i18n / Internationalization** | All strings in locale files; language selector in settings; i18n-ready architecture | Medium |

---

## 6. Native Platform Capabilities

Building the alarm app as a **native cross-platform application** (Tauri 2.x) provides direct access to OS-level capabilities:

### Native Advantages over Web

| Capability | Native (Tauri) | Web App Limitation |
|------------|----------------|-------------------|
| **Background Execution** | Rust background thread — reliable, never throttled | Browsers throttle/suspend background tabs |
| **Audio Playback** | Native audio (`rodio`) — no autoplay restrictions | Web Audio API blocked without user gesture |
| **Vibration / Haptics** | CoreHaptics (iOS), Vibrator (Android) | navigator.vibrate — no iOS support |
| **Notifications** | OS-native, persistent, actionable | Browser notifications — permission-gated, less reliable |
| **System Tray** | Menu bar icon with controls | Not available in browsers |
| **File Access** | Native file dialogs, direct read/write | Sandboxed, limited to downloads |
| **Wake Lock** | Native power management API | Wake Lock API — limited support |
| **Auto-Update** | Built-in Tauri updater plugin | Not applicable |
| **Storage** | SQLite — structured, queryable, unlimited | localStorage — 5MB limit, string-only |
| **System Wake Detection** | OS power events (macOS/Windows/Linux) | Not available |

### Recommended Native Technologies

| Technology | Use Case |
|------------|----------|
| **Tauri 2.x** | Cross-platform runtime (macOS, Windows, Linux, iOS, Android) |
| **Rust Backend** | Alarm engine, audio, storage, notifications |
| **SQLite** | Persistent structured data storage |
| **rodio** | Cross-platform audio playback |
| **tauri-plugin-notification** | OS-native notifications |
| **rusqlite** + **refinery** | SQLite database + migrations |
| **tauri-plugin-dialog** | Native file open/save dialogs |
| **tauri-plugin-global-shortcut** | System-wide keyboard shortcuts |
| **tauri-plugin-updater** | Auto-update mechanism |
| **i18next** | Frontend internationalization |

---

## 7. Import / Export

| Format | Import | Export | Notes |
|--------|--------|--------|-------|
| JSON | ✅ | ✅ | Primary format. Full fidelity — all fields preserved. |
| CSV | ✅ | ✅ | Flat format for spreadsheet users. One row per alarm. |
| iCal (.ics) | ✅ | ✅ | Interop with Google Calendar, Apple Calendar, Outlook. |

- Export scope: individual alarms, groups, or "Export All"
- Import preview before applying; duplicate handling: skip / overwrite / rename
- Native file dialogs via `tauri-plugin-dialog`

---

## 8. Recommended MVP Feature Set

### ✅ MVP (Version 1.0)

- Multiple alarms with create/edit/delete (soft-delete with undo)
- Duplicate alarm
- On/off toggle
- Repeat patterns (once, daily, weekly, interval)
- Date-specific alarms
- Alarm labels
- Snooze with per-alarm duration and max count
- Sound selection (10 built-in tones + custom files)
- Gradual wake-up (volume fade-in)
- Auto-dismiss
- 12/24-hour format toggle
- Dark theme (default) with accent color
- Time-until-alarm preview
- Missed alarm recovery (app launch + system wake)
- Keyboard shortcuts
- System tray / menu bar integration
- Accessibility (WCAG 2.1 AA)
- SQLite persistence
- JSON export/import

### 🚀 Version 2.0 Candidates

- Math puzzle dismiss challenge
- Sleep duration calculator
- Bedtime reminders
- Motivational quotes
- Weather preview
- Alarm history & filterable log with CSV export
- Alarm groups (color-coded, drag-and-drop)
- CSV + iCal export/import
- i18n (2-3 additional languages)

### 🔮 Future / Stretch Goals

- QR code dismiss
- Smart alarm (sleep cycle — mobile)
- Alarm routines
- Full sleep analytics dashboard
- Cloud sync
- World clock / multiple time zones
- Stopwatch & timer / Pomodoro
- Voice assistant integration
- Calendar overlay
- OS widgets
- Auto-update
- Shared/social alarms
- iOS & Android release

---

## Summary Table

| Category | Feature Count |
|---|---|
| Core Features | 14 |
| Intermediate Features | 10 |
| Dismissal Challenges | 7 |
| Smart & Social | 5 |
| Sleep Analytics | 4 |
| Engagement & Lifestyle | 6 |
| UX & Design | 10 |
| Native Platform Capabilities | 10 |
| Import / Export | 3 |
| **Total** | **69** |

---

*Generated for the Alarm App project v1.2.0 — use this document to plan and prioritize features.*