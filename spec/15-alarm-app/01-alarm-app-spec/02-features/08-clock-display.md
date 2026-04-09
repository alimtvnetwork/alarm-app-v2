# Clock Display

**Version:** 1.1.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 — Must Have

---

## Keywords

`clock`, `analog`, `digital`, `svg`, `countdown`, `time`

---

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
- 12/24-hour format toggle (persisted to `settings` SQLite table)

---

## Alarm Countdown

- "Alarm in X hours and Y minutes" for next enabled alarm
- Updates every second
- Shows "No alarms set" when none are enabled
- Positioned below the clock display

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
