# CI Pipeline

> **Spec Version:** 1.0.0  
> **Updated:** 2026-04-13  
> **Status:** Active

---

## Trigger

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

## Concurrency

```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

---

## Jobs

### 1. Lint & Format

```yaml
lint:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v6
    - uses: actions/setup-node@v4
      with: { node-version: '20' }
    - uses: dtolnay/rust-toolchain@stable
      with: { components: 'clippy, rustfmt' }
    - run: cargo fmt --check
    - run: cargo clippy -- -D warnings
    - run: pnpm install --frozen-lockfile
    - run: pnpm lint
```

### 2. Test

```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v6
    - uses: dtolnay/rust-toolchain@stable
    - run: cargo test --workspace
    - uses: actions/setup-node@v4
      with: { node-version: '20' }
    - run: pnpm install --frozen-lockfile
    - run: pnpm test
```

### 3. Build Verification

Verify that the Tauri app builds successfully on all 3 OS runners:

```yaml
build:
  strategy:
    matrix:
      os: [ubuntu-latest, macos-latest, windows-latest]
  runs-on: ${{ matrix.os }}
  steps:
    - uses: actions/checkout@v6
    - uses: dtolnay/rust-toolchain@stable
    - uses: actions/setup-node@v4
      with: { node-version: '20' }
    - run: pnpm install --frozen-lockfile
    - uses: nicolo-ribaudo/action-install-tauri-prerequisites@v1
    - run: pnpm tauri build
```

---

## Environment Variables

```yaml
env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
  CARGO_TERM_COLOR: always
```

---

## Cross-References

- [Overview](./00-overview.md)
- [Release Pipeline](./02-release-pipeline.md)

---

*CI Pipeline — created: 2026-04-13*
