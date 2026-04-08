# File Structure

**Version:** 1.1.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`file-structure`, `components`, `hooks`, `organization`, `tauri`, `rust`

---

## Purpose

Defines the source code file organization for the Alarm App (Tauri 2.x).

---

## Structure

```
src/                          — Frontend (React + TypeScript)
  types/
    alarm.ts                  — Alarm, AlarmGroup, AlarmSound interfaces

  hooks/
    useAlarms.ts              — CRUD, toggle, group toggle, SQLite sync via Tauri IPC
    useTheme.ts               — Theme state + settings table + class toggle
    useAlarmFiring.ts         — Listen for Rust alarm-fired events, trigger overlay
    useClock.ts               — Current time state, updated every second

  components/
    AnalogClock.tsx           — SVG clock face with hour/minute/second hands
    DigitalClock.tsx          — Time + date display
    AlarmList.tsx             — Grouped alarm list with toggles
    AlarmForm.tsx             — Create/edit alarm dialog
    AlarmGroupForm.tsx        — Group create/rename dialog
    AlarmOverlay.tsx          — Full-screen firing overlay (dismiss/snooze)
    ThemeToggle.tsx           — Sun/moon icon button
    ExportImport.tsx          — Export button + import via native file dialog
    AlarmCountdown.tsx        — "Alarm in X hours Y minutes" display

  pages/
    Index.tsx                 — Main layout combining all components

  lib/
    tauri-commands.ts         — Typed wrappers for Tauri invoke() calls
    db.ts                     — Frontend DB query helpers

  assets/
    sounds/                   — Built-in alarm tone audio files

src-tauri/                    — Backend (Rust)
  src/
    main.rs                   — Tauri app entry point, plugin registration
    lib.rs                    — Module declarations
    commands/
      alarm.rs                — Alarm CRUD commands (IPC handlers)
      audio.rs                — Audio playback commands
      settings.rs             — Settings read/write commands
      export_import.rs        — File export/import commands
    engine/
      alarm_engine.rs         — Background alarm checking thread
      scheduler.rs            — Next-alarm calculation, recurring logic
    audio/
      player.rs               — Native audio playback (platform-specific)
      gradual_volume.rs       — Volume fade-in logic
    storage/
      db.rs                   — SQLite connection + migrations
      models.rs               — Rust structs matching DB schema
    notifications/
      mod.rs                  — OS notification dispatch
    tray/
      mod.rs                  — System tray / menu bar setup

  tauri.conf.json             — App config, permissions, window settings
  Cargo.toml                  — Rust dependencies
  migrations/                 — SQLite migration files
  icons/                      — App icons (macOS .icns, Windows .ico, etc.)
```

---

## Component Hierarchy

```
Index.tsx
  ├── ThemeToggle
  ├── AnalogClock
  ├── DigitalClock
  ├── AlarmCountdown
  ├── AlarmList
  │   ├── AlarmForm (dialog)
  │   └── AlarmGroupForm (dialog)
  ├── ExportImport
  └── AlarmOverlay (conditional — shown when alarm fires)
```

---

## IPC Flow

```
Frontend (React)                    Backend (Rust)
────────────────                    ──────────────
invoke("create_alarm", data)  →    commands/alarm.rs → storage/db.rs
invoke("play_sound", soundId) →    commands/audio.rs → audio/player.rs
listen("alarm-fired", handler) ←   engine/alarm_engine.rs (event emit)
invoke("dismiss_alarm", id)   →    commands/alarm.rs → engine stop
invoke("export_alarms")       →    commands/export_import.rs → file dialog
```

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Data Model | `./01-data-model.md` |
| Platform Strategy | `./05-platform-strategy.md` |
| Features | `../02-features/00-overview.md` |
