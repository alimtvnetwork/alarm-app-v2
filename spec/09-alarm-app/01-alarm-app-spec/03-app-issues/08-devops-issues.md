# DevOps Issues

**Version:** 1.0.0  
**Updated:** 2026-04-08  
**AI Confidence:** High  
**Ambiguity:** None  
**Source:** AI Feasibility Analysis v1.0.0

---

## Keywords

`devops`, `signing`, `notarization`, `ci-cd`, `auto-update`, `deployment`

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

*DevOps issues — created: 2026-04-08*
