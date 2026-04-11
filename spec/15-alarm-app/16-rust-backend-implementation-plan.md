# Alarm App — Rust/Tauri Backend Implementation Plan

**Version:** 1.0.0  
**Updated:** 2026-04-11  
**Status:** Ready for Handoff  
**Target:** Tauri 2.x + SQLite (rusqlite) + rodio audio

---

## Keywords

`backend`, `rust`, `tauri`, `sqlite`, `ipc`, `migration`, `audio`, `notifications`

---

## Purpose

Complete Rust/Tauri backend implementation spec for the Alarm App. The React frontend is fully built and uses a mock IPC layer (`src/lib/mock-ipc.ts`) with localStorage. This document specifies everything needed to replace that mock layer with a real native backend.

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────┐
│              React Frontend              │
│  (Zustand stores → tauri-commands.ts)    │
└──────────────┬───────────────────────────┘
               │ invoke("command_name", payload)
               ▼
┌──────────────────────────────────────────┐
│           Tauri IPC Layer                │
│  (src-tauri/src/commands/*.rs)           │
└──────────────┬───────────────────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│ SQLite │ │ Audio  │ │  OS    │
│ rusqlite│ │ rodio  │ │ Layer  │
└────────┘ └────────┘ └────────┘
```

### Crate Dependencies

```toml
[dependencies]
tauri = { version = "2", features = ["tray-icon", "notification"] }
rusqlite = { version = "0.31", features = ["bundled"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
uuid = { version = "1", features = ["v4"] }
chrono = { version = "0.4", features = ["serde"] }
rodio = "0.17"
croner = "2.0"
tokio = { version = "1", features = ["full"] }
```

---

## 2. SQLite Schema (7 Tables)

All identifiers use **PascalCase** per project convention. Use `TEXT` for UUIDs and ISO 8601 timestamps.

### 2.1 Alarm

```sql
CREATE TABLE Alarm (
    AlarmId               TEXT PRIMARY KEY,
    Time                  TEXT NOT NULL,          -- "HH:MM"
    Date                  TEXT,                   -- "YYYY-MM-DD" or NULL
    Label                 TEXT NOT NULL DEFAULT '',
    IsEnabled             INTEGER NOT NULL DEFAULT 1,
    IsPreviousEnabled     INTEGER,
    RepeatType            TEXT NOT NULL DEFAULT 'Once',
    RepeatDaysOfWeek      TEXT NOT NULL DEFAULT '[]',  -- JSON array
    RepeatIntervalMinutes INTEGER NOT NULL DEFAULT 0,
    RepeatCronExpression  TEXT NOT NULL DEFAULT '',
    GroupId               TEXT REFERENCES AlarmGroup(AlarmGroupId),
    SnoozeDurationMin     INTEGER NOT NULL DEFAULT 5,
    MaxSnoozeCount        INTEGER NOT NULL DEFAULT 3,
    SoundFile             TEXT NOT NULL DEFAULT 'classic-beep',
    IsVibrationEnabled    INTEGER NOT NULL DEFAULT 0,
    IsGradualVolume       INTEGER NOT NULL DEFAULT 0,
    GradualVolumeDurationSec INTEGER NOT NULL DEFAULT 30,
    AutoDismissMin        INTEGER NOT NULL DEFAULT 15,
    ChallengeType         TEXT,
    ChallengeDifficulty   TEXT,
    ChallengeShakeCount   INTEGER,
    ChallengeStepCount    INTEGER,
    NextFireTime          TEXT,
    DeletedAt             TEXT,
    CreatedAt             TEXT NOT NULL,
    UpdatedAt             TEXT NOT NULL
);
```

### 2.2 AlarmGroup

```sql
CREATE TABLE AlarmGroup (
    AlarmGroupId  TEXT PRIMARY KEY,
    Name          TEXT NOT NULL,
    Color         TEXT NOT NULL DEFAULT '#8b7355',
    Position      INTEGER NOT NULL DEFAULT 0,
    IsEnabled     INTEGER NOT NULL DEFAULT 1
);
```

### 2.3 AlarmEvent

```sql
CREATE TABLE AlarmEvent (
    AlarmEventId          TEXT PRIMARY KEY,
    AlarmId               TEXT NOT NULL REFERENCES Alarm(AlarmId),
    Type                  TEXT NOT NULL,          -- Fired|Snoozed|Dismissed|Missed
    FiredAt               TEXT NOT NULL,
    DismissedAt           TEXT,
    SnoozeCount           INTEGER NOT NULL DEFAULT 0,
    ChallengeType         TEXT,
    ChallengeSolveTimeSec REAL,
    SleepQuality          INTEGER,               -- 1–5
    Mood                  TEXT,
    AlarmLabelSnapshot    TEXT NOT NULL DEFAULT '',
    AlarmTimeSnapshot     TEXT NOT NULL DEFAULT '',
    Timestamp             TEXT NOT NULL
);

CREATE INDEX idx_AlarmEvent_AlarmId ON AlarmEvent(AlarmId);
CREATE INDEX idx_AlarmEvent_FiredAt ON AlarmEvent(FiredAt);
```

### 2.4 AlarmSound

```sql
CREATE TABLE AlarmSound (
    AlarmSoundId  TEXT PRIMARY KEY,
    Name          TEXT NOT NULL,
    FileName      TEXT NOT NULL,
    Category      TEXT NOT NULL             -- Classic|Gentle|Nature|Digital
);
```

### 2.5 Setting

```sql
CREATE TABLE Setting (
    Key           TEXT PRIMARY KEY,
    Value         TEXT NOT NULL,
    ValueType     TEXT NOT NULL DEFAULT 'String'  -- String|Integer|Boolean|Json
);
```

### 2.6 SnoozeState

```sql
CREATE TABLE SnoozeState (
    AlarmId       TEXT PRIMARY KEY REFERENCES Alarm(AlarmId),
    SnoozeUntil   TEXT NOT NULL,
    SnoozeCount   INTEGER NOT NULL DEFAULT 1
);
```

### 2.7 Quote

```sql
CREATE TABLE Quote (
    QuoteId       TEXT PRIMARY KEY,
    Text          TEXT NOT NULL,
    Author        TEXT NOT NULL DEFAULT '',
    IsFavorite    INTEGER NOT NULL DEFAULT 0,
    IsCustom      INTEGER NOT NULL DEFAULT 0,
    CreatedAt     TEXT NOT NULL
);
```

---

## 3. Rust Structs

All structs derive `Serialize, Deserialize, Clone, Debug`. Field names use PascalCase via `#[serde(rename_all = "PascalCase")]`.

```rust
#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "PascalCase")]
pub struct Alarm {
    pub alarm_id: String,
    pub time: String,
    pub date: Option<String>,
    pub label: String,
    pub is_enabled: bool,
    pub is_previous_enabled: Option<bool>,
    pub repeat: RepeatPattern,
    pub group_id: Option<String>,
    pub snooze_duration_min: i32,
    pub max_snooze_count: i32,
    pub sound_file: String,
    pub is_vibration_enabled: bool,
    pub is_gradual_volume: bool,
    pub gradual_volume_duration_sec: i32,
    pub auto_dismiss_min: i32,
    pub challenge_type: Option<ChallengeType>,
    pub challenge_difficulty: Option<ChallengeDifficulty>,
    pub challenge_shake_count: Option<i32>,
    pub challenge_step_count: Option<i32>,
    pub next_fire_time: Option<String>,
    pub deleted_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "PascalCase")]
pub struct RepeatPattern {
    pub r#type: RepeatType,
    pub days_of_week: Vec<i32>,
    pub interval_minutes: i32,
    pub cron_expression: String,
}
```

> Apply the same pattern for AlarmGroup, AlarmEvent, AlarmSound, SnoozeState, Quote, Settings structs. See TypeScript interfaces in `src/types/alarm.ts` for exact field mapping.

### Enums

```rust
#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum RepeatType { Once, Daily, Weekly, Interval, Cron }

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum ChallengeType { Math, Memory, Shake, Typing, Qr, Steps }

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum ChallengeDifficulty { Easy, Medium, Hard }

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum AlarmEventType { Fired, Snoozed, Dismissed, Missed }

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum SoundCategory { Classic, Gentle, Nature, Digital }

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum ThemeMode { Light, Dark, System }

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum ExportFormat { Json, Csv, Ics }

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum ImportMode { Merge, Replace }

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum DuplicateAction { Skip, Overwrite, Rename }
```

---

## 4. IPC Command Registry (27 Commands)

Each command maps to a `#[tauri::command]` function.

### 4.1 Alarm Commands

| Command | Payload | Response | Description |
|---------|---------|----------|-------------|
| `list_alarms` | — | `Vec<Alarm>` | Active alarms (DeletedAt IS NULL) |
| `get_alarm` | `{ AlarmId }` | `Option<Alarm>` | Single alarm by ID |
| `create_alarm` | `Alarm` | `Alarm` | Insert + compute NextFireTime |
| `update_alarm` | `Alarm` | `Alarm` | Update + recompute NextFireTime |
| `delete_alarm` | `{ AlarmId }` | `()` | Soft-delete (set DeletedAt) |
| `toggle_alarm` | `{ AlarmId, IsEnabled }` | `Alarm` | Enable/disable + recompute |
| `reorder_alarms` | `{ AlarmIds: Vec }` | `()` | Update sort positions |
| `duplicate_alarm` | `{ AlarmId }` | `Alarm` | Clone with new ID + "(copy)" label |

### 4.2 Group Commands

| Command | Payload | Response | Description |
|---------|---------|----------|-------------|
| `list_groups` | — | `Vec<AlarmGroup>` | All groups ordered by Position |
| `create_group` | `AlarmGroup` | `AlarmGroup` | Insert new group |
| `update_group` | `AlarmGroup` | `AlarmGroup` | Update name/color/position |
| `delete_group` | `{ AlarmGroupId }` | `()` | Delete + unassign alarms |
| `toggle_group` | `{ AlarmGroupId, IsEnabled }` | `AlarmGroup` | Enable/disable all group alarms |

### 4.3 Settings Commands

| Command | Payload | Response | Description |
|---------|---------|----------|-------------|
| `get_settings` | — | `Settings` | All settings as typed struct |
| `update_settings` | `Partial<Settings>` | `Settings` | Merge partial update |

### 4.4 Sound Commands

| Command | Payload | Response | Description |
|---------|---------|----------|-------------|
| `list_sounds` | — | `Vec<AlarmSound>` | Built-in + custom sounds |
| `play_sound` | `{ FileName, Volume }` | `()` | Play via rodio |
| `stop_sound` | — | `()` | Stop current playback |

### 4.5 Snooze Commands

| Command | Payload | Response | Description |
|---------|---------|----------|-------------|
| `get_snooze_state` | `{ AlarmId }` | `Option<SnoozeState>` | Current snooze for alarm |
| `snooze_alarm` | `{ AlarmId, DurationMin }` | `SnoozeState` | Increment count, set SnoozeUntil |
| `clear_snooze` | `{ AlarmId }` | `()` | Remove snooze state |

### 4.6 Event / History Commands

| Command | Payload | Response | Description |
|---------|---------|----------|-------------|
| `list_alarm_events` | `{ Filter? }` | `Vec<AlarmEvent>` | Filtered event history |
| `create_alarm_event` | `AlarmEvent` | `AlarmEvent` | Log alarm event |
| `purge_old_events` | `{ RetentionDays }` | `i64` | Delete events older than N days |

### 4.7 Export / Import Commands

| Command | Payload | Response | Description |
|---------|---------|----------|-------------|
| `export_alarms` | `{ Format, Scope }` | `String` | JSON/CSV/ICS output |
| `import_alarms` | `{ Data, Mode, DuplicateAction }` | `ImportResult` | Parse + import |

### 4.8 System Commands

| Command | Payload | Response | Description |
|---------|---------|----------|-------------|
| `get_app_version` | — | `String` | Tauri app version |

---

## 5. Alarm Engine

### 5.1 NextFireTime Computation

```rust
/// Compute next fire time for an alarm from `now`.
/// Must handle: Once, Daily, Weekly (DaysOfWeek), Interval, Cron.
pub fn compute_next_fire_time(alarm: &Alarm, now: DateTime<Local>) -> Option<DateTime<Local>> {
    match alarm.repeat.r#type {
        RepeatType::Once => {
            // Parse alarm.time + alarm.date, return if future, else None
        }
        RepeatType::Daily => {
            // Today at alarm.time if future, else tomorrow
        }
        RepeatType::Weekly => {
            // Find next matching day in DaysOfWeek
        }
        RepeatType::Interval => {
            // now + IntervalMinutes
        }
        RepeatType::Cron => {
            // Use croner crate to compute next occurrence
        }
    }
}
```

### 5.2 Background Polling

```rust
/// Spawns a tokio task that checks every 30 seconds for due alarms.
/// When an alarm is due: emit "alarm-fired" event to frontend, play sound.
pub async fn alarm_polling_loop(app_handle: AppHandle, db: Arc<Mutex<Connection>>) {
    loop {
        tokio::time::sleep(Duration::from_secs(30)).await;
        let now = Local::now();
        let due_alarms = find_due_alarms(&db, now);
        for alarm in due_alarms {
            app_handle.emit("alarm-fired", &alarm).unwrap();
            play_alarm_sound(&alarm);
        }
    }
}
```

### 5.3 Missed Alarm Detection

On app startup, query alarms where `NextFireTime < now` and `IsEnabled = true`. Emit `alarm-missed` events for each.

---

## 6. Audio Engine (rodio)

```rust
use rodio::{Decoder, OutputStream, Sink};
use std::fs::File;
use std::io::BufReader;

pub struct AudioPlayer {
    sink: Option<Sink>,
    _stream: OutputStream,
}

impl AudioPlayer {
    /// Play a sound file with optional gradual volume ramp.
    pub fn play(&mut self, file_path: &str, gradual: bool, duration_sec: u32) {
        let file = File::open(file_path).unwrap();
        let source = Decoder::new(BufReader::new(file)).unwrap();
        let sink = Sink::try_new(&self._stream).unwrap();
        
        if gradual {
            sink.set_volume(0.0);
            // Spawn ramp task: 0.0 → 1.0 over duration_sec
        }
        
        sink.append(source);
        self.sink = Some(sink);
    }

    pub fn stop(&mut self) {
        if let Some(sink) = self.sink.take() {
            sink.stop();
        }
    }
}
```

### Built-in Sounds

Bundle 10 `.ogg` files in `src-tauri/sounds/`:
- `classic-beep.ogg`, `gentle-chime.ogg`, `morning-birds.ogg`, `digital-pulse.ogg`
- `ocean-waves.ogg`, `rain-drops.ogg`, `wind-chimes.ogg`, `bell-tower.ogg`
- `soft-piano.ogg`, `forest-stream.ogg`

---

## 7. OS Service Layer

### 7.1 Auto-Start

```rust
// Use tauri-plugin-autostart
app.plugin(tauri_plugin_autostart::init(
    MacosLauncher::LaunchAgent,
    None
))?;
```

### 7.2 System Tray

```rust
let tray_menu = Menu::with_items(&app, &[
    &MenuItem::new(&app, "Show", true, None)?,
    &MenuItem::new(&app, "Next Alarm: 07:00", false, None)?,
    &PredefinedMenuItem::separator(&app)?,
    &MenuItem::new(&app, "Quit", true, None)?,
])?;

TrayIconBuilder::new()
    .icon(app.default_window_icon().unwrap().clone())
    .menu(&tray_menu)
    .build(app)?;
```

### 7.3 Native Notifications

```rust
use tauri_plugin_notification::NotificationExt;

app.notification()
    .builder()
    .title("Alarm")
    .body(&format!("{} — {}", alarm.time, alarm.label))
    .sound("alarm_sound")
    .show()?;
```

### 7.4 Wake/Sleep Recovery

Listen for system resume events. On resume, run missed alarm detection and reschedule polling.

---

## 8. Migration Guide: Mock → Tauri

### 8.1 Replace Import

```typescript
// Before (mock):
import * as ipc from "@/lib/mock-ipc";

// After (Tauri):
import * as ipc from "@/lib/tauri-commands";
```

### 8.2 Create `tauri-commands.ts`

```typescript
import { invoke } from "@tauri-apps/api/core";
import type { Alarm, AlarmGroup, Settings, AlarmEvent, SnoozeState } from "@/types/alarm";

export async function listAlarms(): Promise<Alarm[]> {
  return invoke<Alarm[]>("list_alarms");
}

export async function createAlarm(alarm: Alarm): Promise<Alarm> {
  return invoke<Alarm>("create_alarm", { alarm });
}

export async function updateAlarm(alarm: Alarm): Promise<Alarm> {
  return invoke<Alarm>("update_alarm", { alarm });
}

export async function deleteAlarm(alarmId: string): Promise<void> {
  return invoke("delete_alarm", { alarmId });
}

export async function toggleAlarm(alarmId: string, isEnabled: boolean): Promise<Alarm> {
  return invoke<Alarm>("toggle_alarm", { alarmId, isEnabled });
}

// ... mirror all 27 commands with async invoke() calls
```

### 8.3 Store Updates

All Zustand store methods must become `async`. Update from synchronous calls to `await ipc.method()`.

### 8.4 Event Listener

```typescript
import { listen } from "@tauri-apps/api/event";

// In App.tsx or overlay store:
listen<Alarm>("alarm-fired", (event) => {
  overlayStore.getState().fireAlarm(event.payload);
});
```

---

## 9. Database Migrations

### Migration 001 — Initial Schema

Contains all 7 CREATE TABLE statements from Section 2.

### Migration 002 — Seed Sounds

```sql
INSERT INTO AlarmSound VALUES
  ('snd-01', 'Classic Beep', 'classic-beep.ogg', 'Classic'),
  ('snd-02', 'Gentle Chime', 'gentle-chime.ogg', 'Gentle'),
  ('snd-03', 'Morning Birds', 'morning-birds.ogg', 'Nature'),
  ('snd-04', 'Digital Pulse', 'digital-pulse.ogg', 'Digital'),
  ('snd-05', 'Ocean Waves', 'ocean-waves.ogg', 'Nature'),
  ('snd-06', 'Rain Drops', 'rain-drops.ogg', 'Nature'),
  ('snd-07', 'Wind Chimes', 'wind-chimes.ogg', 'Gentle'),
  ('snd-08', 'Bell Tower', 'bell-tower.ogg', 'Classic'),
  ('snd-09', 'Soft Piano', 'soft-piano.ogg', 'Gentle'),
  ('snd-10', 'Forest Stream', 'forest-stream.ogg', 'Nature');
```

### Migration 003 — Seed Default Settings

```sql
INSERT INTO Setting VALUES
  ('Theme', 'System', 'String'),
  ('ThemeSkin', 'default', 'String'),
  ('AccentColor', '#8b7355', 'String'),
  ('Is24Hour', 'false', 'Boolean'),
  ('DefaultSnoozeDurationMin', '5', 'Integer'),
  ('DefaultMaxSnoozeCount', '3', 'Integer'),
  ('AutoDismissMin', '15', 'Integer'),
  ('EventRetentionDays', '90', 'Integer'),
  ('IsGradualVolumeEnabled', 'false', 'Boolean'),
  ('GradualVolumeDurationSec', '30', 'Integer'),
  ('Language', 'en', 'String'),
  ('DefaultSound', 'classic-beep', 'String'),
  ('BedtimeEnabled', 'false', 'Boolean'),
  ('BedtimeTime', '22:30', 'String'),
  ('BedtimeReminderMinBefore', '30', 'Integer'),
  ('SleepGoalHours', '8', 'Integer');
```

---

## 10. File Structure (src-tauri/)

```
src-tauri/
├── Cargo.toml
├── tauri.conf.json
├── sounds/                    # 10 built-in .ogg files
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_seed_sounds.sql
│   └── 003_seed_settings.sql
└── src/
    ├── main.rs                # Tauri app setup, plugin registration
    ├── db.rs                  # Database init, migration runner
    ├── models/
    │   ├── mod.rs
    │   ├── alarm.rs           # Alarm, RepeatPattern structs
    │   ├── group.rs           # AlarmGroup struct
    │   ├── event.rs           # AlarmEvent struct
    │   ├── settings.rs        # Settings struct + key-value helpers
    │   ├── sound.rs           # AlarmSound struct
    │   ├── snooze.rs          # SnoozeState struct
    │   └── enums.rs           # All domain enums
    ├── commands/
    │   ├── mod.rs
    │   ├── alarm_commands.rs  # 8 alarm CRUD commands
    │   ├── group_commands.rs  # 5 group commands
    │   ├── settings_commands.rs
    │   ├── sound_commands.rs
    │   ├── snooze_commands.rs
    │   ├── event_commands.rs
    │   ├── export_commands.rs
    │   └── system_commands.rs
    ├── engine/
    │   ├── mod.rs
    │   ├── scheduler.rs       # NextFireTime computation
    │   ├── polling.rs         # Background 30s alarm check loop
    │   └── missed.rs          # Missed alarm detection on startup
    ├── audio/
    │   ├── mod.rs
    │   └── player.rs          # rodio playback + gradual volume
    └── os/
        ├── mod.rs
        ├── autostart.rs       # Auto-launch configuration
        ├── tray.rs            # System tray icon + menu
        └── notifications.rs   # Native notification dispatch
```

---

## 11. Testing Strategy

| Layer | Tool | Coverage |
|-------|------|----------|
| Rust unit tests | `cargo test` | Structs, NextFireTime, enum serde |
| DB integration | rusqlite in-memory | CRUD operations, migrations |
| IPC integration | Tauri test utils | Command round-trips |
| Frontend E2E | Playwright | Full app flows with real backend |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Data Model Spec | `spec/15-alarm-app/01-fundamentals/01-data-model.md` |
| IPC Registry | `spec/15-alarm-app/01-fundamentals/08-ipc-command-registry.md` |
| Design System | `spec/15-alarm-app/02-design-system.md` |
| Implementation Plan | `spec/15-alarm-app/15-implementation-plan.md` |
| Mock IPC Source | `src/lib/mock-ipc.ts` |
| TypeScript Types | `src/types/alarm.ts` |

---

*Rust Backend Implementation Plan v1.0.0 — 2026-04-11*
