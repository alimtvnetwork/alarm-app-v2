# DevOps Issues

**Version:** 1.1.0  
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
| **Likelihood** | 95% |
| **Status** | Open |

**Description:** AI cannot create Apple Developer accounts, generate certificates, or configure notarization. Requires human identity verification and $99/year enrollment.

**Root Cause:** Apple's signing infrastructure requires human identity verification.

**Suggested Fix:** Human task — create Apple Developer account, generate Developer ID certificate, configure `tauri.conf.json` with signing identity. Document in a `devops/macos-signing-guide.md`.

---

### DEVOPS-SIGN-002 — Windows EV code signing requires hardware token

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 90% |
| **Status** | Open |

**Description:** SmartScreen trust requires EV certificate on a physical USB token. Cannot be automated by AI. Expensive (~$200–500/year).

**Root Cause:** Microsoft's SmartScreen requirements.

**Suggested Fix:** Human task — purchase EV certificate from DigiCert/Sectigo, configure CI signing step. Alternative: use Azure Trusted Signing (cloud-based, cheaper) when available for Tauri.

---

### DEVOPS-CI-001 — Cross-platform CI/CD requires 3 OS runners

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 80% |
| **Status** | Open |

**Description:** Building for macOS requires macOS runner (GitHub Actions charges premium). Linux + Windows runners also needed. Total CI cost and complexity are high.

**Root Cause:** Native compilation requirement — no cross-compilation for Tauri.

**Suggested Fix:** Use GitHub Actions with matrix strategy: `[macos-latest, windows-latest, ubuntu-latest]`. Cache `target/` and `node_modules/` between runs. Use Tauri's official `tauri-action` for build + bundle.

---

### DEVOPS-UPDATE-001 — Auto-update signing key management

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 70% |
| **Status** | Open |

**Description:** Tauri updater requires a private key to sign update bundles. Key storage, rotation, and backup strategy not specified.

**Root Cause:** Missing key management specification.

**Suggested Fix:** Generate Tauri updater keypair (`tauri signer generate`). Store private key as GitHub Actions secret (`TAURI_PRIVATE_KEY`). Back up to a password manager. Document rotation procedure in `devops/update-key-management.md`.

---

### DEVOPS-PERM-001 — No Tauri 2.x permission/capability manifest specified

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 80% |
| **Status** | Open |
| **Fail %** | 45% |

**Description:** Tauri 2.x uses a new `capabilities` system in `tauri.conf.json`. Without an exact permission manifest, AI will miss required plugin permissions and the app will crash at runtime with unhelpful errors.

**Root Cause:** Tauri 2.x capability system is new and poorly documented. Most AIs default to Tauri 1.x patterns.

**Suggested Fix:** Add exact `capabilities` JSON block to `03-file-structure.md` or a new `tauri-config.md`:
```json
{
  "capabilities": [{
    "identifier": "main",
    "windows": ["main"],
    "permissions": [
      "core:default",
      "sql:default",
      "notification:default",
      "dialog:default",
      "fs:default",
      "global-shortcut:default",
      "tray:default",
      "autostart:default",
      "updater:default"
    ]
  }]
}
```

**Resolution Plan:** Add the complete capabilities block to `01-fundamentals/03-file-structure.md` under the `src-tauri/` section with inline comments explaining each permission.

---

### DEVOPS-CARGO-001 — No Cargo.toml dependency list with pinned versions

| Field | Value |
|-------|-------|
| **Impact** | High |
| **Likelihood** | 75% |
| **Status** | Open |
| **Fail %** | 35% |

**Description:** Spec mentions crate names (`rodio`, `chrono-tz`, `croner`, `refinery`) but not versions. AI may pick incompatible versions or use deprecated crates.

**Root Cause:** Missing pinned dependency versions.

**Suggested Fix:** Add to `03-file-structure.md` or `01-data-model.md`:
```toml
[dependencies]
tauri = { version = "2", features = ["tray-icon", "global-shortcut"] }
tauri-plugin-sql = { version = "2", features = ["sqlite"] }
tauri-plugin-notification = "2"
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
tauri-plugin-autostart = "2"
tauri-plugin-updater = "2"
rodio = "0.19"
chrono = { version = "0.4", features = ["serde"] }
chrono-tz = "0.10"
croner = "2.0"
refinery = { version = "0.8", features = ["rusqlite"] }
rusqlite = { version = "0.31", features = ["bundled"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
uuid = { version = "1", features = ["v4"] }
tokio = { version = "1", features = ["full"] }
```

**Resolution Plan:** Add the full `Cargo.toml` `[dependencies]` block to `01-fundamentals/03-file-structure.md` with version comments.

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
