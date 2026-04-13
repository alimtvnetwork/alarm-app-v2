# Release Pipeline

> **Spec Version:** 1.0.0  
> **Updated:** 2026-04-13  
> **Status:** Active

---

## Trigger

```yaml
on:
  push:
    branches: ["release/**"]
    tags: ["v*"]
```

## Concurrency

```yaml
concurrency:
  group: release-${{ github.ref }}
  cancel-in-progress: false   # Never cancel release builds
```

## Permissions

```yaml
permissions:
  contents: write
```

---

## Version Resolution

```bash
if [[ "$GITHUB_REF" == refs/tags/* ]]; then
  VERSION="${GITHUB_REF_NAME}"
elif [[ "$GITHUB_REF" == refs/heads/release/* ]]; then
  VERSION="${GITHUB_REF_NAME#release/}"
fi
```

---

## Build Matrix

Tauri's `tauri-action` handles cross-compilation per OS runner:

| Runner | Targets Produced |
|--------|-----------------|
| `windows-latest` | `.msi` (amd64), `.exe` NSIS (amd64) |
| `ubuntu-latest` | `.AppImage` (amd64), `.deb` (amd64) |
| `macos-latest` | `.dmg` (amd64 + arm64 universal) |

### Build Job

```yaml
build:
  strategy:
    fail-fast: false
    matrix:
      include:
        - os: windows-latest
          label: windows
        - os: ubuntu-latest
          label: linux
        - os: macos-latest
          label: macos
  runs-on: ${{ matrix.os }}
  steps:
    - uses: actions/checkout@v6
    - uses: dtolnay/rust-toolchain@stable
    - uses: actions/setup-node@v4
      with: { node-version: '20' }
    - run: pnpm install --frozen-lockfile
    - uses: nicolo-ribaudo/action-install-tauri-prerequisites@v1
    - uses: nicolo-ribaudo/action-tauri-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tagName: ${{ env.VERSION }}
        releaseName: "Alarm App ${{ env.VERSION }}"
        releaseBody: |
          See [CHANGELOG](https://github.com/alimtvnetwork/alarm-app/blob/main/CHANGELOG.md)
        releaseDraft: false
        prerelease: false
```

---

## Post-Build: Checksums

After all platform builds upload artifacts:

```yaml
checksums:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - uses: actions/download-artifact@v4
    - run: |
        cd artifacts
        sha256sum * > checksums.txt
        cat checksums.txt
    - uses: softprops/action-gh-release@v2
      with:
        files: artifacts/checksums.txt
```

---

## Post-Build: Install Scripts

Generate version-pinned `install.ps1` and `install.sh`, then attach to the release:

```yaml
install-scripts:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v6
    - run: |
        sed "s/{{VERSION}}/$VERSION/g" scripts/install.ps1.tmpl > install.ps1
        sed "s/{{VERSION}}/$VERSION/g" scripts/install.sh.tmpl > install.sh
    - uses: softprops/action-gh-release@v2
      with:
        files: |
          install.ps1
          install.sh
```

---

## Release Assets (Per Release)

| Asset | Description |
|-------|-------------|
| `alarm-app_${VERSION}_x64-setup.msi` | Windows MSI installer (amd64) |
| `alarm-app_${VERSION}_x64-setup.exe` | Windows NSIS installer (amd64) |
| `alarm-app_${VERSION}_amd64.AppImage` | Linux AppImage (amd64) |
| `alarm-app_${VERSION}_amd64.deb` | Linux Debian package (amd64) |
| `alarm-app_${VERSION}_x64.dmg` | macOS disk image (Intel + Apple Silicon) |
| `install.ps1` | Version-pinned PowerShell installer |
| `install.sh` | Version-pinned Bash installer |
| `checksums.txt` | SHA-256 checksums for all assets |

---

## Cross-References

- [Overview](./00-overview.md)
- [Install Scripts](./03-install-scripts.md)
- [GitMap Release Pipeline](https://github.com/alimtvnetwork/gitmap-v2/blob/main/spec/pipeline/02-release-pipeline.md) — Pattern source

---

*Release Pipeline — created: 2026-04-13*
