# Atomic Task Breakdown — Implementation Order

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**Purpose:** Dependency-ordered atomic coding tasks for AI execution at near-100% success  
**Total Tasks:** 62  
**Estimated Total:** 20–26 days

---

## Keywords

`tasks`, `implementation`, `atomic`, `dependency-order`, `effort`, `ai-execution`

---

## How to Use This Document

1. Execute tasks **strictly in order** — each task's dependencies are satisfied by preceding tasks
2. **Verify each task** before moving to the next (run `cargo test`, `pnpm vitest`, or manual check)
3. Each task references the **exact spec file** containing implementation details
4. Tasks marked 🔴 are the highest-risk — follow the code examples in the spec exactly, do not improvise

---

## Phase 1: Project Scaffolding (Tasks 1–7)

| # | Task | Effort | Spec Reference | Risk | Depends On |
|---|------|--------|----------------|:----:|:----------:|
| 1 | Initialize Tauri 2.x project: `pnpm create tauri-app --template react-ts` | 15m | `06-tauri-architecture.md` | 🟢 | — |
| 2 | Replace generated frontend with React 18 + Vite 5 + TypeScript 5 + Tailwind CSS v3 + shadcn/ui | 30m | `03-file-structure.md` | 🟢 | 1 |
| 3 | Create file structure matching `03-file-structure.md` — all directories, empty files with module declarations | 30m | `03-file-structure.md` | 🟢 | 2 |
| 4 | Configure `Cargo.toml` with exact pinned dependencies from spec | 15m | `03-file-structure.md` → Cargo.toml section | 🟡 | 1 |
| 5 | Create `src-tauri/capabilities/default.json` with all plugin permissions | 15m | `03-file-structure.md` → Capabilities section | 🟡 | 4 |
| 6 | Create `src-tauri/migrations/V1__initial_schema.sql` with all 5 tables + indexes | 30m | `01-data-model.md` → SQLite Schema | 🟡 | 4 |
| 7 | Configure app icons for macOS (.icns), Windows (.ico), Linux (.png) | 15m | `06-tauri-architecture.md` → Build Pipeline | 🟢 | 1 |

**Phase 1 checkpoint:** `cargo build` compiles. `pnpm dev` shows blank React page. Tauri window opens.

---

## Phase 2: Database & Data Layer (Tasks 8–16)

| # | Task | Effort | Spec Reference | Risk | Depends On |
|---|------|--------|----------------|:----:|:----------:|
| 8 | Implement `storage/db.rs` — SQLite connection open + `refinery` migration runner + WAL mode + PRAGMAs | 2h | `01-data-model.md` → Migration Strategy, `07-startup-sequence.md` Steps 2-4 | 🔴 | 6 |
| 9 | Implement `storage/models.rs` — `AlarmRow`, `RepeatType`, `AlarmGroupRow`, `SettingsRow`, `SnoozeStateRow`, `AlarmEventRow` with `from_row()` | 2h | `01-data-model.md` → Rust Data Mapping | 🟡 | 8 |
| 10 | Implement `RepeatPattern` JSON serialization: `days_of_week()` from TEXT, `repeat_pattern()` builder | 1h | `01-data-model.md` → AlarmRow impl | 🔴 | 9 |
| 11 | Implement settings key-value CRUD: `get_setting<T>()`, `update_setting()`, `Settings::load_all()`, `ensure_defaults()` | 1h | `01-data-model.md` → Settings Keys + DB-SETTINGS-001 | 🟡 | 8 |
| 12 | Implement `AlarmAppError` enum with `thiserror` — all 13 error variants | 30m | `04-platform-constraints.md` → Rust Error Type | 🟢 | 4 |
| 13 | Create TypeScript interfaces: `Alarm`, `RepeatPattern`, `AlarmGroup`, `AlarmSound`, `AlarmEvent`, `SnoozeState` | 30m | `01-data-model.md` → Interfaces | 🟢 | 2 |
| 14 | Create `lib/tauri-commands.ts` — typed `invoke()` wrappers with `safeInvoke()` timeout + error toast | 1h | `04-platform-constraints.md` → Frontend Error Handling, `06-tauri-architecture.md` → IPC | 🟡 | 13 |
| 15 | Implement alarm CRUD operations in Rust: `insert_alarm()`, `update_alarm()`, `list_alarms()`, `soft_delete_alarm()`, `undo_delete()` | 2h | `01-alarm-crud.md` → Soft-delete timer Rust code | 🟡 | 9, 12 |
| 16 | Implement event logging: `insert_alarm_event()`, `purge_old_events()` (90-day retention) | 30m | `01-data-model.md` → Event Retention Policy | 🟢 | 8 |

**Phase 2 checkpoint:** `cargo test` — in-memory SQLite, all CRUD ops pass, migration runs, settings read/write works.

---

## Phase 3: Alarm Scheduling Engine (Tasks 17–24) — ⚠️ HIGHEST RISK

| # | Task | Effort | Spec Reference | Risk | Depends On |
|---|------|--------|----------------|:----:|:----------:|
| 17 | Implement `resolve_local_to_utc()` — DST-aware local→UTC conversion with spring-forward/fall-back handling | 2h | `03-alarm-firing.md` → DST Resolution Function (copy Rust code exactly) | 🔴 | 9 |
| 18 | Implement `compute_next_fire_time()` for `Once` and `Daily` repeat types | 1h | `03-alarm-firing.md` → `NextFireTime` Computation | 🟡 | 17 |
| 19 | Implement `compute_next_fire_time()` for `Weekly` type — next matching weekday with week-wrapping | 1.5h | `03-alarm-firing.md` → `NextFireTime` Computation, Weekly branch | 🟡 | 17 |
| 20 | Implement `compute_next_fire_time()` for `Interval` type | 15m | `03-alarm-firing.md` → Interval branch | 🟢 | 17 |
| 21 | Implement `compute_next_fire_time()` for `Cron` type using `croner` crate | 1h | `03-alarm-firing.md` → Cron branch, `01-data-model.md` → croner | 🟡 | 17 |
| 22 | Implement `alarm_engine.rs` — background thread with 30s interval, query for due alarms, emit `alarm-fired` event | 2h | `03-alarm-firing.md` → Firing Logic, `04-platform-constraints.md` → Critical Path Protection | 🟡 | 18-21, 15 |
| 23 | Implement `AlarmQueue` (FIFO) — `VecDeque<FiredAlarm>`, one active overlay, queue rest, dismiss advances | 1.5h | `03-alarm-firing.md` → Simultaneous Alarms, Queue Rules | 🟡 | 22 |
| 24 | Write unit tests for ALL 5 repeat types + DST spring-forward + DST fall-back + timezone change | 3h | `09-test-strategy.md` → Layer 1, `03-alarm-firing.md` → DST Test Cases | 🔴 | 17-21 |

**Phase 3 checkpoint:** `cargo test` — all scheduling tests pass. DST edge cases verified. Engine starts and ticks without crash.

**⚠️ CRITICAL:** Tasks 17 and 24 are the #1 risk. Copy the `resolve_local_to_utc()` and `compute_next_fire_time()` code from `03-alarm-firing.md` character-for-character. Do NOT improvise DST handling.

---

## Phase 4: Snooze System (Tasks 25–27)

| # | Task | Effort | Spec Reference | Risk | Depends On |
|---|------|--------|----------------|:----:|:----------:|
| 25 | Implement `snooze_alarm` IPC handler — stop audio, write `SnoozeState`, use `tokio::time::sleep_until()` for exact-time trigger | 1.5h | `04-snooze-system.md` → Snooze Timer Implementation | 🟡 | 22 |
| 26 | Implement snooze crash recovery — on startup, check `SnoozeState` for expired/active snoozes | 30m | `04-snooze-system.md` → Crash recovery | 🟡 | 25 |
| 27 | Implement `dismiss_alarm` IPC handler — stop audio, clear `SnoozeState`, log `AlarmEvent` | 30m | `03-alarm-firing.md` → Firing Logic | 🟢 | 22 |

**Phase 4 checkpoint:** Snooze persists across restart. Expired snooze re-fires. Max snooze count enforced.

---

## Phase 5: Audio System (Tasks 28–33)

| # | Task | Effort | Spec Reference | Risk | Depends On |
|---|------|--------|----------------|:----:|:----------:|
| 28 | Implement `audio/player.rs` — play built-in sounds via `rodio`, stop on demand, loop until dismissed | 1.5h | `05-sound-and-vibration.md` → Sound Library | 🟡 | 4 |
| 29 | Bundle 10 built-in audio files in `src-tauri/assets/sounds/` | 30m | `05-sound-and-vibration.md` → Sound Library table | 🟢 | 28 |
| 30 | Implement `audio/gradual_volume.rs` — quadratic curve `t²` from 10%→100%, 100ms update interval | 1h | `05-sound-and-vibration.md` → Volume Curve Algorithm (copy Rust code exactly) | 🟡 | 28 |
| 31 | Implement `validate_custom_sound()` — 5-step validation (extension, symlink, restricted path, size, exists) | 1h | `05-sound-and-vibration.md` → Custom Sound Validation (copy Rust code exactly) | 🟡 | 12 |
| 32 | Implement `resolve_sound_path()` — built-in key lookup vs custom path with fallback to `classic-beep` | 30m | `05-sound-and-vibration.md` → Missing Sound Fallback | 🟢 | 31 |
| 33 | Implement `audio/platform_macos.rs` — `AVAudioSession::Playback + DuckOthers` (macOS only, `#[cfg]` gated) | 1h | `05-sound-and-vibration.md` → macOS Core Audio Session (copy Rust code exactly) | 🔴 | 28 |

**Phase 5 checkpoint:** `cargo test` (non-audio logic). Manual test: sound plays, volume ramps, custom sound validates. macOS: plays through DND.

---

## Phase 6: Platform Wake Detection (Tasks 34–37) — ⚠️ HIGH RISK

| # | Task | Effort | Spec Reference | Risk | Depends On |
|---|------|--------|----------------|:----:|:----------:|
| 34 | Implement `WakeListener` trait + factory in `engine/wake_listener/mod.rs` | 30m | `03-alarm-firing.md` → WakeListener Architecture | 🟡 | 4 |
| 35 | Implement `macos.rs` WakeListener — `NSWorkspaceDidWakeNotification` via `objc2` | 2h | `03-alarm-firing.md` → macOS Wake Listener (copy code) | 🔴 | 34 |
| 36 | Implement `windows.rs` WakeListener — `WM_POWERBROADCAST` with hidden window | 2h | `03-alarm-firing.md` → Windows Wake Listener (copy code) | 🔴 | 34 |
| 37 | Implement `linux.rs` WakeListener — `PrepareForSleep` D-Bus signal via `zbus` | 2h | `03-alarm-firing.md` → Linux Wake Listener (copy code) | 🔴 | 34 |

**Phase 6 checkpoint:** On each platform, sleep→wake triggers missed alarm check in logs. Test by suspending and resuming.

**⚠️ CRITICAL:** These are the #2 risk. The Rust code examples in `03-alarm-firing.md` are intentionally detailed — copy them. The `objc2`, `windows`, and `zbus` crate APIs change frequently; verify the exact API against crate docs if compilation fails.

---

## Phase 7: Startup Sequence (Tasks 38–40)

| # | Task | Effort | Spec Reference | Risk | Depends On |
|---|------|--------|----------------|:----:|:----------:|
| 38 | Implement 9-step startup sequence in `main.rs` with exact ordering from spec | 2h | `07-startup-sequence.md` — all 9 steps with error handling per step | 🟡 | 8, 11, 22, 25, 34-37 |
| 39 | Implement `init_logging()` — `tracing_subscriber` + daily rotating file appender (7 day retention) | 1h | `07-startup-sequence.md` → Step 6b Logging Strategy (copy Rust code exactly) | 🟡 | 38 |
| 40 | Implement missed alarm check (Step 8) + stale soft-delete cleanup + event retention purge | 1h | `07-startup-sequence.md` → Step 8, `01-alarm-crud.md` → cleanup_stale_soft_deletes | 🟡 | 38 |

**Phase 7 checkpoint:** App starts in <750ms. Logs appear in `{app_data}/logs/`. Missed alarms surface. Tray shows "Next alarm: HH:MM".

---

## Phase 8: Frontend — Core UI (Tasks 41–46)

| # | Task | Effort | Spec Reference | Risk | Depends On |
|---|------|--------|----------------|:----:|:----------:|
| 41 | Implement `useAlarms` hook — CRUD via `safeInvoke()`, `useAlarmFiring` for event listener | 2h | `01-alarm-crud.md` → IPC Commands, Hook | 🟡 | 14 |
| 42 | Implement `AlarmList` — grouped display, toggle switches, empty state | 1.5h | `01-alarm-crud.md` → UI Components | 🟡 | 41 |
| 43 | Implement `AlarmForm` dialog — time/date/label/repeat/sound/snooze/group selectors with validation | 2h | `01-alarm-crud.md` → Operations, `01-data-model.md` → Validation Rules | 🟡 | 41 |
| 44 | Implement `AlarmOverlay` — full-screen firing overlay with dismiss/snooze, auto-dismiss countdown, missed badge, queue indicator | 2h | `03-alarm-firing.md` → AlarmOverlay UI, Queue UI Indicator | 🟡 | 41, 23 |
| 45 | Implement undo stack (max 5) + `UndoToast` component with independent timers | 1.5h | `01-alarm-crud.md` → Undo Stack (copy TypeScript code exactly) | 🟡 | 41 |
| 46 | Implement drag-and-drop with `@dnd-kit/core` + `@dnd-kit/sortable` + keyboard sensor + ARIA | 2h | `01-alarm-crud.md` → DnD + Keyboard Accessibility (copy JSX exactly) | 🟡 | 42 |

**Phase 8 checkpoint:** Create/edit/delete/toggle alarms via UI. Undo works. DnD reorders. Overlay shows on alarm fire.

---

## Phase 9: Frontend — Supporting UI (Tasks 47–50)

| # | Task | Effort | Spec Reference | Risk | Depends On |
|---|------|--------|----------------|:----:|:----------:|
| 47 | Implement `AnalogClock` (SVG) + `DigitalClock` (12h/24h) + `AlarmCountdown` | 2h | `08-clock-display.md`, `03-file-structure.md` | 🟢 | 2 |
| 48 | Implement theme system — light/dark/system, CSS tokens, `useTheme` hook, persist to settings | 1.5h | `09-theme-system.md`, `02-design-system.md` | 🟢 | 11 |
| 49 | Implement `ExportImport` — JSON/CSV export via native dialog, JSON import with merge/replace + validation | 2h | `10-export-import.md` | 🟡 | 41 |
| 50 | Implement `platform.css` — WebKitGTK fallbacks (`@supports` for `backdrop-filter`), platform detection class | 1h | `04-platform-constraints.md` → WebView CSS Compatibility | 🟡 | 2 |

---

## Phase 10: System Integration (Tasks 51–54)

| # | Task | Effort | Spec Reference | Risk | Depends On |
|---|------|--------|----------------|:----:|:----------:|
| 51 | Implement system tray — icon, next alarm tooltip, quick toggle, minimize to tray | 1.5h | `06-tauri-architecture.md` → System Tray | 🟡 | 38 |
| 52 | Implement OS notifications — fire alongside overlay, permission request, fallback | 1h | `06-tauri-architecture.md` → Notifications | 🟡 | 22 |
| 53 | Implement i18n — `react-i18next` setup, `en.json` locale, `eslint-plugin-i18next` config | 1h | `03-file-structure.md` → i18n Enforcement | 🟡 | 2 |
| 54 | Implement timezone change detection — `on_timezone_change()`, recalculate all `NextFireTime` | 1h | `03-alarm-firing.md` → Timezone Change Detection | 🔴 | 22 |

---

## Phase 11: Testing (Tasks 55–58)

| # | Task | Effort | Spec Reference | Risk | Depends On |
|---|------|--------|----------------|:----:|:----------:|
| 55 | Write Rust unit tests — scheduler (all 5 types), DST (3 cases), volume curve, sound validation, webhook validation | 3h | `09-test-strategy.md` → Layer 1 | 🟡 | 24 (extend) |
| 56 | Write Rust integration tests — CRUD lifecycle, soft-delete+undo, group toggle, missed alarm detection, event retention | 3h | `09-test-strategy.md` → Layer 2 | 🟡 | 15 |
| 57 | Write frontend unit tests — `useAlarms` mock IPC, `AlarmForm` validation, `AlarmOverlay` states, time formatting | 2h | `09-test-strategy.md` → Layer 3 | 🟡 | 41-46 |
| 58 | Write E2E tests — create→fire→dismiss, create→fire→snooze→re-fire→dismiss, delete→undo, group toggle, import | 3h | `09-test-strategy.md` → Layer 4 | 🟡 | All |

**Phase 11 checkpoint:** `cargo test --all-features` passes. `pnpm vitest run --coverage` ≥ 70%. E2E flows pass on macOS.

---

## Phase 12: CI/CD & Distribution (Tasks 59–62) — Requires Human Steps

| # | Task | Effort | Spec Reference | Risk | Depends On |
|---|------|--------|----------------|:----:|:----------:|
| 59 | Create `.github/workflows/build-and-release.yml` — full CI matrix (macOS arm64/x64, Windows, Linux) | 1h | `08-devops-setup-guide.md` → Complete Workflow File (copy YAML exactly) | 🟡 | All |
| 60 | Configure Tauri updater — generate keypair, add pubkey to `tauri.conf.json`, endpoint to GitHub Releases | 30m | `08-devops-setup-guide.md` → Section 4 | 🟡 | 59 |
| 61 | Add test job to CI — `cargo test` + `pnpm vitest run --coverage --coverage.thresholds.lines=70` | 30m | `09-test-strategy.md` → CI Integration | 🟢 | 59, 55-57 |
| 62 | Verify CI build completes on all 3 platforms (manual dispatch) | 1h | `08-devops-setup-guide.md` → Branch Strategy | 🟡 | 59-61 |

**⚠️ Human tasks (not AI):** Apple Developer enrollment, certificate creation, Windows EV cert purchase, GitHub secrets setup. See `08-devops-setup-guide.md` → Checklist.

---

## Task Dependency Graph (Critical Path)

```
1 → 2 → 3
1 → 4 → 5
       4 → 6 → 8 → 9 → 10
                8 → 11
                     9 → 15 → 22 → 23 → 44
                          17 → 18-21 → 22
                               24 (tests)
                     22 → 25-27 (snooze)
                     22 → 34 → 35-37 (wake)
                     8,11,22,25,34-37 → 38 → 39,40
       4 → 28 → 29,30,31,33
  2 → 13 → 14 → 41 → 42-46
  2 → 47,48,50
  41 → 49
  38 → 51
  22 → 52,54
  All → 55-58 → 59-62
```

**Critical path:** 1→4→6→8→9→17→18→22→38→55→59 (longest chain, ~14 days)

---

## Risk Summary by Phase

| Phase | Tasks | Risk Level | Mitigation |
|-------|:-----:|:----------:|-----------|
| 1. Scaffolding | 7 | 🟢 Low | Standard setup |
| 2. Data Layer | 9 | 🟡 Med | Copy `AlarmRow` from spec verbatim |
| 3. Scheduling | 8 | 🔴 High | Copy DST code from spec. Write tests FIRST |
| 4. Snooze | 3 | 🟡 Med | Use `sleep_until()` not polling |
| 5. Audio | 6 | 🟡 Med | Copy validation + macOS session code |
| 6. Wake Detection | 4 | 🔴 High | Copy FFI code. Verify crate API versions |
| 7. Startup | 3 | 🟡 Med | Follow 9-step order exactly |
| 8. Frontend Core | 6 | 🟡 Med | Copy undo stack code from spec |
| 9. Frontend Extra | 4 | 🟢 Low | Standard React components |
| 10. System | 4 | 🟡 Med | Tauri plugin APIs are well-documented |
| 11. Testing | 4 | 🟡 Med | Spec has test examples to copy |
| 12. CI/CD | 4 | 🟡 Med | Copy YAML from spec. Human signs certs |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| AI Handoff Readiness Report | `./10-ai-handoff-readiness-report.md` |
| AI Handoff Reliability Report | `./09-ai-handoff-reliability-report.md` |
| All Fundamentals | `./01-fundamentals/00-overview.md` |
| All Features | `./02-features/00-overview.md` |
| All Issues (Resolved) | `./03-app-issues/00-overview.md` |

---

*Atomic task breakdown — created: 2026-04-09*
