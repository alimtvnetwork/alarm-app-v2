# DevOps Setup Guide

**Version:** 1.0.0  
**Updated:** 2026-04-09  
**AI Confidence:** High  
**Ambiguity:** None  
**Resolves:** DEVOPS-SIGN-001, DEVOPS-SIGN-002, DEVOPS-CI-001, DEVOPS-UPDATE-001

---

## Keywords

`devops`, `signing`, `notarization`, `ci-cd`, `auto-update`, `github-actions`, `tauri-action`, `code-signing`

---

## Purpose

Step-by-step setup guides for code signing, CI/CD, and auto-update infrastructure. These are **human tasks** that cannot be performed by AI — they require accounts, certificates, and secrets that involve identity verification and payment.

---

## 1. macOS Code Signing & Notarization

> **Resolves DEVOPS-SIGN-001.**

### Prerequisites

| Item | Details |
|------|---------|
| **Apple Developer Account** | $99/year — [developer.apple.com](https://developer.apple.com/programs/) |
| **Apple ID with 2FA** | Required for Developer enrollment |
| **Xcode CLI tools** | `xcode-select --install` |

### Step-by-Step

#### 1.1 Enroll in Apple Developer Program

1. Visit [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll/)
2. Sign in with Apple ID (must have 2FA enabled)
3. Choose Individual or Organization enrollment
4. Pay $99/year
5. Wait for approval (usually 24–48 hours)

#### 1.2 Create Developer ID Certificate

1. Open Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority
2. Enter email, select "Saved to disk", create CSR file
3. Go to [developer.apple.com/account/resources/certificates](https://developer.apple.com/account/resources/certificates/list)
4. Click "+" → select "Developer ID Application"
5. Upload CSR → download `.cer` file
6. Double-click to install in Keychain

#### 1.3 Create App-Specific Password (for notarization)

1. Go to [appleid.apple.com](https://appleid.apple.com/) → Security → App-Specific Passwords
2. Generate a new password, label it "Tauri Notarization"
3. Save it securely — you'll use it as `APPLE_PASSWORD` in CI

#### 1.4 Find Your Signing Identity

```bash
security find-identity -v -p codesigning
# Output: "Developer ID Application: Your Name (TEAM_ID)"
```

Save:
- **Identity name**: `Developer ID Application: Your Name (TEAM_ID)`
- **Team ID**: The 10-character string in parentheses

#### 1.5 Configure `tauri.conf.json`

```json
{
  "bundle": {
    "macOS": {
      "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)",
      "providerShortName": "TEAM_ID"
    }
  }
}
```

#### 1.6 GitHub Actions Secrets (macOS)

| Secret Name | Value | Where to Find |
|-------------|-------|---------------|
| `APPLE_CERTIFICATE` | Base64-encoded `.p12` certificate | Export from Keychain Access |
| `APPLE_CERTIFICATE_PASSWORD` | Password used when exporting `.p12` | Set during export |
| `APPLE_ID` | Your Apple ID email | Your Apple account |
| `APPLE_PASSWORD` | App-specific password | Step 1.3 |
| `APPLE_TEAM_ID` | 10-char team identifier | Step 1.4 |

#### Export Certificate as Base64

```bash
# Export from Keychain as .p12 file (set a password when prompted)
security export -k login.keychain -t identities -f pkcs12 -o cert.p12

# Convert to base64 for GitHub secret
base64 -i cert.p12 | pbcopy
# Paste into GitHub Secrets as APPLE_CERTIFICATE
```

---

## 2. Windows Code Signing

> **Resolves DEVOPS-SIGN-002.**

### Option A: EV Certificate (Recommended for SmartScreen Trust)

| Item | Details |
|------|---------|
| **EV Certificate** | $200–500/year from DigiCert, Sectigo, or GlobalSign |
| **Hardware Token** | USB token shipped with EV cert (required by CA) |
| **Windows machine** | For local signing or self-hosted runner |

#### 2A.1 Purchase EV Certificate

1. Go to [digicert.com](https://www.digicert.com/signing/code-signing-certificates) or [sectigo.com](https://sectigo.com/ssl-certificates-tls/code-signing)
2. Select "EV Code Signing Certificate"
3. Complete organization validation (requires legal docs, ~1–2 weeks)
4. Receive USB hardware token by mail

#### 2A.2 Configure Signing in CI

EV certificates on USB tokens **cannot** be used in cloud CI directly. Options:

| Approach | Pros | Cons |
|----------|------|------|
| **Self-hosted runner** | Full control, USB token connected | Must maintain a Windows machine |
| **Azure Trusted Signing** | Cloud-based, no USB | Newer service, limited Tauri docs |
| **SignPath.io** | CI integration, cloud signing | Third-party dependency, cost |

#### 2A.3 Self-Hosted Runner Setup

```bash
# On your Windows machine with USB token:
# 1. Install GitHub Actions runner
# 2. Configure as self-hosted runner for Windows builds
# 3. Install signtool.exe (comes with Windows SDK)

# Sign command (used by tauri-action):
signtool sign /tr http://timestamp.digicert.com /td sha256 /fd sha256 /a "target/release/bundle/nsis/*.exe"
```

### Option B: Azure Trusted Signing (Cloud Alternative)

1. Create an Azure account → enable "Trusted Signing" resource
2. Create a certificate profile (Identity Validation type)
3. Configure GitHub Actions with Azure credentials
4. No USB token needed — signing happens in Azure cloud

```yaml
# In CI workflow (simplified):
- name: Sign with Azure Trusted Signing
  uses: azure/trusted-signing-action@v0.3.16
  with:
    azure-tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    azure-client-id: ${{ secrets.AZURE_CLIENT_ID }}
    azure-client-secret: ${{ secrets.AZURE_CLIENT_SECRET }}
    endpoint: https://eus.codesigning.azure.net/
    trusted-signing-account-name: ${{ secrets.SIGNING_ACCOUNT }}
    certificate-profile-name: ${{ secrets.CERTIFICATE_PROFILE }}
    files-folder: target/release/bundle/nsis/
    file-digest: SHA256
    timestamp-rfc3161: http://timestamp.acs.microsoft.com
```

#### GitHub Actions Secrets (Windows)

| Secret Name | Value |
|-------------|-------|
| `AZURE_TENANT_ID` | Azure AD tenant ID |
| `AZURE_CLIENT_ID` | Service principal client ID |
| `AZURE_CLIENT_SECRET` | Service principal secret |
| `SIGNING_ACCOUNT` | Trusted Signing account name |
| `CERTIFICATE_PROFILE` | Certificate profile name |

---

## 3. CI/CD Pipeline (GitHub Actions)

> **Resolves DEVOPS-CI-001.**

### Complete Workflow File

Create `.github/workflows/build-and-release.yml`:

```yaml
name: Build & Release

on:
  push:
    tags:
      - 'v*'   # Trigger on version tags: v1.0.0, v1.1.0, etc.
  workflow_dispatch:  # Manual trigger for testing

concurrency:
  group: release-${{ github.ref }}
  cancel-in-progress: true

env:
  TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
  TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}

jobs:
  build:
    strategy:
      fail-fast: false
      matrix:
        include:
          - platform: macos-latest
            target: aarch64-apple-darwin
            label: macOS-arm64
          - platform: macos-latest
            target: x86_64-apple-darwin
            label: macOS-x64
          - platform: windows-latest
            target: x86_64-pc-windows-msvc
            label: Windows-x64
          - platform: ubuntu-22.04
            target: x86_64-unknown-linux-gnu
            label: Linux-x64

    runs-on: ${{ matrix.platform }}
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # --- System Dependencies ---
      - name: Install Linux dependencies
        if: matrix.platform == 'ubuntu-22.04'
        run: |
          sudo apt-get update
          sudo apt-get install -y \
            libwebkit2gtk-4.1-dev \
            libappindicator3-dev \
            librsvg2-dev \
            patchelf \
            libssl-dev \
            libgtk-3-dev

      # --- Rust ---
      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.target }}

      - name: Cache Rust dependencies
        uses: actions/cache@v4
        with:
          path: |
            ~/.cargo/registry
            ~/.cargo/git
            src-tauri/target
          key: rust-${{ matrix.target }}-${{ hashFiles('src-tauri/Cargo.lock') }}
          restore-keys: rust-${{ matrix.target }}-

      # --- Node.js ---
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install frontend dependencies
        run: npm ci

      # --- macOS Signing ---
      - name: Import macOS certificate
        if: startsWith(matrix.platform, 'macos')
        env:
          APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
          APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
        run: |
          echo "$APPLE_CERTIFICATE" | base64 --decode > cert.p12
          security create-keychain -p actions build.keychain
          security default-keychain -s build.keychain
          security unlock-keychain -p actions build.keychain
          security import cert.p12 -k build.keychain -P "$APPLE_CERTIFICATE_PASSWORD" -T /usr/bin/codesign
          security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k actions build.keychain
          rm cert.p12

      # --- Build ---
      - name: Build Tauri app
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # macOS notarization
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: 'Alarm App ${{ github.ref_name }}'
          releaseBody: 'See the changelog for details.'
          releaseDraft: true
          prerelease: false
          args: --target ${{ matrix.target }}

  # --- Post-build: Update manifest for auto-updater ---
  update-manifest:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Generate update manifest
        run: |
          # tauri-action auto-generates latest.json in the release
          # The updater checks this file for new versions
          echo "Update manifest generated by tauri-action"
```

### CI Cost Estimation

| Runner | Cost (GitHub Actions) | Build Time (est.) |
|--------|----------------------|-------------------|
| macOS (arm64) | $0.16/min | ~8–12 min |
| macOS (x64) | $0.08/min | ~10–15 min |
| Windows | $0.08/min | ~10–15 min |
| Linux | $0.008/min | ~5–8 min |
| **Per release** | **~$4–8** | **~35–50 min total** |

### Caching Strategy

| Cache | Key | Savings |
|-------|-----|---------|
| Rust `target/` | `Cargo.lock` hash | ~60–70% build time |
| `~/.cargo/registry` | `Cargo.lock` hash | Network download time |
| `node_modules/` | `package-lock.json` hash | ~30s per build |

### Branch Strategy

| Event | Action |
|-------|--------|
| Push to `main` | Run tests only (no build) |
| Push tag `v*` | Full build + release draft |
| Pull request | Run tests + lint |
| Manual dispatch | Full build (for testing CI) |

---

## 4. Auto-Update Key Management

> **Resolves DEVOPS-UPDATE-001.**

### How Tauri Auto-Update Works

1. App checks an update endpoint (GitHub Releases) on launch
2. If a newer version exists, downloads the update bundle
3. Bundle is verified against a **public key** embedded in the app
4. Bundle was signed with the corresponding **private key** during CI build
5. If signature is valid, the update is installed

### 4.1 Generate Updater Keypair

```bash
# Generate a new keypair (one-time setup)
npx tauri signer generate -w ~/.tauri/alarm-app.key

# This creates two files:
# ~/.tauri/alarm-app.key          — PRIVATE KEY (keep secret!)
# ~/.tauri/alarm-app.key.pub      — PUBLIC KEY (embed in app)
```

You'll be prompted for a password. **Use a strong password** and save it — you'll need it as `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`.

### 4.2 Configure `tauri.conf.json`

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "dialog": true,
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6...",
      "endpoints": [
        "https://github.com/YOUR_ORG/alarm-app/releases/latest/download/latest.json"
      ]
    }
  }
}
```

- **`pubkey`**: Paste the contents of `alarm-app.key.pub`
- **`endpoints`**: Points to GitHub Releases where `latest.json` is published by `tauri-action`

### 4.3 Store Private Key in CI

| Secret Name | Value | Source |
|-------------|-------|--------|
| `TAURI_SIGNING_PRIVATE_KEY` | Contents of `~/.tauri/alarm-app.key` | Step 4.1 |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Password set during key generation | Step 4.1 |

These are referenced in the CI workflow (Section 3) via `env:` block.

### 4.4 Key Backup & Rotation

#### Backup Procedure

| Location | Purpose |
|----------|---------|
| **GitHub Actions Secrets** | CI signing (primary) |
| **Password manager** (1Password/Bitwarden) | Team backup |
| **Encrypted USB drive** (offline) | Disaster recovery |

> ⚠️ **Never** commit the private key to the repository. Never store it unencrypted on disk.

#### Rotation Procedure

Key rotation requires releasing a **transition version** that trusts both old and new keys:

1. Generate new keypair: `npx tauri signer generate -w ~/.tauri/alarm-app-v2.key`
2. Release version N with **both** public keys in `tauri.conf.json` endpoints
3. Update CI secret `TAURI_SIGNING_PRIVATE_KEY` to new private key
4. Release version N+1 signed with new key — existing users can verify with either key
5. Release version N+2 with **only** new public key — old key fully retired

#### Emergency: Lost Private Key

If the private key is lost and no backup exists:
1. Generate new keypair
2. Users on current version **cannot auto-update** (signature verification fails)
3. Release a new version with new pubkey — requires manual download from website
4. All future versions use new key normally

### 4.5 Update Flow Diagram

```
App Launch
    │
    ▼
Check endpoint ──→ GET /latest/download/latest.json
    │
    ▼
Compare versions ──→ current < remote?
    │                     │
    No                   Yes
    │                     │
    ▼                     ▼
  (done)          Download .tar.gz (macOS) / .nsis (Windows)
                         │
                         ▼
                  Verify signature with embedded pubkey
                         │
                    ┌────┴────┐
                    │         │
                  Valid    Invalid
                    │         │
                    ▼         ▼
              Install      Reject
              + restart    + log error
```

---

## Checklist: Complete DevOps Setup

| # | Task | Type | Est. Time | Status |
|---|------|------|-----------|--------|
| 1 | Enroll in Apple Developer Program | Human | 1–2 days | ☐ |
| 2 | Create Developer ID certificate | Human | 30 min | ☐ |
| 3 | Create app-specific password | Human | 5 min | ☐ |
| 4 | Export certificate as Base64 | Human | 10 min | ☐ |
| 5 | Purchase Windows EV cert OR setup Azure Trusted Signing | Human | 1–2 weeks | ☐ |
| 6 | Generate Tauri updater keypair | Human | 5 min | ☐ |
| 7 | Backup keypair to password manager | Human | 5 min | ☐ |
| 8 | Create GitHub repository | Human | 5 min | ☐ |
| 9 | Add all secrets to GitHub Actions | Human | 15 min | ☐ |
| 10 | Create `.github/workflows/build-and-release.yml` | AI/Human | 10 min | ☐ |
| 11 | Test CI with manual workflow dispatch | Human | 30 min | ☐ |
| 12 | Tag first release (`v1.0.0`) | Human | 5 min | ☐ |
| 13 | Verify auto-update from v1.0.0 → v1.0.1 | Human | 30 min | ☐ |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| File Structure | `./03-file-structure.md` |
| Platform Constraints | `./04-platform-constraints.md` |
| Startup Sequence | `./07-startup-sequence.md` |
| App Issues | `../03-app-issues/08-devops-issues.md` |

---

*DevOps setup guide — created: 2026-04-09*
