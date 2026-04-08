# Dismissal Challenges

**Version:** 1.0.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** Low  
**Priority:** P1 (Math) / P2 (Others)

---

## Keywords

`challenge`, `dismiss`, `math`, `shake`, `typing`, `anti-oversleep`

---

## Description

Optional challenges that must be completed before an alarm can be dismissed. Prevents sleepy dismiss taps and ensures the user is mentally or physically engaged.

---

## Challenge Types

### Math Problem (P1)

| Difficulty | Example | Description |
|-----------|---------|-------------|
| Easy | `12 + 7 = ?` | Single addition/subtraction |
| Medium | `23 × 4 = ?` | Multiplication |
| Hard | `147 ÷ 3 = ?` | Division with remainders |

- Wrong answers keep the alarm ringing
- Difficulty configurable per alarm

### Memory / Pattern Game (P2)

- Show a sequence of 4–6 colored tiles briefly
- User must replicate the pattern from memory
- Engages visual memory before dismissal

### Shake to Dismiss (P2)

- Shake device 20–50 times (configurable)
- Progress bar shows shake count
- Uses `DeviceMotionEvent` — feature-detected

### Typing Challenge (P2)

- Display a sentence; user types it exactly
- Phrases: motivational quotes or random sentences
- Case-insensitive matching

### QR / Barcode Scan (P3)

- Register a QR code location (bathroom mirror, kitchen)
- Scan to dismiss — forces physical movement
- Requires camera access

### Step Counter (P3)

- Walk 20–50 steps before dismissal
- Uses `DeviceMotionEvent` for step estimation
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
