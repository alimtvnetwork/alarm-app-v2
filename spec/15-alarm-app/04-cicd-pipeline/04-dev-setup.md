# Developer Setup (`run.ps1 -i`)

> **Spec Version:** 1.0.0  
> **Updated:** 2026-04-13  
> **Status:** Active

---

## Purpose

A single command to install **all developer prerequisites** needed to build the Alarm App from source. Modeled after GitMap's `run.ps1` pattern with simple, memorable flags.

---

## Quick Start

```powershell
# Windows — install everything to build from source
.\run.ps1 -i
```

```bash
# Linux / macOS — install everything to build from source
./run.sh -i
```

That's it. One flag, all prerequisites.

---

## What `-i` Installs

| Tool | Version | Purpose | Auto-Install Method |
|------|---------|---------|-------------------|
| Rust | stable (latest) | Tauri backend | `rustup` |
| Node.js | 20+ LTS | Frontend build | `winget` / `brew` / `nvm` |
| pnpm | 9+ | Package manager | `corepack enable` |
| Tauri CLI | 2.x | Build + dev server | `cargo install tauri-cli` |

### Platform-Specific Dependencies

| Platform | Additional | Install Method |
|----------|-----------|---------------|
| Windows | WebView2 Runtime | Pre-installed on Win 10/11 |
| Linux | `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf` | `apt install` |
| macOS | Xcode Command Line Tools | `xcode-select --install` |

---

## PowerShell Implementation (`run.ps1 -i`)

### Detection Logic

```powershell
function Test-Tool($name, $cmd) {
    $found = Get-Command $cmd -ErrorAction SilentlyContinue
    if ($found) {
        $ver = & $cmd --version 2>&1 | Select-Object -First 1
        Write-Host "  ✓ $name found: $ver"
        return $true
    }
    Write-Host "  ✗ $name not found — installing..."
    return $false
}
```

### Install Flow

```
1. Print banner: "⏰ Alarm App — Dev Setup"
2. Check each tool:
   a. Rust → if missing: invoke rustup-init
   b. Node.js → if missing: winget install OpenJS.NodeJS.LTS
   c. pnpm → if missing: corepack enable && corepack prepare pnpm@latest --activate
   d. Tauri CLI → if missing: cargo install tauri-cli
3. Install frontend dependencies: pnpm install
4. Verify all tools present
5. Print summary with versions
```

### Terminal Output

```
╔══════════════════════════════════════╗
║   ⏰ Alarm App — Dev Setup           ║
╚══════════════════════════════════════╝

[1/5] Checking prerequisites...
  ✓ Rust found: rustc 1.78.0
  ✗ Node.js not found — installing...
    → winget install OpenJS.NodeJS.LTS
  ✓ Node.js installed: v20.14.0
  ✓ pnpm found: 9.1.0
  ✗ Tauri CLI not found — installing...
    → cargo install tauri-cli
  ✓ Tauri CLI installed: 2.1.0
  ⏱ 45.2s

[2/5] Installing frontend dependencies...
  → pnpm install
  ✓ Dependencies installed
  ⏱ 8.3s

========================================
  ✅ Dev environment ready!
  Run: .\run.ps1        (build & run)
  Run: .\run.ps1 -d     (dev mode)
========================================
```

---

## Bash Implementation (`run.sh -i`)

### Install Flow

```bash
install_prerequisites() {
  echo "  Checking Rust..."
  if ! command -v rustc &>/dev/null; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
  fi

  echo "  Checking Node.js..."
  if ! command -v node &>/dev/null; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      brew install node@20
    else
      curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
      sudo apt-get install -y nodejs
    fi
  fi

  echo "  Checking pnpm..."
  if ! command -v pnpm &>/dev/null; then
    corepack enable
    corepack prepare pnpm@latest --activate
  fi

  echo "  Checking Tauri CLI..."
  if ! command -v cargo-tauri &>/dev/null; then
    cargo install tauri-cli
  fi

  # Linux-only: system libraries
  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo apt update
    sudo apt install -y \
      libwebkit2gtk-4.1-dev \
      libappindicator3-dev \
      librsvg2-dev \
      patchelf
  fi

  echo "  Installing frontend dependencies..."
  pnpm install
}
```

---

## Post-Setup: Build & Run

After `-i` completes, developers use these flags:

| Command | Action |
|---------|--------|
| `run.ps1` / `run.sh` | Full build + run |
| `run.ps1 -d` / `run.sh -d` | Dev mode (hot reload) |
| `run.ps1 -b` / `run.sh -b` | Build only (no run) |
| `run.ps1 -t` / `run.sh -t` | Run tests |
| `run.ps1 -c` / `run.sh -c` | Clean all build artifacts |

See [Run Script Reference](./05-run-script-reference.md) for all flags.

---

## Cross-References

- [Overview](./00-overview.md)
- [Run Script Reference](./05-run-script-reference.md)
- [PowerShell Integration Guide](../../09-powershell-integration/04-integration-guide.md) — Pattern source

---

*Dev Setup — created: 2026-04-13*
