# Alarm Scheduling

**Version:** 1.0.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None  
**Priority:** P0 — Must Have

---

## Keywords

`scheduling`, `recurring`, `repeat`, `one-time`, `days`

---

## Description

Alarms can be set to repeat on specific days of the week or fire once. Options include: Once (auto-disables after firing), Daily (all 7 days), Weekdays (Mon–Fri), Weekends (Sat–Sun), and Custom (user selects specific days).

---

## Acceptance Criteria

- [ ] Day selection via pill toggles for Mon–Sun
- [ ] Shortcut buttons: Weekdays, Weekends, Daily
- [ ] One-time alarms (empty `recurringDays`) auto-disable after firing
- [ ] Recurring alarms fire every matching day indefinitely
- [ ] "Alarm in X hours Y minutes" countdown updates in real time

---

## Quick Alarm / Timer Shortcut (P1)

One-tap buttons for common quick alarms: "10 min", "30 min", "1 hour", "2 hours". Creates a one-time alarm relative to current time.

---

## Holiday-Aware Scheduling (P2)

Optional integration with a holiday calendar. When a recurring alarm falls on a public holiday, prompt: "Tomorrow is a holiday. Skip this alarm?"

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Alarm CRUD | `./01-alarm-crud.md` |
| Alarm Firing | `./03-alarm-firing.md` |
