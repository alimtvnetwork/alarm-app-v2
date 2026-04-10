# Dependency Lock

**Version:** 1.1.0  
**Updated:** 2026-04-10  
**AI Confidence:** High  
**Ambiguity:** None

---

## Keywords

`dependencies`, `versions`, `crates`, `npm`, `pinning`, `compatibility`, `breaking-changes`

---
---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ⚠️ N/A (consolidated in 97-acceptance-criteria.md) |


## Purpose

Pins every project dependency to an exact version with documented API surface, known breaking changes, and upgrade notes. Prevents AI from installing incompatible versions.

---

## Rust Crates (Cargo.toml)

### Core Framework

| Crate | Pinned Version | Spec Minimum | API Surface Used | Notes |
|-------|:-:|:-:|------|-------|
| `tauri` | `=2.10.3` | 2.x | `Builder`, `Manager`, `AppHandle`, `invoke`, `emit`, `listen`, tray-icon + global-shortcut features | Core framework. Must match plugin versions |
| `tauri-build` | `=2.5.6` | 2.x | `build()` in `build.rs` | Build-time only |
| `thiserror` | `=2.0.18` | 2.x | `#[derive(Error)]` on `AlarmAppError` | ⚠️ Was missing from Cargo.toml spec — must be added |

### Tauri Plugins

| Crate | Pinned Version | API Surface Used | Notes |
|-------|:-:|------|-------|
| `tauri-plugin-notification` | `=2.3.3` | `NotificationExt::notification()`, `.show()`, `.request_permission()`, `.is_permission_granted()` | OS-native notifications |
| `tauri-plugin-dialog` | `=2.7.0` | `DialogExt::dialog()`, `.file().pick_file()`, `.save_file()`, `.message()`, `.ask()` | File dialogs for export/import |
| `tauri-plugin-fs` | `=2.5.0` | `FsExt::fs()`, `.read_file()`, `.exists()` | Custom sound file validation |
| `tauri-plugin-autostart` | `=2.5.1` | `AutostartExt::autostart()`, `.enable()`, `.disable()`, `.is_enabled()` | Launch-on-login toggle |
| `tauri-plugin-updater` | `=2.10.1` | `UpdaterExt::updater()`, `.check()`, `.download_and_install()` | Auto-update mechanism |
| `tauri-plugin-global-shortcut` | `=2.3.1` | `GlobalShortcutExt::global_shortcut()`, `.register()`, `.unregister()` | Keyboard shortcuts |

### Database

| Crate | Pinned Version | Spec Had | API Surface Used | Breaking Changes |
|-------|:-:|:-:|------|------|
| `rusqlite` | `=0.32.1` | `0.31` | `Connection::open()`, `.execute()`, `.query_row()`, `.prepare()`, `params![]`, `Row::get()` | ⚠️ Pin to `0.32.1` (not `0.39.0`) — v0.33+ changes `Row::get()` return types. `0.32.1` is the last version compatible with `refinery 0.8.x` feature gate. Features: `["bundled"]` |
| `refinery` | `=0.8.14` | `0.8` | `embed_migrations!()`, `Runner::new().run()` | Pin to `0.8.14` — `0.9.x` changes migration macro syntax. Features: `["rusqlite"]` |

### Audio

| Crate | Pinned Version | Spec Had | API Surface Used | Breaking Changes |
|-------|:-:|:-:|------|------|
| `rodio` | `=0.19.0` | `0.19` | `OutputStream::try_default()`, `Sink::try_new()`, `.append()`, `.set_volume()`, `.play()`, `.stop()`, `.sleep_until_end()` | ✅ Keep `0.19.0`. `0.20+` renamed `OutputStream` → `OutputStreamHandle` and changed `Sink` construction. |

### Date/Time

| Crate | Pinned Version | API Surface Used | Breaking Changes |
|-------|:-:|------|------|
| `chrono` | `=0.4.44` | `Utc::now()`, `Local::now()`, `NaiveTime`, `DateTime<Tz>`, `Duration`, `Weekday`, serde feature | ✅ Stable across 0.4.x |
| `chrono-tz` | `=0.10.4` | `Tz::from_str()`, IANA timezone lookup | ✅ Stable |
| `croner` | `=2.0.7` | `Cron::new()`, `.upcoming()`, `.next()` | ⚠️ Pin to `2.0.7` — v3.0 is a rewrite with different `Cron` constructor API |

### Serialization

| Crate | Pinned Version | API Surface Used |
|-------|:-:|------|
| `serde` | `=1.0.228` | `#[derive(Serialize, Deserialize)]`, `#[serde(rename_all = "PascalCase")]`, `#[serde(rename = "...")]` |
| `serde_json` | `=1.0.149` | `serde_json::to_string()`, `serde_json::from_str()`, `Value` |

### Utilities

| Crate | Pinned Version | API Surface Used |
|-------|:-:|------|
| `uuid` | `=1.23.0` | `Uuid::new_v4()`, `.to_string()`. Features: `["v4"]` |
| `tokio` | `=1.51.1` | `tokio::spawn()`, `tokio::time::sleep()`, `tokio::time::sleep_until()`, `tokio::sync::Mutex`. Features: `["full"]` |
| `tracing` | `=0.1.44` | `tracing::info!()`, `tracing::warn!()`, `tracing::error!()`, `#[instrument]` |
| `tracing-subscriber` | `=0.3.23` | `fmt::init()`, `EnvFilter`. Features: `["env-filter"]` |
| `tracing-appender` | `=0.2.4` | `rolling::daily()` for log rotation |

### Platform-Specific

| Crate | Pinned Version | Target | API Surface Used | Breaking Changes |
|-------|:-:|------|------|------|
| `objc2` | `=0.5.2` | `cfg(target_os = "macos")` | NSWorkspace wake notifications, audio session config | ⚠️ Pin to `0.5.2` — `0.6.x` completely restructured module hierarchy |
| `windows` | `=0.58.0` | `cfg(target_os = "windows")` | `Win32_System_Power` for `WM_POWERBROADCAST` | ⚠️ Pin to `0.58.0` — `0.59+` changed feature gate naming |
| `zbus` | `=4.4.0` | `cfg(target_os = "linux")` | `Connection::system()`, proxy for `org.freedesktop.login1.Manager` | ⚠️ Pin to `4.4.0` — `5.x` is async-only rewrite with different connection API |

---

## npm Packages (package.json)

### Core Framework

| Package | Pinned Version | Spec Had | API Surface Used | Breaking Changes |
|---------|:-:|:-:|------|------|
| `react` | `=18.3.1` | `18` | Hooks, JSX, `React.lazy()`, `Suspense` | ✅ Keep React 18. React 19 changes `ref` forwarding and removes legacy context |
| `react-dom` | `=18.3.1` | `18` | `createRoot()`, portals | ✅ Must match React version |
| `typescript` | `=5.7.3` | `5` | Type checking, strict mode | ✅ Keep TS 5. TS 6 not yet stable for ecosystem |
| `vite` | `=5.4.18` | `5` | Dev server, build, HMR | ✅ Keep Vite 5. Vite 6+ changes config API |
| `@tauri-apps/api` | `=2.10.1` | `2.x` | `invoke()`, `listen()`, `emit()`, `event` module | Must match Tauri core version |
| `@tauri-apps/cli` | `=2.10.1` | `2.x` | `tauri dev`, `tauri build` CLI | Must match Tauri core version |

### UI Framework

| Package | Pinned Version | Spec Had | API Surface Used | Breaking Changes |
|---------|:-:|:-:|------|------|
| `tailwindcss` | `=3.4.22` | `v3` | Utility classes, dark mode, custom theme | ⚠️ Keep v3. Tailwind v4 removes `tailwind.config.js` in favor of CSS-based config |
| `shadcn/ui` | N/A | — | CLI-installed components (Button, Dialog, Slider, Switch, etc.) | Not an npm dep — components are copied into `src/components/ui/` |

### State & Routing

| Package | Pinned Version | Spec Had | API Surface Used | Breaking Changes |
|---------|:-:|:-:|------|------|
| `zustand` | `=4.5.7` | `^4.5` | `create()`, `useStore()`, selectors, `devtools` middleware | ⚠️ Keep v4. Zustand v5 changes `create()` import path and removes deprecated APIs |
| `sonner` | `=1.7.7` | `^1.5` | `toast.success()`, `toast.error()`, `toast.info()`, `Toaster` component | ⚠️ Keep v1. Sonner v2 changes `Toaster` props and theming API |
| `react-router-dom` | `=6.30.0` | `^6.x` | `BrowserRouter`, `Routes`, `Route`, `useNavigate()`, `useParams()` | ⚠️ Keep v6. v7 is a major rewrite (Remix merger) with different routing model |

### i18n

| Package | Pinned Version | API Surface Used |
|---------|:-:|------|
| `i18next` | `=24.2.3` | `i18n.init()`, `i18n.use()`, `i18n.t()` | ⚠️ Pin to v24 — v25+ changes plugin registration API |
| `react-i18next` | `=15.5.3` | `useTranslation()`, `Trans`, `initReactI18next` | Must be compatible with i18next v24 |
| `eslint-plugin-i18next` | `=6.1.3` | `no-literal-string` rule | Linting only |

---

## Compatibility Matrix

| Component | Version Constraint | Reason |
|-----------|-------------------|--------|
| Tauri core ↔ Tauri plugins | All `2.x` — minor versions should match within ±2 | Plugin ABI compatibility |
| `rusqlite` ↔ `refinery` | `rusqlite 0.32.x` + `refinery 0.8.x` | `refinery`'s `rusqlite` feature gate compiled against `rusqlite 0.32` |
| `react` ↔ `react-dom` | Exact same version | React requirement |
| `@tauri-apps/api` ↔ Tauri core | Same minor version | IPC protocol compatibility |
| `i18next` ↔ `react-i18next` | `i18next 24.x` + `react-i18next 15.x` | Plugin compatibility |

---

## Upgrade Policy

1. **Never upgrade without testing.** All version bumps must pass the full test suite (see `09-test-strategy.md`)
2. **Pin with `=` in Cargo.toml.** Do not use `^` or `~` — exact versions only
3. **Pin with `=` in package.json.** Do not use `^` or `~` — exact versions only
4. **Document breaking changes.** Before upgrading any dependency, document the API changes in this file
5. **Batch upgrades.** Upgrade related crates together (e.g., all Tauri plugins in one PR)

---

## Missing Dependencies (Found During Audit)

| Dependency | Type | Where Used | Action |
|------------|------|-----------|--------|
| `thiserror` | Rust crate | `AlarmAppError` in `04-platform-constraints.md` | ⚠️ Add to Cargo.toml — was used in error type but never listed |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Cargo.toml | `./03-file-structure.md` → Cargo.toml Dependencies section |
| Plugin Integration | `./06-tauri-architecture-and-framework-comparison.md` → Plugin Integration table |
| Frontend Packages | `./06-tauri-architecture-and-framework-comparison.md` → Crate / Package table |
| Test Strategy | `./09-test-strategy.md` |
| Platform Constraints | `./04-platform-constraints.md` |

---

*Dependency Lock — v1.0.0 — 2026-04-10*
