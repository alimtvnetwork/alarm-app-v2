# Platform-Specific Implementation & Concurrency Safety Guide

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**Purpose:** Eliminate the remaining 10–15% implementation risk by providing platform-exact guidance, async safety patterns, and error recovery strategies  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`platform`, `concurrency`, `async`, `race-condition`, `macos`, `windows`, `linux`, `error-handling`, `safety`

---

## 1. Platform-Specific Implementation Matrix

### 1.1 macOS-Specific Requirements

| Component | Implementation | Crate/API | Risk | Notes |
|-----------|---------------|-----------|:----:|-------|
| Wake detection | `NSWorkspaceDidWakeNotification` via `objc2` | `objc2 = "0.5"`, `objc2-foundation`, `objc2-app-kit` | 🔴 | Must run on main thread. Use `Block::new()` for callback |
| Audio session | `AVAudioSession::Playback + DuckOthers` | `objc2-av-foundation` | 🔴 | Set BEFORE first audio play. Call at startup Step 6a |
| App data dir | `~/Library/Application Support/com.alarm-app/` | `app_handle.path().app_data_dir()` | 🟢 | Tauri handles this |
| Code signing | Developer ID + notarization via `xcrun notarytool` | Apple Developer Program | 🔴 | **Human task.** See `08-devops-setup-guide.md` |
| System tray | NSStatusItem via `tauri-plugin-system-tray` | Tauri plugin | 🟢 | Standard Tauri API |
| WebView | Safari WebKit (system version) | — | 🟡 | `backdrop-filter` supported. Test with `@supports` |

#### macOS Gotchas

```rust
// GOTCHA 1: objc2 wake listener must keep the observer alive
// Store the observer handle or it gets deallocated immediately
let observer = center.addObserverForName_object_queue_usingBlock(...);
// KEEP `observer` in a struct field — do NOT let it drop

// GOTCHA 2: AVAudioSession must be configured before first Sink creation
// Wrong: create Sink → configure session → play
// Right: configure session → create Sink → play
configure_audio_session()?;  // Step 6a
// ... later, when alarm fires:
let sink = Sink::try_new(&stream_handle)?;

// GOTCHA 3: notarization requires hardened runtime
// In tauri.conf.json:
// "macOS": { "hardenedRuntime": true }
```

### 1.2 Windows-Specific Requirements

| Component | Implementation | Crate/API | Risk | Notes |
|-----------|---------------|-----------|:----:|-------|
| Wake detection | `WM_POWERBROADCAST` via hidden window | `windows = "0.58"` with `Win32_System_Power` | 🔴 | Must create message-only window on separate thread |
| Audio session | None required | `rodio` uses WASAPI | 🟢 | Plays independently of focus |
| App data dir | `%APPDATA%/com.alarm-app/` | `app_handle.path().app_data_dir()` | 🟢 | Tauri handles this |
| Code signing | EV certificate or Azure Trusted Signing | signtool.exe / Azure | 🔴 | **Human task** |
| System tray | Win32 NotifyIcon via Tauri plugin | Tauri plugin | 🟢 | Standard API |
| WebView | WebView2 (Chromium) — evergreen | — | 🟢 | Full modern CSS support |

#### Windows Gotchas

```rust
// GOTCHA 1: WM_POWERBROADCAST requires a HWND — create a message-only window
// Use HWND_MESSAGE as parent to create an invisible window
let hwnd = CreateWindowExW(
    WINDOW_EX_STYLE::default(),
    class_name, window_name,
    WINDOW_STYLE::default(),
    0, 0, 0, 0,
    HWND_MESSAGE,  // <-- Message-only window
    None, None, None,
);

// GOTCHA 2: The message loop must run on its own thread
// Main thread is owned by Tauri — spawn a dedicated thread
std::thread::spawn(move || {
    let mut msg = MSG::default();
    unsafe {
        while GetMessageW(&mut msg, None, 0, 0).as_bool() {
            DispatchMessageW(&msg);
        }
    }
});

// GOTCHA 3: PBT_APMRESUMEAUTOMATIC fires BEFORE user interaction
// PBT_APMRESUMESUSPEND fires AFTER user action — handle BOTH
```

### 1.3 Linux-Specific Requirements

| Component | Implementation | Crate/API | Risk | Notes |
|-----------|---------------|-----------|:----:|-------|
| Wake detection | `PrepareForSleep(false)` D-Bus signal from `systemd-logind` | `zbus = "4"` | 🔴 | Requires system D-Bus. Wayland compositors may differ |
| Audio session | PulseAudio/PipeWire `media.role=alarm` | `rodio` (automatic) | 🟢 | Handled by CPAL backend |
| App data dir | `~/.local/share/com.alarm-app/` | `app_handle.path().app_data_dir()` | 🟢 | Tauri handles this |
| Build deps | `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf` | apt | 🟡 | CI must install these |
| System tray | AppIndicator / StatusNotifierItem | Tauri plugin | 🟡 | Varies by DE (GNOME needs extension) |
| WebView | WebKitGTK (distro version) | — | 🔴 | **Most restrictive.** No `backdrop-filter` on older versions |

#### Linux Gotchas

```rust
// GOTCHA 1: zbus async proxy must run on tokio runtime
// Use tokio::spawn, not std::thread::spawn
tokio::spawn(async move {
    let conn = Connection::system().await.expect("D-Bus connect failed");
    let proxy = Login1ManagerProxy::new(&conn).await.expect("proxy failed");
    // ...
});

// GOTCHA 2: systemd-logind may not exist on all distros
// Gracefully handle: if D-Bus connect fails, log warning and continue without wake detection
match Connection::system().await {
    Ok(conn) => { /* register listener */ },
    Err(e) => {
        tracing::warn!("D-Bus unavailable: {e}. Wake detection disabled on this system.");
    }
}

// GOTCHA 3: WebKitGTK CSS — always use @supports
// Never assume backdrop-filter, container-queries, or color-mix() work
```

#### Linux CI Setup (exact apt packages)

```bash
sudo apt-get update
sudo apt-get install -y \
    libwebkit2gtk-4.1-dev \
    libappindicator3-dev \
    librsvg2-dev \
    patchelf \
    libssl-dev \
    libgtk-3-dev
```

---

## 2. Async & Concurrency Safety

### 2.1 Identified Async Tasks

| Task | Runtime | Thread | Concern |
|------|---------|--------|---------|
| Alarm engine (30s tick) | `tokio::spawn` | Background | Must never crash. `match` all errors |
| Snooze timer | `tokio::time::sleep_until` | Per-snooze task | Must check cancellation after wake |
| Soft-delete timer | `tokio::spawn` + `sleep(5s)` | Per-delete | Race: undo vs hard-delete |
| Wake listener callback | Platform-specific | OS event thread | Must cross thread boundary safely |
| Gradual volume ramp | `tokio::time::interval(100ms)` | Per-alarm | Must stop when alarm dismissed |
| SQLite writes | `rusqlite` | Single writer | WAL mode + `busy_timeout=5000` |
| Frontend IPC | `invoke()` → Tauri → Rust | Tauri IPC thread | 5s timeout via `safeInvoke()` |

### 2.2 Race Condition Safeguards

#### Race 1: Undo vs Hard-Delete

```
User deletes alarm A → backend starts 5s timer
User deletes alarm B → backend starts 5s timer  
User clicks "Undo A" at t=3s → must cancel A's timer, NOT B's
```

**Safeguard:** Each delete generates a unique `undo_token` (UUID). The hard-delete query is:
```sql
DELETE FROM alarms WHERE id = ? AND deleted_at IS NOT NULL
```
This is idempotent — if undo already cleared `deleted_at`, the DELETE affects 0 rows.

#### Race 2: Alarm Fire During Edit

```
User is editing alarm at t=07:29:55
Alarm engine fires alarm at t=07:30:00
User saves edit at t=07:30:02 → overwrites NextFireTime
```

**Safeguard:** Use `UpdatedAt` optimistic locking:
```rust
// On update: include WHERE UpdatedAt = {expected}
let rows = conn.execute(
    "UPDATE alarms SET Time=?, ..., UpdatedAt=? WHERE AlarmId=? AND UpdatedAt=?",
    params![new_time, new_updated_at, alarm_id, expected_updated_at],
)?;

if rows == 0 {
    // Alarm was modified by engine — reload and retry
    return Err(AlarmAppError::ConcurrentModification);
}
```

#### Race 3: Snooze Expiry After Dismiss

```
Alarm fires → user snoozes (5 min) → snooze task sleeping
User dismisses alarm at t+2min → clears snooze_state
Snooze task wakes at t+5min → must NOT re-fire
```

**Safeguard:** Already in spec — snooze timer checks `snooze_state` table before re-firing:
```rust
tokio::time::sleep_until(expiry).await;
// VERIFY snooze wasn't cancelled
if let Some(state) = engine.get_snooze_state(&alarm_id).await {
    engine.fire_alarm(&alarm_id).await;  // Still snoozed → fire
}
// If None → was dismissed during sleep → do nothing
```

#### Race 4: Multiple Engine Ticks on Same Alarm

```
Engine tick at t=0 matches alarm (nextFireTime=t-1)
Engine fires alarm, starts updating nextFireTime
Engine tick at t=30 runs BEFORE nextFireTime update completes → matches again
```

**Safeguard:** Mark alarm as "firing" in memory before starting fire sequence:
```rust
pub struct AlarmEngine {
    currently_firing: HashSet<String>,  // In-memory lock
}

async fn check_and_fire_alarms(&mut self) {
    let due = query_due_alarms(&self.pool).await;
    for alarm in due {
        if self.currently_firing.contains(&alarm.id) {
            continue;  // Already being processed
        }
        self.currently_firing.insert(alarm.id.clone());
        
        // Process alarm...
        self.update_next_fire_time(&alarm).await;
        self.currently_firing.remove(&alarm.id);
    }
}
```

#### Race 5: Group Toggle vs Individual Toggle

```
User toggles group OFF (disables all 5 alarms, saves previous_enabled)
User individually toggles alarm 3 ON while group is OFF
User toggles group ON → should restore original states, but alarm 3 was manually changed
```

**Safeguard:** Group toggle ON restores `IsPreviousEnabled`, then clears `IsPreviousEnabled`:
```sql
-- Group OFF: save state
UPDATE alarms SET IsPreviousEnabled = IsEnabled, IsEnabled = 0 WHERE GroupId = ?;

-- Group ON: restore state (overrides manual changes during OFF)
UPDATE alarms SET IsEnabled = COALESCE(IsPreviousEnabled, IsEnabled), IsPreviousEnabled = NULL WHERE GroupId = ?;
```
This is documented in `07-alarm-groups.md`. The group toggle takes precedence.

### 2.3 SQLite Concurrency

| Rule | Implementation |
|------|---------------|
| **WAL mode** | `PRAGMA journal_mode=WAL` at startup Step 4 |
| **Busy timeout** | `PRAGMA busy_timeout=5000` — wait 5s before `SQLITE_BUSY` |
| **Single writer** | SQLite handles this automatically in WAL mode |
| **Connection pool** | 1 writer `Connection` wrapped in `Arc<Mutex<Connection>>` + reader connections via `rusqlite` |
| **Transactions** | Use for multi-step operations (group toggle, import) |
| **No ORM** | Direct SQL queries with parameterized binds — no ORM overhead or magic |

### 2.4 Tokio Runtime Configuration

```rust
// main.rs — Tauri uses its own tokio runtime
// Do NOT create a second runtime. Use tauri::async_runtime::spawn() or tokio::spawn()
// Both go to the same runtime in Tauri 2.x

// For CPU-bound work (audio encoding, large JSON parse):
tokio::task::spawn_blocking(move || {
    // Runs on blocking thread pool, not async executor
    heavy_computation()
}).await?;
```

---

## 3. Error Handling & Recovery Matrix

### 3.1 Startup Error Chain

| Step | Error | Severity | Action | User Sees |
|------|-------|:--------:|--------|-----------|
| 1. App data dir | `create_dir_all` fails | Fatal | Log to stderr → native error dialog → exit(1) | "Cannot create app data directory" |
| 2. SQLite open | DB locked by another process | Fatal | Show dialog → exit | "Another instance may be running" |
| 2. SQLite open | DB file corrupted | Fatal | Backup → create fresh → retry | "Database corrupted. A backup was created." |
| 3. Migrations | SQL error in migration | Fatal | Backup DB → offer [Reset] or [Exit] | "Database update failed" |
| 4. WAL mode | PRAGMA fails | Warning | Log, continue | Nothing (degraded perf only) |
| 5. Settings | Read fails | Warning | Use defaults, log | Nothing |
| 6a. Tray | Init fails | Warning | Continue without tray | No tray icon |
| 6b. Logging | File appender fails | Warning | Fall back to stderr only | Nothing |
| 7. Engine | Spawn fails | Fatal | Show error dialog → exit | "Alarm engine failed to start" |
| 8. Missed check | Query fails | Warning | Log, continue | Missed alarms surface on next tick |

### 3.2 Runtime Error Recovery

| Error | Retry Strategy | Fallback | Log Level |
|-------|---------------|----------|:---------:|
| SQLite write | 1 retry after 500ms | Show "save failed" toast, no data loss | ERROR |
| SQLite read | No retry, use cached data | Show "load failed" toast | ERROR |
| Audio file missing | No retry | Play `classic-beep`, show warning badge | WARN |
| Audio playback fail | No retry | Show overlay without audio, send OS notification | ERROR |
| IPC timeout (>5s) | No retry | Cancel operation, show "timeout" toast | ERROR |
| Notification denied | No retry | In-app overlay only, one-time settings hint | INFO |
| Network (updater) | No retry | Skip update check, retry next launch | WARN |
| Timezone detect fail | No retry | Use UTC, log warning | WARN |

### 3.3 Critical Path Protection

The alarm engine loop is the most critical code path. It must NEVER stop:

```rust
// This is the ONLY acceptable pattern for the engine loop
loop {
    match self.check_and_fire_alarms().await {
        Ok(count) => {
            if count > 0 {
                tracing::info!(fired = count, "Alarm check complete");
            }
        }
        Err(e) => {
            tracing::error!(error = %e, "Alarm engine tick failed — CONTINUING");
            // NEVER break. NEVER return. NEVER panic.
        }
    }
    tokio::time::sleep(Duration::from_secs(30)).await;
}
```

---

## 4. Cross-Platform Build Verification Script

### 4.1 Pre-Build Checklist (Automated)

Create `scripts/verify-build.sh`:

```bash
#!/bin/bash
set -e

echo "=== Build Verification ==="

# 1. Check Rust compilation
echo "[1/5] Checking Rust compilation..."
cd src-tauri && cargo check --all-features 2>&1
echo "  ✓ Rust compiles"

# 2. Check frontend build
echo "[2/5] Checking frontend build..."
cd .. && pnpm build 2>&1
echo "  ✓ Frontend builds"

# 3. Run Rust tests
echo "[3/5] Running Rust tests..."
cd src-tauri && cargo test --all-features 2>&1
echo "  ✓ Rust tests pass"

# 4. Run frontend tests
echo "[4/5] Running frontend tests..."
cd .. && pnpm vitest run 2>&1
echo "  ✓ Frontend tests pass"

# 5. Check Tauri bundle
echo "[5/5] Checking Tauri bundle..."
cd src-tauri && cargo tauri build --debug 2>&1
echo "  ✓ Tauri bundles"

echo ""
echo "=== All checks passed ==="
```

### 4.2 Platform-Specific CI Matrix

```yaml
strategy:
  matrix:
    include:
      # macOS ARM (M1/M2/M3)
      - { platform: macos-latest, target: aarch64-apple-darwin, label: macOS-arm64 }
      # macOS Intel
      - { platform: macos-13, target: x86_64-apple-darwin, label: macOS-x64 }
      # Windows
      - { platform: windows-latest, target: x86_64-pc-windows-msvc, label: Windows-x64 }
      # Linux
      - { platform: ubuntu-22.04, target: x86_64-unknown-linux-gnu, label: Linux-x64 }
```

---

## 5. Test Strategy for Async Safety

### 5.1 Race Condition Tests

```rust
#[tokio::test]
async fn test_undo_during_hard_delete_timer() {
    let db = setup_test_db().await;
    let alarm = create_test_alarm(&db).await;
    
    // Delete (starts 5s timer)
    let token = delete_alarm(&db, &alarm.id).await.unwrap();
    
    // Undo at t+2s (before hard-delete)
    tokio::time::sleep(Duration::from_secs(2)).await;
    undo_delete(&db, &token).await.unwrap();
    
    // Wait for hard-delete timer to fire at t+5s
    tokio::time::sleep(Duration::from_secs(4)).await;
    
    // Alarm should still exist (undo succeeded)
    let alarm = get_alarm(&db, &alarm.id).await;
    assert!(alarm.is_some());
    assert!(alarm.unwrap().deleted_at.is_none());
}

#[tokio::test]
async fn test_dismiss_cancels_snooze() {
    let engine = setup_test_engine().await;
    let alarm = create_and_fire_alarm(&engine).await;
    
    // Snooze for 1 min
    engine.snooze_alarm(&alarm.id, 1).await.unwrap();
    assert!(engine.get_snooze_state(&alarm.id).await.is_some());
    
    // Dismiss while snoozed
    engine.dismiss_alarm(&alarm.id).await.unwrap();
    assert!(engine.get_snooze_state(&alarm.id).await.is_none());
    
    // Wait for snooze expiry
    tokio::time::sleep(Duration::from_secs(65)).await;
    
    // Should NOT have re-fired
    let events = get_alarm_events(&engine, &alarm.id).await;
    assert_eq!(events.iter().filter(|e| e.r#type == "fired").count(), 1);
}

#[tokio::test]
async fn test_engine_tick_does_not_double_fire() {
    let engine = setup_test_engine().await;
    let alarm = create_alarm_due_now(&engine).await;
    
    // Run two ticks rapidly
    engine.check_and_fire_alarms().await.unwrap();
    engine.check_and_fire_alarms().await.unwrap();
    
    // Should only fire once
    let events = get_alarm_events(&engine, &alarm.id).await;
    assert_eq!(events.iter().filter(|e| e.r#type == "fired").count(), 1);
}
```

### 5.2 Platform Test Checklist

| Test | macOS | Windows | Linux | How to Verify |
|------|:-----:|:-------:|:-----:|--------------|
| Wake detection fires | ⬜ | ⬜ | ⬜ | Sleep machine → wake → check logs for "Wake detected" |
| Audio plays through DND | ⬜ | N/A | N/A | Enable DND → fire alarm → audio should play |
| `backdrop-filter` fallback | N/A | N/A | ⬜ | Run on WebKitGTK < 2.40 → verify solid background fallback |
| System tray shows | ⬜ | ⬜ | ⬜ | Launch app → verify tray icon + tooltip |
| Tray on GNOME | N/A | N/A | ⬜ | Install AppIndicator extension → verify tray works |
| Auto-update flow | ⬜ | ⬜ | ⬜ | Tag v1.0.1 → launch v1.0.0 → update prompt appears |
| Code signing valid | ⬜ | ⬜ | N/A | Run `codesign -v` (macOS) or check Properties→Digital Signatures (Windows) |

---

## 6. Crate Version Compatibility Notes

| Crate | Pinned Version | Known Issue | Workaround |
|-------|:--------------:|-------------|-----------|
| `objc2` | 0.5 | API changed significantly from 0.4. Old blog posts show outdated syntax | Use `objc2` docs, not blog posts |
| `windows` | 0.58 | Feature flags changed from 0.48. `Win32_System_Power` is the correct feature | Check [microsoft/windows-rs](https://github.com/microsoft/windows-rs) for current features |
| `zbus` | 4 | v4 is async-first, v3 was sync. Migration guide exists | Use `#[proxy]` macro, not manual proxy |
| `rodio` | 0.19 | `Sink::try_new()` signature changed from 0.17 | Use `OutputStream::try_default()` + `Sink::try_new(&stream_handle)` |
| `refinery` | 0.8 | `embed_migrations!` path is relative to `Cargo.toml`, not `main.rs` | Put migrations dir at `src-tauri/migrations/` |
| `croner` | 2.0 | v1 had different API for finding next occurrence | Use `Cron::new(expr)?.find_next_occurrence()` |
| `tauri` | 2 | Capability system is new in v2. Most Tauri 1.x examples don't apply | Only use Tauri 2.x docs and examples |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Atomic Task Breakdown | `./11-atomic-task-breakdown.md` |
| AI Handoff Readiness Report | `./10-ai-handoff-readiness-report.md` |
| Startup Sequence | `./01-fundamentals/07-startup-sequence.md` |
| Platform Constraints | `./01-fundamentals/04-platform-constraints.md` |
| DevOps Setup | `./01-fundamentals/08-devops-setup-guide.md` |
| Test Strategy | `./01-fundamentals/09-test-strategy.md` |
| Alarm Firing | `./02-features/03-alarm-firing.md` |
| Sound & Vibration | `./02-features/05-sound-and-vibration.md` |

---

*Platform & concurrency guide — created: 2026-04-09*
