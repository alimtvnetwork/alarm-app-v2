# PowerShell Integration for Project Runner

> **Spec Version:** 3.0.0  
> **Script Version:** 2.0.0  
> **Updated:** 2026-04-09  
> **Status:** Active  
> **Location:** `spec/09-powershell-integration/`  
> **Purpose:** Cross-platform runner for Go + React + Tauri projects with pnpm PnP, CleanCSS, and auto-dependency management

---

## Summary

This specification defines a **cross-platform, cross-project reusable** runner for building and running fullstack applications with Go backend and React frontend. Supports Tauri for desktop builds and CleanCSS for CSS minification. The system uses a JSON configuration file (`powershell.json`) to define project-specific paths and settings.

**Key Features:**
- **pnpm Plug'n'Play (PnP)** — Disk-efficient package management with shared store
- **Tauri Desktop Builds** — Build cross-platform desktop apps with `-t` flag, dev mode with `-d`
- **CleanCSS Post-Build** — Automatic CSS minification via `postBuildCommand`
- **Auto-Dependency Install** — Homebrew, jq, Go, Node.js, pnpm, Rust, Tauri CLI auto-installed if missing
- **Relative Path Resolution** — All paths relative to script location
- **Force Reinstall** — Clear caches and reset everything with `-Force` flag
- **Cross-Platform** — Windows (PowerShell) + macOS/Linux (Bash) with feature parity

**This spec is NOT project-specific** — it can be used by:
- Any Go + React fullstack project
- Tauri desktop applications
- WP Plugin Publish
- Spec Management Software

---

## User Stories

- As a developer, I want to run a single command to build and start my fullstack app
- As a developer, I want clean build options to reset everything when needed
- As a developer, I want the script to auto-install missing dependencies (Go, Node.js, pnpm)
- As a developer, I want to configure paths via JSON instead of editing the script
- As a developer, I want firewall rules configured automatically for development
- As a developer, I want pnpm PnP to save disk space across multiple projects

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PowerShell Runner Architecture v2.0                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│   │   run.ps1    │───▶│ powershell.  │───▶│   Project    │                  │
│   │   (Script)   │    │ json config  │    │   Folders    │                  │
│   └──────────────┘    └──────────────┘    └──────────────┘                  │
│          │                   │                    │                          │
│          │                   ▼                    ▼                          │
│          │           ┌──────────────┐    ┌──────────────┐                   │
│          │           │  pnpm Store  │    │  Go Backend  │                   │
│          │           │  (Shared)    │    │  + React FE  │                   │
│          │           └──────────────┘    └──────────────┘                   │
│          ▼                                                                   │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         Pipeline Steps                               │   │
│   │  1. Git Pull → 2. Prerequisites → 3. pnpm Install → 4. Build → 5. Run│  │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Pipeline Steps

| Step | Name | Description | Flags |
|------|------|-------------|-------|
| 1 | Git Pull | Sync latest changes | `-SkipPull` / `-p` to skip |
| 2 | Prerequisites | Check/install Go, Node.js, pnpm, Rust, Tauri | Auto-install via brew/winget |
| 3 | Install + Build | Install deps, build React (or Tauri) | `-Force` / `-f` clears & reinstalls |
| 4 | Copy | Copy dist to backend | Skipped in Tauri mode |
| 5 | Run | Start Go server | `-BuildOnly` / `-b` to skip |
| 6 | Post-Build | CleanCSS minification (if configured) | Via `postBuildCommand` |

---

## Package Management: pnpm with Plug'n'Play

### Why pnpm PnP?

| Feature | npm | pnpm PnP |
|---------|-----|----------|
| Disk Usage | Full copy per project | Shared store, hard links |
| Install Speed | Moderate | Fast (cached) |
| node_modules | Required (~500MB+) | Not required |
| Deterministic | package-lock.json | pnpm-lock.yaml |

### Configuration

```json
{
  "usePnp": true,
  "pnpmStorePath": "E:/.pnpm-store"
}
```

- `usePnp: true` - Enable pnpm with PnP mode
- `pnpmStorePath` - Custom store location (relative to rootDir or absolute)

### Store Path Options

| Option | Path | Description |
|--------|------|-------------|
| **Default (Recommended)** | `E:/.pnpm-store` | Shared drive for all projects |
| **Relative (Isolated)** | `.pnpm-store` | Store in project root |
| **User Home** | `~/.pnpm-store` | Global store in user home |

---

## Folder Structure

```
spec/09-powershell-integration/
├── 00-overview.md               ← This file
├── 01-configuration-schema.md   ← JSON config format with pnpm options
├── 02-template-vs-project-differences.md ← Template vs project differences
├── 03-script-reference.md       ← CLI flags and functions
├── 04-integration-guide.md      ← How to add to any project
├── 05-error-codes.md            ← Exit codes (9500-9599)
├── 06-firewall-rules.md         ← Windows firewall setup
├── 07-php-known-issues.md       ← PHP error management
├── 08-multi-site-deployment.md  ← Multi-site deployment
├── schemas/
│   └── powershell.schema.json   ← JSON Schema for validation
├── templates/
│   ├── run.ps1                  ← Main script template (Windows)
│   ├── run.sh                   ← Main script template (macOS/Linux)
│   └── powershell.json          ← Example config with pnpm
└── examples/
    └── server-client-project.json  ← Sample for server/client layout
```

---

## Quick Start

### Windows (PowerShell)

```powershell
.\run.ps1                # Full build and run
.\run.ps1 -Force         # Clean rebuild everything
.\run.ps1 -SkipBuild     # Just start backend
.\run.ps1 -BuildOnly     # Build only
.\run.ps1 -t             # Build Tauri desktop app
.\run.ps1 -td            # Tauri dev mode (hot-reload)
.\run.ps1 -SkipPull -Force  # Skip git pull + clean build
.\run.ps1 -OpenFirewall  # Configure firewall (requires Admin)
.\run.ps1 -Help          # Show help
```

### macOS/Linux (Bash)

```bash
./run.sh                 # Full build and run
./run.sh -f              # Clean rebuild everything
./run.sh -s              # Just start backend
./run.sh -b              # Build only
./run.sh -t              # Build Tauri desktop app
./run.sh -d              # Tauri dev mode (hot-reload)
./run.sh -p -f           # Skip git pull + clean build
./run.sh -r              # Full clean reinstall + build
./run.sh -h              # Show help
```

---

## Configuration File

Create `powershell.json` in project root:

```json
{
  "$schema": "./spec/powershell-integration/schemas/powershell.schema.json",
  "version": "1.1.0",
  "projectName": "WP Plugin Publish",
  "rootDir": ".",
  "backendDir": "backend",
  "frontendDir": ".",
  "distDir": "dist",
  "targetDir": "backend/frontend/dist",
  "dataDir": "backend/data",
  "ports": [8080],
  "prerequisites": {
    "go": true,
    "node": true,
    "pnpm": true
  },
  "usePnp": true,
  "pnpmStorePath": "E:/.pnpm-store",
  "cleanPaths": [
    "node_modules",
    "dist",
    ".vite",
    ".pnp.cjs",
    ".pnp.loader.mjs",
    "backend/data/*.db"
  ],
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install",
  "runCommand": "go run cmd/server/main.go",
  "configFile": "config.json",
  "configExampleFile": "config.example.json"
}
```

---

## Features

### Auto-Install Dependencies

- **Homebrew** (macOS): Auto-installed if missing (run.sh only)
- **jq** (macOS): Auto-installed via brew if missing (run.sh only)
- **Go**: Installed via `brew install go` (macOS) or `winget install GoLang.Go` (Windows)
- **Node.js**: Installed via `brew install node` (macOS) or `winget install OpenJS.NodeJS.LTS` (Windows)
- **pnpm**: Installed via `npm install -g pnpm`
- **Rust**: Installed via `rustup` (macOS/Linux) or `winget install Rustlang.Rustup` (Windows)
- **Tauri CLI**: Installed via `pnpm add -D @tauri-apps/cli`
- **Xcode CLT** (macOS): Detected and prompted if missing (required for Rust/Tauri compilation)
- **clean-css-cli**: Installed via `pnpm add -D clean-css-cli` (if `postBuildCommand` uses it)

### Force Clean Build

The `-Force` flag removes:
- `.pnp.cjs` and `.pnp.loader.mjs` files
- `node_modules/` directory (if exists)
- `dist/` directory
- `.vite/` cache
- SQLite databases (`*.db`, `*.db-shm`, `*.db-wal`)
- Prunes pnpm store cache

### Required .gitignore Entries

**IMPORTANT:** Add these entries to your `.gitignore` to exclude pnpm artifacts from version control:

```gitignore
# pnpm store (local cache)
.pnpm-store/

# pnpm PnP files (generated)
.pnp.cjs
.pnp.loader.mjs

# Build artifacts
dist/
.vite/
```

### pnpm Store Management

```powershell
# Check store status
pnpm store status

# Prune unused packages
pnpm store prune

# View store path
pnpm store path
```

### Firewall Configuration

The `-OpenFirewall` flag (requires Administrator):
- Creates inbound rules for configured ports
- Sets profile to Private and Domain
- Names rules consistently for easy management

---

## Path Resolution

All paths are resolved relative to the script location (`$MyInvocation.MyCommand.Path`).

```
project-root/           ← Working directory (where run.ps1 lives)
├── run.ps1             ← Script location (rootDir base)
├── powershell.json     ← Config file
├── package.json        ← Frontend (frontendDir: ".")
├── .pnp.cjs            ← PnP resolution (generated by pnpm)
├── .pnpm-store/        ← pnpm store (pnpmStorePath)
├── dist/               ← Build output (distDir: "dist")
└── backend/            ← Backend (backendDir: "backend")
    ├── cmd/server/main.go
    ├── config.json
    ├── config.example.json
    ├── frontend/
    │   └── dist/       ← Target (targetDir)
    └── data/           ← Data (dataDir)
        └── *.db
```

---

## Using in Projects

### For New Projects

1. Copy `templates/run.ps1` to project root
2. Create `powershell.json` with project-specific paths
3. Set `usePnp: true` and configure `pnpmStorePath`
4. Run `.\run.ps1 -Help` to verify

### Multi-Project Setup (Shared Store)

For multiple projects sharing a pnpm store:

```json
{
  "pnpmStorePath": "E:/.pnpm-store"
}
```

All projects pointing to the same store share cached packages.

---

## AI Handoff Instructions

To integrate this PowerShell runner into any project, share:

```
spec/powershell-integration/
```

Tell the AI:
> "Follow the spec at `spec/powershell-integration/` to add the PowerShell build runner. Create a `powershell.json` config for my project structure. Enable pnpm PnP for disk-efficient package management."

---

## Cross-References

| Document | Description |
|----------|-------------|
| [Configuration Schema](./01-configuration-schema.md) | JSON config format with pnpm options |
| [Script Reference](./02-script-reference.md) | CLI flags and functions |
| [Integration Guide](./03-integration-guide.md) | Step-by-step setup |
| [Error Codes](./04-error-codes.md) | Exit codes 9500-9599 |
| [Firewall Rules](./05-firewall-rules.md) | Windows firewall setup |
| **[Upload Scripts Spec](../11-upload-scripts/readme.md)** | WordPress plugin upload scripts (V1, V2, V3) |
| [Upload V1](../11-upload-scripts/01-upload-plugin-v1.md) | Single-file upload via Invoke-RestMethod |
| [Upload V2](../11-upload-scripts/02-upload-plugin-v2.md) | Envelope-aware upload with unwrapping |
| [Upload V3](../11-upload-scripts/03-upload-plugin-v3.md) | Parallel multi-plugin deployment via Start-Job |
| [Upload Custom](../11-upload-scripts/04-upload-plugin-custom.md) | Custom path deployments via `run.ps1 -u -pp` |
| [Upload Config](../11-upload-scripts/05-configuration.md) | Authentication, headers, and fallback config |

---

*This spec enables consistent, reproducible builds across all fullstack projects with optimized disk usage via pnpm PnP.*
