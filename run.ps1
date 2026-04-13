# Alarm App — Build & Run Script (PowerShell)
# Version: 1.0.0
# Frontend-only React/Vite project — no Go backend
# Configure via powershell.json
#
# USAGE:
#   .\run.ps1 -h    Show help
#   .\run.ps1 -i    Install all dependencies
#   .\run.ps1       Build and start dev server
#   .\run.ps1 -b    Build only (production)
#   .\run.ps1 -f    Force clean rebuild
#   .\run.ps1 -r    Clean reinstall + build (-f + -i)
#
# FLAGS:
#   -h   Show help
#   -b   Build only (production), don't start dev server
#   -s   Skip build, just start dev server
#   -p   Skip git pull
#   -f   Force clean (remove node_modules, dist, .vite)
#   -i   Install/update all dependencies
#   -r   Rebuild (combines -f + -i)
#   -t   Build Tauri desktop app
#   -td  Run Tauri dev mode
#   -v   Verbose output

param(
    [Alias('b')][switch]$buildonly,
    [Alias('s')][switch]$skipbuild,
    [Alias('p')][switch]$skippull,
    [Alias('f')][switch]$force,
    [Alias('i')][switch]$install,
    [Alias('r')][switch]$rebuild,
    [Alias('t')][switch]$tauri,
    [Alias('td')][switch]$tauridev,
    [Alias('h')][switch]$help,
    [Alias('v')][switch]$verbose
)

if ($rebuild) {
    $force = $true
    $install = $true
}

$ErrorActionPreference = "Stop"

# ============================================================================
# PATH RESOLUTION
# ============================================================================
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ([string]::IsNullOrWhiteSpace($ScriptDir)) {
    $ScriptDir = Get-Location
}

# ============================================================================
# CONFIGURATION LOADING
# ============================================================================
$ConfigPath = Join-Path $ScriptDir "powershell.json"

if (-not (Test-Path $ConfigPath)) {
    Write-Host "ERROR: powershell.json not found at: $ConfigPath" -ForegroundColor Red
    exit 1
}

try {
    $Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
} catch {
    Write-Host "ERROR: Failed to parse powershell.json: $_" -ForegroundColor Red
    exit 1
}

function Resolve-RelativePath($Path) {
    if ([string]::IsNullOrWhiteSpace($Path) -or $Path -eq ".") {
        return $ScriptDir
    }
    if ($Path -match '^[A-Za-z]:' -or $Path -match '^\\\\') {
        return $Path -replace '/', '\'
    }
    return Join-Path $ScriptDir $Path
}

$ProjectName = if ($Config.projectName) { $Config.projectName } else { "Project" }
$RootDir = Resolve-RelativePath $Config.rootDir
$FrontendDir = Resolve-RelativePath $Config.frontendDir
$DistDir = if ($Config.distDir) { $Config.distDir } else { "dist" }
$Ports = if ($Config.ports) { $Config.ports } else { @(8080) }
$BuildCommand = if ($Config.buildCommand) { $Config.buildCommand } else { "npm run build" }
$InstallCommand = if ($Config.installCommand) { $Config.installCommand } else { "npm install" }
$RunCommand = if ($Config.runCommand) { $Config.runCommand } else { "npm run dev" }
$CleanPaths = if ($Config.cleanPaths) { $Config.cleanPaths } else { @("node_modules", "dist", ".vite") }
$ConfigFile = if ($Config.configFile) { $Config.configFile } else { ".env" }
$ConfigExampleFile = if ($Config.configExampleFile) { $Config.configExampleFile } else { ".env.example" }
$RequiredModules = if ($Config.requiredModules) { $Config.requiredModules } else { @() }
$PostBuildCommand = if ($Config.postBuildCommand) { $Config.postBuildCommand } else { "" }
$TauriBuildCommand = if ($Config.tauriBuildCommand) { $Config.tauriBuildCommand } else { "npm run tauri build" }
$TauriDevCommand = if ($Config.tauriDevCommand) { $Config.tauriDevCommand } else { "npm run tauri dev" }

$CheckNode = if ($null -ne $Config.prerequisites -and $null -ne $Config.prerequisites.node) { $Config.prerequisites.node } else { $true }
$CheckRust = if ($null -ne $Config.prerequisites -and $null -ne $Config.prerequisites.rust) { $Config.prerequisites.rust } else { $false }
$CheckTauri = if ($null -ne $Config.prerequisites -and $null -ne $Config.prerequisites.tauri) { $Config.prerequisites.tauri } else { $false }

if ($tauri -or $tauridev) {
    $CheckRust = $true
    $CheckTauri = $true
}

$TotalStopwatch = [System.Diagnostics.Stopwatch]::StartNew()

# ============================================================================
# UTILITY
# ============================================================================
function Format-ElapsedTime($Stopwatch) {
    $elapsed = $Stopwatch.Elapsed
    if ($elapsed.TotalMinutes -ge 1) {
        return "{0:N0}m {1:N1}s" -f [Math]::Floor($elapsed.TotalMinutes), $elapsed.Seconds
    } else {
        return "{0:N1}s" -f $elapsed.TotalSeconds
    }
}

function Test-Command($Command) {
    $oldPref = $ErrorActionPreference
    $ErrorActionPreference = 'SilentlyContinue'
    try { return $null -ne (Get-Command $Command -ErrorAction SilentlyContinue) }
    catch { return $false }
    finally { $ErrorActionPreference = $oldPref }
}

function Refresh-Path {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("Path", "User")
}

# ============================================================================
# AUTO-INSTALL FUNCTIONS
# ============================================================================
function Install-NodeJS {
    Write-Host "  Node.js not found. Attempting auto-install..." -ForegroundColor Yellow
    if (Test-Command "winget") {
        winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
        if ($LASTEXITCODE -ne 0) { throw "winget install failed" }
        Refresh-Path
        Write-Host "  ✓ Node.js installed" -ForegroundColor Green
    } elseif (Test-Command "brew") {
        brew install node
        Write-Host "  ✓ Node.js installed via Homebrew" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Cannot auto-install Node.js. Install manually: https://nodejs.org/" -ForegroundColor Red
        exit 1
    }
}

function Install-Rust {
    Write-Host "  Rust not found. Attempting auto-install..." -ForegroundColor Yellow
    if (Test-Command "winget") {
        winget install Rustlang.Rustup --accept-package-agreements --accept-source-agreements
        if ($LASTEXITCODE -ne 0) { throw "winget install failed" }
        Refresh-Path
        rustup default stable 2>&1 | Out-Host
        Write-Host "  ✓ Rust installed" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Cannot auto-install Rust. Install manually: https://rustup.rs/" -ForegroundColor Red
        exit 1
    }
}

function Install-TauriCli {
    Write-Host "  Installing Tauri CLI..." -ForegroundColor Yellow
    npm install -D @tauri-apps/cli
    Write-Host "  ✓ Tauri CLI installed" -ForegroundColor Green
}

# ============================================================================
# HELP
# ============================================================================
if ($help) {
    Write-Host ""
    Write-Host "$ProjectName - Build & Run Script" -ForegroundColor Cyan
    Write-Host ("=" * ($ProjectName.Length + 22)) -ForegroundColor Cyan
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  .\run.ps1 [flags]"
    Write-Host ""
    Write-Host "FLAGS:" -ForegroundColor Yellow
    Write-Host "  -h   Show this help message"
    Write-Host "  -i   Install/update all dependencies"
    Write-Host "  -b   Build only (production), don't start dev server"
    Write-Host "  -s   Skip build, just start dev server"
    Write-Host "  -f   Force clean (remove node_modules, dist, caches)"
    Write-Host "  -r   Clean reinstall + build (-f + -i)"
    Write-Host "  -p   Skip git pull"
    Write-Host "  -t   Build Tauri desktop app"
    Write-Host "  -td  Run Tauri dev mode (hot-reload)"
    Write-Host "  -v   Verbose debug output"
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor Yellow
    Write-Host "  .\run.ps1 -i           # Install all dependencies"
    Write-Host "  .\run.ps1              # Build + start dev server"
    Write-Host "  .\run.ps1 -b           # Production build only"
    Write-Host "  .\run.ps1 -r           # Clean reinstall + build"
    Write-Host "  .\run.ps1 -f           # Force clean rebuild"
    Write-Host "  .\run.ps1 -t           # Build Tauri desktop app"
    Write-Host "  .\run.ps1 -td          # Tauri dev mode"
    Write-Host ""
    Write-Host "CONFIGURATION:" -ForegroundColor Yellow
    Write-Host "  Config: $ConfigPath"
    Write-Host "  Project: $ProjectName"
    Write-Host "  Frontend: $FrontendDir"
    Write-Host ""
    exit 0
}

# ============================================================================
# BANNER
# ============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  $ProjectName - Build & Run" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($verbose) {
    Write-Host "Configuration:" -ForegroundColor Gray
    Write-Host "  Script Dir: $ScriptDir" -ForegroundColor Gray
    Write-Host "  Frontend Dir: $FrontendDir" -ForegroundColor Gray
    if ($tauri) { Write-Host "  Mode: Tauri Desktop Build" -ForegroundColor Gray }
    if ($tauridev) { Write-Host "  Mode: Tauri Dev" -ForegroundColor Gray }
    Write-Host ""
}

# ============================================================================
# STEP 1: GIT PULL
# ============================================================================
$stepWatch = [System.Diagnostics.Stopwatch]::StartNew()
if (-not $skippull) {
    Write-Host "[1/5] Pulling latest changes..." -ForegroundColor Yellow
    Push-Location $RootDir
    try {
        if (Test-Path ".git") {
            git pull 2>&1 | Out-Host
            if ($LASTEXITCODE -ne 0) {
                Write-Host "  WARNING: git pull failed, continuing..." -ForegroundColor Yellow
            } else {
                Write-Host "  ✓ Git pull complete" -ForegroundColor Green
            }
        } else {
            Write-Host "  Skipping (not a git repository)" -ForegroundColor Gray
        }
    }
    finally { Pop-Location }
} else {
    Write-Host "[1/5] Skipping git pull (-p)" -ForegroundColor Gray
}
$stepWatch.Stop()
Write-Host "  ⏱ $(Format-ElapsedTime $stepWatch)" -ForegroundColor DarkGray
Write-Host ""

# ============================================================================
# STEP 2: PREREQUISITES
# ============================================================================
$stepWatch = [System.Diagnostics.Stopwatch]::StartNew()
Write-Host "[2/5] Checking prerequisites..." -ForegroundColor Yellow

if ($CheckNode) {
    if (-not (Test-Command "node")) { Install-NodeJS }
    $nodeVersion = node --version 2>&1
    Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
    $npmVersion = npm --version 2>&1
    Write-Host "  ✓ npm: $npmVersion" -ForegroundColor Green
}

if ($CheckRust) {
    if (-not (Test-Command "rustc")) { Install-Rust }
    $rustVersion = rustc --version 2>&1
    Write-Host "  ✓ Rust: $rustVersion" -ForegroundColor Green
}

if ($CheckTauri) {
    $tauriFound = $false
    try {
        $tauriVer = npx tauri --version 2>&1
        if ($LASTEXITCODE -eq 0) { $tauriFound = $true }
    } catch {}
    if (-not $tauriFound) {
        Install-TauriCli
        $tauriVer = "(just installed)"
    }
    Write-Host "  ✓ Tauri CLI: $tauriVer" -ForegroundColor Green
}

$stepWatch.Stop()
Write-Host "  ⏱ $(Format-ElapsedTime $stepWatch)" -ForegroundColor DarkGray
Write-Host ""

# ============================================================================
# INSTALL MODE (-i): Install all npm dependencies
# ============================================================================
if ($install) {
    $stepWatch = [System.Diagnostics.Stopwatch]::StartNew()
    Write-Host "[INSTALL] Installing dependencies..." -ForegroundColor Cyan
    Write-Host ""

    if ($rebuild) {
        Write-Host "  Rebuild mode: deferring until after force-clean..." -ForegroundColor Yellow
    } else {
        Push-Location $FrontendDir
        try {
            Write-Host "  Running: $InstallCommand" -ForegroundColor Gray
            Invoke-Expression $InstallCommand
            if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
            Write-Host "  ✓ Dependencies installed" -ForegroundColor Green
        }
        finally { Pop-Location }

        $stepWatch.Stop()
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  Dependencies installed!" -ForegroundColor Cyan
        Write-Host "  Time: $(Format-ElapsedTime $stepWatch)" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        exit 0
    }
}

# ============================================================================
# TAURI DEV MODE (-td)
# ============================================================================
if ($tauridev) {
    Write-Host "[3/5] Starting Tauri dev mode..." -ForegroundColor Yellow

    Push-Location $FrontendDir
    try {
        if (-not (Test-Path "node_modules")) {
            Write-Host "  Installing dependencies first..." -ForegroundColor Gray
            Invoke-Expression $InstallCommand
        }

        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  $ProjectName — Tauri Dev Mode" -ForegroundColor Cyan
        Write-Host "  Press Ctrl+C to stop" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""

        Invoke-Expression $TauriDevCommand
    }
    finally { Pop-Location }
    exit 0
}

# ============================================================================
# STEP 3: BUILD
# ============================================================================
$stepWatch = [System.Diagnostics.Stopwatch]::StartNew()
if (-not $skipbuild) {
    if ($tauri) {
        Write-Host "[3/5] Building Tauri desktop app..." -ForegroundColor Yellow
    } else {
        Write-Host "[3/5] Building frontend..." -ForegroundColor Yellow
    }

    Push-Location $FrontendDir
    try {
        # Force clean
        if ($force) {
            Write-Host "  FORCE MODE: Cleaning..." -ForegroundColor Magenta
            foreach ($cleanPath in $CleanPaths) {
                $resolved = Resolve-RelativePath $cleanPath
                if (Test-Path $resolved) {
                    Write-Host "  Removing: $cleanPath..." -ForegroundColor Gray
                    Remove-Item -Recurse -Force $resolved -ErrorAction SilentlyContinue
                }
            }
            Write-Host "  ✓ Clean complete" -ForegroundColor Magenta
        }

        # Auto-install if node_modules missing
        if (-not (Test-Path "node_modules") -or $force) {
            Write-Host "  Installing dependencies..." -ForegroundColor Gray
            Invoke-Expression $InstallCommand
            if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
        }

        # Check required modules
        foreach ($m in $RequiredModules) {
            if (-not (Test-Path (Join-Path "node_modules" $m))) {
                Write-Host "  Missing module: $m — running install..." -ForegroundColor Yellow
                Invoke-Expression $InstallCommand
                break
            }
        }

        # Build
        if ($tauri) {
            Write-Host "  Running: $TauriBuildCommand" -ForegroundColor Gray
            Invoke-Expression $TauriBuildCommand
            if ($LASTEXITCODE -ne 0) { throw "Tauri build failed" }
            Write-Host "  ✓ Tauri desktop app built" -ForegroundColor Green
        } else {
            Write-Host "  Running: $BuildCommand" -ForegroundColor Gray
            Invoke-Expression $BuildCommand
            if ($LASTEXITCODE -ne 0) { throw "Build failed" }
            Write-Host "  ✓ Frontend built successfully" -ForegroundColor Green

            if ($PostBuildCommand) {
                Write-Host "  Running post-build: $PostBuildCommand" -ForegroundColor Gray
                Invoke-Expression $PostBuildCommand
            }
        }
    }
    finally { Pop-Location }

    $stepWatch.Stop()
    Write-Host "  ⏱ $(Format-ElapsedTime $stepWatch)" -ForegroundColor DarkGray
    Write-Host ""
} else {
    Write-Host "[3/5] Skipping build (-s)" -ForegroundColor Gray
    Write-Host ""
}

# BUILD ONLY EXIT
if ($buildonly) {
    $TotalStopwatch.Stop()
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Build complete! (-b mode)" -ForegroundColor Cyan
    Write-Host "  Output: $FrontendDir\$DistDir" -ForegroundColor Cyan
    Write-Host "  Total time: $(Format-ElapsedTime $TotalStopwatch)" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    exit 0
}

# Tauri build exits here
if ($tauri) {
    $TotalStopwatch.Stop()
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Tauri build complete!" -ForegroundColor Cyan
    Write-Host "  Total time: $(Format-ElapsedTime $TotalStopwatch)" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    exit 0
}

# ============================================================================
# STEP 4: SETUP CONFIG
# ============================================================================
Push-Location $FrontendDir
try {
    $envFile = Join-Path $FrontendDir $ConfigFile
    $envExample = Join-Path $FrontendDir $ConfigExampleFile
    if (-not (Test-Path $envFile)) {
        if (Test-Path $envExample) {
            Write-Host "[4/5] Creating $ConfigFile from $ConfigExampleFile..." -ForegroundColor Yellow
            Copy-Item $envExample $envFile
            Write-Host "  ✓ $ConfigFile created" -ForegroundColor Green
        }
    }
}
finally { Pop-Location }

# ============================================================================
# STEP 5: START DEV SERVER
# ============================================================================
$TotalStopwatch.Stop()
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  $ProjectName starting..." -ForegroundColor Cyan
Write-Host "  Open: http://localhost:$($Ports[0])" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop" -ForegroundColor Cyan
Write-Host "  Setup time: $(Format-ElapsedTime $TotalStopwatch)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Push-Location $FrontendDir
try {
    Invoke-Expression $RunCommand
}
finally { Pop-Location }
