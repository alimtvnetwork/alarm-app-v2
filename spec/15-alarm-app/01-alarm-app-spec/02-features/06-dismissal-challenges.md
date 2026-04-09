# Dismissal Challenges

**Version:** 1.2.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P1 (Math) / P2 (Others)  
**Resolves:** UX-CHALLENGE-001

---

## Keywords

`challenge`, `dismiss`, `math`, `shake`, `typing`, `anti-oversleep`, `native`, `difficulty`, `calibration`

---

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
- Solve time is logged in `alarm_events.metadata` JSON (`{"solve_time_ms": 4500}`) for future adaptive calibration (P3)
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
  type: 'math' | 'memory' | 'shake' | 'typing' | 'qr' | 'steps';
  difficulty?: 'easy' | 'medium' | 'hard'; // math only
  shakeCount?: number; // shake only
  stepCount?: number;  // steps only
}
```

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Alarm Firing | `./03-alarm-firing.md` |
| Alarm CRUD | `./01-alarm-crud.md` |
| Platform Constraints | `../01-fundamentals/04-platform-constraints.md` |
