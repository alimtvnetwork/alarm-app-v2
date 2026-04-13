# Run Script Reference

> **Spec Version:** 1.0.0  
> **Updated:** 2026-04-13  
> **Status:** Active

---

## Purpose

Complete flag reference for `run.ps1` (Windows) and `run.sh` (Linux / macOS). Every flag uses a **single letter** — short, intuitive, universal.

---

## Flag Reference

| Flag | Long Form | Action | Example |
|------|-----------|--------|---------|
| `-i` | `--install` | Install all dev prerequisites | `run.ps1 -i` |
| `-d` | `--dev` | Start Tauri dev server (hot reload) | `run.ps1 -d` |
| `-b` | `--build` | Build production app (no run) | `run.ps1 -b` |
| `-t` | `--test` | Run all tests (Rust + frontend) | `run.ps1 -t` |
| `-c` | `--clean` | Clean all build artifacts | `run.ps1 -c` |
| `-r` | `--release` | Build release binaries | `run.ps1 -r` |
| `-h` | `--help` | Show help with all flags | `run.ps1 -h` |
| `-v` | `--version` | Show tool versions | `run.ps1 -v` |
| *(none)* | | Full build + run | `run.ps1` |

---

## Flag Details

### `-i` — Install Prerequisites

Installs Rust, Node.js, pnpm, Tauri CLI, and platform-specific libraries. Safe to re-run — skips already-installed tools.

```powershell
.\run.ps1 -i
```

### `-d` — Dev Mode

Starts the Tauri development server with hot reload for both frontend (Vite) and backend (Rust):

```powershell
.\run.ps1 -d
```

Equivalent to: `pnpm tauri dev`

### `-b` — Build

Builds the production app bundle without launching it:

```powershell
.\run.ps1 -b
```

Equivalent to: `pnpm tauri build`

### `-t` — Test

Runs all tests:

```powershell
.\run.ps1 -t
```

Equivalent to:
```
cargo test --workspace
pnpm test
```

### `-c` — Clean

Removes all build artifacts and caches:

```powershell
.\run.ps1 -c
```

Removes:
- `target/` (Rust build)
- `dist/` (Vite output)
- `node_modules/` (optional, with confirmation)
- `.vite/` cache

### `-r` — Release Build

Builds optimized release binaries with all platform-specific installers:

```powershell
.\run.ps1 -r
```

Equivalent to: `pnpm tauri build --release`

### `-v` — Version

Shows all tool versions:

```powershell
.\run.ps1 -v
```

Output:
```
Alarm App Dev Environment
  Rust:      1.78.0
  Node.js:   v20.14.0
  pnpm:      9.1.0
  Tauri CLI: 2.1.0
```

### `-h` — Help

```powershell
.\run.ps1 -h
```

Output:
```
⏰ Alarm App — Build & Run Script

Usage: run.ps1 [flag]

Flags:
  -i    Install all dev prerequisites
  -d    Start dev server (hot reload)
  -b    Build production app
  -t    Run all tests
  -c    Clean build artifacts
  -r    Build release binaries
  -v    Show tool versions
  -h    Show this help

No flag = full build + run
```

---

## Combining Flags

Flags are **mutually exclusive** — use one at a time. The script exits after completing the flagged action.

```powershell
.\run.ps1 -i    # Step 1: install prerequisites
.\run.ps1 -d    # Step 2: start dev server
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Missing prerequisite (after `-i` was not run) |
| `2` | Build failed |
| `3` | Test failed |

---

## Cross-References

- [Overview](./00-overview.md)
- [Dev Setup](./04-dev-setup.md)
- [PowerShell Integration Guide](../../09-powershell-integration/04-integration-guide.md)

---

*Run Script Reference — created: 2026-04-13*
