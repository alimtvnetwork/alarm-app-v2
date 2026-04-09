# Smart Features

**Version:** 1.1.0  
**Updated:** 2026-04-08  
**AI Confidence:** Medium  
**Ambiguity:** Medium  
**Priority:** P3 — Future

---

## Keywords

`weather`, `location`, `webhook`, `voice`, `timezone`, `native`

---

## Description

Advanced features for future iterations: weather briefing, location-based alarms, webhook integrations, system tray enhancements, and voice commands.

---

## Features

### Weather Briefing on Wake (P3)

- After dismissal, show temperature, rain chance, wind for user's location
- Uses a weather API (requires API key) — HTTP requests from Rust backend
- Configurable: show/hide per alarm

### Location-Based Alarms (P3)

- Geofence triggers: "Alert when I arrive at gym" or "Alert when I leave office"
- **Desktop:** Uses system location services (CoreLocation on macOS, WinRT on Windows)
- **Mobile:** Native GPS/geofencing APIs (CLLocationManager on iOS, Geofencing API on Android)
- Configurable radius per geofence

### Webhook / API Triggers (P3)

- On alarm dismiss, send HTTP POST to a configured URL
- HTTP requests handled by Rust backend (no CORS limitations)
- Use cases: smart home (lights, coffee machine), logging, IFTTT
- Configurable URL and payload per alarm

### System Tray Enhancements (P3)

- Quick-create alarm from tray menu
- Show next alarm time in menu bar (macOS) / tray tooltip (Windows)
- Tray notification badge when alarm is snoozed
- One-click toggle all alarms from tray

### Voice Command Integration (P3)

- "Set alarm for 7 AM" via native speech recognition
- **macOS:** NSSpeechRecognizer / Speech framework
- **Mobile:** Platform speech APIs (Speech framework on iOS, SpeechRecognizer on Android)
- Basic commands: set, edit, delete, toggle

### Multiple Time Zone Support (P2)

- Set alarms in different time zones (e.g., "9:00 AM Tokyo time")
- Alarm list shows both local and target times
- Useful for remote workers and travelers

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Platform Constraints | `../01-fundamentals/04-platform-constraints.md` |
| Alarm Firing | `./03-alarm-firing.md` |
