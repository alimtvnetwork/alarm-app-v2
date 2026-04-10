# Changelog

**Version:** 2.0.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`changelog`, `versions`, `history`, `changes`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | N/A (reserved prefix 98) |
| AI Confidence assigned | ✅ |
| Ambiguity assigned | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |

---

## Version History

### v2.2.0 — 2026-04-10

**Theme:** Fix phases A–G — 37 issues resolved, readiness score upgraded to ~85/100

#### Fix Phases

| Phase | Issues | Focus |
|-------|:------:|-------|
| A | 11 | Domain enums: 13 TS + 13 Rust enums replacing all magic string union types |
| B | 2 | Error enums: WebhookError definition (7 variants), IPC error response format |
| C | 6 | Acceptance criteria added to 4 feature files, camelCase IPC keys fixed |
| D | 6 | Test fixtures PascalCase, cheat sheet thiserror 2.x, enum guidance |
| G | 12 | Code patterns: expect()→match, raw !→named booleans, exemptions documented |

#### Changed
- `01-data-model.md` → v1.8.0: Domain Enums section, interfaces use enum types, Rust struct uses enum types
- `04-platform-constraints.md` → v1.4.0: IPC error response format, code pattern exemptions section
- `07-startup-sequence.md` → v1.2.0: FATAL markers on intentional panics
- `09-test-strategy.md`: Test fixtures PascalCase with enum imports
- `13-ai-cheat-sheet.md` → v1.1.0: Domain enums table, error enums, thiserror 2.x, PascalCase safeInvoke
- `01-alarm-crud.md` → v1.7.0: PascalCase ARIA attrs
- `03-alarm-firing.md` → v1.8.0: D-Bus graceful degradation, named booleans
- `05-sound-and-vibration.md` → v1.5.0: Named booleans for path checks
- `06-dismissal-challenges.md` → v1.4.0: Enum types, acceptance criteria
- `09-theme-system.md`: ThemeMode enum
- `10-export-import.md`: PascalCase keys + enum types
- `11-sleep-wellness.md` → v1.2.0: PascalCase IPC keys, acceptance criteria
- `12-smart-features.md` → v1.3.0: WebhookError enum, acceptance criteria
- `13-analytics.md`: HistoryFilter with enum types
- `14-personalization.md` → v1.3.0: Acceptance criteria
- `10-ai-handoff-readiness-report.md` → v2.1.0: ~85/100, 39 open, 0 critical
- `99-consistency-report.md` → v2.1.0: Health 85/100
- `00-overview.md` → v2.2.0: Status ~85/100, enum references in data model

#### Status
- **Total issues:** 256 (217 resolved + 39 open)
- **Open severity:** 0 critical, 22 medium, 17 low
- **All blocking issues resolved** — spec is ready for AI handoff with minor caveats

---

### v2.1.0 — 2026-04-10

**Theme:** Deep quality audit — 76 new issues found across 5 discovery phases, readiness score downgraded to ~70/100

#### Discovery Phases 14–18

| Phase | Issues | Focus |
|-------|:------:|-------|
| 14 | 29 | Structural: magic string types (9), missing enums (2), missing IPC error format, missing acceptance criteria (4) |
| 15 | 13 | Code quality: raw `!` negation (4), `expect()` anti-patterns (3), camelCase IPC keys (2), boolean semantics |
| 16 | 12 | Test/cheat sheet: camelCase test fixtures (critical), thiserror version mismatch, missing PascalCase examples |
| 17 | 12 | Execution guides: stale handoff report (critical), missing enum tasks in breakdown, D-Bus contradictions |
| 18 | 10 | Staleness: root overview 100/100, consistency reports stale, changelog missing phases 14–17 |

#### Changed
- `00-overview.md` → v2.1.0: Status downgraded from "Complete" to "Conditionally Ready", readiness ~70/100
- `10-ai-handoff-readiness-report.md` → v2.0.0: Re-scored to ~70/100, 256 issues (76 open), blocking gaps documented
- `99-consistency-report.md` (root) → v2.0.0: Health score 70/100, open issues listed, stale subfolder reports flagged
- `14-spec-issues/00-overview.md` → v1.14.0: Added phases 14–18, totals 256/76/180

#### Status
- **Total issues:** 256 (180 resolved + 76 open)
- **Discovery phases:** 18 complete (saturation reached — yield declining)
- **Recommended next step:** Begin fix phases for 76 open issues

---

### v2.0.0 — 2026-04-10

**Theme:** 100/100 readiness — dependency pinning + platform verification matrix close final 2-point gap (subsequently downgraded by phases 14–18)

#### Added
- **`10-dependency-lock.md`** (new) in `01-fundamentals/` — 30 Rust crates + 14 npm packages pinned with `=x.y.z` exact versions, API surface documented per dependency, breaking changes flagged (rusqlite 0.31→0.32.1, rodio pin at 0.19, croner pin at 2.0.7, zustand pin at 4.5.7), compatibility matrix, upgrade policy
- **`11-platform-verification-matrix.md`** (new) in `01-fundamentals/` — Feature × Platform × Expected Behavior × Test Method × Fallback tables for alarm timing, audio playback, notifications, system tray, WebView CSS, notification permission flows (macOS/Windows/Linux)
- **Platform E2E tests** (PLAT-01 through PLAT-10) in `09-test-strategy.md` — alarm firing while minimized, sleep/wake missed alarms, audio sessions, tray icons, CSS fallbacks, DST boundaries
- **Dependency compatibility tests** (DEP-01 through DEP-07) in `09-test-strategy.md` — cargo check, migration compat, plugin registration, npm install, vite build, tsc strict, IPC type check
- **Tray icon asset requirements** in `02-design-system.md` — per-platform format, sizes, color mode rules
- **npm `package.json` section** in `03-file-structure.md` — all frontend deps pinned with `=x.y.z`
- **`thiserror` crate** added to Cargo.toml — was used in `AlarmAppError` but never listed

#### Changed
- `00-overview.md` → v2.0.0: Readiness score 100/100, fundamentals count 12
- `01-fundamentals/00-overview.md` → v1.4.0: Added files 10, 11 to inventory
- `01-fundamentals/02-design-system.md` → v1.2.0: Tray icon assets section
- `01-fundamentals/03-file-structure.md` → v1.6.0: Cargo.toml exact pins, npm section, thiserror added
- `01-fundamentals/06-tauri-architecture.md` → v1.2.0: Plugin versions + API signatures
- `01-fundamentals/09-test-strategy.md` → v1.1.0: Platform E2E + dep compat test layers
- `10-ai-handoff-readiness-report.md` → v1.3.0: 100/100 score, 12 fundamentals, 6 test layers, dep pins
- All `99-consistency-report.md` files updated to reflect v2.0.0

#### Gap Resolution (98 → 100)
- **Gap 1 (Platform Runtime Testing, -1pt):** ✅ Resolved — platform verification matrix with testable assertions per OS
- **Gap 2 (Third-Party API Surface, -1pt):** ✅ Resolved — all 44 dependencies pinned with exact versions + API surface documented

---

### v1.9.0 — 2026-04-10

**Theme:** Final spec audit — 180 total issues resolved across 13 discovery phases, readiness score 98/100

#### Added
- **`14-spec-issues/13-discovery-phase-11.md`** — 14 issues: memory budget contradiction (150MB vs 200MB), startup budget contradiction (2s vs 750ms), AlarmEvents column count, i18n locale path mismatch, missing IPC commands, dark mode token, stale overview
- **`14-spec-issues/14-discovery-phase-12.md`** — 9 issues: stale readiness report versions/counts, cheat sheet AlarmEvents column count, concurrency guide PascalCase/field refs, reliability report stale gaps, consistency report missing inventory, task breakdown duration mismatch
- **`14-spec-issues/15-discovery-phase-13.md`** — 3 issues: absolute local path in app-issues overview, stale AlarmEvents.Metadata column ref, incorrect feature count (190+ → 69)

#### Changed
- `10-ai-handoff-readiness-report.md` → v1.2.0: Re-scored to **98/100 (A+)**, AI success rate 97–99%, 180/180 issues, 13 discovery phases, 59 fix phases, updated all file versions and cross-references
- `09-ai-handoff-reliability-report.md` — Added "ALL RESOLVED" banners to gaps section, updated issue counts
- `12-platform-and-concurrency-guide.md` — PascalCase table names (`Alarms`), corrected `alarm.alarm_id` field references
- `13-ai-cheat-sheet.md` — AlarmEvents column count corrected to 13
- `99-consistency-report.md` (root) — Full inventory of all 7 root documents and 4 subfolders
- `03-app-issues/00-overview.md` — Removed absolute filesystem path, changed to external document note
- `03-app-issues/07-ux-ui-issues.md` — `AlarmEvents.Metadata` → `AlarmEvents.ChallengeSolveTimeSec`
- `15-reference/alarm-app-features.md` — Total features corrected from "~190+" to 69
- `14-spec-issues/00-overview.md` → v1.9.0: Added phases 11–13, updated totals to 180/180
- `02-features/03-alarm-firing.md` — Fixed memory budget (150MB → 200MB), startup budget (2s → 750ms)
- `02-features/05-sound-and-vibration.md` — Added missing IPC commands
- `02-features/06-dismissal-challenges.md` — Added missing IPC commands, clarified AlarmChallenge interface
- `02-features/14-personalization.md` — Added missing IPC commands
- `01-fundamentals/02-design-system.md` — Added destructive token for dark mode
- `01-fundamentals/16-accessibility-and-nfr.md` — Fixed i18n locale path
- `00-overview.md` — Updated fundamentals count, dates, and spec-issues reference

#### Fixed (26 spec quality issues across 3 discovery phases)
- **Discovery 11:** 14 issues — feature specs & fundamentals deep audit (3 critical, 7 medium, 4 low)
- **Discovery 12:** 9 issues — root-level docs & execution guides audit (stale versions, naming, cross-refs)
- **Discovery 13:** 3 issues — app issues & reference docs audit (absolute path, stale column, incorrect count)

---

### v1.8.0 — 2026-04-10

**Theme:** Spec quality audit — 154 issues found and resolved across 10 discovery phases and 46 fix phases

#### Added
- **`14-spec-issues/`** folder (new) — 12 discovery/fix tracking documents covering naming violations, contradictions, structural issues, content gaps, AI handoff risks, logic consistency, UI/UX consistency, guideline compliance
- **`ValueType`** column on `Settings` table schema (`01-data-model.md`) — enables typed `get_setting<T>()` helper
- **SUPERSEDED** banner on `05-platform-strategy.md` — points to authoritative `06-tauri-architecture-and-framework-comparison.md`
- **Supplementary** banner on `09-ai-handoff-reliability-report.md` — clarifies relationship to authoritative `11-atomic-task-breakdown.md`

#### Changed
- `00-overview.md` — Updated spec-issues count (154 found), reliability report label changed from "superseded" to "supplementary"
- `01-fundamentals/01-data-model.md` → v1.7.0: Settings `ValueType` column, `Alarms` table comment fix, AutoLaunch/MinimizeToTray typed as boolean, PascalCase naming throughout all SQL and prose
- `01-fundamentals/03-file-structure.md` → v1.5.0: Removed duplicate `rusqlite`/`refinery` Cargo.toml entries, `db.ts` → "IPC query wrappers"
- `01-fundamentals/04-platform-constraints.md` → v1.3.0: PascalCase naming fixes
- `01-fundamentals/09-test-strategy.md` → v1.0.0: PascalCase naming fixes in test examples
- `02-features/01-alarm-crud.md` → v1.6.0: PascalCase in pseudocode
- `02-features/03-alarm-firing.md` → v1.7.0: PascalCase for all table/column references
- `02-features/10-export-import.md` → v1.3.0: PascalCase in export schema
- `02-features/11-sleep-wellness.md` → v1.1.0: PascalCase in settings references
- `03-app-issues/` — PascalCase fixes across all 8 issue files (column names, table names, SQL)
- `09-ai-handoff-reliability-report.md` — PascalCase fixes, supplementary banner
- `10-ai-handoff-readiness-report.md` — Updated file versions, added spec-issues reference, fixed absolute filesystem path
- `11-atomic-task-breakdown.md` — PascalCase naming fixes
- `12-platform-and-concurrency-guide.md` — PascalCase naming fixes
- `13-ai-cheat-sheet.md` — Settings column count 2→3, PascalCase fixes
- `15-reference/alarm-app-features.md` — PascalCase naming fixes
- `15-reference/alarm-clock-features.md` — PascalCase naming fixes
- Both `99-consistency-report.md` files → v1.6.0: Updated all version numbers, added PascalCase compliance checks

#### Fixed (154 spec quality issues across 10 discovery phases)
- **Discovery 1–6:** 77 issues — naming violations (18), contradictions (11), structural (5), content gaps (12), AI handoff risks (4), logic consistency (11), UI/UX consistency (4), guideline compliance (12)
- **Discovery 7:** 18 issues — regression scan after initial fixes
- **Discovery 8:** 11 issues — remaining files audit
- **Discovery 9:** 30 issues — full grep scan for snake_case/camelCase violations
- **Discovery 10:** 18 issues — deep cross-file audit (stale data, schema contradictions, broken cross-references, ambiguity)

---

### v1.7.0 — 2026-04-09

**Theme:** Near-100% AI execution coverage — eliminate residual 10–15% risk

#### Added
- **`11-atomic-task-breakdown.md`** (new) — 62 dependency-ordered tasks across 12 phases, effort estimates, risk levels, critical path diagram. Reduces AI guessing to zero by providing exact execution order
- **`12-platform-and-concurrency-guide.md`** (new) — Platform-specific gotchas (macOS `objc2` observer lifetime, Windows hidden message window, Linux D-Bus graceful degradation), 5 race condition safeguards with Rust code (undo vs hard-delete, alarm fire during edit, snooze after dismiss, double-fire prevention, group toggle conflicts), SQLite concurrency rules, crate version compatibility notes
- **`13-ai-cheat-sheet.md`** (new) — Single-page AI quick reference: tech stack, file structure, 5 critical implementation patterns, 10 cross-platform warnings, startup sequence, error handling rules, spec file lookup table, 8 execution rules for AI
- Race condition test examples: `test_undo_during_hard_delete_timer`, `test_dismiss_cancels_snooze`, `test_engine_tick_does_not_double_fire`
- Build verification script (`scripts/verify-build.sh`) — 5-step automated check
- Platform test checklist — 7 manual tests per platform

#### Changed
- `00-overview.md` → v1.5.0 (added modules 09, 11, 12, 13 to inventory, status updated to "Near-100% Coverage")
- Readiness score interpretation: 96/100 spec quality + near-100% execution guidance

#### Risk Reduction
- **Before (v1.6.0):** 85–90% AI success rate, 10–15% residual risk from platform FFI, async race conditions, crate API changes
- **After (v1.7.0):** ~95–98% AI success rate. Remaining 2–5% is irreducible: human-only tasks (code signing certificates, Apple Developer enrollment) and runtime-only bugs (OS-specific audio quirks, WebKitGTK version differences)

---

### v1.6.0 — 2026-04-09

**Theme:** All 43 issues resolved — spec complete for AI handoff

#### Added
- **`09-test-strategy.md`** (new) in `01-fundamentals/` — 4-layer test strategy: Rust unit (cargo test, 90% scheduler coverage), Rust integration (in-memory SQLite), frontend unit (Vitest + React Testing Library, 70%), E2E (tauri-driver + Playwright). CI YAML, fixtures, coverage thresholds
- **Logging strategy** in `07-startup-sequence.md` v1.1.0 — `tracing` + `tracing-appender` (daily rotation, 7-day retention), 5 log levels, frontend forwarding via `log_from_frontend` IPC
- **Multi-monitor overlay** in `03-alarm-firing.md` v1.5.0 — `current_monitor()` for visible app, `primary()` when minimized to tray
- **Export privacy warning** in `10-export-import.md` v1.3.0 — confirmation dialog before export, optional AES-256 ZIP for v2.0+
- **Challenge calibration** in `06-dismissal-challenges.md` v1.2.0 — operand rules per tier, target solve times, solve time logging in `AlarmEvents.metadata`, Custom tier (P2), integer-only answers
- **`AlarmLabelSnapshot` + `AlarmTimeSnapshot`** columns on `AlarmEvents` table — preserves context after alarm deletion (DB-ORPHAN-001)
- **`ValueType` column** on `Settings` table + typed `get_setting<T>()` Rust helper (DB-SETTINGS-001)
- **`@dnd-kit/core` v6.x** explicitly specified, `react-beautiful-dnd` rejected as deprecated (FE-DND-001)

#### Changed
- `01-fundamentals/01-data-model.md` → v1.6.0 (AlarmRow Rust struct, croner v2.0 pinned, DB-ORPHAN-001, DB-SETTINGS-001)
- `01-fundamentals/07-startup-sequence.md` → v1.1.0 (logging strategy)
- `02-features/03-alarm-firing.md` → v1.5.0 (multi-monitor overlay)
- `02-features/06-dismissal-challenges.md` → v1.2.0 (calibrated tiers)
- `02-features/10-export-import.md` → v1.3.0 (privacy warning)
- `03-app-issues/00-overview.md` → v1.4.0 (all 43 resolved)
- All `99-consistency-report.md` files updated to reflect final state

#### Fixed (10 issues resolved)
- **BE-LOG-001** ✅ — Logging strategy (tracing + tracing-appender)
- **BE-VOLUME-001** ✅ — Already resolved by BE-AUDIO-001 (quadratic curve in sound spec)
- **FE-DND-001** ✅ — @dnd-kit/core specified
- **FE-OVERLAY-001** ✅ — Multi-monitor overlay behavior defined
- **DB-ORPHAN-001** ✅ — Denormalized snapshot columns on `AlarmEvents`
- **DB-SETTINGS-001** ✅ — value_type column + get_setting<T>()
- **SEC-EXPORT-001** ✅ — Export privacy warning dialog
- **SEC-SOUND-001** ✅ — Already resolved by BE-AUDIO-002/SEC-PATH-001 validation chain
- **UX-CHALLENGE-001** ✅ — Calibrated difficulty tiers with operand rules

---

### v1.5.0 — 2026-04-09

**Theme:** Medium-impact issue resolution batch (11 issues)

#### Added
- **Custom sound validation** in `05-sound-and-vibration.md` v1.4.0 — `validate_custom_sound()` function (extension, size, symlink, restricted paths), `resolve_sound_path()` fallback
- **Platform audio sessions** in `05-sound-and-vibration.md` v1.4.0 — macOS `AVAudioSession` Playback+DuckOthers, Windows/Linux notes
- **Gradual volume algorithm** in `05-sound-and-vibration.md` v1.4.0 — quadratic curve (`t²`), 100ms interval, `run_gradual_volume()` Rust implementation
- **Undo stack** in `01-alarm-crud.md` v1.6.0 — max 5 entries, independent timers, stacking toasts (max 3), undo-any capability
- **WebView CSS compatibility** in `04-platform-constraints.md` v1.3.0 — engine matrix, `@supports` feature detection, safe/unsafe CSS lists, `platform.css`
- **Memory budget** in `04-platform-constraints.md` v1.3.0 — revised to 200MB (WebView overhead), component breakdown, optimization strategies
- **i18n enforcement** in `03-file-structure.md` v1.4.0 — `react-i18next`, `eslint-plugin-i18next` no-literal-string rule, `en.json` key inventory
- **AlarmRow Rust struct** in `01-data-model.md` v1.6.0 — `from_row()`, `days_of_week()`, `repeat_pattern()`, `RepeatType` enum
- **`croner` v2.0** pinned in `01-data-model.md` v1.6.0

#### Changed
- `01-fundamentals/01-data-model.md` → v1.6.0
- `01-fundamentals/03-file-structure.md` → v1.4.0
- `01-fundamentals/04-platform-constraints.md` → v1.3.0
- `02-features/01-alarm-crud.md` → v1.6.0
- `02-features/05-sound-and-vibration.md` → v1.4.0

#### Fixed (11 issues resolved)
- **BE-AUDIO-002** ✅, **BE-CRON-001** ✅, **BE-AUDIO-003** ✅, **FE-STATE-002** ✅, **FE-RENDER-001** ✅, **FE-I18N-001** ✅, **DB-SERIAL-001** ✅, **SEC-PATH-001** ✅, **PERF-STARTUP-001** ✅, **PERF-MEMORY-001** ✅, **DEVOPS-TEST-001** ✅

---

### v1.4.0 — 2026-04-09

**Theme:** DevOps + high/medium-impact issue resolution (22 issues total resolved)

#### Added
- **`08-devops-setup-guide.md`** (new) in `01-fundamentals/` — macOS code signing (Apple Developer, notarization), Windows code signing (EV certificate, signtool), CI/CD pipeline (GitHub Actions matrix), auto-update key management (tauri-plugin-updater, Ed25519)
- **`07-startup-sequence.md`** (new) in `01-fundamentals/` — 9-step initialization, parallel init (tokio::join!), <750ms budget, error handling per step
- **Soft-delete timer** in `01-alarm-crud.md` v1.5.0 — `tokio::spawn` + `sleep(5s)`, startup cleanup for stale deleted_at rows
- **Exact snooze timing** in `04-snooze-system.md` v1.3.0 — `tokio::time::sleep_until(snooze_expiry)` replacing polling
- **SSRF protection** in `12-smart-features.md` v1.2.0 — `validate_webhook_url()`, `is_private_ip()`, HTTP client rules
- **Platform wake-events** in `03-alarm-firing.md` v1.5.0 — `WakeListener` trait, macOS/Windows/Linux FFI implementations
- **Error handling strategy** in `04-platform-constraints.md` v1.2.0 — `AlarmAppError` enum, 12-error behavior table, `safeInvoke` wrapper
- **DST handling** in `03-alarm-firing.md` v1.4.0 — `resolve_local_to_utc()`, spring-forward/fall-back rules, 5 test cases
- **WAL mode** in `01-data-model.md` v1.5.0 — `PRAGMA journal_mode=WAL`, busy_timeout=5000
- **Event retention** in `01-data-model.md` v1.5.0 — 90-day purge, `EventRetentionDays` setting
- **Group toggle state** in `07-alarm-groups.md` v1.2.0 — `IsPreviousEnabled` column
- **Alarm queue** in `03-alarm-firing.md` v1.3.0 — FIFO `AlarmQueue` struct, overlay sequencing
- **AI Handoff Reliability Report** — 11 spec gap issues merged into category files
- **Keyboard accessibility** in `01-alarm-crud.md` v1.4.0 — full keyboard shortcut table, ARIA attributes, dnd-kit KeyboardSensor

#### Fixed (21 issues resolved in this version)
- **Critical:** DEVOPS-SIGN-001 ✅ (macOS signing), DEVOPS-SIGN-002 ✅ (Windows signing)
- **High:** BE-TIMER-001 ✅, BE-WAKE-001 ✅, FE-A11Y-001 ✅, SEC-WEBHOOK-001 ✅, UX-DST-001 ✅, UX-TZ-001 ✅, DEVOPS-CI-001 ✅, DEVOPS-UPDATE-001 ✅, DB-MIGRATE-001 ✅, BE-STARTUP-001 ✅, BE-QUEUE-001 ✅
- **Medium:** BE-AUDIO-001 ✅, BE-SNOOZE-001 ✅, BE-DELETE-001 ✅, BE-CONCUR-001 ✅, BE-ERROR-001 ✅, FE-STATE-001 ✅, DB-GROWTH-001 ✅, DEVOPS-PERM-001 ✅, DEVOPS-CARGO-001 ✅

---

### v1.3.0 — 2026-04-08

**Theme:** Technology decisions & issue tracking maturity

#### Added
- **`@dnd-kit/core` + `@dnd-kit/sortable`** specified as DnD library in `02-features/01-alarm-crud.md`
  - Keyboard alternative (`Ctrl+Shift+↑/↓`) added for WCAG 2.1 AA compliance
- **`croner` crate** specified as Rust cron parser in `01-fundamentals/01-data-model.md` and `02-features/03-alarm-firing.md`
- **`refinery` crate** specified as SQLite migration tool in `01-fundamentals/03-file-structure.md`
  - Migration files now use `V1__` naming convention
- **DST & Timezone Handling Rules** — new section in `01-fundamentals/01-data-model.md`
  - Spring-forward: fire at next valid minute
  - Fall-back: fire on first occurrence only
  - Timezone change: recalculate all `NextFireTime` values
  - Implementation: `chrono-tz` crate + `SystemTimezone` setting
- **Issues tracking folder** — 7 new category files in `03-app-issues/`
  - `02-frontend-issues.md` — 7 issues (FE-STATE-001/002, FE-DND-001, FE-A11Y-001, FE-OVERLAY-001, FE-RENDER-001, FE-I18N-001)
  - `03-backend-issues.md` — 8 issues (BE-TIMER-001 ✅, BE-AUDIO-001/002, BE-WAKE-001, BE-CRON-001, BE-SNOOZE-001, BE-DELETE-001, BE-CONCUR-001)
  - `04-database-issues.md` — 4 issues (DB-MIGRATE-001, DB-GROWTH-001, DB-ORPHAN-001, DB-SETTINGS-001)
  - `05-security-issues.md` — 3 issues (SEC-PATH-001, SEC-WEBHOOK-001, SEC-EXPORT-001)
  - `06-performance-issues.md` — 2 issues (PERF-STARTUP-001, PERF-MEMORY-001)
  - `07-ux-ui-issues.md` — 3 issues (UX-DST-001, UX-TZ-001, UX-CHALLENGE-001)
  - `08-devops-issues.md` — 4 issues (DEVOPS-SIGN-001/002, DEVOPS-CI-001, DEVOPS-UPDATE-001)
- **AI Feasibility Analysis** — external document (not included in spec repo)
  - 62% overall success probability
  - 32 atomic issues across 9 categories
  - Execution roadmap: 18–29 day estimate, ~30% AI / ~70% human

#### Changed
- `01-fundamentals/01-data-model.md` → v1.3.0
- `01-fundamentals/03-file-structure.md` → v1.2.0
- `02-features/01-alarm-crud.md` → v1.3.0
- `03-app-issues/00-overview.md` → v1.1.0 (issue summary table added, 32 total issues)
- `03-app-issues/99-consistency-report.md` → v1.2.0 (10 files, 100/100 health)

#### Fixed
- **BE-TIMER-001 (RESOLVED):** Standardized alarm check interval to **30 seconds** across all specs

---

### v1.2.0 — 2026-04-08

**Theme:** Web-to-native migration & spec enrichment

#### Added
- Missed Alarm Recovery section in `03-alarm-firing.md`
- `RepeatPattern` interface with `cron` type support
- `MaxSnoozeCount` field in Alarm interface
- `NextFireTime` precomputed field and computation rules
- `SnoozeState` table in SQLite schema
- Platform-specific wake-event listeners (macOS/Windows/Linux)
- Auto-dismiss feature with configurable timeout
- Reference documents: `alarm-app-features.md`, `alarm-clock-features.md` (75 features)
- `01-web-to-native-migration.md` in app-issues

#### Changed
- All specs migrated from web app (localStorage/React) to native (Tauri 2.x/Rust/SQLite)
- IPC command registry expanded to full CRUD + audio + export
- Priority matrix updated: P0 (CRUD, Firing, Snooze, Tray)

---

### v1.1.0 — 2026-04-07

**Theme:** Initial Tauri 2.x architecture

#### Added
- Platform strategy (`05-platform-strategy.md`)
- Platform constraints (`04-platform-constraints.md`)
- File structure for Tauri 2.x (`03-file-structure.md`)
- IPC command registry
- System tray specification

---

### v1.0.0 — 2026-04-06

**Theme:** Initial alarm app specification

#### Added
- Core data model (Alarm, AlarmGroup, AlarmSound, AlarmEvent)
- Feature specs: CRUD, firing, snooze, sound, challenges, groups, UI themes
- Analytics, export/import, smart features, accessibility & NFR

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Spec Overview | `./00-overview.md` |
| Issues Folder | `./03-app-issues/00-overview.md` |
| Spec Issues Audit | `./14-spec-issues/00-overview.md` |
| Feasibility Analysis | External document (not included in spec repo) |
| AI Handoff Readiness Report | `./10-ai-handoff-readiness-report.md` |

---

*Changelog v1.9.0 — updated: 2026-04-10*
