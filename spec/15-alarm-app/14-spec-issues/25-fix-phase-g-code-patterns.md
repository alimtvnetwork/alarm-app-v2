# Fix Phase G — Code Sample Patterns

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Scope:** Fix expect() in non-startup code, raw negation patterns, add exemption documentation

---

## Issues Resolved

| Issue | Description | File Changed |
|-------|-------------|-------------|
| P15-001 | Raw `!` negation on `days_of_week.contains()` | `03-alarm-firing.md` |
| P15-002 | Raw `!args.start` without named boolean | `03-alarm-firing.md` |
| P15-003 | Raw `!` on `ALLOWED_EXTENSIONS.contains()` | `05-sound-and-vibration.md` |
| P15-004 | Double raw `!` in filename check | `05-sound-and-vibration.md` |
| P15-005 | `alarm.enabled` without `Is` prefix + PascalCase | `01-alarm-crud.md` |
| P15-007 | `expect()` in D-Bus code (4 locations) — non-startup | `03-alarm-firing.md` |
| P15-007 | `expect()` in startup code (3 locations) — add FATAL + exemption docs | `07-startup-sequence.md` |
| P16-004 | `assert!(!...)` in tests — documented as exempt | `04-platform-constraints.md` |
| P16-005 | `.not.toBeVisible()` in Playwright — documented as exempt | `04-platform-constraints.md` |
| P16-010 | `!= 0` SQLite pattern — documented as exempt | `04-platform-constraints.md` |
| P17-006 | D-Bus `expect()` contradicts graceful `match` — fixed to all `match` | `03-alarm-firing.md` |
| P17-009 | Mutex `expect()` not documented as exempt — now documented | `04-platform-constraints.md` |

---

## Changes Made

### `03-alarm-firing.md` (v1.7.0 → v1.8.0)
- `!repeat.days_of_week.contains()` → `repeat.is_day_excluded()`
- 4× `expect()` in D-Bus code → graceful `match` with `tracing::warn!` + early return
- `!args.start` → `let is_waking = !args.start;` with exemption comment

### `05-sound-and-vibration.md` (v1.4.0 → v1.5.0)
- `!ALLOWED_EXTENSIONS.contains()` → `let is_allowed = ...; if !is_allowed`
- Double `!contains()` → `let is_plain_filename = ...` named boolean

### `01-alarm-crud.md` (v1.6.0 → v1.7.0)
- `alarm.label`, `alarm.time`, `alarm.enabled` → `alarm.Label`, `alarm.Time`, `alarm.IsEnabled`

### `07-startup-sequence.md` (v1.1.0 → v1.2.0)
- Added `FATAL:` prefix and `// INTENTIONAL PANIC` comments to startup `expect()` calls

### `04-platform-constraints.md` (v1.4.0)
- Added "Code Pattern Exemptions" section with 6 documented exemptions

---

## Issues Resolved: 12
## Running Total: 256 total, 217 resolved, 39 open

---

*Fix Phase G — updated: 2026-04-10*
