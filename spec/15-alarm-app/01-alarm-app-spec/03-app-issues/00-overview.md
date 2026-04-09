# App Issues

**Version:** 1.3.0  
**Status:** Active  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`issues`, `bugs`, `fixes`, `retrospectives`, `feasibility`, `risk-analysis`, `spec-gaps`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| `00-overview.md` present | ✅ |
| AI Confidence assigned | ✅ |
| Ambiguity assigned | ✅ |
| Keywords present | ✅ |
| Scoring table present | ✅ |

---

## Purpose

Bug tracking, fixes, risk analysis, and retrospectives for the Alarm App. Issues sourced from the AI Feasibility Analysis v1.0.0 (32 issues) and the AI Handoff Reliability Report v1.0.0 (11 spec gap issues). All issues are consolidated into category files — no separate spec-gap tracking file.

---

## Issue Summary

| Category | File | Issues | Critical | High | Medium | Low |
|----------|------|:------:|:--------:|:----:|:------:|:---:|
| Migration | `01-web-to-native-migration.md` | 1 | — | — | — | — |
| Frontend | `02-frontend-issues.md` | 7 | — | 1 | 3 | 3 |
| Backend | `03-backend-issues.md` | 14 | — | 3 | 7 | 4 |
| Database | `04-database-issues.md` | 5 | — | 1 | 2 | 2 |
| Security | `05-security-issues.md` | 4 | — | 1 | 1 | 2 |
| Performance | `06-performance-issues.md` | 2 | — | — | 2 | — |
| UX/UI | `07-ux-ui-issues.md` | 3 | — | 2 | — | 1 |
| DevOps | `08-devops-issues.md` | 7 | 1 | 5 | 1 | — |
| **Total** | | **43** | **1** | **13** | **16** | **12** |

---

## Spec Gap Issue Distribution

The 11 issues from the AI Handoff Reliability Report have been merged into category files:

| Original ID | New ID | Target File | Category |
|-------------|--------|-------------|----------|
| SPEC-PERM-001 | DEVOPS-PERM-001 | `08-devops-issues.md` | Tauri permissions |
| SPEC-CARGO-001 | DEVOPS-CARGO-001 | `08-devops-issues.md` | Cargo versions |
| SPEC-TEST-001 | DEVOPS-TEST-001 | `08-devops-issues.md` | Test strategy |
| SPEC-QUEUE-001 | BE-QUEUE-001 | `03-backend-issues.md` | Alarm queue |
| SPEC-STARTUP-001 | BE-STARTUP-001 | `03-backend-issues.md` | Startup sequence |
| SPEC-ERROR-001 | BE-ERROR-001 | `03-backend-issues.md` | Error handling |
| SPEC-LOG-001 | BE-LOG-001 | `03-backend-issues.md` | Logging |
| SPEC-AUDIO-SESSION-001 | BE-AUDIO-003 | `03-backend-issues.md` | macOS audio |
| SPEC-VOLUME-ALG-001 | BE-VOLUME-001 | `03-backend-issues.md` | Volume algorithm |
| SPEC-SOUND-VALIDATE-001 | SEC-SOUND-001 | `05-security-issues.md` | Sound validation |
| SPEC-REPEAT-001 | DB-SERIAL-001 | `04-database-issues.md` | JSON serialization |

---

## Document Inventory

| # | File | Description |
|---|------|-------------|
| 01 | `01-web-to-native-migration.md` | Web-app references that must be updated for native cross-platform |
| 02 | `02-frontend-issues.md` | 7 issues: state management, DnD, a11y, overlay, WebView, i18n |
| 03 | `03-backend-issues.md` | 14 issues: timer, audio, wake-events, cron, snooze, delete, concurrency, queue, startup, error handling, logging, volume |
| 04 | `04-database-issues.md` | 5 issues: migration tooling, event growth, orphans, type safety, JSON serialization |
| 05 | `05-security-issues.md` | 4 issues: path injection, SSRF, export encryption, sound validation |
| 06 | `06-performance-issues.md` | 2 issues: startup budget, memory budget |
| 07 | `07-ux-ui-issues.md` | 3 issues: DST handling, timezone change, challenge calibration |
| 08 | `08-devops-issues.md` | 7 issues: macOS signing, Windows signing, CI/CD, update keys, Tauri permissions, Cargo versions, test strategy |
| 99 | `99-consistency-report.md` | Folder health check |

---

## Cross-References

- [AI Feasibility Analysis](/mnt/documents/alarm-app-ai-feasibility-analysis.md) — Source of original 32 issues
- [AI Handoff Reliability Report](../09-ai-handoff-reliability-report.md) — Source of 11 spec gap issues
- Parent folder's `00-overview.md` for broader context

---

*App issues overview — updated: 2026-04-09*
