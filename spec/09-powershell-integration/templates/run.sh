#!/usr/bin/env bash
# ============================================================================
# Build & Run Script — macOS/Linux Template
# Version: 1.3.0
# Generic template for Go backend + React frontend projects with pnpm support
# Configure via powershell.json — see spec/09-powershell-integration/01-configuration-schema.md
#
# USAGE:
#   Copy this file and powershell.json to your project root.
#   Edit powershell.json with your project-specific paths and settings.
#   Run: ./run.sh -h for help.
#
# FLAGS:
#   -h   Show help
#   -b   Build frontend only (don't start backend)
#   -s   Skip frontend build (start backend only)
#   -p   Skip git pull
#   -f   Force clean build (remove caches, deps, databases)
#   -i   Install/update all dependencies (frontend + backend)
#   -r   Rebuild (combines -f + -i for complete clean reinstall)
#   -v   Verbose debug output
#
# PIPELINE:
#   1. Git Pull → 2. Prerequisites → 3. pnpm Install → 4. Build → 5. Copy → 6. Run
#
# REQUIRES: jq (for JSON config parsing), bash 4+ or zsh
#
# See spec/09-powershell-integration/ for full documentation.
# ============================================================================

set -euo pipefail

# ============================================================================
# FLAGS
# ============================================================================
FLAG_BUILDONLY=false
FLAG_SKIPBUILD=false
FLAG_SKIPPULL=false
FLAG_FORCE=false
FLAG_INSTALL=false
FLAG_REBUILD=false
FLAG_HELP=false
FLAG_VERBOSE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)      FLAG_HELP=true; shift ;;
    -b|--buildonly)  FLAG_BUILDONLY=true; shift ;;
    -s|--skipbuild)  FLAG_SKIPBUILD=true; shift ;;
    -p|--skippull)   FLAG_SKIPPULL=true; shift ;;
    -f|--force)      FLAG_FORCE=true; shift ;;
    -i|--install)    FLAG_INSTALL=true; shift ;;
    -r|--rebuild)    FLAG_REBUILD=true; shift ;;
    -v|--verbose)    FLAG_VERBOSE=true; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# -rebuild = -force + -install
if $FLAG_REBUILD; then
  FLAG_FORCE=true
  FLAG_INSTALL=true
fi

# ============================================================================
# COLORS & OUTPUT
# ============================================================================
C_RESET="\033[0m"
C_CYAN="\033[36m"
C_GREEN="\033[32m"
C_YELLOW="\033[33m"
C_RED="\033[31m"
C_GRAY="\033[90m"
C_MAGENTA="\033[35m"

print_header()  { echo -e "${C_CYAN}$1${C_RESET}"; }
print_success() { echo -e "  ${C_GREEN}✓ $1${C_RESET}"; }
print_warn()    { echo -e "  ${C_YELLOW}WARNING: $1${C_RESET}"; }
print_error()   { echo -e "  ${C_RED}ERROR: $1${C_RESET}"; }
print_gray()    { echo -e "  ${C_GRAY}$1${C_RESET}"; }
print_step()    { echo -e "${C_YELLOW}$1${C_RESET}"; }

# ============================================================================
# TIMING
# ============================================================================
TOTAL_START=$(date +%s)

format_elapsed() {
  local start=$1
  local end
  end=$(date +%s)
  local diff=$(( end - start ))
  if (( diff >= 60 )); then
    local mins=$(( diff / 60 ))
    local secs=$(( diff % 60 ))
    echo "${mins}m ${secs}s"
  else
    echo "${diff}s"
  fi
}

# ============================================================================
# PATH RESOLUTION
# ============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

resolve_path() {
  local p="$1"
  if [[ -z "$p" || "$p" == "." ]]; then
    echo "$SCRIPT_DIR"
  elif [[ "$p" == /* ]]; then
    echo "$p"
  else
    echo "$SCRIPT_DIR/$p"
  fi
}

# ============================================================================
# CONFIGURATION LOADING (requires jq)
# ============================================================================
if ! command -v jq &>/dev/null; then
  echo -e "${C_RED}ERROR: jq is required for JSON config parsing.${C_RESET}"
  echo "  Install: brew install jq"
  exit 1
fi

CONFIG_PATH="$SCRIPT_DIR/powershell.json"

if [[ ! -f "$CONFIG_PATH" ]]; then
  print_error "powershell.json not found at: $CONFIG_PATH"
  echo "  Create a powershell.json configuration file in the script directory."
  exit 1
fi

# Read config values with defaults
cfg() { jq -r "$1 // \"$2\"" "$CONFIG_PATH"; }
cfg_bool() { jq -r "$1 // $2" "$CONFIG_PATH"; }
cfg_array() { jq -r "$1 // [] | .[]" "$CONFIG_PATH"; }

PROJECT_NAME=$(cfg '.projectName' 'Project')
ROOT_DIR=$(resolve_path "$(cfg '.rootDir' '.')")
BACKEND_DIR=$(resolve_path "$(cfg '.backendDir' 'backend')")
FRONTEND_DIR=$(resolve_path "$(cfg '.frontendDir' '.')")
DIST_DIR=$(cfg '.distDir' 'dist')
TARGET_DIR_RAW=$(cfg '.targetDir' '')
TARGET_DIR=""
[[ -n "$TARGET_DIR_RAW" ]] && TARGET_DIR=$(resolve_path "$TARGET_DIR_RAW")
DATA_DIR_RAW=$(cfg '.dataDir' '')
DATA_DIR=""
[[ -n "$DATA_DIR_RAW" ]] && DATA_DIR=$(resolve_path "$DATA_DIR_RAW")
PORTS=$(jq -r '.ports // [8080] | .[0]' "$CONFIG_PATH")
BUILD_CMD=$(cfg '.buildCommand' 'pnpm run build')
INSTALL_CMD=$(cfg '.installCommand' 'pnpm install')
RUN_CMD=$(cfg '.runCommand' 'go run cmd/server/main.go')
CONFIG_FILE=$(cfg '.configFile' 'config.json')
CONFIG_EXAMPLE=$(cfg '.configExampleFile' 'config.example.json')
PNPM_STORE_RAW=$(cfg '.pnpmStorePath' '')
PNPM_STORE=""
[[ -n "$PNPM_STORE_RAW" ]] && PNPM_STORE=$(resolve_path "$PNPM_STORE_RAW")
USE_PNP=$(cfg_bool '.usePnp' 'true')

CHECK_GO=$(cfg_bool '.prerequisites.go' 'true')
CHECK_NODE=$(cfg_bool '.prerequisites.node' 'true')
CHECK_PNPM=$(cfg_bool '.prerequisites.pnpm' 'true')

# ============================================================================
# HELP
# ============================================================================
if $FLAG_HELP; then
  echo ""
  print_header "$PROJECT_NAME - Build & Run Script (macOS/Linux)"
  echo ""
  echo -e "${C_YELLOW}USAGE:${C_RESET}"
  echo "  ./run.sh [flags]"
  echo ""
  echo -e "${C_YELLOW}FLAGS:${C_RESET}"
  echo "  -h,  --help       Show this help message and exit"
  echo "  -b,  --buildonly   Build frontend only, don't start the backend server"
  echo "  -s,  --skipbuild   Skip frontend build, only run the backend server"
  echo "  -p,  --skippull    Skip git pull step"
  echo "  -f,  --force       Clean build: remove caches, dependencies, databases"
  echo "  -i,  --install     Install/update dependencies (frontend + backend)"
  echo "  -r,  --rebuild     Complete clean reinstall (combines -f + -i)"
  echo "  -v,  --verbose     Show detailed debug output"
  echo ""
  echo -e "${C_YELLOW}EXAMPLES:${C_RESET}"
  echo "  ./run.sh              # Full build and run"
  echo "  ./run.sh -i           # Install/update all dependencies"
  echo "  ./run.sh -r           # Complete clean reinstall and build"
  echo "  ./run.sh -f           # Clean rebuild everything"
  echo "  ./run.sh -s           # Just start the backend (skip build)"
  echo "  ./run.sh -b           # Build only, don't start server"
  echo "  ./run.sh -p -f        # Clean build without git pull"
  echo ""
  echo -e "${C_YELLOW}CONFIGURATION:${C_RESET}"
  echo "  Config file: $CONFIG_PATH"
  echo "  Project:     $PROJECT_NAME"
  echo "  Backend:     $BACKEND_DIR"
  echo "  Frontend:    $FRONTEND_DIR"
  [[ -n "$PNPM_STORE" ]] && echo "  pnpm Store:  $PNPM_STORE"
  echo ""
  exit 0
fi

# ============================================================================
# BANNER
# ============================================================================
echo ""
print_header "========================================"
print_header "  $PROJECT_NAME - Build & Run Script"
print_header "========================================"
echo ""

if $FLAG_VERBOSE; then
  print_gray "Configuration:"
  print_gray "  Script Dir:  $SCRIPT_DIR"
  print_gray "  Root Dir:    $ROOT_DIR"
  print_gray "  Backend Dir: $BACKEND_DIR"
  print_gray "  Frontend Dir: $FRONTEND_DIR"
  [[ -n "$PNPM_STORE" ]] && print_gray "  pnpm Store:  $PNPM_STORE"
  echo ""
fi

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================
command_exists() { command -v "$1" &>/dev/null; }

get_pnpm_major() {
  local ver
  ver=$(pnpm --version 2>/dev/null || echo "0.0.0")
  echo "${ver%%.*}"
}

get_node_major() {
  local ver
  ver=$(node --version 2>/dev/null || echo "v0.0.0")
  ver="${ver#v}"
  echo "${ver%%.*}"
}

# ============================================================================
# INSTALLATION FUNCTIONS (macOS: brew; Linux: package manager)
# ============================================================================
ensure_brew() {
  if ! command_exists brew; then
    print_error "Homebrew not found. Install from https://brew.sh"
    exit 1
  fi
}

install_go() {
  echo -e "  ${C_YELLOW}Attempting to install Go...${C_RESET}"
  if [[ "$(uname)" == "Darwin" ]]; then
    ensure_brew
    brew install go
  else
    print_error "Auto-install not supported on this OS. Install Go manually: https://go.dev/dl/"
    exit 1
  fi
  print_success "Go installed successfully"
}

install_node() {
  echo -e "  ${C_YELLOW}Attempting to install Node.js...${C_RESET}"
  if [[ "$(uname)" == "Darwin" ]]; then
    ensure_brew
    brew install node
  else
    print_error "Auto-install not supported on this OS. Install Node.js manually: https://nodejs.org/"
    exit 1
  fi
  print_success "Node.js installed successfully"
}

install_pnpm() {
  echo -e "  ${C_YELLOW}Installing pnpm globally...${C_RESET}"
  npm install -g pnpm
  print_success "pnpm installed successfully"
}

# ============================================================================
# PNPM STORE CONFIGURATION
# ============================================================================
EFFECTIVE_NODE_LINKER="isolated"
EFFECTIVE_INSTALL_CMD="$INSTALL_CMD"
PNPM_MAJOR=0
NODE_MAJOR=0

configure_pnpm_store() {
  local node_linker="isolated"

  if [[ "$USE_PNP" == "true" && $NODE_MAJOR -lt 24 ]]; then
    node_linker="pnp"
  fi

  EFFECTIVE_NODE_LINKER="$node_linker"

  if [[ "$USE_PNP" == "true" && "$node_linker" != "pnp" ]]; then
    print_warn "Falling back to node-linker=isolated (Node v$NODE_MAJOR)"
  fi

  if [[ -n "$PNPM_STORE" ]]; then
    print_gray "Configuring pnpm store: $PNPM_STORE"
    mkdir -p "$PNPM_STORE"
    pnpm config set --location=project store-dir "$PNPM_STORE" 2>/dev/null || true
  fi

  pnpm config set --location=project virtual-store-dir .pnpm 2>/dev/null || true
  pnpm config set --location=project node-linker "$node_linker" 2>/dev/null || true

  if [[ "$node_linker" == "pnp" ]]; then
    pnpm config set --location=project symlink false 2>/dev/null || true
  else
    pnpm config set --location=project symlink true 2>/dev/null || true
  fi

  pnpm config set --location=project package-import-method auto 2>/dev/null || true
}

get_effective_install_cmd() {
  local cmd="$INSTALL_CMD"
  if (( PNPM_MAJOR >= 10 )) && [[ "$cmd" == *"pnpm install"* ]] && [[ "$cmd" != *"dangerously-allow-all-builds"* ]]; then
    cmd="$cmd --dangerously-allow-all-builds"
  fi
  echo "$cmd"
}

# ============================================================================
# ENVIRONMENT VARIABLES FROM CONFIG
# ============================================================================
while IFS='=' read -r key value; do
  [[ -n "$key" ]] && export "$key"="$value"
done < <(jq -r '.env // {} | to_entries[] | "\(.key)=\(.value)"' "$CONFIG_PATH" 2>/dev/null)

# ============================================================================
# STEP 1: GIT PULL
# ============================================================================
STEP_START=$(date +%s)
if ! $FLAG_SKIPPULL; then
  print_step "[1/5] Pulling latest changes from git..."
  pushd "$ROOT_DIR" > /dev/null
  if [[ -d ".git" ]]; then
    if git pull 2>&1; then
      print_success "Git pull complete"
    else
      print_warn "git pull failed, continuing..."
    fi
  else
    print_gray "Skipping (not a git repository)"
  fi
  popd > /dev/null
else
  print_step "[1/5] Skipping git pull (-p)"
fi
print_gray "⏱ $(format_elapsed $STEP_START)"
echo ""

# ============================================================================
# STEP 2: PREREQUISITES
# ============================================================================
STEP_START=$(date +%s)
print_step "[2/5] Checking prerequisites..."

if [[ "$CHECK_GO" == "true" ]]; then
  if ! command_exists go; then install_go; fi
  GO_VER=$(go version 2>&1 | sed 's/go version //')
  print_success "Go found: $GO_VER"
fi

if [[ "$CHECK_NODE" == "true" ]]; then
  if ! command_exists node; then install_node; fi
  NODE_VER=$(node --version 2>&1)
  print_success "Node.js found: $NODE_VER"
  NODE_MAJOR=$(get_node_major)
fi

if [[ "$CHECK_PNPM" == "true" ]]; then
  if ! command_exists pnpm; then install_pnpm; fi
  PNPM_VER=$(pnpm --version 2>&1)
  print_success "pnpm found: $PNPM_VER"
  PNPM_MAJOR=$(get_pnpm_major)
  EFFECTIVE_INSTALL_CMD=$(get_effective_install_cmd)
  configure_pnpm_store
fi

print_gray "⏱ $(format_elapsed $STEP_START)"
echo ""

# ============================================================================
# INSTALL MODE (-i): Install dependencies for both frontend and backend
# ============================================================================
if $FLAG_INSTALL; then
  STEP_START=$(date +%s)
  print_header "[INSTALL] Installing/updating all dependencies..."
  echo ""

  if $FLAG_REBUILD; then
    echo -e "  ${C_YELLOW}[Frontend] Rebuild mode: deferring until after force-clean...${C_RESET}"
  else
    echo -e "  ${C_YELLOW}[Frontend] Running pnpm install...${C_RESET}"
    pushd "$FRONTEND_DIR" > /dev/null
    eval "$EFFECTIVE_INSTALL_CMD"
    print_success "Frontend dependencies installed"
    popd > /dev/null
  fi

  echo ""
  echo -e "  ${C_YELLOW}[Backend] Running go mod tidy && go mod download...${C_RESET}"
  pushd "$BACKEND_DIR" > /dev/null
  go mod tidy
  go mod download
  print_success "Backend dependencies installed"
  popd > /dev/null

  if ! $FLAG_REBUILD; then
    echo ""
    print_header "========================================"
    print_header "  Dependencies installed!"
    print_header "  Time: $(format_elapsed $STEP_START)"
    print_header "========================================"
    exit 0
  fi
fi

# ============================================================================
# STEP 3: FRONTEND BUILD
# ============================================================================
STEP_START=$(date +%s)
if ! $FLAG_SKIPBUILD; then
  print_step "[3/5] Building React frontend..."

  pushd "$FRONTEND_DIR" > /dev/null

  # Force clean
  if $FLAG_FORCE; then
    echo -e "  ${C_MAGENTA}FORCE MODE: Cleaning build artifacts...${C_RESET}"

    # Clean paths from config
    while IFS= read -r clean_path; do
      [[ -z "$clean_path" ]] && continue
      resolved=$(resolve_path "$clean_path")
      if [[ "$clean_path" == *"*"* ]]; then
        # Wildcard: use find
        local dir_part="${resolved%/*}"
        local pattern="${resolved##*/}"
        if [[ -d "$dir_part" ]]; then
          find "$dir_part" -maxdepth 1 -name "$pattern" -exec rm -rf {} + 2>/dev/null || true
          print_gray "Removed: $clean_path (wildcard)"
        fi
      elif [[ -e "$resolved" ]]; then
        rm -rf "$resolved"
        print_gray "Removed: $clean_path"
      fi
    done < <(cfg_array '.cleanPaths')

    # Always clean pnpm artifacts
    for extra in node_modules .pnpm .pnp.cjs .pnp.loader.mjs .pnp.data.json; do
      if [[ -e "$extra" ]]; then
        print_gray "Removing: $extra..."
        rm -rf "$extra"
      fi
    done

    if [[ "$CHECK_PNPM" == "true" ]]; then
      print_gray "Clearing pnpm cache..."
      pnpm store prune 2>/dev/null || true
    fi

    # Clean backend runtime data
    if [[ -n "$DATA_DIR" && -d "$DATA_DIR" ]]; then
      for rt_path in sessions request-sessions errors; do
        local full="$DATA_DIR/$rt_path"
        if [[ -d "$full" ]]; then
          print_gray "Removing: $full..."
          rm -rf "$full"
        fi
      done
      for log_file in log.txt error.log.txt; do
        local log_path="$DATA_DIR/$log_file"
        if [[ -f "$log_path" ]]; then
          rm -f "$log_path"
        fi
      done
    fi

    echo -e "  ${C_MAGENTA}✓ Clean complete${C_RESET}"
  fi

  # Check if install needed
  NEEDS_INSTALL=false
  if $FLAG_INSTALL; then
    NEEDS_INSTALL=true
  elif [[ "$EFFECTIVE_NODE_LINKER" == "pnp" && ! -f ".pnp.cjs" ]]; then
    NEEDS_INSTALL=true
  elif [[ "$EFFECTIVE_NODE_LINKER" != "pnp" && ! -d "node_modules" ]]; then
    NEEDS_INSTALL=true
  fi

  # Check required modules
  if ! $NEEDS_INSTALL && [[ "$EFFECTIVE_NODE_LINKER" != "pnp" ]]; then
    while IFS= read -r mod; do
      [[ -z "$mod" ]] && continue
      if [[ ! -d "node_modules/$mod" ]]; then
        NEEDS_INSTALL=true
        break
      fi
    done < <(cfg_array '.requiredModules')
  fi

  if $NEEDS_INSTALL || $FLAG_FORCE; then
    print_gray "Installing dependencies..."
    eval "$EFFECTIVE_INSTALL_CMD"
  fi

  # Build
  print_gray "Running: $BUILD_CMD"
  eval "$BUILD_CMD"
  print_success "Frontend built successfully"

  popd > /dev/null

  print_gray "⏱ $(format_elapsed $STEP_START)"
  echo ""

  # STEP 4: COPY BUILD TO BACKEND
  STEP_START=$(date +%s)
  if [[ -n "$TARGET_DIR" ]]; then
    print_step "[4/5] Copying build to backend..."
    SOURCE_DIST="$FRONTEND_DIR/$DIST_DIR"
    if [[ ! -d "$SOURCE_DIST" ]]; then
      print_warn "Build output not found: $SOURCE_DIST"
    else
      TARGET_PARENT=$(dirname "$TARGET_DIR")
      mkdir -p "$TARGET_PARENT"
      [[ -d "$TARGET_DIR" ]] && rm -rf "$TARGET_DIR"
      cp -R "$SOURCE_DIST" "$TARGET_DIR"
      print_success "Copied to: $TARGET_DIR"
    fi
  else
    print_step "[4/5] Skipping copy (no targetDir)"
  fi
else
  print_step "[3/5] Skipping frontend build (-s)"
  print_step "[4/5] Skipping copy"
fi
echo ""

# ============================================================================
# BUILD ONLY EXIT
# ============================================================================
if $FLAG_BUILDONLY; then
  TOTAL_END=$(date +%s)
  TOTAL_ELAPSED=$(( TOTAL_END - TOTAL_START ))
  print_header "========================================"
  print_header "  Build complete! (-b mode)"
  print_header "  Total time: ${TOTAL_ELAPSED}s"
  print_header "========================================"
  exit 0
fi

# ============================================================================
# STEP 5: START BACKEND
# ============================================================================
print_step "[5/5] Starting Go backend..."

pushd "$BACKEND_DIR" > /dev/null

BACKEND_CONFIG="$BACKEND_DIR/$CONFIG_FILE"
BACKEND_EXAMPLE="$BACKEND_DIR/$CONFIG_EXAMPLE"

if [[ ! -f "$BACKEND_CONFIG" ]]; then
  if [[ -f "$BACKEND_EXAMPLE" ]]; then
    print_gray "Creating $CONFIG_FILE from $CONFIG_EXAMPLE..."
    cp "$BACKEND_EXAMPLE" "$BACKEND_CONFIG"
  else
    print_warn "No $CONFIG_FILE found"
  fi
fi

if [[ -n "$DATA_DIR" && ! -d "$DATA_DIR" ]]; then
  mkdir -p "$DATA_DIR"
fi

TOTAL_END=$(date +%s)
TOTAL_ELAPSED=$(( TOTAL_END - TOTAL_START ))

echo ""
print_header "========================================"
print_header "  $PROJECT_NAME starting..."
print_header "  Open: http://localhost:$PORTS"
print_header "  Press Ctrl+C to stop"
print_header "  Build time: ${TOTAL_ELAPSED}s"
print_header "========================================"
echo ""

eval "$RUN_CMD"

popd > /dev/null
