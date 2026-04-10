# Fundamentals Acceptance Criteria — Consolidated Rollup

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Purpose:** Testable success criteria for all fundamental/infrastructure specs  
**Resolves:** P14-002

---

## Keywords

`acceptance-criteria`, `fundamentals`, `infrastructure`, `verification`, `testable`

---

## 01 — Data Model (`01-data-model.md`)

- [ ] All 5 SQLite tables created by V1 migration: `Alarms`, `AlarmGroups`, `Settings`, `SnoozeState`, `AlarmEvents`
- [ ] All table/column/index names use PascalCase
- [ ] 4 indexes created: `IdxAlarmsNextFire`, `IdxAlarmsGroup`, `IdxEventsAlarm`, `IdxEventsTimestamp`
- [ ] All 9 default settings seeded by V1 migration (Theme, TimeFormat, DefaultSnoozeDuration, DefaultSound, AutoLaunch, MinimizeToTray, Language, EventRetentionDays, SystemTimezone)
- [ ] `refinery_schema_history` table auto-created by migration runner
- [ ] All 13 domain enums implemented in both TypeScript and Rust with PascalCase variants
- [ ] `AlarmRow.from_row()` correctly maps SQLite INTEGER → bool and TEXT → enum
- [ ] Boolean semantic inverse methods defined: `isDisabled()`, `isVibrationOff()`, `isFixedVolume()`
- [ ] Validation rules enforced for all fields per validation table
- [ ] Soft-delete uses `DeletedAt` column with 5-second undo window

## 02 — Design System (`02-design-system.md`)

- [ ] Light and dark color palettes defined with all semantic tokens
- [ ] Typography uses Inter font family with specified weights
- [ ] Border radius uses 12px (cards), 8px (buttons), 16px (modals)
- [ ] All 4 UI states implemented per view: loading (skeleton), populated, empty, error
- [ ] Skeleton screens use `animate-pulse` on `bg-muted` rectangles
- [ ] Error states show inline banner with retry button
- [ ] System tray icons meet platform requirements (macOS template, Windows .ico, Linux .png)

## 03 — File Structure (`03-file-structure.md`)

- [ ] Rust backend follows `src-tauri/src/` structure: `engine/`, `storage/`, `audio/`, `commands/`
- [ ] Frontend follows `src/` structure: `components/`, `stores/`, `hooks/`, `types/`, `lib/`
- [ ] Zustand stores in `stores/`: `useAlarmStore.ts`, `useOverlayStore.ts`, `useSettingsStore.ts`
- [ ] Migrations in `src-tauri/migrations/` with `V{N}__{description}.sql` naming
- [ ] i18n locale files in `src/locales/`
- [ ] Capabilities file at `src-tauri/capabilities/default.json`

## 04 — Platform Constraints (`04-platform-constraints.md`)

- [ ] `AlarmAppError` enum has all 13 variants with `thiserror` derive
- [ ] `WebhookError` enum has all 4 variants
- [ ] IPC error response format: `{ Code: string, Message: string, Details?: string }`
- [ ] `safeInvoke()` wrapper handles timeout (5s) and error toast
- [ ] WebKitGTK CSS fallbacks use `@supports` for `backdrop-filter`
- [ ] Code pattern exemptions documented: startup panics, mutex poisoning, test assertions

## 05 — Platform Strategy (`05-platform-strategy.md`)

- [ ] N/A — superseded by `06-tauri-architecture-and-framework-comparison.md`

## 06 — Tauri Architecture (`06-tauri-architecture-and-framework-comparison.md`)

- [ ] All IPC commands registered: alarm CRUD (5), group (3), settings (2), snooze (2), sound (4), export (3), history (3), challenges (2), wellness (4), smart (3), overlay (2)
- [ ] Zustand stores: `useAlarmStore` (CRUD + groups + loading/error), `useOverlayStore` (active alarm + queue), `useSettingsStore` (theme + preferences)
- [ ] IPC event → store update flow implemented via `useAlarmEvents` hook
- [ ] All npm packages pinned with `=x.y.z` exact versions

## 07 — Startup Sequence (`07-startup-sequence.md`)

- [ ] 9-step startup sequence executes in exact order
- [ ] Step 1: Resolve app data directory (`com.alarm-app`)
- [ ] Step 2: Open SQLite connection (create file if absent)
- [ ] Step 3: Run `refinery` migrations
- [ ] Step 4: Enable WAL mode + `busy_timeout=5000` + `foreign_keys=ON`
- [ ] Step 5: Load settings into memory, apply defaults for missing keys
- [ ] Step 6: Parallel init — system tray + logging (daily rotating, 7-day retention) + WebView/React
- [ ] Step 7: Start alarm engine (30s interval background thread)
- [ ] Step 8: Missed alarm check + snooze crash recovery + cleanup stale soft-deletes + purge old events
- [ ] Step 9: Update tray (next alarm), surface missed alarms, app ready
- [ ] Startup completes in < 750ms on target hardware
- [ ] Each step has specific error handling (no unhandled panics except intentional startup `expect()`)

## 08 — DevOps Setup Guide (`08-devops-setup-guide.md`)

- [ ] GitHub Actions CI matrix: macOS arm64, macOS x64, Windows x64, Linux x64
- [ ] Build produces platform artifacts: `.dmg` (macOS), `.msi` (Windows), `.deb`/`.AppImage` (Linux)
- [ ] Code signing configured for macOS (notarization) and Windows (optional EV cert)
- [ ] Auto-updater configured with Tauri updater plugin + GitHub Releases endpoint
- [ ] Test job runs `cargo test` + `pnpm vitest run --coverage` with 70% threshold

## 09 — Test Strategy (`09-test-strategy.md`)

- [ ] 4-layer test pyramid: unit (Rust) → integration (Rust) → component (React) → E2E (Playwright)
- [ ] Rust unit tests cover: all 5 repeat types, DST spring-forward, DST fall-back, timezone change, volume curve, sound validation
- [ ] Integration tests use in-memory SQLite with same schema
- [ ] Frontend tests mock Tauri `invoke()` via `vi.mock('@tauri-apps/api/core')`
- [ ] E2E tests cover: create→fire→dismiss, create→fire→snooze→re-fire→dismiss, delete→undo, group toggle
- [ ] Test fixtures use PascalCase keys matching production data model
- [ ] Coverage thresholds: Rust functions ≥ 70%, frontend lines ≥ 70%

## 10 — Dependency Lock (`10-dependency-lock.md`)

- [ ] All 30 Rust crates pinned with `=x.y.z` in `Cargo.toml`
- [ ] All 14 npm packages pinned with `=x.y.z` in `package.json`
- [ ] Breaking change warnings documented for: rusqlite 0.31→0.32.1, zustand v5, react-router v7, sonner v2
- [ ] No `^` or `~` version ranges in any dependency specification

## 11 — Platform Verification Matrix (`11-platform-verification-matrix.md`)

- [ ] Feature × platform matrix covers: alarm timing, audio playback, notifications, system tray, WebView CSS
- [ ] Each cell specifies: expected behavior, test method, fallback
- [ ] Platform-specific E2E tests (PLAT-01 through PLAT-10) defined

---

## Summary

| Fundamental | Criteria Count |
|------------|:-:|
| 01 Data Model | 10 |
| 02 Design System | 7 |
| 03 File Structure | 6 |
| 04 Platform Constraints | 6 |
| 05 Platform Strategy | 0 (superseded) |
| 06 Tauri Architecture | 4 |
| 07 Startup Sequence | 12 |
| 08 DevOps | 5 |
| 09 Test Strategy | 7 |
| 10 Dependency Lock | 4 |
| 11 Platform Verification | 3 |
| **Total** | **64** |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Feature Acceptance Criteria | `../02-features/97-acceptance-criteria.md` |
| All Fundamentals | `./00-overview.md` |
| Spec Authoring Guide | `../../01-spec-authoring-guide/05-app-project-template.md` |

---

*Fundamentals acceptance criteria rollup — created: 2026-04-10*
