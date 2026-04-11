# Dismissal Challenges

**Version:** 1.7.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P1 (Math) / P2 (Others)  
**Resolves:** UX-CHALLENGE-001

---

## Keywords

`challenge`, `dismiss`, `math`, `shake`, `typing`, `anti-oversleep`, `native`, `difficulty`, `calibration`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ✅ |


## Description

Optional challenges that must be completed before an alarm can be dismissed. Prevents sleepy dismiss taps and ensures the user is mentally or physically engaged.

---

## Challenge Types

### Math Problem (P1)

| Difficulty | Example | Operand Rules | Target Solve Time |
|-----------|---------|---------------|-------------------|
| Easy | `12 + 7 = ?` | Addition/subtraction, operands 1–20 | <5 seconds |
| Medium | `23 × 4 = ?` | Multiplication, one operand 2–12, other 10–50 | <10 seconds |
| Hard | `(15 × 3) + 12 = ?` | Two-step: multiply then add/subtract | <20 seconds |
| Custom (P2) | User-defined | User sets operand ranges and operation types | N/A |

**Rules:**
- All problems produce **integer answers only** (no decimals). Division problems are pre-validated
- Wrong answers keep the alarm ringing
- Difficulty configurable per alarm
- Solve time is logged in `AlarmEvents.ChallengeSolveTimeSec` (stored as seconds, e.g. `4.5`) for future adaptive calibration (P3)
- **Problem generation:** Use `rand` crate. For Hard tier, generate `(a × b) + c` where `a ∈ [2,12]`, `b ∈ [10,30]`, `c ∈ [-50,50]`, ensuring result > 0

### Memory / Pattern Game (P2)

- Show a sequence of 4–6 colored tiles briefly
- User must replicate the pattern from memory
- Engages visual memory before dismissal

### Shake to Dismiss (P2)

- Shake device 20–50 times (configurable)
- Progress bar shows shake count
- **Desktop:** Not available — option hidden (no accelerometer)
- **Mobile (iOS):** CoreMotion accelerometer data via native API
- **Mobile (Android):** SensorManager accelerometer via native API
- Feature-detected at runtime; option hidden on unsupported platforms

### Typing Challenge (P2)

- Display a sentence; user types it exactly
- Phrases: motivational quotes or random sentences
- Case-insensitive matching

### QR / Barcode Scan (P3)

- Register a QR code location (bathroom mirror, kitchen)
- Scan to dismiss — forces physical movement
- **Desktop:** Uses webcam via native camera access
- **Mobile:** Uses native camera API

### Step Counter (P3)

- Walk 20–50 steps before dismissal
- **Desktop:** Not available — option hidden
- **Mobile (iOS):** CMPedometer via CoreMotion
- **Mobile (Android):** Step detector sensor via SensorManager
- Real-time progress display

---

## Configuration

Each alarm can have an optional challenge:
```typescript
interface AlarmChallenge {
  Type: ChallengeType;
  Difficulty: ChallengeDifficulty | null; // math only
  ShakeCount: number | null; // shake only
  StepCount: number | null;  // steps only
}
```

> **Note:** This interface is a documentation-only convenience wrapper for the frontend. Do NOT create this as a separate interface in code. The data is stored as flat columns on the `Alarms` table (`ChallengeType`, `ChallengeDifficulty`, `ChallengeShakeCount`, `ChallengeStepCount`). See `01-fundamentals/01-data-model.md`.

---

## Overlay + Challenge Interaction Flow

> **Resolves GA2-021, GA2-022.** Defines exactly how challenges integrate with the `AlarmOverlay`.

### Flow

1. Alarm fires → `AlarmOverlay` opens in separate Tauri window
2. Overlay shows: alarm label, current time, **Snooze** button, **Dismiss** button
3. User taps **Dismiss**:
   - **No challenge configured** (`ChallengeType = null`): alarm dismissed immediately
   - **Challenge configured**: Dismiss button is replaced by `ChallengePanel` component
4. `ChallengePanel` renders the challenge (math input, shake progress, typing field, etc.)
5. User submits answer → frontend calls `submit_challenge_answer`
6. If correct: alarm dismissed, overlay closes, event logged with `ChallengeSolveTimeSec`
7. If incorrect: error feedback ("Wrong answer — try again"), alarm continues ringing, challenge stays visible
8. User can still tap **Snooze** at any time during a challenge (snooze is never blocked)

### Missed Alarms + Challenges

- **Missed alarms skip the challenge** — they auto-resolve as `Type = AlarmEventType::Missed`
- Rationale: the user wasn't present to solve the challenge; forcing it retroactively is pointless
- `ChallengeType` is still logged on the missed event for analytics, but `ChallengeSolveTimeSec = null`

### UI State Machine

```
┌─────────────┐     Dismiss     ┌──────────────┐    Correct    ┌───────────┐
│  Overlay    │ ──────────────► │  Challenge   │ ────────────► │ Dismissed │
│  (ringing)  │                 │  (ringing)   │               │  (quiet)  │
└──────┬──────┘                 └──────┬───────┘               └───────────┘
       │ Snooze                        │ Snooze
       ▼                               ▼
┌─────────────┐                 ┌──────────────┐
│  Snoozed    │                 │  Snoozed     │
└─────────────┘                 └──────────────┘
```

---

## IPC Commands

| Command | Payload | Returns |
|---------|---------|---------|
| `get_challenge` | `{ AlarmId: string }` | `AlarmChallenge \| null` |
| `submit_challenge_answer` | `{ AlarmId: string, Answer: string }` | `{ Correct: boolean, SolveTimeSec: number }` |

**Behavior:**
- `get_challenge` — Returns the challenge configuration for the firing alarm. Returns `null` if no challenge is configured.
- `submit_challenge_answer` — Validates the user's answer. If correct, logs `SolveTimeSec` to `AlarmEvents.ChallengeSolveTimeSec` and allows dismissal. If incorrect, returns `Correct: false` and the alarm continues firing.

### Rust Structs

```rust
#[derive(Debug, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct GetChallengePayload {
    pub alarm_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct SubmitChallengePayload {
    pub alarm_id: String,
    pub answer: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "PascalCase")]
pub struct ChallengeResult {
    pub correct: bool,        // Note: serializes to "Correct" via serde rename_all = PascalCase
    pub solve_time_sec: f64,
}
```

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Math challenge generates negative result | Re-generate — all answers must be > 0 |
| User closes overlay window during challenge | Alarm continues firing; overlay re-opens after 3 seconds |
| Shake challenge on desktop (no accelerometer) | Option hidden at runtime; alarm falls back to `ChallengeType.None` |
| QR code scanner permission denied | Show toast with permission instructions; fall back to `ChallengeType.None` |
| Challenge solve time exceeds 5 minutes | Log `SolveTimeSec` as-is; no timeout (alarm keeps firing) |

---

## Acceptance Criteria

- [ ] Math challenge generates integer-only answers for all difficulty levels
- [ ] Wrong answer keeps alarm ringing; correct answer dismisses
- [ ] Solve time logged to `AlarmEvents.ChallengeSolveTimeSec` on successful dismissal
- [ ] Hard problems use formula `(a × b) + c` with operands in specified ranges and result > 0
- [ ] Challenge type configurable per alarm via `ChallengeType` enum (never raw strings)
- [ ] Desktop hides shake and step counter options (feature-detected at runtime)
- [ ] `get_challenge` returns `null` when no challenge configured
- [ ] `submit_challenge_answer` returns `{ Correct: false }` on wrong answer without dismissing

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Alarm Firing | `./03-alarm-firing.md` |
| Alarm CRUD | `./01-alarm-crud.md` |
| Design System (UI States) | `../01-fundamentals/02-design-system.md` |
| File Structure (ChallengePanel) | `../01-fundamentals/03-file-structure.md` |
| Data Model | `../01-fundamentals/01-data-model.md` |
| Platform Constraints | `../01-fundamentals/04-platform-constraints.md` |
| Domain Enums | `../01-fundamentals/01-data-model.md` → Domain Enums section |
