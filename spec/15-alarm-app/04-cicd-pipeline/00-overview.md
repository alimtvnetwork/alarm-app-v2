# CI/CD Pipeline — Overview

> **Spec Version:** 1.0.0  
> **Updated:** 2026-04-13  
> **Status:** Active  
> **AI Confidence:** 95%  
> **Ambiguity:** 5%

---

## Purpose

This folder defines the complete CI/CD, release, and installation pipeline for the Alarm App (Tauri 2.x). It covers:

1. **Continuous Integration** — lint, test, build verification on every push
2. **Release Pipeline** — cross-compile Tauri app for 6 platform targets
3. **Install Scripts** — one-liner download commands for end users (like Movie CLI)
4. **Dev Setup Script** — `run.ps1 -i` / `run.sh -i` for developer prerequisites
5. **GitHub Releases** — manual download page with all OS installers

---

## Documents

| File | Purpose |
|------|---------|
| [01-ci-pipeline.md](./01-ci-pipeline.md) | CI workflow: lint, test, build verification |
| [02-release-pipeline.md](./02-release-pipeline.md) | Release automation: Tauri builds for 6 targets |
| [03-install-scripts.md](./03-install-scripts.md) | End-user one-liner installers (PowerShell + Bash) |
| [04-dev-setup.md](./04-dev-setup.md) | Developer prerequisites (`run.ps1 -i` / `run.sh -i`) |
| [05-run-script-reference.md](./05-run-script-reference.md) | Complete `run.ps1` / `run.sh` flag reference |

---

## Platform Targets

| Platform | Architecture | Installer Format |
|----------|-------------|-----------------|
| Windows | amd64 | `.msi` + `.exe` (NSIS) |
| Windows | arm64 | `.msi` + `.exe` (NSIS) |
| Linux | amd64 | `.AppImage` + `.deb` |
| Linux | arm64 | `.AppImage` + `.deb` |
| macOS | amd64 (Intel) | `.dmg` |
| macOS | arm64 (Apple Silicon) | `.dmg` |

---

## Install Experience Summary

### End Users

```powershell
# Windows (PowerShell) — downloads and installs the app
irm https://github.com/alimtvnetwork/alarm-app/releases/latest/download/install.ps1 | iex
```

```bash
# Linux / macOS — downloads and installs the app
curl -fsSL https://github.com/alimtvnetwork/alarm-app/releases/latest/download/install.sh | bash
```

Users can also visit the [GitHub Releases](https://github.com/alimtvnetwork/alarm-app/releases) page to manually download for their OS.

### Developers

```powershell
# Windows — install all dev prerequisites (Rust, Node, pnpm, Tauri CLI)
.\run.ps1 -i
```

```bash
# Linux / macOS — install all dev prerequisites
./run.sh -i
```

---

## Shared Conventions

- **Platform**: GitHub Actions
- **Runner**: OS-specific (`ubuntu-latest`, `macos-latest`, `windows-latest`)
- **Tauri**: v2.x with Rust backend
- **Action versions**: Pinned to exact tags, never `@latest`
- **Checksums**: SHA-256 for every release asset
- **Static linking**: Where possible (Rust `target-feature=+crt-static` on Windows)

---

## Cross-References

- [Alarm App Overview](../00-overview.md)
- [Platform & Concurrency Guide](../12-platform-and-concurrency-guide.md)
- [Rust Backend Plan](../16-rust-backend-implementation-plan.md)
- [PowerShell Integration](../../09-powershell-integration/04-integration-guide.md)
- [GitMap Pipeline Specs](https://github.com/alimtvnetwork/gitmap-v2/tree/main/spec/pipeline) — Pattern source
- [GitMap Generic Release](https://github.com/alimtvnetwork/gitmap-v2/tree/main/spec/generic-release) — Install script patterns

---

*Overview — created: 2026-04-13*
