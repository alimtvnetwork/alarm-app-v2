# DevOps Issues

**Version:** 1.2.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** None  
**Source:** AI Feasibility Analysis v1.0.0, AI Handoff Reliability Report v1.0.0

---

## Keywords

`devops`, `signing`, `notarization`, `ci-cd`, `auto-update`, `deployment`, `tauri`, `permissions`, `cargo`, `testing`

---

## Issue Registry

### DEVOPS-SIGN-001 — macOS notarization requires manual Apple Developer setup

| Field | Value |
|-------|-------|
| **Impact** | Critical |
| **Likelihood** | 95% → 0% |
| **Status** | ✅ Resolved |

**Description:** AI cannot create Apple Developer accounts, generate certificates, or configure notarization. Requires human identity verification and $99/year enrollment.

**Root Cause:** Apple's signing infrastructure requires human identity verification.

**Resolution:** Created `01-fundamentals/08-devops-setup-guide.md` v1.0.0 Section 1 with complete step-by-step: Apple Developer enrollment, Developer ID certificate creation, app-specific password, Keychain export to Base64, `tauri.conf.json` signing config, and 5 GitHub Actions secrets with descriptions.

---

### DEVOPS-SIGN-002 — Windows EV code signing requires hardware token

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 90% → 0% |
| **Status** | ✅ Resolved |

**Description:** SmartScreen trust requires EV certificate on a physical USB token. Cannot be automated by AI. Expensive (~$200–500/year).

**Root Cause:** Microsoft's SmartScreen requirements.

**Resolution:** Created `01-fundamentals/08-devops-setup-guide.md` v1.0.0 Section 2 with two paths: Option A (EV cert with USB token + self-hosted runner) and Option B (Azure Trusted Signing cloud alternative with GitHub Actions config). Includes cost comparison and signing command examples.

---

### DEVOPS-CI-001 — Cross-platform CI/CD requires 3 OS runners

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 80% → 0% |
| **Status** | ✅ Resolved |

**Description:** Building for macOS requires macOS runner (GitHub Actions charges premium). Linux + Windows runners also needed. Total CI cost and complexity are high.

**Root Cause:** Native compilation requirement — no cross-compilation for Tauri.

**Resolution:** Created `01-fundamentals/08-devops-setup-guide.md` v1.0.0 Section 3 with complete GitHub Actions workflow: 4-target matrix (macOS arm64/x64, Windows x64, Linux x64), Rust/Node caching, macOS certificate import, `tauri-action` integration, cost estimate (~$4–8/release), and branch strategy.

---

### DEVOPS-UPDATE-001 — Auto-update signing key management

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 70% → 0% |
| **Status** | ✅ Resolved |

**Description:** Tauri updater requires a private key to sign update bundles. Key storage, rotation, and backup strategy not specified.

**Root Cause:** Missing key management specification.

**Resolution:** Created `01-fundamentals/08-devops-setup-guide.md` v1.0.0 Section 4 with keypair generation, `tauri.conf.json` updater config, 3-location backup strategy, key rotation procedure (transition version approach), emergency lost-key recovery plan, and update flow diagram.

---

### DEVOPS-PERM-001 — No Tauri 2.x permission/capability manifest specified

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 80% → 0% |
| **Status** | ✅ Resolved |
| **Fail %** | 45% → 5% |

**Description:** Tauri 2.x uses a new `capabilities` system in `tauri.conf.json`. Without an exact permission manifest, AI will miss required plugin permissions and the app will crash at runtime with unhelpful errors.

**Root Cause:** Tauri 2.x capability system is new and poorly documented. Most AIs default to Tauri 1.x patterns.

**Resolution:** Added complete `capabilities/default.json` manifest to `01-fundamentals/03-file-structure.md` v1.3.0 with all 9 plugin permission groups, permission category table, and security notes.

---

### DEVOPS-CARGO-001 — No Cargo.toml dependency list with pinned versions

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 75% → 0% |
| **Status** | ✅ Resolved |
| **Fail %** | 35% → 5% |

**Description:** Spec mentions crate names (`rodio`, `chrono-tz`, `croner`, `refinery`) but not versions. AI may pick incompatible versions or use deprecated crates.

**Root Cause:** Missing pinned dependency versions.

**Resolution:** Added complete `Cargo.toml` `[dependencies]` block to `01-fundamentals/03-file-structure.md` v1.3.0 with pinned versions, feature flags, and platform-conditional dependencies (`objc2`, `windows`, `zbus`).

---

### DEVOPS-TEST-001 — No test strategy defined

| Field | Value |
|-------|-------|
| **Impact** | Medium |
| **Likelihood** | 85% |
| **Status** | Open |
| **Fail %** | 30% |

**Description:** No unit test, integration test, or E2E test strategy specified. AI will produce untested code with no verification mechanism.

**Root Cause:** Missing quality assurance spec.

**Suggested Fix:**
- **Rust unit tests:** `scheduler.rs` (nextFireTime calculation for all 5 repeat types + DST), `gradual_volume.rs`, validation functions
- **Rust integration tests:** IPC command handlers with in-memory SQLite
- **Frontend unit tests:** `useAlarms` hook, `AlarmForm` validation, time formatting
- **E2E test:** Create alarm → wait for fire → dismiss → verify event logged (use Tauri's `tauri-driver` or WebDriver)

**Resolution Plan:** Create `01-fundamentals/12-test-strategy.md` defining test layers, coverage targets, and CI integration requirements.

---

*DevOps issues — updated: 2026-04-09*
