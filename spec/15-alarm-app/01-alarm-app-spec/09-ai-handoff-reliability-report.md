# AI Handoff Reliability Report — Alarm App

> ℹ️ **Supplementary** — The authoritative task breakdown is `11-atomic-task-breakdown.md` (62 tasks). This report provides failure probability analysis and risk data that remains useful for planning.

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**Purpose:** Predict failure points and risks when handing this spec to another AI system for implementation

---

## Overall Failure Probability

| Scenario | Failure Risk |
|----------|:---:|
| Full app implementation (all P0–P3) | **75–85%** partial failure |
| P0 features only (MVP) | **45–55%** partial failure |
| Frontend-only (mock data, no Tauri) | **15–20%** |
| Single feature in isolation | **5–15%** |

> **"Partial failure"** = AI produces code that compiles but has critical runtime bugs, missing edge cases, or architectural mistakes that require significant manual fixing.

---

## Atomic Task Breakdown (94 tasks — SUPERSEDED)

> **⚠️ Note:** This 94-task breakdown is superseded by the authoritative **62-task breakdown** in `11-atomic-task-breakdown.md`. The 62-task version consolidates related tasks and reflects the current architecture. Use `11-atomic-task-breakdown.md` for implementation. This section is retained for historical context only.

### Phase 1: Project Scaffolding (9 tasks)

| # | Task | Fail % | Risk Level |
|---|------|:---:|:---:|
| 1.1 | Initialize Tauri 2.x project with `pnpm create tauri-app` | 15% | 🟢 Low |
| 1.2 | Configure `tauri.conf.json` — permissions: notification, dialog, sql, tray, global-shortcut | 45% | 🟡 Med |
| 1.3 | Add React 18 + Vite 5 + TypeScript 5 to frontend | 10% | 🟢 Low |
| 1.4 | Add Tailwind CSS v3 + shadcn/ui setup | 10% | 🟢 Low |
| 1.5 | Configure Cargo.toml — rodio, rusqlite, refinery, chrono, chrono-tz, croner, uuid, serde | 35% | 🟡 Med |
| 1.6 | Create `src-tauri/migrations/V1__initial_schema.sql` with all 5 tables | 25% | 🟡 Med |
| 1.7 | Set up `refinery` crate for SQLite migration runner | 50% | 🟠 High |
| 1.8 | Create file structure matching `03-file-structure.md` exactly | 20% | 🟢 Low |
| 1.9 | Configure app icons for macOS (.icns), Windows (.ico), Linux (.png) | 30% | 🟡 Med |

### Phase 2: SQLite & Data Layer (10 tasks)

| # | Task | Fail % | Risk Level |
|---|------|:---:|:---:|
| 2.1 | Create Rust `storage/models.rs` — structs matching all 5 tables with serde | 20% | 🟢 Low |
| 2.2 | Create Rust `storage/db.rs` — SQLite connection init + migration runner | 40% | 🟡 Med |
| 2.3 | Implement `RepeatPattern` JSON serialization in `repeat_days_of_week` column | 55% | 🟠 High |
| 2.4 | Implement soft-delete filter (`WHERE deleted_at IS NULL`) on all queries | 25% | 🟡 Med |
| 2.5 | Create TypeScript interfaces matching `01-data-model.md` exactly | 15% | 🟢 Low |
| 2.6 | Create `lib/tauri-commands.ts` — typed invoke() wrappers for all IPC commands | 25% | 🟡 Med |
| 2.7 | Implement settings key-value read/write in Rust | 20% | 🟢 Low |
| 2.8 | Implement `AlarmEvents` insert for fired/snoozed/dismissed/missed types | 20% | 🟢 Low |
| 2.9 | Implement `SnoozeState` table read/write/clear operations | 25% | 🟡 Med |
| 2.10 | SQLite WAL mode + correct app data directory per OS | 40% | 🟡 Med |

### Phase 3: Alarm CRUD — Frontend (8 tasks)

| # | Task | Fail % | Risk Level |
|---|------|:---:|:---:|
| 3.1 | `useAlarms` hook — list, create, update, delete via Tauri invoke() | 25% | 🟡 Med |
| 3.2 | `AlarmForm` dialog — time picker, date picker, label, repeat, sound, group selectors | 30% | 🟡 Med |
| 3.3 | `AlarmList` component — grouped display with toggle switches | 20% | 🟢 Low |
| 3.4 | Soft-delete with 5-second undo toast + undoToken IPC flow | 50% | 🟠 High |
| 3.5 | Duplicate alarm — one-click clone with "(Copy)" label suffix | 15% | 🟢 Low |
| 3.6 | Drag-and-drop between groups using `@dnd-kit/core` + `@dnd-kit/sortable` | 40% | 🟡 Med |
| 3.7 | Keyboard alternative for drag-drop (`Ctrl+Shift+↑/↓`) | 55% | 🟠 High |
| 3.8 | Empty state UI when no alarms exist | 5% | 🟢 Low |

### Phase 4: Alarm CRUD — Backend (6 tasks)

| # | Task | Fail % | Risk Level |
|---|------|:---:|:---:|
| 4.1 | `commands/alarm.rs` — create_alarm IPC handler with validation | 25% | 🟡 Med |
| 4.2 | `commands/alarm.rs` — update_alarm with `NextFireTime` recomputation | 35% | 🟡 Med |
| 4.3 | `commands/alarm.rs` — delete_alarm with undoToken + deferred hard-delete | 55% | 🟠 High |
| 4.4 | `commands/alarm.rs` — toggle_alarm with `NextFireTime` recompute on enable | 30% | 🟡 Med |
| 4.5 | `commands/alarm.rs` — duplicate_alarm + move_alarm_to_group | 20% | 🟢 Low |
| 4.6 | Input validation matching ALL rules from data model (time format, ranges, etc.) | 40% | 🟡 Med |

### Phase 5: Alarm Engine — Core Firing (12 tasks) ⚠️ HIGHEST RISK PHASE

| # | Task | Fail % | Risk Level |
|---|------|:---:|:---:|
| 5.1 | `engine/alarm_engine.rs` — spawn background thread with 30s check interval | 35% | 🟡 Med |
| 5.2 | Query `WHERE NextFireTime <= now AND IsEnabled = 1 AND DeletedAt IS NULL` | 20% | 🟢 Low |
| 5.3 | Emit `alarm-fired` event to frontend via Tauri IPC on match | 30% | 🟡 Med |
| 5.4 | `NextFireTime` computation for `once` type (disable after fire) | 20% | 🟢 Low |
| 5.5 | `NextFireTime` computation for `daily` type (+24h) | 15% | 🟢 Low |
| 5.6 | `NextFireTime` computation for `weekly` type (next matching weekday) | 40% | 🟡 Med |
| 5.7 | `NextFireTime` computation for `interval` type (+N minutes) | 15% | 🟢 Low |
| 5.8 | `NextFireTime` computation for `cron` type via `croner` crate | 45% | 🟡 Med |
| 5.9 | **DST spring-forward handling** — skipped time → fire at next valid minute | **70%** | 🔴 Critical |
| 5.10 | **DST fall-back handling** — fire on first occurrence only, not twice | **70%** | 🔴 Critical |
| 5.11 | **Timezone change detection** — recalc all `NextFireTime` on OS tz change | **65%** | 🔴 Critical |
| 5.12 | Use `chrono-tz` for IANA timezone resolution, store in settings table | 35% | 🟡 Med |

### Phase 6: Missed Alarm Recovery (6 tasks) ⚠️ HIGH RISK

| # | Task | Fail % | Risk Level |
|---|------|:---:|:---:|
| 6.1 | On app launch — query and surface all missed alarms | 30% | 🟡 Med |
| 6.2 | **macOS wake detection** — `NSWorkspace.didWakeNotification` listener | **60%** | 🔴 Critical |
| 6.3 | **Windows wake detection** — `WM_POWERBROADCAST` listener | **65%** | 🔴 Critical |
| 6.4 | **Linux wake detection** — `systemd-logind PrepareForSleep` D-Bus signal | **70%** | 🔴 Critical |
| 6.5 | Missed alarm UI — "MISSED" badge, original time, current time display | 25% | 🟡 Med |
| 6.6 | Log missed alarms as `type = 'missed'` in `AlarmEvents` | 15% | 🟢 Low |

### Phase 7: Audio & Sound (7 tasks)

| # | Task | Fail % | Risk Level |
|---|------|:---:|:---:|
| 7.1 | `audio/player.rs` — play built-in sounds via `rodio` | 30% | 🟡 Med |
| 7.2 | Bundle 10 built-in audio files (classic-beep, digital-buzz, etc.) | 25% | 🟡 Med |
| 7.3 | Custom sound file selection via `tauri-plugin-dialog` | 35% | 🟡 Med |
| 7.4 | Sound preview — play briefly before confirming selection | 25% | 🟡 Med |
| 7.5 | `audio/gradual_volume.rs` — 10%→100% linear ramp over 15/30/60s | 45% | 🟡 Med |
| 7.6 | Stop audio on dismiss/snooze | 20% | 🟢 Low |
| 7.7 | **macOS audio session category** for alarm-type playback | **55%** | 🟠 High |

### Phase 8: Snooze System (5 tasks)

| # | Task | Fail % | Risk Level |
|---|------|:---:|:---:|
| 8.1 | `snooze_alarm` IPC — stop audio, write `SnoozeState`, set `SnoozeUntil` | 25% | 🟡 Med |
| 8.2 | Alarm engine checks `SnoozeState` table for expired snoozes | 35% | 🟡 Med |
| 8.3 | Hide snooze button when `SnoozeCount >= MaxSnoozeCount` | 15% | 🟢 Low |
| 8.4 | Hide snooze button entirely when `MaxSnoozeCount = 0` | 10% | 🟢 Low |
| 8.5 | Snooze state persists across app restart (SQLite-backed) | 20% | 🟢 Low |

### Phase 9: UI Components (8 tasks)

| # | Task | Fail % | Risk Level |
|---|------|:---:|:---:|
| 9.1 | `AlarmOverlay` — full-screen firing overlay with dismiss/snooze | 25% | 🟡 Med |
| 9.2 | Auto-dismiss countdown progress bar | 30% | 🟡 Med |
| 9.3 | `AnalogClock` — SVG clock face with hands | 20% | 🟢 Low |
| 9.4 | `DigitalClock` — time + date, 12h/24h toggle | 15% | 🟢 Low |
| 9.5 | `AlarmCountdown` — "Alarm in X hours Y minutes" | 20% | 🟢 Low |
| 9.6 | `ThemeToggle` — sun/moon icon, write to settings table | 15% | 🟢 Low |
| 9.7 | `AlarmGroupForm` — create/rename dialog with color picker | 20% | 🟢 Low |
| 9.8 | Queue simultaneous alarms (only one overlay at a time) | **50%** | 🟠 High |

### Phase 10: System Tray (4 tasks)

| # | Task | Fail % | Risk Level |
|---|------|:---:|:---:|
| 10.1 | `tray/mod.rs` — system tray setup with Tauri tray plugin | 35% | 🟡 Med |
| 10.2 | Show next alarm time in tray tooltip | 30% | 🟡 Med |
| 10.3 | Tray menu — quick toggle, quit | 25% | 🟡 Med |
| 10.4 | Minimize to tray instead of closing (controlled by setting) | 40% | 🟡 Med |

### Phase 11: Notifications (3 tasks)

| # | Task | Fail % | Risk Level |
|---|------|:---:|:---:|
| 11.1 | OS notification on alarm fire via Tauri notification plugin | 25% | 🟡 Med |
| 11.2 | Request notification permission on first alarm creation | 30% | 🟡 Med |
| 11.3 | Fallback to in-app-only if notification permission denied | 20% | 🟢 Low |

### Phase 12: Theme System (4 tasks)

| # | Task | Fail % | Risk Level |
|---|------|:---:|:---:|
| 12.1 | Warm cream/linen/tan palette as CSS tokens (light mode) | 15% | 🟢 Low |
| 12.2 | Charcoal/warm gray dark mode palette | 15% | 🟢 Low |
| 12.3 | System theme detection via OS appearance change event | 35% | 🟡 Med |
| 12.4 | Persist theme choice to SQLite settings table | 15% | 🟢 Low |

### Phase 13: Export/Import (4 tasks)

| # | Task | Fail % | Risk Level |
|---|------|:---:|:---:|
| 13.1 | Export alarms to JSON via native save dialog | 25% | 🟡 Med |
| 13.2 | Export alarms to CSV | 20% | 🟢 Low |
| 13.3 | Import alarms from JSON with validation + merge/replace strategy | 40% | 🟡 Med |
| 13.4 | Export to iCal (.ics) format | 45% | 🟡 Med |

### Phase 14: Design System (4 tasks)

| # | Task | Fail % | Risk Level |
|---|------|:---:|:---:|
| 14.1 | Outfit font for headings/clock, Figtree for body | 15% | 🟢 Low |
| 14.2 | 12px border radius, warm shadow tokens | 10% | 🟢 Low |
| 14.3 | Cozy minimal aesthetic — correct spacing, density | 25% | 🟡 Med |
| 14.4 | Responsive layout for main `Index.tsx` page | 20% | 🟢 Low |

### Phase 15: Auto-Launch & Updates (4 tasks)

| # | Task | Fail % | Risk Level |
|---|------|:---:|:---:|
| 15.1 | Auto-launch on system boot (Tauri autostart plugin) | 35% | 🟡 Med |
| 15.2 | Tauri updater plugin — check for updates on launch | 40% | 🟡 Med |
| 15.3 | macOS code signing + notarization | **60%** | 🔴 Critical |
| 15.4 | Windows code signing | **55%** | 🟠 High |

---

## Top 15 Failure Points (Ranked by Impact × Probability)

| Rank | Task | Fail % | Why It Fails |
|------|------|:---:|------|
| 1 | **DST spring-forward/fall-back** (5.9–5.10) | 70% | Most AIs don't know DST edge cases. They'll use naive `+ 24h` math instead of `chrono-tz` aware computation. |
| 2 | **System wake detection** (6.2–6.4) | 60-70% | Requires OS-specific listeners (`NSWorkspace`, `WM_POWERBROADCAST`, D-Bus). AI will likely skip or stub these. |
| 3 | **Timezone change recalc** (5.11) | 65% | Listening for OS timezone events + recalculating ALL alarms is complex. AI will likely forget this entirely. |
| 4 | **macOS code signing + notarization** (15.3) | 60% | Not a code problem — requires Apple Developer account, certificates, `codesign`, `xcrun notarytool`. AI can't set this up. |
| 5 | **Refinery migration runner** (1.7) | 50% | `refinery` crate config is non-obvious. AI may use wrong embed macro or migration path. |
| 6 | **Soft-delete undo with deferred hard-delete** (3.4, 4.3) | 50-55% | Requires: undoToken generation, 5s timer, cancel-on-undo, permanent delete after timeout. Complex state machine. |
| 7 | **RepeatPattern JSON in SQLite** (2.3) | 55% | Storing `daysOfWeek` as JSON string in TEXT column + parsing in Rust is error-prone. `serde_json` edge cases. |
| 8 | **Alarm queue (one overlay at a time)** (9.8) | 50% | AI will likely render multiple overlays simultaneously instead of queuing. Needs a proper queue + sequential display. |
| 9 | **Gradual volume ramp** (7.5) | 45% | `rodio` volume control requires a custom `Source` wrapper or `Sink` manipulation on a timer. Not trivial. |
| 10 | **macOS audio session category** (7.7) | 55% | Setting Core Audio session to "alarm" category requires `objc` FFI or specific `rodio` configuration. |
| 11 | **Cron `NextFireTime`** (5.8) | 45% | Using `croner` crate correctly for next-occurrence from arbitrary cron expression. |
| 12 | **Weekly `NextFireTime`** (5.6) | 40% | Must find next matching weekday correctly, handling week wrapping. Off-by-one errors common. |
| 13 | **Tauri permission config** (1.2) | 45% | Tauri 2.x capability system is new. Wrong permissions = runtime panics with unhelpful errors. |
| 14 | **dnd-kit keyboard sensor** (3.7) | 55% | `Ctrl+Shift+↑/↓` keyboard alternative for group reordering requires custom sensor setup. |
| 15 | **Import validation + merge** (13.3) | 40% | UUID collision handling, schema version mismatch, partial import on error — lots of edge cases. |

---

## Spec Improvements Needed

### 🔴 Critical Gaps (will cause failure)

| # | Gap | Recommendation |
|---|-----|----------------|
| 1 | **No Tauri 2.x permission/capability manifest** | Add exact `capabilities` JSON block for `tauri.conf.json` — list every plugin permission needed |
| 2 | **No Cargo.toml dependency list with versions** | Add exact crate versions: `rodio = "0.19"`, `chrono = "0.4"`, `chrono-tz = "0.10"`, `croner = "2.0"`, `refinery = "0.8"`, etc. |
| 3 | **No migration runner setup instructions** | Add `refinery` embed macro example + migration file naming convention |
| 4 | **DST rules lack pseudocode** | Add step-by-step algorithm for spring-forward/fall-back with code example |
| 5 | **Wake detection has no code examples** | Add macOS/Windows/Linux code snippets for each OS wake listener |
| 6 | **No alarm queue behavior defined** | Specify: FIFO queue, show oldest first, dismiss advances to next, timeout applies per-alarm |

### 🟡 Medium Gaps (may cause bugs)

| # | Gap | Recommendation |
|---|-----|----------------|
| 7 | **Undo flow lacks sequence diagram** | Add: user deletes → undoToken returned → 5s timer starts → undo cancels timer → timeout triggers hard-delete |
| 8 | **No error handling spec** | Define: what happens on SQLite write failure, audio file not found, IPC timeout, corrupt DB |
| 9 | **No startup sequence defined** | Add: 1. Open DB → 2. Run migrations → 3. Load settings → 4. Start alarm engine → 5. Check missed → 6. Render UI |
| 10 | **Gradual volume lacks algorithm** | Add: `volume = 0.1 + (0.9 * elapsed / duration)`, update every 100ms |
| 11 | **Custom sound path validation missing** | Define: check file exists, check format, max file size, what if file deleted later |

### 🟢 Minor Gaps (nice to have)

| # | Gap | Recommendation |
|---|-----|----------------|
| 12 | **No test strategy** | Add: unit tests for scheduler, integration tests for IPC, E2E for alarm fire cycle |
| 13 | **No logging strategy** | Define: Rust `tracing` crate, log levels, log file location per OS |
| 14 | **No performance benchmarks** | Define: max alarms supported, alarm check latency, UI render budget |

---

## Recommended Handoff Strategy

### Option A: Give Everything at Once
- **Risk:** 75–85% partial failure
- **Result:** AI produces skeleton code with critical bugs in DST, wake detection, audio

### Option B: Phase-by-Phase (Recommended) ✅
- Hand off **one phase at a time** with its dependent specs
- Verify each phase works before moving to next
- **Risk:** 25–35% partial failure per phase
- **Suggested order:** Phase 1→2→4→3→5→8→7→6→9→10→11→12→13→14→15

### Option C: Frontend + Backend Separately
- AI #1: Frontend (React/TypeScript) with mock IPC
- AI #2: Backend (Rust/Tauri) with test harness
- Integrate manually
- **Risk:** 30–40% — but integration phase adds 2–3 days

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Data Model | `./01-fundamentals/01-data-model.md` |
| File Structure | `./01-fundamentals/03-file-structure.md` |
| Platform Constraints | `./01-fundamentals/04-platform-constraints.md` |
| Alarm Firing | `./02-features/03-alarm-firing.md` |
| Snooze System | `./02-features/04-snooze-system.md` |
| Sound & Vibration | `./02-features/05-sound-and-vibration.md` |
