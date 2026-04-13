# Install Scripts (End-User)

> **Spec Version:** 1.0.0  
> **Updated:** 2026-04-13  
> **Status:** Active

---

## Purpose

One-liner install commands for end users to download and install the Alarm App on any OS — no manual GitHub browsing required.

---

## One-Liner Commands

### Windows (PowerShell)

```powershell
irm https://github.com/alimtvnetwork/alarm-app/releases/latest/download/install.ps1 | iex
```

### Linux / macOS (Bash)

```bash
curl -fsSL https://github.com/alimtvnetwork/alarm-app/releases/latest/download/install.sh | bash
```

### Version-Pinned

```powershell
irm https://github.com/alimtvnetwork/alarm-app/releases/download/v1.0.0/install.ps1 | iex
```

```bash
curl -fsSL https://github.com/alimtvnetwork/alarm-app/releases/download/v1.0.0/install.sh | bash
```

---

## PowerShell Installer (`install.ps1`)

### Flow

```
1. Print banner (app name + version)
2. Detect OS architecture (amd64 / arm64)
3. Construct download URL for .msi installer
4. Download .msi + checksums.txt
5. Verify SHA-256 checksum (fail on mismatch)
6. Run .msi installer silently (msiexec /i /quiet)
7. Verify install: check app exists in Program Files
8. Print success summary with app location
```

### Architecture Detection

```powershell
$cpuArch = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture
if ($cpuArch -eq "Arm64") { $arch = "arm64" }
else { $arch = "x64" }
```

### Terminal Output

```
╔══════════════════════════════════════╗
║   ⏰ Alarm App Installer v1.0.0     ║
╚══════════════════════════════════════╝

  Detected: Windows amd64
  Downloading: alarm-app_v1.0.0_x64-setup.msi
  ✓ Downloaded (12.4 MB)
  ✓ Checksum verified (SHA-256)
  ✓ Installing...
  ✓ Installed to C:\Program Files\Alarm App

  🎉 Done! Launch from Start Menu → Alarm App
```

---

## Bash Installer (`install.sh`)

### Flow

```
1. Print banner (app name + version)
2. Detect OS (Linux / macOS) and architecture (amd64 / arm64)
3. Select correct asset:
   - macOS → .dmg
   - Linux → .AppImage (fallback: .deb)
4. Download asset + checksums.txt
5. Verify SHA-256 checksum
6. Install:
   - macOS: mount .dmg, copy to /Applications, unmount
   - Linux (.AppImage): copy to ~/.local/bin, chmod +x
   - Linux (.deb): sudo dpkg -i
7. Verify install
8. Print success summary
```

### OS + Architecture Detection

```bash
detect_platform() {
  OS="$(uname -s)"
  ARCH="$(uname -m)"

  case "$OS" in
    Darwin) PLATFORM="macos" ;;
    Linux)  PLATFORM="linux" ;;
    *)      echo "Unsupported OS: $OS"; exit 1 ;;
  esac

  case "$ARCH" in
    x86_64)  ARCH="amd64" ;;
    aarch64|arm64) ARCH="arm64" ;;
    *)       echo "Unsupported arch: $ARCH"; exit 1 ;;
  esac
}
```

### Terminal Output (Linux)

```
╔══════════════════════════════════════╗
║   ⏰ Alarm App Installer v1.0.0     ║
╚══════════════════════════════════════╝

  Detected: Linux amd64
  Downloading: alarm-app_v1.0.0_amd64.AppImage
  ✓ Downloaded (18.2 MB)
  ✓ Checksum verified (SHA-256)
  ✓ Installed to ~/.local/bin/alarm-app
  ✓ Added to PATH

  🎉 Done! Run: alarm-app
```

### Terminal Output (macOS)

```
╔══════════════════════════════════════╗
║   ⏰ Alarm App Installer v1.0.0     ║
╚══════════════════════════════════════╝

  Detected: macOS arm64 (Apple Silicon)
  Downloading: alarm-app_v1.0.0_x64.dmg
  ✓ Downloaded (22.1 MB)
  ✓ Checksum verified (SHA-256)
  ✓ Mounted disk image
  ✓ Copied to /Applications/Alarm App.app
  ✓ Unmounted disk image

  🎉 Done! Launch from Applications → Alarm App
```

---

## Checksum Verification

Both scripts **must** verify checksums before installing:

```bash
EXPECTED=$(grep "$ASSET_NAME" checksums.txt | awk '{print $1}')
ACTUAL=$(sha256sum "$ASSET_NAME" | awk '{print $1}')

if [ "$EXPECTED" != "$ACTUAL" ]; then
  echo "✗ Checksum mismatch! Download may be corrupted."
  echo "  Expected: $EXPECTED"
  echo "  Got:      $ACTUAL"
  exit 1
fi
```

---

## Upgrade & Uninstall

### Upgrade

Re-running the install script upgrades to the latest version:

```powershell
# Windows — upgrades in-place
irm .../install.ps1 | iex
```

```bash
# Linux / macOS — replaces existing
curl -fsSL .../install.sh | bash
```

### Uninstall

| Platform | Command |
|----------|---------|
| Windows | Settings → Apps → Alarm App → Uninstall |
| macOS | Drag `/Applications/Alarm App.app` to Trash |
| Linux (.AppImage) | `rm ~/.local/bin/alarm-app` |
| Linux (.deb) | `sudo apt remove alarm-app` |

---

## GitHub Releases Page

Users who prefer manual download can visit:

```
https://github.com/alimtvnetwork/alarm-app/releases/latest
```

The release page lists all assets with descriptions:

| Asset | For |
|-------|-----|
| `alarm-app_v1.0.0_x64-setup.msi` | Windows 10/11 (64-bit) |
| `alarm-app_v1.0.0_x64-setup.exe` | Windows 10/11 (64-bit, NSIS) |
| `alarm-app_v1.0.0_amd64.AppImage` | Linux (64-bit, portable) |
| `alarm-app_v1.0.0_amd64.deb` | Ubuntu / Debian (64-bit) |
| `alarm-app_v1.0.0_x64.dmg` | macOS (Intel + Apple Silicon) |
| `checksums.txt` | SHA-256 verification |

---

## Cross-References

- [Overview](./00-overview.md)
- [Release Pipeline](./02-release-pipeline.md)
- [Dev Setup](./04-dev-setup.md)
- [GitMap Install Scripts](https://github.com/alimtvnetwork/gitmap-v2/blob/main/spec/generic-release/03-install-scripts.md) — Pattern source
- [GitMap Installation Flow](https://github.com/alimtvnetwork/gitmap-v2/blob/main/spec/pipeline/04-installation-flow.md) — Terminal output patterns

---

*Install Scripts — created: 2026-04-13*
