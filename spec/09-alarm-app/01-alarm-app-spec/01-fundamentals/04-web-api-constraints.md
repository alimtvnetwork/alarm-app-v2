# Web API Constraints

**Version:** 1.0.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** Low

---

## Keywords

`web-api`, `browser`, `audio`, `notifications`, `service-worker`, `limitations`

---

## Purpose

Documents browser API limitations relevant to a web-based alarm app and the mitigations to adopt.

---

## Constraints & Mitigations

### Background Execution

| Issue | Detail |
|-------|--------|
| **Problem** | Browsers throttle/suspend background tabs. Alarms may not fire if the tab is inactive. |
| **Mitigation** | Use a 1-second `setInterval` check. Request Notification API permission so system notifications appear even when the tab is not focused. |
| **Future** | Service Worker with push notifications for full background support. |

### Audio Autoplay

| Issue | Detail |
|-------|--------|
| **Problem** | Most browsers block audio autoplay without prior user interaction. |
| **Mitigation** | Require user interaction on first visit (e.g., "Enable alarm sounds" button). Use Web Audio API with `AudioContext` created on user gesture. |

### Vibration API

| Issue | Detail |
|-------|--------|
| **Problem** | Supported on Android Chrome only. Not supported on iOS Safari or desktop browsers. |
| **Mitigation** | Feature-detect with `navigator.vibrate`. Show vibration toggle only when supported. Gracefully degrade. |

### Wake Lock API

| Issue | Detail |
|-------|--------|
| **Problem** | Prevents screen from dimming. Limited browser support. |
| **Mitigation** | Optional feature for bedside clock mode. Feature-detect and enable only when available. |

### Notification API

| Issue | Detail |
|-------|--------|
| **Problem** | Requires explicit user permission. May be blocked by browser settings. |
| **Mitigation** | Request permission on first alarm creation. Show in-app overlay as fallback. Never rely solely on system notifications. |

### localStorage Limits

| Issue | Detail |
|-------|--------|
| **Problem** | ~5–10 MB limit. Data is tab-scoped and not synced across devices. |
| **Mitigation** | Sufficient for alarm data (typically <100 KB). Provide export/import for backup. |

---

## Recommended Approach (v1.0)

- **Primary**: In-app 1-second interval check + in-app overlay
- **Audio**: Web Audio API with user-gesture-initiated `AudioContext`
- **Notifications**: Notification API as enhancement, not requirement
- **Storage**: localStorage — no backend dependency
- **Vibration**: Optional, feature-detected
- **PWA**: Future enhancement (P3)

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Alarm Firing Feature | `../02-features/03-alarm-firing.md` |
| Sound & Vibration Feature | `../02-features/05-sound-and-vibration.md` |
