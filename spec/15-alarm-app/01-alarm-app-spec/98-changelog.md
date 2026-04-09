# Changelog

**Version:** 1.3.0  
**Updated:** 2026-04-08  
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
  - Timezone change: recalculate all `nextFireTime` values
  - Implementation: `chrono-tz` crate + `system_timezone` setting
- **Issues tracking folder** — 7 new category files in `03-app-issues/`
  - `02-frontend-issues.md` — 7 issues (FE-STATE-001/002, FE-DND-001, FE-A11Y-001, FE-OVERLAY-001, FE-RENDER-001, FE-I18N-001)
  - `03-backend-issues.md` — 8 issues (BE-TIMER-001 ✅, BE-AUDIO-001/002, BE-WAKE-001, BE-CRON-001, BE-SNOOZE-001, BE-DELETE-001, BE-CONCUR-001)
  - `04-database-issues.md` — 4 issues (DB-MIGRATE-001, DB-GROWTH-001, DB-ORPHAN-001, DB-SETTINGS-001)
  - `05-security-issues.md` — 3 issues (SEC-PATH-001, SEC-WEBHOOK-001, SEC-EXPORT-001)
  - `06-performance-issues.md` — 2 issues (PERF-STARTUP-001, PERF-MEMORY-001)
  - `07-ux-ui-issues.md` — 3 issues (UX-DST-001, UX-TZ-001, UX-CHALLENGE-001)
  - `08-devops-issues.md` — 4 issues (DEVOPS-SIGN-001/002, DEVOPS-CI-001, DEVOPS-UPDATE-001)
- **AI Feasibility Analysis** — `/mnt/documents/alarm-app-ai-feasibility-analysis.md`
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
  - `01-fundamentals/04-platform-constraints.md` — changed from 1s to 30s
  - Now consistent with `02-features/03-alarm-firing.md` and `16-accessibility-and-nfr.md`
  - Snooze expiry uses exact `tokio::time::sleep_until()` instead of polling

---

### v1.2.0 — 2026-04-08

**Theme:** Web-to-native migration & spec enrichment

#### Added
- Missed Alarm Recovery section in `03-alarm-firing.md`
- `RepeatPattern` interface with `cron` type support
- `maxSnoozeCount` field in Alarm interface
- `nextFireTime` precomputed field and computation rules
- `snooze_state` table in SQLite schema
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
| Feasibility Analysis | `/mnt/documents/alarm-app-ai-feasibility-analysis.md` |

---

*Changelog — updated: 2026-04-08*
