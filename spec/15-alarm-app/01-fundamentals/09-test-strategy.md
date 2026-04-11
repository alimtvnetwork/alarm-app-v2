# Test Strategy

**Version:** 1.2.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 — Must Have  
**Resolves:** DEVOPS-TEST-001

---

## Keywords

`testing`, `unit-test`, `integration-test`, `e2e`, `coverage`, `ci`, `vitest`, `tauri-driver`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ⚠️ N/A (consolidated in 97-acceptance-criteria.md) |


## Purpose

Defines the test layers, tools, coverage targets, and CI integration for the Alarm App. Without a test strategy, AI-generated code will have zero verification.

---

## Test Layers

### Layer 1 — Rust Unit Tests

**Tool:** Built-in `#[cfg(test)]` + `cargo test`

**Scope:** Pure logic functions with no I/O or side effects.

| Module | Test Cases |
|--------|-----------|
| `scheduler.rs` | `NextFireTime` for all 5 repeat types (once, daily, weekly, interval, cron) |
| `scheduler.rs` | DST spring-forward (skipped time → next valid minute) |
| `scheduler.rs` | DST fall-back (ambiguous time → first occurrence) |
| `scheduler.rs` | Timezone change recalculation |
| `gradual_volume.rs` | Volume curve values at 0%, 25%, 50%, 75%, 100% of duration |
| `validate_custom_sound()` | Valid files, wrong extension, too large, symlink, system path |
| `validate_webhook_url()` | Valid HTTPS, localhost blocked, private IP blocked, HTTP rejected |
| `RepeatType::from_str()` | All 5 valid types + invalid input |
| `AlarmRow::days_of_week()` | Valid JSON, empty array, malformed JSON (returns default) |

**Example:**

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use chrono::NaiveTime;

    #[test]
    fn test_next_fire_time_once_future() {
        let alarm_time = NaiveTime::from_hms_opt(7, 30, 0).unwrap();
        let tz = chrono_tz::Asia::Kuala_Lumpur;
        let now = Utc.with_ymd_and_hms(2026, 4, 9, 0, 0, 0).unwrap(); // midnight UTC = 8AM KL

        let result = compute_next_fire_time(alarm_time, None, &RepeatPattern::once(), &tz, now);
        // 7:30 KL is in the past (it's 8AM) → should be tomorrow 7:30 KL
        assert!(result.is_some());
        assert!(result.unwrap() > now);
    }

    #[test]
    fn test_days_of_week_malformed_json() {
        let row = AlarmRow { repeat_days_of_week: "not json".to_string(), ..default() };
        assert_eq!(row.days_of_week(), vec![]); // Should not panic
    }
}
```

**Coverage target:** 90% for `scheduler.rs`, 80% for other modules.

---

### Layer 2 — Rust Integration Tests

**Tool:** `cargo test` with in-memory SQLite

**Scope:** IPC command handlers with real database, verifying full request → DB → response flow.

```rust
// tests/alarm_commands.rs
use rusqlite::Connection;

fn setup_test_db() -> Connection {
    let conn = Connection::open_in_memory().unwrap();
    // Run migrations
    refinery::embed_migrations!("migrations");
    migrations::runner().run(&mut conn).unwrap();
    conn
}

#[tokio::test]
async fn test_create_alarm_persists_to_db() {
    let conn = setup_test_db();
    let payload = CreateAlarmPayload {
        time: "07:30".to_string(),
        label: "Morning".to_string(),
        ..Default::default()
    };

    // Rust struct fields are snake_case; serde serializes to PascalCase for IPC
    let alarm = create_alarm_handler(&conn, payload).await.unwrap();
    assert_eq!(alarm.time, "07:30");  // Rust field access (snake_case)
    assert!(alarm.next_fire_time.is_some());

    // Verify persisted
    let row = conn.query_row("SELECT * FROM Alarms WHERE AlarmId = ?", [&alarm.alarm_id], AlarmRow::from_row).unwrap();
    assert_eq!(row.label, "Morning");
}

#[tokio::test]
async fn test_soft_delete_and_undo() {
    let conn = setup_test_db();
    let alarm = create_test_alarm(&conn).await;

    let result = delete_alarm_handler(&conn, &alarm.id).await.unwrap();
    assert!(!result.undo_token.is_empty());

    // Verify soft-deleted
    let row = conn.query_row("SELECT DeletedAt FROM Alarms WHERE AlarmId = ?", [&alarm.alarm_id], |r| r.get::<_, Option<String>>(0)).unwrap();
    assert!(row.is_some());

    // Undo
    undo_delete_handler(&conn, &result.undo_token).await.unwrap();
    let row = conn.query_row("SELECT DeletedAt FROM Alarms WHERE AlarmId = ?", [&alarm.alarm_id], |r| r.get::<_, Option<String>>(0)).unwrap();
    assert!(row.is_none());
}
```

**Key integration tests:**

| Test | Verifies |
|------|----------|
| Create → read → update → delete flow | Full CRUD lifecycle |
| Soft-delete → undo within 5s | Undo token mechanism |
| Group toggle off → individual states saved | `IsPreviousEnabled` column |
| Group toggle on → individual states restored | State restoration |
| Duplicate alarm | New UUID, "(Copy)" label, all fields copied |
| Move alarm to group | `GroupId` updated correctly |
| Missed alarm detection query | WHERE clause returns correct alarms |
| Event retention purge | Old events deleted, recent kept |

---

### Layer 3 — Frontend Unit Tests

**Tool:** Vitest + React Testing Library + jsdom

**Scope:** React hooks, components, and utility functions.

```typescript
// src/hooks/__tests__/useAlarms.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('useAlarms', () => {
  it('should create alarm and add to list', async () => {
    const { invoke } = await import('@tauri-apps/api/core');
    (invoke as any).mockResolvedValue({ AlarmId: '1', Time: '07:30', Label: 'Test' });

    const { result } = renderHook(() => useAlarms());
    await act(async () => {
      await result.current.createAlarm({ Time: '07:30', Label: 'Test' });
    });

    expect(invoke).toHaveBeenCalledWith('create_alarm', expect.any(Object));
  });
});
```

**Key frontend tests:**

| Component/Hook | Test Cases |
|---------------|-----------|
| `useAlarms` | CRUD operations, toggle, mock IPC calls |
| `AlarmForm` | Validation (time format, label length, snooze range) |
| `AlarmForm` | Default values populated correctly |
| `AlarmList` | Renders grouped alarms, empty state |
| `AlarmOverlay` | Shows label, time, dismiss/snooze buttons |
| `AlarmOverlay` | Hides snooze when `MaxSnoozeCount` reached |
| `UndoToast` | Shows/hides on delete/undo, timer countdown |
| Time formatting | 12h/24h conversion, "Alarm in X hours Y min" |

---

### Layer 4 — E2E Tests

**Tool:** `tauri-driver` (WebDriver protocol) + Playwright or WebdriverIO

**Scope:** Full app flow from UI interaction to backend response.

```typescript
// e2e/alarm-flow.spec.ts
describe('Alarm E2E', () => {
  it('should create alarm, fire, and dismiss', async () => {
    // 1. Create alarm set to 1 minute from now
    await page.click('[data-testid="add-alarm"]');
    await page.fill('[data-testid="time-input"]', getCurrentTimePlusMinutes(1));
    await page.click('[data-testid="save-alarm"]');

    // 2. Verify alarm appears in list
    await expect(page.locator('[data-testid="alarm-item"]')).toBeVisible();

    // 3. Wait for alarm to fire (max 90s)
    await expect(page.locator('[data-testid="alarm-overlay"]')).toBeVisible({ timeout: 90000 });

    // 4. Dismiss
    await page.click('[data-testid="dismiss-button"]');
    await expect(page.locator('[data-testid="alarm-overlay"]')).not.toBeVisible();

    // 5. Verify event logged
    // Navigate to history, check for "fired" + "dismissed" events
  });
});
```

**Key E2E tests:**

| Flow | Steps |
|------|-------|
| Create → fire → dismiss | Full happy path |
| Create → fire → snooze → re-fire → dismiss | Snooze lifecycle |
| Delete → undo within 5s | Soft-delete recovery |
| Group toggle off → alarms disabled | Master toggle |
| Import JSON → alarms appear | Import flow |
| Theme toggle | Dark/light switch persists |

---

## Coverage Targets

| Layer | Target | Tool |
|-------|--------|------|
| Rust unit tests | 80% lines | `cargo tarpaulin` or `llvm-cov` |
| Rust integration tests | Key flows (not % based) | `cargo test` |
| Frontend unit tests | 70% lines | `vitest --coverage` (v8 provider) |
| E2E tests | 5 critical flows | `tauri-driver` |

---

## CI Integration

Add to the GitHub Actions workflow (see `08-devops-setup-guide.md`):

```yaml
# In build-and-release.yml, add test job before build
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: dtolnay/rust-toolchain@stable
    - uses: actions/setup-node@v4
      with: { node-version: '20' }

    # Rust tests
    - name: Run Rust tests
      run: cd src-tauri && cargo test --all-features

    # Frontend tests
    - name: Install frontend deps
      run: npm ci
    - name: Run frontend tests
      run: npx vitest run --coverage

    # Fail build if coverage below threshold
    - name: Check coverage
      run: npx vitest run --coverage --coverage.thresholds.lines=70
```

**E2E tests** run separately on a matrix of OS runners (macOS, Windows, Linux) since they require the full built app.

---

## Test Data Fixtures

```typescript
// src/test/fixtures.ts
// All keys MUST be PascalCase — matches IPC serialization format.
// Enum values MUST use enum constants — never raw strings.
import { RepeatType } from '@/types/alarm';

export const testAlarm = {
  Time: '07:30',
  Label: 'Test Alarm',
  Repeat: { Type: RepeatType.Daily, DaysOfWeek: [], IntervalMinutes: 0, CronExpression: '' },
  SnoozeDurationMin: 5,
  MaxSnoozeCount: 3,
  SoundFile: 'classic-beep',
  IsGradualVolume: false,
  GradualVolumeDurationSec: 30,
  AutoDismissMin: 0,
};
```

---

## Layer 5 — Platform-Specific E2E Tests

> See `11-platform-verification-matrix.md` for the full Feature × Platform × Behavior matrix. These tests run on the CI OS matrix (macOS, Windows, Linux).

| Test ID | Platform | Scenario | Expected Result |
|---------|----------|----------|-----------------|
| PLAT-01 | All | Alarm fires while app is minimized | Audio plays, notification shown, overlay appears on focus |
| PLAT-02 | All | System sleep → wake with missed alarm | Missed alarm fires within 5s of wake event |
| PLAT-03 | macOS | Audio plays over other apps (audio session) | Alarm audio not ducked by music playback |
| PLAT-04 | All | Tray icon visible after app start | Tray icon rendered in correct format per OS |
| PLAT-05 | macOS | Tray icon in light + dark menu bar | Template icon auto-inverts correctly |
| PLAT-06 | All | Notification permission denied → overlay fallback | Overlay shown, one-time hint displayed |
| PLAT-07 | Linux | `backdrop-filter` fallback on WebKitGTK <2.40 | Solid background shown instead of blur |
| PLAT-08 | All | Custom sound file playback (WAV, MP3, OGG) | Each format plays without error |
| PLAT-09 | All | DST spring-forward alarm at 2:30 AM | Fires at 3:00 AM (next valid time) |
| PLAT-10 | All | DST fall-back alarm at 1:30 AM | Fires once at first occurrence only |

### CI OS Matrix for Platform Tests

```yaml
# Add to build-and-release.yml
platform-tests:
  strategy:
    matrix:
      os: [macos-latest, windows-latest, ubuntu-latest]
  runs-on: ${{ matrix.os }}
  steps:
    - uses: actions/checkout@v4
    - uses: dtolnay/rust-toolchain@stable
    - name: Build app
      run: cd src-tauri && cargo build --release
    - name: Run platform tests
      run: cd src-tauri && cargo test --test platform_tests --release
```

---

## Layer 6 — Dependency Compatibility Tests

> Verifies that pinned dependency versions compile and interoperate correctly. See `10-dependency-lock.md` for version pins.

| Test ID | Check | Command | Pass Criteria |
|---------|-------|---------|---------------|
| DEP-01 | Rust crates compile | `cargo check --all-features` | Exit code 0, no warnings about deprecated APIs |
| DEP-02 | `rusqlite` ↔ `refinery` compat | `cargo test` on migration runner | Migrations run on in-memory SQLite without error |
| DEP-03 | Tauri plugin registration | `cargo build` with all plugins in `main.rs` | All `.plugin()` calls compile |
| DEP-04 | npm packages install | `npm ci` | Exit code 0, no peer dependency warnings |
| DEP-05 | Frontend build | `vite build` | Exit code 0, bundle under 500KB gzipped |
| DEP-06 | TypeScript strict check | `tsc --noEmit --strict` | Exit code 0 |
| DEP-07 | `@tauri-apps/api` ↔ Tauri core | `invoke()` calls compile in TS | No type errors on IPC wrappers |

### CI Dependency Check Job

```yaml
dep-check:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: dtolnay/rust-toolchain@stable
    - uses: actions/setup-node@v4
      with: { node-version: '20' }
    - name: Rust compile check
      run: cd src-tauri && cargo check --all-features 2>&1 | tee /tmp/cargo-check.log
    - name: Check for deprecation warnings
      run: "! grep -i 'deprecated' /tmp/cargo-check.log"
    - name: npm install
      run: npm ci
    - name: TypeScript check
      run: npx tsc --noEmit --strict
    - name: Vite build
      run: npx vite build
```

---

## Cross-References

| Reference | Location |
|-----------|----------|
| DevOps CI/CD | `./08-devops-setup-guide.md` |
| Data Model | `./01-data-model.md` |
| Alarm CRUD | `../02-features/01-alarm-crud.md` |
| Alarm Firing | `../02-features/03-alarm-firing.md` |
| App Issues | `../03-app-issues/08-devops-issues.md` → DEVOPS-TEST-001 |
| Platform Verification Matrix | `./11-platform-verification-matrix.md` |
| Dependency Lock | `./10-dependency-lock.md` |
| Coding Guidelines | `../../02-coding-guidelines/03-coding-guidelines-spec/` — test code must follow same boolean/naming/enum rules |

---

*Test strategy — updated: 2026-04-10*
