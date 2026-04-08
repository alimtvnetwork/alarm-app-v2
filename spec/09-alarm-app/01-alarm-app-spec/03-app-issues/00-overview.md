# App Issues

**Version:** 1.1.0  
**Status:** Active  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`issues`, `bugs`, `fixes`, `retrospectives`, `feasibility`, `risk-analysis`

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

Bug tracking, fixes, risk analysis, and retrospectives for the Alarm App. Issues sourced from the AI Feasibility Analysis v1.0.0 (32 atomic issues across 7 categories).

---

## Issue Summary

| Category | File | Issues | Critical | High | Medium | Low |
|----------|------|:------:|:--------:|:----:|:------:|:---:|
| Migration | `01-web-to-native-migration.md` | 1 | — | — | — | — |
| Frontend | `02-frontend-issues.md` | 7 | — | 1 | 3 | 3 |
| Backend | `03-backend-issues.md` | 8 | — | 2 | 5 | 1 |
| Database | `04-database-issues.md` | 4 | — | 1 | 1 | 2 |
| Security | `05-security-issues.md` | 3 | — | 1 | 1 | 1 |
| Performance | `06-performance-issues.md` | 2 | — | — | 2 | — |
| UX/UI | `07-ux-ui-issues.md` | 3 | — | 2 | — | 1 |
| DevOps | `08-devops-issues.md` | 4 | 1 | 3 | — | — |
| **Total** | | **32** | **1** | **10** | **12** | **8** |

---

## Document Inventory

| # | File | Description |
|---|------|-------------|
| 01 | `01-web-to-native-migration.md` | Web-app references that must be updated for native cross-platform |
| 02 | `02-frontend-issues.md` | 7 issues: state management, DnD, a11y, overlay, WebView, i18n |
| 03 | `03-backend-issues.md` | 8 issues: timer, audio, wake-events, cron, snooze, delete, concurrency |
| 04 | `04-database-issues.md` | 4 issues: migration tooling, event growth, orphans, type safety |
| 05 | `05-security-issues.md` | 3 issues: path injection, SSRF, export encryption |
| 06 | `06-performance-issues.md` | 2 issues: startup budget, memory budget |
| 07 | `07-ux-ui-issues.md` | 3 issues: DST handling, timezone change, challenge calibration |
| 08 | `08-devops-issues.md` | 4 issues: macOS signing, Windows signing, CI/CD, update keys |
| 99 | `99-consistency-report.md` | Folder health check |

---

## Cross-References

- [AI Feasibility Analysis](/mnt/documents/alarm-app-ai-feasibility-analysis.md) — Source of all 32 issues
- Parent folder's `00-overview.md` for broader context

---

*App issues overview — updated: 2026-04-08*
