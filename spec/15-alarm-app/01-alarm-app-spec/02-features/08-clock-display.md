# Clock Display

**Version:** 1.3.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 — Must Have

---

## Keywords

`clock`, `analog`, `digital`, `svg`, `countdown`, `time`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ✅ |


## Description

The home screen features a live analog clock (SVG) with smooth-animated hands and a digital time display below it. A countdown shows time remaining until the next alarm.

---

## Analog Clock

- SVG circle with tick marks for hours and minutes
- Hour, minute, and second hands with smooth CSS transitions
- Second hand: continuous sweep animation (`transition: transform 1s linear`)
- Warm styling: cream face, brown hands, tan tick marks (matching design system)
- Responsive: scales to container width

---

## Digital Clock

- `HH:MM:SS` format using Outfit font at 4rem
- Current date and day of week below in Figtree
- 12/24-hour format toggle (persisted to `Settings` SQLite table)

---

## Alarm Countdown

- "Alarm in X hours and Y minutes" for next enabled alarm
- Updates every second
- Shows "No alarms set" when none are enabled
- Positioned below the clock display

---

## Hooks

### `useClock`

Custom React hook providing real-time clock state:

```typescript
interface ClockState {
  Hours: number;      // 0–23
  Minutes: number;    // 0–59
  Seconds: number;    // 0–59
  Is24Hour: boolean;  // Derived from Settings: `getSettings("TimeFormat") === "24h"`
}

function useClock(): ClockState;
```

- Updates every second via `setInterval`
- Reads `Is24Hour` preference from Settings on mount
- Used by both `AnalogClock` and `DigitalClock` components

---

## IPC Commands

| Command | Payload | Returns |
|---------|---------|---------|
| `get_next_alarm_time` | `void` | `{ NextFireTime: string \| null, AlarmLabel: string \| null }` |

**Behavior:**
- Returns the `NextFireTime` (ISO 8601) and label of the earliest enabled alarm
- Returns `null` values when no alarms are enabled
- Called on mount and after any alarm CRUD operation to update the countdown display

---

## Acceptance Criteria

- [ ] Analog clock renders with smooth second hand animation
- [ ] Digital time updates every second
- [ ] Date and day of week displayed
- [ ] Countdown shows time to next alarm
- [ ] 12/24-hour toggle persists across app restarts

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Design System | `../01-fundamentals/02-design-system.md` |
| Theme System | `./09-theme-system.md` |
| Alarm Scheduling | `./02-alarm-scheduling.md` |
