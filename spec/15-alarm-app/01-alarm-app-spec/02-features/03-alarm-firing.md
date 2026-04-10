# Alarm Firing

**Version:** 1.12.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 — Must Have  
**Resolves:** BE-QUEUE-001, UX-DST-001, UX-TZ-001, BE-WAKE-001, FE-OVERLAY-001

---

## Keywords

`firing`, `trigger`, `overlay`, `dismiss`, `audio`, `notification`, `native`, `missed-alarm`, `auto-dismiss`, `next-fire-time`

---
---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ✅ |


## Description

When the current time matches an enabled alarm's `NextFireTime`, the alarm fires. A full-screen overlay appears with the alarm label, and native audio plays. The user can dismiss or snooze. Missed alarms are detected on app launch and system wake.

---

## Firing Logic

1. Rust backend runs a dedicated background thread with a **30-second check interval**
2. Query: `SELECT * FROM Alarms WHERE NextFireTime <= now AND IsEnabled = 1 AND DeletedAt IS NULL`
3. For each matched alarm:
   a. Rust triggers native audio playback (via `rodio` or platform audio API)
   b. Rust emits an `alarm-fired` event to the frontend via Tauri IPC
   c. Frontend shows full-screen `AlarmOverlay` with alarm label
   d. Rust dispatches OS-native notification (via Tauri notification plugin)
   e. Insert `AlarmEvents` row with `Type = AlarmEventType::Fired`
4. After firing: Rust recomputes `NextFireTime` based on `repeat` pattern
    - `RepeatType::Once` → set `IsEnabled = 0`, `NextFireTime = NULL`
   - `RepeatType::Daily` → advance by 24 hours (DST-aware — see DST section below)
    - `RepeatType::Weekly` → advance to next matching day (DST-aware)
    - `RepeatType::Interval` → advance by `IntervalMinutes`
    - `RepeatType::Cron` → compute next from cron expression (via `croner` crate)

---

## DST & Timezone-Aware Firing

> **Resolves UX-DST-001 and UX-TZ-001.** Without this, alarms fire at wrong times during DST transitions or when traveling.

### Core Principle

Alarms are defined in **local time** (`HH:MM`). The `NextFireTime` is stored as **UTC**. The Rust backend converts between them using the IANA timezone from the `Settings` table.

### NextFireTime Computation (Rust Pseudocode)

```rust
/// Entry point — delegates to type-specific handlers (each ≤15 lines)
fn compute_next_fire_time(
    alarm_time: NaiveTime,
    alarm_date: Option<NaiveDate>,
    repeat: &RepeatPattern,
    timezone: &Tz,
    now: DateTime<Utc>,
) -> Option<DateTime<Utc>> {
    let now_local = now.with_timezone(timezone);
    match repeat.r#type {
        RepeatType::Once => compute_once(alarm_time, alarm_date, &now_local, timezone),
        RepeatType::Daily => compute_daily(alarm_time, &now_local, now, timezone),
        RepeatType::Weekly => compute_weekly(alarm_time, repeat, &now_local, now, timezone),
        RepeatType::Interval => Some(now + Duration::minutes(repeat.interval_minutes as i64)),
        RepeatType::Cron => compute_cron(&repeat.cron_expression, &now_local, timezone),
    }
}

fn compute_once(
    alarm_time: NaiveTime,
    alarm_date: Option<NaiveDate>,
    now_local: &DateTime<Tz>,
    timezone: &Tz,
) -> Option<DateTime<Utc>> {
    let target_date = alarm_date.unwrap_or_else(|| {
        let today = now_local.date_naive();
        if alarm_time > now_local.time() { today } else { today + Duration::days(1) }
    });
    resolve_local_to_utc(target_date, alarm_time, timezone)
}

fn compute_daily(
    alarm_time: NaiveTime,
    now_local: &DateTime<Tz>,
    now: DateTime<Utc>,
    timezone: &Tz,
) -> Option<DateTime<Utc>> {
    let today = now_local.date_naive();
    let candidate = resolve_local_to_utc(today, alarm_time, timezone);
    match candidate {
        Some(t) if t > now => Some(t),
        _ => resolve_local_to_utc(today + Duration::days(1), alarm_time, timezone),
    }
}

fn compute_weekly(
    alarm_time: NaiveTime,
    repeat: &RepeatPattern,
    now_local: &DateTime<Tz>,
    now: DateTime<Utc>,
    timezone: &Tz,
) -> Option<DateTime<Utc>> {
    for offset in 0..=7 {
        let date = now_local.date_naive() + Duration::days(offset);
        let weekday_num = date.weekday().num_days_from_sunday();
        if !repeat.days_of_week.contains(&(weekday_num as u8)) { continue; }
        if let Some(t) = resolve_local_to_utc(date, alarm_time, timezone) {
            if t > now { return Some(t); }
        }
    }
    None
}

fn compute_cron(
    cron_expr: &str,
    now_local: &DateTime<Tz>,
    timezone: &Tz,
) -> Option<DateTime<Utc>> {
    let cron = Cron::new(cron_expr).parse().ok()?;
    cron.find_next_occurrence(&now_local.naive_local(), false)
        .and_then(|naive| resolve_local_to_utc(naive.date(), naive.time(), timezone))
}
```

### DST Resolution Function

```rust
/// Convert a local date+time to UTC, handling DST edge cases.
fn resolve_local_to_utc(
    date: NaiveDate,
    time: NaiveTime,
    tz: &Tz,
) -> Option<DateTime<Utc>> {
    let naive_dt = NaiveDateTime::new(date, time);
    match tz.from_local_datetime(&naive_dt) {
        LocalResult::Single(dt) => Some(dt.with_timezone(&Utc)),
        LocalResult::Ambiguous(first, _) => Some(handle_fall_back(first, date, time)),
        LocalResult::None => handle_spring_forward(date, time, tz),
    }
}

/// FALL-BACK: time occurs twice → use the FIRST occurrence
fn handle_fall_back(first: DateTime<Tz>, date: NaiveDate, time: NaiveTime) -> DateTime<Utc> {
    tracing::info!(date = %date, time = %time, "DST fall-back: using first occurrence");
    first.with_timezone(&Utc)
}

/// SPRING-FORWARD: time doesn't exist → advance minute-by-minute until valid
fn handle_spring_forward(date: NaiveDate, skipped_time: NaiveTime, tz: &Tz) -> Option<DateTime<Utc>> {
    // Walk forward from the skipped time to find the first valid local minute
    let mut candidate = skipped_time;
    for _ in 0..120 {
        candidate = candidate + chrono::Duration::minutes(1);
        let naive_dt = NaiveDateTime::new(date, candidate);
        match tz.from_local_datetime(&naive_dt) {
            LocalResult::Single(dt) => {
                tracing::warn!(date = %date, skipped = %skipped_time, resolved = %candidate,
                    "DST spring-forward: advanced to next valid minute");
                return Some(dt.with_timezone(&Utc));
            }
            LocalResult::Ambiguous(dt, _) => {
                return Some(dt.with_timezone(&Utc));
            }
            LocalResult::None => continue, // still in the gap
        }
    }
    tracing::error!(date = %date, "DST spring-forward: no valid time found within 2 hours");
    None
}
```

### Timezone Change Detection

```rust
/// Called on each alarm engine tick and on OS timezone change event
fn on_timezone_change(conn: &Connection, new_tz: &Tz) {
    // 1. Update settings table
    update_setting(conn, "SystemTimezone", new_tz.name());

    // 2. Recalculate nextFireTime for ALL enabled alarms
    let alarms = get_enabled_alarms(conn);
    for alarm in &alarms {
        let new_next = compute_next_fire_time(
            alarm.time, alarm.date, &alarm.repeat_pattern(), new_tz, Utc::now()
        );
        update_next_fire_time(conn, &alarm.alarm_id, new_next);
    }

    tracing::info!(timezone = %new_tz, count = alarms.len(), "Recalculated all alarm times");
}
```

### DST Test Cases

| Scenario | Input | Expected |
|----------|-------|----------|
| Spring-forward: 2:30 AM skipped (US) | `time=02:30`, DST jumps 2:00→3:00 | Fire at 3:00 AM (next valid minute) |
| Spring-forward: 1:30 AM skipped (EU) | `time=01:30`, DST jumps 1:00→2:00 | Fire at 2:00 AM (next valid minute) |
| Fall-back: 1:30 AM occurs twice | `time=01:30`, DST falls back 2:00→1:00 | Fire at first 1:30 AM only |
| Normal day | `time=07:00`, no DST | Fire at 07:00 local = correct UTC |
| No DST timezone (e.g., MYT) | `time=07:00`, no DST ever | Fire at 07:00 local = correct UTC |
| Timezone change: KUL→LON | `time=07:00`, tz changes | `NextFireTime` recalculated for London |
| Daily alarm across DST boundary | `time=02:30`, repeating daily | Skipped day fires at 3:00, next day fires at 2:30 normally |

---

## Missed Alarm Recovery (Critical Feature)

This is the most important reliability feature. Desktop computers sleep, shut down, and resume — alarms must never be silently lost.

### Strategy

1. **Persist `NextFireTime`** for every enabled alarm in SQLite
2. **On app launch:** query all alarms where `NextFireTime < now AND IsEnabled = 1 AND DeletedAt IS NULL` → fire missed alarm notifications
3. **On system wake:** same check via OS power event listener (see Platform Wake-Event Listeners below)
4. **On every 30s tick:** check if any alarm's `NextFireTime <= now`
5. **After firing:** update `NextFireTime` based on repeat pattern, or disable if one-time

### Platform Wake-Event Listeners

> **Resolves BE-WAKE-001.** No Tauri plugin exists for system sleep/wake events. Platform-specific Rust FFI is required.

#### Architecture

```rust
// src-tauri/src/engine/wake_listener.rs

/// Trait for platform-specific wake detection
pub trait WakeListener: Send + 'static {
    /// Start listening for wake events. Calls `on_wake` when system resumes.
    fn start(&self, on_wake: Box<dyn Fn() + Send + Sync>) -> Result<(), AlarmAppError>;
    /// Stop listening (cleanup)
    fn stop(&self);
}

/// Factory: returns the correct listener for the current platform
pub fn create_wake_listener() -> Box<dyn WakeListener> {
    #[cfg(target_os = "macos")]
    { Box::new(macos::MacOsWakeListener::new()) }

    #[cfg(target_os = "windows")]
    { Box::new(windows::WindowsWakeListener::new()) }

    #[cfg(target_os = "linux")]
    { Box::new(linux::LinuxWakeListener::new()) }
}
```

#### macOS — `NSWorkspace` Notifications

```rust
// src-tauri/src/engine/wake_listener/macos.rs
use objc2::runtime::*;
use objc2_foundation::*;
use objc2_app_kit::NSWorkspace;

/// Internal platform struct — not serialized to frontend (no serde needed).
pub struct MacOsWakeListener;

impl MacOsWakeListener {
    pub fn new() -> Self { Self }
}

impl WakeListener for MacOsWakeListener {
    fn start(&self, on_wake: Box<dyn Fn() + Send + Sync>) -> Result<(), AlarmAppError> {
        let workspace = unsafe { NSWorkspace::sharedWorkspace() };
        let center = unsafe { workspace.notificationCenter() };
        register_wake_observer(&center, on_wake);
        register_sleep_observer(&center);
        Ok(())
    }

    fn stop(&self) { /* Remove observers on shutdown */ }
}

fn register_wake_observer(center: &NSNotificationCenter, on_wake: Box<dyn Fn() + Send + Sync>) {
    unsafe {
        center.addObserverForName_object_queue_usingBlock(
            Some(ns_string!("NSWorkspaceDidWakeNotification")),
            None, None,
            &Block::new(move |_: &NSNotification| {
                tracing::info!("macOS: System woke from sleep");
                on_wake();
            }),
        );
    }
}

fn register_sleep_observer(center: &NSNotificationCenter) {
    unsafe {
        center.addObserverForName_object_queue_usingBlock(
            Some(ns_string!("NSWorkspaceWillSleepNotification")),
            None, None,
            &Block::new(|_: &NSNotification| {
                tracing::info!("macOS: System entering sleep");
            }),
        );
    }
}
```

#### Windows — `WM_POWERBROADCAST`

```rust
// src-tauri/src/engine/wake_listener/windows.rs
use windows::Win32::System::Power::*;
use windows::Win32::UI::WindowsAndMessaging::*;

/// Internal platform struct — not serialized to frontend (no serde needed).
pub struct WindowsWakeListener {
    hwnd: Option<HWND>,
}

impl WindowsWakeListener {
    pub fn new() -> Self { Self { hwnd: None } }
}

impl WakeListener for WindowsWakeListener {
    fn start(&self, on_wake: Box<dyn Fn() + Send + Sync>) -> Result<(), AlarmAppError> {
        // Create a hidden message-only window to receive power events
        std::thread::spawn(move || {
            // Register window class + create message-only window
            // In the window proc:
            unsafe {
                // Window procedure handles WM_POWERBROADCAST
                // match msg {
                //     WM_POWERBROADCAST => {
                //         if wparam == PBT_APMRESUMEAUTOMATIC
                //            || wparam == PBT_APMRESUMESUSPEND {
                //             tracing::info!("Windows: System resumed from sleep");
                //             on_wake();
                //         }
                //     }
                // }
            }
        });
        Ok(())
    }

    fn stop(&self) {
        // Destroy hidden window
    }
}
```

**Windows power events to handle:**

| Event | Constant | When |
|-------|----------|------|
| Resume (automatic) | `PBT_APMRESUMEAUTOMATIC` | System wakes from sleep/hibernate (no user action) |
| Resume (user) | `PBT_APMRESUMESUSPEND` | System wakes from user-initiated sleep |
| Suspend | `PBT_APMSUSPEND` | System entering sleep (log only) |

#### Linux — `systemd-logind` D-Bus Signal

```rust
// src-tauri/src/engine/wake_listener/linux.rs
use zbus::{Connection, proxy};

#[proxy(
    interface = "org.freedesktop.login1.Manager",
    default_service = "org.freedesktop.login1",
    default_path = "/org/freedesktop/login1"
)]
trait Login1Manager {
    /// Signal emitted before sleep (true) and after wake (false)
    #[zbus(signal)]
    fn prepare_for_sleep(&self, start: bool);
}

pub struct LinuxWakeListener;

impl LinuxWakeListener {
    pub fn new() -> Self { Self }
}

impl WakeListener for LinuxWakeListener {
    fn start(&self, on_wake: Box<dyn Fn() + Send + Sync>) -> Result<(), AlarmAppError> {
        tokio::spawn(async move {
            let connection = match Connection::system().await {
                Ok(c) => c,
                Err(e) => {
                    tracing::warn!(error = %e, "D-Bus unavailable — sleep detection disabled on Linux");
                    return;
                }
            };

            let proxy = match Login1ManagerProxy::new(&connection).await {
                Ok(p) => p,
                Err(e) => {
                    tracing::warn!(error = %e, "login1 proxy failed — sleep detection disabled");
                    return;
                }
            };

            let mut stream = match proxy.receive_prepare_for_sleep().await {
                Ok(s) => s,
                Err(e) => {
                    tracing::warn!(error = %e, "PrepareForSleep subscription failed");
                    return;
                }
            };

            while let Some(signal) = stream.next().await {
                let args = match signal.args() {
                    Ok(a) => a,
                    Err(e) => {
                        tracing::warn!(error = %e, "Failed to parse PrepareForSleep args");
                        continue;
                    }
                };
                let is_waking = !args.start; // D-Bus protocol: start=false means woke up (exempt: external API)
                if is_waking {
                    tracing::info!("Linux: System woke from sleep (PrepareForSleep=false)");
                    on_wake();
                } else {
                    tracing::info!("Linux: System entering sleep (PrepareForSleep=true)");
                }
            }
        });
        Ok(())
    }

    fn stop(&self) {}
}
```

#### Integration with Alarm Engine

```rust
// In main.rs setup, after alarm engine starts (Step 7 of startup sequence):
let engine_clone = engine.clone();
let wake_listener = create_wake_listener();
wake_listener.start(Box::new(move || {
    // On wake: trigger immediate missed alarm check
    let engine = engine_clone.clone();
    tokio::spawn(async move {
        tracing::info!("Wake detected — running missed alarm check");
        engine.check_missed_alarms().await;
    });
}))?;
```

#### File Structure Addition

```
src-tauri/src/engine/
  wake_listener/
    mod.rs                    — WakeListener trait + factory
    macos.rs                  — NSWorkspace implementation
    windows.rs                — WM_POWERBROADCAST implementation
    linux.rs                  — systemd-logind D-Bus implementation
```

### Missed Alarm UI

- Missed alarms show with a distinct "Missed Alarm" badge in the overlay
- Display: alarm label + original scheduled time + "Missed at HH:MM"
- Log as `Type = AlarmEventType::Missed` in `AlarmEvents` table
- Recalculate `NextFireTime` for repeating alarms

### Guarantee

> If the computer was off from 6:00 AM to 9:00 AM and an alarm was set for 7:00 AM, the user sees "Missed Alarm: 7:00 AM — [label]" immediately at 9:00 AM.

---

## Auto-Dismiss

- Optional per-alarm setting: `AutoDismissMin` (0 = manual dismiss only, 1–60 minutes)
- If an alarm fires and is not dismissed/snoozed within N minutes, it auto-dismisses
- Audio stops, overlay closes, event logged as `Type = AlarmEventType::Dismissed` with note `auto`
- Default: 0 (manual dismiss only) — user must manually dismiss

---

## AlarmOverlay UI

| Element | Description |
|---------|-------------|
| Alarm label | Large text showing the alarm's label |
| Current time | Displayed prominently |
| Scheduled time | Original fire time (important for missed alarms) |
| Missed badge | "MISSED" indicator if alarm was missed during sleep |
| Dismiss button | Stops audio, closes overlay |
| Snooze button | Stops audio, schedules re-fire (hidden when max snooze reached) |
| Auto-dismiss countdown | Progress bar if auto-dismiss is enabled |
| Queue badge | Shows "N more alarms pending" when queue has items |

### AlarmOverlay Lifecycle (Resolves FE-OVERLAY-002)

The overlay is a **separate Tauri window** created by the Rust backend, not a CSS overlay or portal within the main window. This ensures the overlay appears even when the main window is minimized or closed to tray.

#### State Machine

```
[Hidden] ──alarm-fired──→ [Creating Window] ──window ready──→ [Visible/Active]
                                                                    │
                           ┌──dismiss───────────────────────────────┘
                           │         │
                           ▼         ▼
                    [Closing]   [Transitioning]──next in queue──→ [Visible/Active]
                        │
                        ▼
                    [Hidden]
```

#### Lifecycle Steps

1. **Trigger:** Rust `AlarmEngine` detects due alarm → emits `alarm-fired` event via Tauri
2. **Window creation:** Rust creates overlay window via `WindowBuilder`:
   - `always_on_top: true`, `decorations: false`, `resizable: false`, `fullscreen: true`
   - Positioned on active monitor (or primary if app is in tray)
3. **Frontend mount:** `AlarmOverlay.tsx` mounts inside the overlay window, reads `useOverlayStore().activeAlarm`
4. **Audio start:** Rust starts audio playback via `rodio` immediately after emitting event (does not wait for window)
5. **User action:** Dismiss or snooze → frontend calls IPC → Rust stops audio → frontend updates store
6. **Queue progression:** `useOverlayStore.dismissCurrent()` pops next alarm from queue or closes window if empty
7. **Window destruction:** When queue is empty and active alarm dismissed → Rust destroys overlay window

#### Ownership Rules

| Concern | Owner | Rationale |
|---------|-------|-----------|
| AlarmQueue (pending + active) | **Rust backend** (`AlarmEngine`) | Must survive frontend reload, ensures reliability |
| Queue mirror for UI | **Frontend** (`useOverlayStore`) | Read-only mirror synced via IPC events for rendering |
| Overlay window lifecycle | **Rust backend** | Window creation/destruction requires Tauri API |
| Overlay content rendering | **Frontend** (React) | UI rendering in WebView |
| Audio playback | **Rust backend** | Native audio via `rodio`, not subject to WebView limitations |
| Auto-dismiss timer | **Rust backend** | Timer must fire even if frontend is unresponsive |

#### IPC Sync Protocol

```
Rust AlarmEngine                    Frontend OverlayStore
     │                                      │
     ├──emit("alarm-fired", alarm)─────────→│ showOverlay() or enqueueAlarm()
     │                                      │
     │←──invoke("dismiss_alarm", id)────────┤ User clicks Dismiss
     ├──emit("alarm-dismissed", id)────────→│ dismissCurrent() → show next or close
     │                                      │
     │←──invoke("snooze_alarm", id, dur)────┤ User clicks Snooze
     ├──emit("alarm-snoozed", id)──────────→│ dismissCurrent() → show next or close
     │                                      │
     ├──emit("alarm-fired", id)────────────→│ Snooze expired → enqueueAlarm() or showOverlay()
     │                                      │
     ├──emit("queue-updated", {len})───────→│ Update badge count
     │                                      │
```

### Multi-Monitor Behavior (Resolves FE-OVERLAY-001)

- **App visible on a monitor:** Overlay appears on the same monitor as the app window, using `WebviewWindow::current_monitor()` bounds
- **App minimized to tray:** Overlay appears on the **primary monitor** via `Monitor::primary()`
- **Overlay window:** Created with `fullscreen: true` on the target monitor. Uses Tauri `WindowBuilder::position(x, y).inner_size(w, h)` matching monitor bounds
- **All platforms:** Overlay window is `always_on_top: true`, `decorations: false`, `resizable: false`

---

## Acceptance Criteria

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
- [ ] Missed alarms logged with `Type = AlarmEventType::Missed` in `AlarmEvents`
- [ ] Auto-dismiss stops alarm after configured minutes if unacknowledged
- [ ] Only one alarm overlay can be active at a time (queue if multiple fire simultaneously)
- [ ] Queued alarms fire in FIFO order (earliest `NextFireTime` first)
- [ ] Queue badge shows count of pending alarms on overlay

---

## Simultaneous Alarms (Queue System)

> **Resolves BE-QUEUE-001, UX-003.** Defines behavior when two or more alarms fire within the same 30s check interval.

### Ownership (Resolves UX-003)

The **Rust backend** (`AlarmEngine`) is the authoritative owner of the alarm queue. The frontend `useOverlayStore` maintains a **read-only mirror** synced via IPC events (`alarm-fired`, `alarm-dismissed`, `alarm-snoozed`, `queue-updated`). This ensures the queue survives frontend reloads and accurately reflects backend state.

### Problem

The 30-second check interval may match multiple alarms. Without queue rules, AI implementations will either render multiple overlays (broken) or drop subsequent alarms (data loss).

### Queue Rules

1. **Detection:** On each 30s tick, query returns all alarms where `NextFireTime <= now AND IsEnabled = 1`
2. **Ordering:** Sort matched alarms by `NextFireTime ASC` (earliest first), then `CreatedAt ASC` (tiebreaker)
3. **Immediate logging:** ALL matched alarms insert `AlarmEvents` row with `Type = AlarmEventType::Fired` immediately — do not wait for overlay display
4. **Overlay sequencing:** Show only the first alarm's overlay. Queue the rest in memory
5. **Progression:** When user dismisses or snoozes the current overlay → show next alarm from queue
6. **Auto-dismiss:** Each queued alarm's `AutoDismissMin` timer starts when its overlay is shown (not when it enters the queue)
7. **Audio:** Audio plays for the currently displayed alarm only. When progressing to next, restart audio with next alarm's sound

### Queue Data Structure

```rust
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "PascalCase")]
struct AlarmQueue {
    /// Ordered FIFO queue of alarms waiting to display overlay
    pending: VecDeque<FiredAlarm>,
    /// Currently displayed alarm (if any)
    active: Option<FiredAlarm>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "PascalCase")]
struct FiredAlarm {
    alarm_id: String,
    label: String,
    sound_file: String,
    fire_time: DateTime<Utc>,     // Original scheduled time
    fired_at: DateTime<Utc>,      // Actual fire time
    auto_dismiss_min: u32,        // 0 = manual dismiss only
    is_missed: bool,              // true if fire_time < app_launch_time
}
```

### Queue UI Indicator

When `pending.len() > 0`, show a badge on the `AlarmOverlay`:

```
┌──────────────────────────────────┐
│          🔔 ALARM                │
│                                  │
│     "Morning Workout"           │
│        7:00 AM                   │
│                                  │
│  ┌──────────┐  ┌──────────┐     │
│  │ Dismiss  │  │  Snooze  │     │
│  └──────────┘  └──────────┘     │
│                                  │
│     ┌─────────────────────┐     │
│     │ 2 more alarms pending│    │
│     └─────────────────────┘     │
└──────────────────────────────────┘
```

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| 5+ alarms fire at once | All queued, processed FIFO. No limit on queue size |
| Snooze alarm A, alarm B is next | Show alarm B overlay. Alarm A re-enters queue when snooze expires |
| All queued alarms auto-dismissed | Queue drains, overlay closes, normal state resumes |
| New alarm fires while queue active | Append to end of queue |
| App closed while queue active | All unacknowledged alarms → `missed` on next launch (Step 8 of startup) |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Snooze System | `./04-snooze-system.md` |
| Sound & Vibration | `./05-sound-and-vibration.md` |
| Platform Constraints | `../01-fundamentals/04-platform-constraints.md` |
| Startup Sequence | `../01-fundamentals/07-startup-sequence.md` |
| Dismissal Challenges | `./06-dismissal-challenges.md` |
| Data Model | `../01-fundamentals/01-data-model.md` |
| Analytics | `./13-analytics.md` |
| App Issues | `../03-app-issues/03-backend-issues.md` → BE-QUEUE-001 |
