# Security Issues

**Version:** 1.1.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** None  
**Source:** AI Feasibility Analysis v1.0.0, AI Handoff Reliability Report v1.0.0

---

## Keywords

`security`, `path-injection`, `ssrf`, `webhook`, `export`, `sanitization`, `file-validation`

---

## Issue Registry

### SEC-PATH-001 — Custom sound file path could reference sensitive files

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 25% |
| **Status** | Open |

**Description:** User selects a sound file via file dialog, but the stored path is read by the Rust backend. If path validation is missing, a crafted path could be exploited.

**Root Cause:** No path sanitization specified.

**Suggested Fix:** Validate stored path: must have audio extension (`.mp3`, `.wav`, `.ogg`, `.flac`), must be within user-accessible directories, reject symlinks. Use Tauri's `fs` scope to restrict access.

---

### SEC-WEBHOOK-001 — Webhook SSRF potential

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 30% |
| **Status** | Open |

**Description:** P3 webhook feature sends HTTP POST from Rust backend to user-configured URL. No validation against internal/localhost URLs.

**Root Cause:** Missing SSRF protection.

**Suggested Fix:** Validate webhook URLs: reject `127.0.0.1`, `localhost`, `::1`, `10.x.x.x`, `192.168.x.x`, `169.254.x.x`. Disable redirect-following. Set 5s timeout. Log all webhook calls.

---

### SEC-EXPORT-001 — Export data may contain sensitive alarm labels

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 40% |
| **Status** | Open |

**Description:** Users may put personal info in alarm labels. Export to JSON/CSV/iCal creates an unencrypted file on disk.

**Root Cause:** No export encryption option.

**Suggested Fix:** Add a warning dialog before export: "Export file is not encrypted." For P3+, offer optional password-protected ZIP export.

---

### SEC-SOUND-001 — Custom sound file validation rules missing

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 60% |
| **Status** | Open |
| **Fail %** | 30% |

**Description:** User can select any audio file but no max size, format validation, or handling for moved/deleted files is specified.

**Root Cause:** Missing validation rules.

**Suggested Fix:**
- Max file size: 10MB
- Allowed formats: `.mp3`, `.wav`, `.ogg`, `.flac`
- On alarm fire: check `Path::exists()`. If missing → fall back to `classic-beep`, show "⚠ Sound file missing" in overlay
- On alarm edit: if file path invalid, show warning + offer to re-select
- Reject symlinks (security)

**Resolution Plan:** Add validation rules to `02-features/05-sound-and-vibration.md` under "Custom Sound Validation" and cross-reference with `SEC-PATH-001`.

---

*Security issues — updated: 2026-04-09*
