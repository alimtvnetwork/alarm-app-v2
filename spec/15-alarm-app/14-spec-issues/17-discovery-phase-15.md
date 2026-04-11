# Discovery Phase 15 — Deep Boolean, Negation & Code Sample Audit

**Version:** 1.0.0  
**Updated:** 2026-04-10  
**Auditor:** AI Spec Auditor  
**Scope:** Deep scan of all code samples in feature and fundamental files for boolean violations, raw negation patterns, `expect()`/`unwrap()` usage, missing acceptance criteria details, `0 = disabled` anti-patterns, and additional enum/naming gaps

---

## Audit Methodology

1. Grep-scanned all `.md` files in `02-features/` and `01-fundamentals/` for:
   - Raw `!` negation in code samples (Rust and TypeScript)
   - Unprefixed boolean field references (`alarm.enabled` instead of `alarm.IsEnabled`)
   - `0 = disabled` / `0 = off` patterns (negative semantic encoding)
   - `expect()` / `unwrap()` in non-test code samples
   - Missing `## Acceptance Criteria` sections
   - `null` checks without positive guards
2. Cross-referenced against boolean principles (P1–P6), no-negatives rule, and magic value rules

---

## P15-001: Raw `!` Negation in Rust — `03-alarm-firing.md` line 109

**Severity:** 🟡 Medium  
**Rule Violated:** Boolean principles P3 — No raw `!` on function calls, use semantic inverse  
**Location:** `02-features/03-alarm-firing.md` line 109  
**Code:** `if !repeat.days_of_week.contains(&(weekday_num as u8)) { continue; }`  
**Required Fix:** Extract to positive guard: `if repeat.is_day_excluded(weekday_num) { continue; }` or `if repeat.days_of_week.excludes(weekday_num) { continue; }`  
**Exemption Check:** This is NOT an idiomatic `!ok` or `err != nil` pattern — it's domain logic negation on a collection method. NOT exempt.

---

## P15-002: Raw `!` Negation in Rust — `03-alarm-firing.md` line 392

**Severity:** 🟢 Low  
**Rule Violated:** Boolean principles P3  
**Location:** `02-features/03-alarm-firing.md` line 392  
**Code:** `if !args.start {`  
**Context:** D-Bus `PrepareForSleep` signal — `start=true` means entering sleep, `start=false` means waking.  
**Required Fix:** `if args.is_waking() {` or extract to named boolean: `let is_waking = !args.start;` → `if is_waking {`  
**Exemption Check:** `args.start` comes from the D-Bus signal definition (external API). This MAY be exempt as a library/protocol value. However, the coding guidelines say to extract if repeated 3+ times, and the semantic inverse should be used regardless.

---

## P15-003: Raw `!` Negation in Rust — `05-sound-and-vibration.md` line 74

**Severity:** 🟡 Medium  
**Rule Violated:** Boolean principles P3  
**Location:** `02-features/05-sound-and-vibration.md` line 74  
**Code:** `if !ALLOWED_EXTENSIONS.contains(&ext.as_str()) {`  
**Required Fix:** `if is_extension_blocked(&ext) {` or `if ALLOWED_EXTENSIONS.excludes(&ext) {`

---

## P15-004: Double Raw `!` Negation in Rust — `05-sound-and-vibration.md` line 129

**Severity:** 🟡 Medium  
**Rule Violated:** Boolean principles P3 + P6 (mixed polarity — two `!` in one expression)  
**Location:** `02-features/05-sound-and-vibration.md` line 129  
**Code:** `if !sound_file.contains('/') && !sound_file.contains('\\') {`  
**Required Fix:** Extract to named boolean: `let is_filename_only = !sound_file.contains('/') && !sound_file.contains('\\');` or better: `if is_plain_filename(&sound_file) {`  
**Note:** This is a P4+P6 compound violation — 2+ operators with mixed polarity. Must extract to single-intent named boolean.

---

## P15-005: `alarm.enabled` Without `Is` Prefix — `01-alarm-crud.md` line 149

**Severity:** 🟡 Medium  
**Rule Violated:** Boolean principles P1 — `is`/`has` prefix required; PascalCase key naming  
**Location:** `02-features/01-alarm-crud.md` line 149  
**Code:** `alarm.enabled ? 'enabled' : 'disabled'`  
**Required Fix:** `alarm.IsEnabled ? 'enabled' : 'disabled'`  
**Note:** Already tracked as P14-013 but confirming the code sample is a double violation (missing prefix + missing PascalCase).

---

## P15-006: `0 = disabled` Semantic Anti-Pattern — 3 Locations

**Severity:** 🟡 Medium  
**Rule Violated:** Boolean principles P2 — No negative words in boolean semantics  
**Locations:**
- `03-alarm-firing.md` line 450: `AutoDismissMin (0 = disabled, 1–60 minutes)`
- `03-alarm-firing.md` line 597: `auto_dismiss_min: u32, // 0 = disabled`
- `04-snooze-system.md` line 31: `0–10 (0 = snooze disabled)`
- `01-fundamentals/01-data-model.md` line 38: `0 = snooze disabled`
- `01-fundamentals/01-data-model.md` line 43: `0 = disabled`

**Observation:** Using `0 = disabled` encodes negative semantics into a numeric field. While the FIELD names are correct (`AutoDismissMin`, `MaxSnoozeCount`), the COMMENTS use the word "disabled" which contradicts P2. The spec should describe these as:
- `AutoDismissMin`: `0 = manual dismiss only` (positive framing)
- `MaxSnoozeCount`: `0 = dismiss only, no snooze` (positive framing)

**Risk:** Low-medium. An AI will copy the "disabled" language into code comments, violating P2.

---

## P15-007: `expect()` in Non-Test Production Code — 8 Locations

**Severity:** 🟡 Medium  
**Rule Violated:** Error handling best practices — `expect()` panics in production code  
**Locations:**
- `01-alarm-crud.md` line 61: `conn.lock().expect("DB lock poisoned")`
- `03-alarm-firing.md` line 382: `.expect("Failed to connect to system D-Bus")`
- `03-alarm-firing.md` line 385: `.expect("Failed to create login1 proxy")`
- `03-alarm-firing.md` line 388: `.expect("Failed to subscribe to PrepareForSleep")`
- `03-alarm-firing.md` line 391: `signal.args().expect("Failed to parse signal args")`
- `07-startup-sequence.md` line 104: `.expect("Failed to resolve app data directory")`
- `07-startup-sequence.md` line 106: `.expect("Failed to create app data directory")`
- `07-startup-sequence.md` line 118: `.expect("Failed to open database")`

**Observation:** The `expect()` calls in startup sequence (lines 104, 106, 118) are arguably acceptable — if the app data dir can't be resolved, the app can't function. These should be documented as intentional panics with justification.

However, the D-Bus `expect()` calls (lines 382–391) are problematic — D-Bus connection failure on Linux shouldn't crash the app. These should return `Result` and degrade gracefully (log warning, disable sleep detection).

The `conn.lock().expect()` (line 61) is idiomatic for Mutex poisoning but should still be documented as an acceptable panic.

**Required Fix:** Spec should explicitly state which `expect()` calls are intentional (startup-critical) vs which must be converted to `?` with `Result` propagation.

---

## P15-008: Missing Acceptance Criteria — `06-dismissal-challenges.md`

**Severity:** 🟡 Medium  
**Rule Violated:** Spec authoring guide — Feature files should have testable acceptance criteria  
**Location:** `02-features/06-dismissal-challenges.md`  
**Observation:** Confirmed — no `## Acceptance Criteria` section. Has "Rules" subsections but no checkbox-style testable criteria.  
**Note:** Already tracked as P14-020.

---

## P15-009: Missing Acceptance Criteria — `11-sleep-wellness.md`

**Severity:** 🟡 Medium  
**Location:** `02-features/11-sleep-wellness.md`  
**Observation:** Confirmed — no `## Acceptance Criteria` section. 5 features described but no testable definitions of "done."  
**Note:** Already tracked as P14-021.

---

## P15-010: Missing Acceptance Criteria — `12-smart-features.md`

**Severity:** 🟡 Medium  
**Location:** `02-features/12-smart-features.md`  
**Observation:** Confirmed — no `## Acceptance Criteria` section.  
**Note:** Already tracked as P14-022.

---

## P15-011: Missing Acceptance Criteria — `14-personalization.md`

**Severity:** 🟡 Medium  
**Location:** `02-features/14-personalization.md`  
**Observation:** Confirmed — no `## Acceptance Criteria` section.  
**Note:** Already tracked as P14-023.

---

## P15-012: `WebhookError` Enum Used But Never Defined

**Severity:** 🔴 Critical  
**Rule Violated:** Content completeness + magic string rule  
**Location:** `12-smart-features.md` lines 63–157  
**Observation:** The code samples reference 7 `WebhookError` variants:
- `WebhookError::InvalidUrl`
- `WebhookError::InsecureScheme`
- `WebhookError::BlockedHost`
- `WebhookError::MissingHost`
- `WebhookError::PrivateIp`
- `WebhookError::NonStandardPort`
- `WebhookError::RequestFailed(String)`

But the enum is never defined. No `#[derive(Debug, thiserror::Error)]` declaration. No `Display` implementations. An AI will have to guess the full enum definition.  
**Note:** Related to P14-027 (no error enum spec) but this is a SPECIFIC enum with 7 variants visible in code that has no definition.

---

## P15-013: `url.scheme() != "https"` — Raw String Comparison

**Severity:** 🟡 Medium  
**Rule Violated:** `05-magic-strings-and-organization.md` §8.2 — Domain status comparisons must use enum constants  
**Location:** `12-smart-features.md` line 72  
**Code:** `if url.scheme() != "https"`  
**Exemption Check:** `url.scheme()` is a library API (`url::Url`). The coding guidelines exempt "Library internals" from the raw string rule. However, the comparison value `"https"` is a protocol constant that could be extracted to a named constant.  
**Verdict:** **Exempt** per the library API exemption. But recommend defining `const REQUIRED_SCHEME: &str = "https";` for clarity.

---

## P15-014: `11-sleep-wellness.md` — IPC Commands Use camelCase Payload Keys

**Severity:** 🟡 Medium  
**Rule Violated:** PascalCase key naming  
**Location:** `11-sleep-wellness.md` line 59  
**Code:** `log_sleep_quality { alarmId, quality, mood, notes }`  
**Required Fix:** `log_sleep_quality { AlarmId, Quality, Mood, Notes }`

---

## P15-015: `11-sleep-wellness.md` — IPC Commands Use camelCase Payload Keys (Ambient)

**Severity:** 🟡 Medium  
**Rule Violated:** PascalCase key naming  
**Location:** `11-sleep-wellness.md` line 67  
**Code:** `play_ambient { sound, durationMin }`  
**Required Fix:** `play_ambient { Sound, DurationMin }`

---

## P15-016: `14-personalization.md` — No IPC Commands for Streaks or Themes

**Severity:** 🟡 Medium  
**Rule Violated:** Content completeness — features must define IPC commands  
**Location:** `14-personalization.md`  
**Observation:** The file defines Quote IPC commands but NOT:
- Theme/skin selection IPC (how does frontend change theme? Direct Settings table update via existing `update_setting`?)
- Streak data retrieval IPC (how does frontend get streak count and calendar data?)
- Custom background IPC (file picker result → where is image stored and how is path persisted?)

If these use existing `update_setting`/`get_setting` commands, that should be explicitly stated. Currently an AI must guess.

---

## P15-017: `!= 0` Boolean Conversion Pattern Not Documented as Acceptable

**Severity:** 🟢 Low  
**Rule Violated:** Boolean principles — `!= 0` is raw negation  
**Location:** `01-fundamentals/01-data-model.md` lines 148–159  
**Code:** `is_enabled: row.get::<_, i32>("IsEnabled")? != 0`  
**Observation:** The `!= 0` pattern for SQLite INTEGER → Rust bool conversion is used 4 times. This is an idiomatic database pattern. However, per the no-negatives rule, this SHOULD use a positive helper: `is_truthy(row.get::<_, i32>("IsEnabled")?)` or `i32_to_bool(...)`.  
**Exemption Check:** Similar to `if !ok` in Go — this is an idiomatic database conversion. Should be explicitly documented as EXEMPT in the exemptions section.

---

## P15-018: Sleep Wellness Feature References `AlarmEvents` Table But No Schema Extension Defined

**Severity:** 🟡 Medium  
**Rule Violated:** Content completeness — data model must be complete  
**Location:** `11-sleep-wellness.md` lines 29, 58  
**Observation:** The file says "Sleep data storage → SQLite `Settings` + `AlarmEvents` tables" and "Data stored in SQLite `AlarmEvents` table." But the `AlarmEvents` table schema (in `01-data-model.md`) has no columns for sleep quality, mood, or notes. The `log_sleep_quality` IPC command references fields that don't exist in the schema.  
**AI Risk:** AI will try to insert `quality`, `mood`, `notes` into `AlarmEvents` — columns don't exist. Will either crash or create an ad-hoc migration.

---

## Summary

| Severity | Count | New (not in P14) |
|----------|:-----:|:----------------:|
| 🔴 Critical | 1 | 1 |
| 🟡 Medium | 13 | 9 |
| 🟢 Low | 4 | 3 |
| **Total** | **18** | **13** |
| Duplicates from P14 | 5 | — |

### Net New Issues: 13

Excluding duplicates (P15-005=P14-013, P15-008=P14-020, P15-009=P14-021, P15-010=P14-022, P15-011=P14-023), this phase found **13 net new issues**.

### Key Findings

1. **Raw `!` negation in 4 Rust code samples** — directly violates boolean P3 rule. AI will copy these patterns.
2. **`expect()` in production code samples** — 8 locations, 5 should be converted to `?` with Result propagation.
3. **`0 = disabled` negative semantics** — 5 locations use "disabled" language in comments, violating P2.
4. **`AlarmEvents` table missing columns for sleep/mood data** — schema gap will cause insertion failures.
5. **camelCase IPC payload keys in `11-sleep-wellness.md`** — 2 commands use lowercase keys.
6. **`14-personalization.md` missing IPC commands** for 3 out of 5 features.

---

## Cumulative Issue Count

| Phase | Issues | Net New | Running Total |
|-------|:------:|:-------:|:-------------:|
| Phases 1–13 | 180 | 180 | 180 |
| Phase 14 | 29 | 29 | 209 |
| **Phase 15** | **18** | **13** | **222** |

**Open: 42 | Resolved: 180**

---

*Discovery Phase 15 — updated: 2026-04-10*
