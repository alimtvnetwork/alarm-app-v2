# File Structure

**Version:** 1.0.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`file-structure`, `components`, `hooks`, `organization`

---

## Purpose

Defines the source code file organization for the Alarm App.

---

## Structure

```
src/
  types/
    alarm.ts              — Alarm, AlarmGroup, AlarmSound interfaces

  hooks/
    useAlarms.ts          — CRUD, toggle, group toggle, localStorage sync
    useTheme.ts           — Theme state + localStorage + class toggle
    useAlarmFiring.ts     — 1s interval, match check, audio playback
    useClock.ts           — Current time state, updated every second

  components/
    AnalogClock.tsx       — SVG clock face with hour/minute/second hands
    DigitalClock.tsx      — Time + date display
    AlarmList.tsx         — Grouped alarm list with toggles
    AlarmForm.tsx         — Create/edit alarm dialog
    AlarmGroupForm.tsx    — Group create/rename dialog
    AlarmOverlay.tsx      — Full-screen firing overlay (dismiss/snooze)
    ThemeToggle.tsx       — Sun/moon icon button
    ExportImport.tsx      — Export button + import file input
    AlarmCountdown.tsx    — "Alarm in X hours Y minutes" display

  pages/
    Index.tsx             — Main layout combining all components

  assets/
    sounds/               — Built-in alarm tone audio files
```

---

## Component Hierarchy

```
Index.tsx
  ├── ThemeToggle
  ├── AnalogClock
  ├── DigitalClock
  ├── AlarmCountdown
  ├── AlarmList
  │   ├── AlarmForm (dialog)
  │   └── AlarmGroupForm (dialog)
  ├── ExportImport
  └── AlarmOverlay (conditional — shown when alarm fires)
```

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Data Model | `./01-data-model.md` |
| Features | `../02-features/00-overview.md` |
