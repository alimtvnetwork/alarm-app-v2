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
| **Likelihood** | 25% → 0% |
| **Status** | ✅ Resolved |

**Description:** User selects a sound file via file dialog, but the stored path is read by the Rust backend. If path validation is missing, a crafted path could be exploited.

**Root Cause:** No path sanitization specified.

**Resolution:** Added `validate_custom_sound()` function to `02-features/05-sound-and-vibration.md` v1.4.0 with extension whitelist, symlink rejection, platform-specific restricted path blocking (macOS `/System`, Windows `C:\Windows`, Linux `/etc`/`/sys`/`/proc`), and canonicalization via `Path::canonicalize()`.

---

### SEC-WEBHOOK-001 — Webhook SSRF potential

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 30% → 0% |
| **Status** | ✅ Resolved |

**Description:** P3 webhook feature sends HTTP POST from Rust backend to user-configured URL. No validation against internal/localhost URLs.

**Root Cause:** Missing SSRF protection.

**Resolution:** Added comprehensive SSRF protection to `02-features/12-smart-features.md` v1.2.0 with `validate_webhook_url()` Rust function (blocks localhost, private IPs, link-local, CGNAT, metadata endpoints), `is_private_ip()` helper, HTTP client rules (no redirects, 5s timeout, HTTPS-only, non-standard port rejection), and validation timing (on save + on fire + fresh DNS resolution).

---

### SEC-EXPORT-001 — Export data may contain sensitive alarm labels

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 40% → 0% |
| **Status** | ✅ Resolved |

**Description:** Users may put personal info in alarm labels. Export to JSON/CSV/iCal creates an unencrypted file on disk.

**Root Cause:** No export encryption option.

**Resolution:** Added export warning dialog to `02-features/10-export-import.md`. Before any export, show confirmation: "Export file is not encrypted. Anyone with access to the file can read your alarm labels and settings. Continue?" with [Cancel] [Export] buttons. For v2.0+, offer optional password-protected ZIP export using `zip` crate with AES-256 encryption. Warning is skippable via "Don't show again" checkbox (stored in settings).

---

### SEC-SOUND-001 — Custom sound file validation rules missing

| Field | Value |
|-------|-------|
| **Impact** | Low |
| **Likelihood** | 60% → 0% |
| **Status** | ✅ Resolved |
| **Fail %** | 30% → 5% |

**Description:** User can select any audio file but no max size, format validation, or handling for moved/deleted files is specified.

**Root Cause:** Missing validation rules.

**Resolution:** Already fully resolved by BE-AUDIO-002 and SEC-PATH-001 fixes. Complete `validate_custom_sound()` function in `02-features/05-sound-and-vibration.md` v1.4.0 covers: extension whitelist (`.mp3`, `.wav`, `.ogg`, `.flac`), 10MB size limit, symlink rejection, platform-restricted paths, and missing-file fallback (`resolve_sound_path()` → `classic-beep`).

---

*Security issues — updated: 2026-04-09*
