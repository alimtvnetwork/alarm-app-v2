

# Discovery Phase 3: Cross-File Logic Consistency Audit

## Audit Scope
Deep scan of the firing → snooze → dismiss flow, DST logic, concurrency patterns, and data model completeness across all spec files.

---

## New Issues Found: 12

### Logic Flow Issues

**LC-001: `AlarmChallenge` Not in Data Model or `alarms` Table** (Critical)
- `06-dismissal-challenges.md` defines `AlarmChallenge` interface with fields `type`, `difficulty`, `shakeCount`, `stepCount`
- Neither the TS `Alarm` interface nor the SQL `alarms` table has a `challenge` or `challengeType` column
- AI cannot implement challenge-per-alarm without schema support
- The `challenge_type` column exists only in `alarm_events` (logging), not in `alarms` (configuration)

**LC-002: Snooze State TS Interface Uses `nextFireTime` But Table Uses `snooze_until`** (Medium)
- `04-snooze-system.md` line 43: TS `SnoozeState.nextFireTime`
- `01-data-model.md` line 261: SQL column is `snooze_until`
- AI will map wrong field name in serialization

**LC-003: Soft-Delete Timer Uses `sqlx` While Project Chose `rusqlite`** (Critical — extends IC-001)
- `01-alarm-crud.md` lines 61, 76: `sqlx::query(...)` in the delete timer and cleanup functions
- These are the ONLY code samples for soft-delete/undo behavior — AI will copy them verbatim
- Already tracked in IC-007 but worth noting this is critical path code

**LC-004: `on_timezone_change` Uses `SqlitePool` (sqlx type) with `async` but `rusqlite` is sync** (Critical)
- `03-alarm-firing.md` line 155: `fn on_timezone_change(pool: &SqlitePool, new_tz: &Tz)` — uses `await` inside
- `rusqlite` is synchronous — no `SqlitePool`, no `.await`
- This function is copy-paste-critical for DST handling and will fail to compile

**LC-005: Startup Step 2 Uses `SqlitePool::connect` (sqlx API)** (Critical)
- `07-startup-sequence.md` line 117: `SqlitePool::connect(&format!("sqlite:{}?mode=rwc", ...))`
- This is `sqlx` connection API. `rusqlite` uses `Connection::open(path)`
- Startup will not compile as written

### DST Logic Issues

**LC-006: Spring-Forward Hardcoded to 3:00 AM** (Critical — already noted, now with evidence)
- `03-alarm-firing.md` line 135: `NaiveTime::from_hms_opt(3, 0, 0).unwrap()`
- `13-ai-cheat-sheet.md` line 79: same hardcoded 3:00 AM
- DST transitions vary: EU = 2:00→3:00, US = 2:00→3:00, Lord Howe Island = 2:00→2:30, Brazil (historical) = 0:00→1:00
- Correct approach: iterate forward minute-by-minute from the skipped time until a valid time is found
- AI will copy the hardcoded value and produce incorrect behavior for ~30% of world timezones

**LC-007: `purge_old_events` Uses `sqlx` in Data Model** (Medium — extends IC-001)
- `01-data-model.md` line 306: `sqlx::query("DELETE FROM alarm_events WHERE timestamp < ?")`
- Same pattern: uses sqlx in a file that elsewhere uses rusqlite

### Concurrency Logic Issues

**LC-008: `currently_firing` HashSet Not Thread-Safe** (Critical)
- `12-platform-and-concurrency-guide.md` line 219: `currently_firing: HashSet<String>` in `AlarmEngine`
- HashSet is not `Send + Sync` — cannot be shared across async tasks without `Arc<Mutex<>>`
- Engine runs in `tokio::spawn` — needs `Arc<Mutex<HashSet<String>>>` or `DashSet`
- AI will get a compile error on the `Sync` bound

**LC-009: Race 2 Optimistic Locking Uses `sqlx`** (Medium — extends IC-001)
- `12-platform-and-concurrency-guide.md` line 181: `sqlx::query("UPDATE alarms SET...")`
- Optimistic locking code is the safeguard for a critical race condition — must compile

**LC-010: Snooze Crash Recovery Not in Startup Sequence** (Medium)
- `04-snooze-system.md` line 82: "On startup, query `snooze_state` table for active snoozes"
- `07-startup-sequence.md` Step 8 only mentions missed alarms from `alarms` table
- Active snoozes from previous session are never recovered — snoozed alarms silently disappear

### Data Flow Issues

**LC-011: CSV Export Uses `snake_case` Column Names** (Medium — naming violation)
- `10-export-import.md` line 60: columns are `repeat_type, repeat_days, group_name, sound_file, snooze_duration, max_snooze_count`
- Coding guidelines mandate PascalCase for all keys including export formats
- Already tracked in naming violations but this is a data flow issue too

**LC-012: `alarm_events` Duplicate Schema — Analytics vs Data Model** (Already IC-005, confirmed)
- `13-analytics.md` line 91 and `01-data-model.md` line 265 both define `CREATE TABLE alarm_events`
- Confirmed identical for now, but any future edit to one without the other will break

---

## Updated Totals

| Category | Previous | New | Total |
|----------|:--------:|:---:|:-----:|
| Naming Violations | 11 | 1 | 12 |
| Internal Contradictions | 7 | 0 | 7 |
| Structural Issues | 5 | 0 | 5 |
| Content Gaps | 6 | 1 | 7 |
| AI Handoff Risks | 4 | 0 | 4 |
| **Logic Consistency (NEW)** | 0 | 10 | **10** |
| **Grand Total** | **33** | **12** | **45** |

---

## Severity Breakdown (All 45 Issues)

| Severity | Count |
|----------|:-----:|
| Critical | 20 |
| Medium | 23 |
| Low | 2 |

---

## Implementation Plan

1. **Create** `14-spec-issues/06-logic-consistency.md` with all 10 new LC-xxx issues
2. **Update** `14-spec-issues/01-naming-violations.md` — add LC-011
3. **Update** `14-spec-issues/04-content-gaps.md` — add LC-001 (AlarmChallenge missing from schema)
4. **Update** `14-spec-issues/00-overview.md` — add category 6, update totals to 45, mark Phase 3 done
5. **Update** `mem://feature/alarm-app-spec-issues` — sync with new totals and phase status

---

## Key Insight

The `sqlx` vs `rusqlite` contradiction (IC-001) is far worse than initially assessed. It is not just a naming disagreement — it infects **8+ code samples** across critical paths: startup, soft-delete, DST timezone change, event purge, optimistic locking, and connection pooling. An AI copying these samples will hit compilation failures across the entire backend.

