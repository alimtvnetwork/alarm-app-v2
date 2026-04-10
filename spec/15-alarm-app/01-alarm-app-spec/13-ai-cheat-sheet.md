# AI Cheat Sheet — Alarm App

**Version:** 1.0.0 | **Updated:** 2026-04-09 | **One-page reference for AI coding agents**

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Tauri 2.x | 2.x |
| **Backend** | Rust | 2021 edition |
| **Frontend** | React 18 + TypeScript 5 | 18.x / 5.x |
| **Build** | Vite 5 | 5.x |
| **Styling** | Tailwind CSS v3 + shadcn/ui | 3.x |
| **Database** | SQLite (bundled, via `rusqlite`) | WAL mode |
| **Migrations** | `refinery` crate | 0.8 |
| **Audio** | `rodio` | 0.19 |
| **Timezone** | `chrono` + `chrono-tz` | 0.4 / 0.10 |
| **Cron** | `croner` | 2.0 |
| **Logging** | `tracing` + `tracing-appender` | 0.1 / 0.2 |
| **i18n** | `react-i18next` | latest |
| **DnD** | `@dnd-kit/core` + `@dnd-kit/sortable` | 6.x |
| **Errors** | `thiserror` | 1.x |

---

## File Structure (Key Paths)

```
src/                           ← React frontend
  types/alarm.ts               ← ALL TypeScript interfaces
  hooks/useAlarms.ts            ← CRUD + IPC
  hooks/useAlarmFiring.ts       ← Listen alarm-fired events
  components/AlarmOverlay.tsx   ← Full-screen firing UI
  lib/tauri-commands.ts         ← safeInvoke() with 5s timeout
  i18n/index.ts                 ← react-i18next setup

src-tauri/                     ← Rust backend
  src/main.rs                   ← 9-step startup sequence
  src/commands/alarm.rs         ← IPC handlers (CRUD)
  src/engine/alarm_engine.rs    ← 30s tick loop (NEVER breaks)
  src/engine/scheduler.rs       ← nextFireTime computation
  src/engine/wake_listener/     ← Platform wake detection (3 files)
  src/audio/player.rs           ← rodio playback
  src/audio/gradual_volume.rs   ← Quadratic t² volume curve
  src/audio/platform_macos.rs   ← AVAudioSession config
  src/storage/db.rs             ← SQLite + refinery migrations
  src/storage/models.rs         ← AlarmRow, RepeatType
  migrations/V1__initial_schema.sql
  Cargo.toml                    ← Pinned deps (see 03-file-structure.md)
  capabilities/default.json     ← Plugin permissions (REQUIRED)
```

---

## 5 Critical Implementation Patterns

### 1. Engine Loop — NEVER Crash

```rust
const ALARM_CHECK_INTERVAL_SECS: u64 = 30;

loop {
    match self.check_and_fire_alarms().await {
        Ok(_) => {},
        Err(e) => tracing::error!(error=%e, "tick failed — CONTINUING"),
    }
    tokio::time::sleep(Duration::from_secs(ALARM_CHECK_INTERVAL_SECS)).await;
}
```

### 2. DST Resolution — Copy This Exactly

```rust
fn resolve_local_to_utc(date: NaiveDate, time: NaiveTime, tz: &Tz) -> Option<DateTime<Utc>> {
    match tz.from_local_datetime(&NaiveDateTime::new(date, time)) {
        LocalResult::Single(dt) => Some(dt.with_timezone(&Utc)),
        LocalResult::Ambiguous(first, _) => Some(first.with_timezone(&Utc)), // Fall-back: first
        LocalResult::None => {                                                // Spring-forward
            // Walk forward minute-by-minute to find next valid local time (timezone-agnostic)
            let mut candidate = time;
            for _ in 0..120 {
                candidate = candidate + chrono::Duration::minutes(1);
                match tz.from_local_datetime(&NaiveDateTime::new(date, candidate)) {
                    LocalResult::Single(dt) | LocalResult::Ambiguous(dt, _) => {
                        return Some(dt.with_timezone(&Utc));
                    }
                    LocalResult::None => continue,
                }
            }
            None
        }
    }
}
```

### 3. SQLite Booleans — Integer Conversion

```rust
is_enabled: row.get::<_, i32>("IsEnabled")? != 0,                // INTEGER → bool
repeat_days_of_week: row.get("RepeatDaysOfWeek")?,               // JSON TEXT → String
// Then: serde_json::from_str(&self.repeat_days_of_week).unwrap_or_default()
```

### 4. Frontend IPC — Always Timeout

```typescript
async function safeInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T | null> {
    try {
        return await Promise.race([
            invoke<T>(cmd, args),
            new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 5000))
        ]);
    } catch (e) { toast.error(getErrorMessage(e)); return null; }
}
```

### 5. Custom Sound Validation — 5 Checks

Extension → Not symlink → Not system path → Size < 10MB → File exists

---

## 10 Cross-Platform Warnings

| # | Warning | Platform |
|---|---------|----------|
| 1 | `objc2` 0.5 API differs from 0.4 — use docs, not blog posts | macOS |
| 2 | `AVAudioSession` must be configured BEFORE first `Sink` creation | macOS |
| 3 | `WM_POWERBROADCAST` needs a hidden message-only window on separate thread | Windows |
| 4 | Handle BOTH `PBT_APMRESUMEAUTOMATIC` and `PBT_APMRESUMESUSPEND` | Windows |
| 5 | `zbus` v4 is async-first — use `tokio::spawn`, not `std::thread` | Linux |
| 6 | D-Bus may not exist — gracefully degrade if `Connection::system()` fails | Linux |
| 7 | `backdrop-filter` unsupported on older WebKitGTK — always use `@supports` | Linux |
| 8 | `refinery embed_migrations!` path is relative to `Cargo.toml`, not `main.rs` | All |
| 9 | Tauri 2.x capabilities file (`default.json`) is REQUIRED — without it, IPC fails silently | All |
| 10 | `rodio 0.19` `Sink::try_new()` API changed from 0.17 — use `OutputStream::try_default()` | All |

---

## Startup Sequence (9 Steps — Exact Order)

```
1. Resolve app data dir     (<10ms)
2. Open SQLite connection   (<50ms)
3. Run refinery migrations  (<100ms)
4. PRAGMA WAL + busy=5000   (<10ms)
5. Load settings            (<20ms)
6. PARALLEL: tray + logging + WebView  (<500ms)
7. Start alarm engine       (<5ms)
8. Missed alarm check       (<50ms)
9. Update tray, surface missed alarms  (<5ms)
TOTAL: <750ms
```

---

## Database Tables (5)

`Alarms` (22 columns) | `AlarmGroups` (4) | `Settings` (2, key-value) | `SnoozeState` (3) | `AlarmEvents` (11)

**Key PRAGMAs:** `journal_mode=WAL`, `busy_timeout=5000`, `foreign_keys=ON`, `synchronous=NORMAL`

---

## Error Handling Rules

1. **Never crash silently** — every error: toast OR log at WARN/ERROR
2. **Never lose alarm data** — SQLite write errors don't corrupt existing rows
3. **Always have fallback** — no feature failure prevents alarms from firing
4. **Engine loop never breaks** — log and continue on ALL errors
5. **Missing sound → `classic-beep`** — never silence an alarm

---

## Spec File Quick Reference

| Need to implement... | Read this spec |
|---------------------|---------------|
| Data types, schemas, validation | `01-fundamentals/01-data-model.md` |
| File & folder structure | `01-fundamentals/03-file-structure.md` |
| Errors, memory, CSS compat | `01-fundamentals/04-platform-constraints.md` |
| Tauri architecture, IPC, plugins | `01-fundamentals/06-tauri-architecture.md` |
| Startup order, logging | `01-fundamentals/07-startup-sequence.md` |
| CI/CD, signing, auto-update | `01-fundamentals/08-devops-setup-guide.md` |
| Test layers, coverage targets | `01-fundamentals/09-test-strategy.md` |
| CRUD, undo stack, DnD | `02-features/01-alarm-crud.md` |
| Engine, DST, wake, queue | `02-features/03-alarm-firing.md` |
| Snooze timer, crash recovery | `02-features/04-snooze-system.md` |
| Audio, volume, validation | `02-features/05-sound-and-vibration.md` |
| Atomic task order | `11-atomic-task-breakdown.md` |
| Platform gotchas, race conditions | `12-platform-and-concurrency-guide.md` |

---

## Execution Rules for AI

1. **Follow task order** from `11-atomic-task-breakdown.md` — do NOT skip ahead
2. **Copy code from specs** when provided — do NOT improvise DST, audio session, or wake listener code
3. **Write tests for Phase 3** (scheduling) BEFORE implementing — TDD for the highest-risk code
4. **Verify each phase** with `cargo test` before moving to next
5. **Check crate docs** if compilation fails — `objc2`, `windows`, `zbus` APIs change between versions
6. **Never break the engine loop** — wrap everything in `match` with error logging
7. **Use `safeInvoke()`** for ALL frontend IPC calls — never raw `invoke()`
8. **Human tasks exist** — code signing and certificates cannot be done by AI (see `08-devops-setup-guide.md`)

---

*AI Cheat Sheet — Alarm App v1.0.0 — created: 2026-04-09*
