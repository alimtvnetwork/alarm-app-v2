#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::Path;
use std::sync::Arc;
use std::time::Duration;

use rusqlite::Connection;
use tauri::Manager;
use tokio::sync::Mutex;
use tracing_appender::rolling;
use tracing_subscriber::{fmt, prelude::*, EnvFilter};

use alarm_app::errors::AlarmAppError;
use alarm_app::storage::db;

mod commands_registration;

/// Shared database connection wrapped in Arc<Mutex<>> for thread-safe access.
pub type DbPool = Arc<Mutex<Connection>>;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_global_shortcut::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            // Step 1: Resolve app data directory
            let app_dir = app_handle
                .path()
                .app_data_dir()
                .expect("FATAL: Failed to resolve app data directory");
            std::fs::create_dir_all(&app_dir)
                .expect("FATAL: Failed to create app data directory");

            // Step 2: Open SQLite connection
            let db_path = app_dir.join("alarm-app.db");
            let mut conn = Connection::open(&db_path)
                .expect("FATAL: Failed to open database");

            // Step 3: Run migrations
            if let Err(e) = db::run_migrations(&mut conn) {
                tracing::error!(error = %e, "Migration failed");
                panic!("FATAL: Database migration failed: {e}");
            }

            // Step 4: Enable WAL mode + PRAGMAs
            db::set_pragmas(&conn);

            // Step 5: Load settings
            let settings = db::load_settings(&conn);

            // Step 6a: Init logging
            init_logging(&app_dir);

            // Step 6b: Configure platform audio session
            #[cfg(target_os = "macos")]
            {
                if let Err(e) = alarm_app::audio::platform_macos::configure_audio_session() {
                    tracing::warn!(error = %e, "macOS audio session config failed (non-fatal)");
                }
            }

            tracing::info!(
                db_path = %db_path.display(),
                "App started successfully"
            );

            // Store DB pool in app state
            let pool: DbPool = Arc::new(Mutex::new(conn));
            app.manage(pool);

            // Step 7: Start alarm engine (30s polling loop)
            let engine_pool: DbPool = Arc::new(Mutex::new(
                Connection::open(&db_path).expect("FATAL: Failed to open engine DB connection"),
            ));
            let engine_pool_clone = engine_pool.clone();
            let engine_handle = app_handle.clone();
            alarm_app::engine::alarm_engine::start_engine(
                engine_pool.clone(),
                app_handle.clone(),
            );

            tracing::info!("Alarm engine started");

            // Step 8: Start wake listener for sleep/wake detection
            let wake_pool = engine_pool_clone;
            let wake_handle = engine_handle;
            let wake_listener = alarm_app::engine::wake_listener::create_wake_listener();
            let _ = wake_listener.start(Box::new(move || {
                let pool = wake_pool.clone();
                let handle = wake_handle.clone();
                tokio::spawn(async move {
                    tracing::info!("Wake detected — running missed alarm check");
                    alarm_app::engine::alarm_engine::on_system_wake(&pool, &handle).await;
                });
            }));

            tracing::info!("Wake listener started");

            // Step 9: System tray
            if let Err(e) = alarm_app::tray::setup_tray(&app_handle) {
                tracing::warn!(error = %format!("{e}"), "Failed to set up system tray");
            }

            // Step 10: Timezone change watcher
            let tz_pool: DbPool = Arc::new(Mutex::new(
                Connection::open(&db_path).expect("FATAL: Failed to open tz-watcher DB connection"),
            ));
            alarm_app::engine::timezone_watcher::start_timezone_watcher(
                tz_pool,
                app_handle.clone(),
            );

            tracing::info!("Phase 10 init complete (tray + timezone watcher)");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            alarm_app::commands::alarm::list_alarms,
            alarm_app::commands::alarm::create_alarm,
            alarm_app::commands::alarm::update_alarm,
            alarm_app::commands::alarm::delete_alarm,
            alarm_app::commands::alarm::toggle_alarm,
            alarm_app::commands::alarm::duplicate_alarm,
            alarm_app::commands::alarm::undo_delete_alarm,
            alarm_app::commands::alarm::reorder_alarms,
            alarm_app::commands::settings::get_settings,
            alarm_app::commands::settings::update_setting,
            alarm_app::commands::group::list_groups,
            alarm_app::commands::group::create_group,
            alarm_app::commands::group::update_group,
            alarm_app::commands::group::delete_group,
            alarm_app::commands::group::toggle_group,
            alarm_app::commands::history::list_alarm_events,
            alarm_app::commands::history::clear_history,
            alarm_app::commands::snooze::snooze_alarm,
            alarm_app::commands::snooze::get_snooze_state,
            alarm_app::commands::snooze::cancel_snooze,
            alarm_app::commands::snooze::dismiss_alarm,
            alarm_app::commands::audio::list_sounds,
            alarm_app::commands::audio::set_custom_sound,
            alarm_app::commands::audio::validate_custom_sound,
            log_from_frontend,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn init_logging(app_dir: &Path) {
    let log_dir = app_dir.join("logs");
    let _ = std::fs::create_dir_all(&log_dir);

    let file_appender = rolling::daily(&log_dir, "alarm-app.log");
    let (non_blocking, _guard) = tracing_appender::non_blocking(file_appender);

    let _ = tracing_subscriber::registry()
        .with(EnvFilter::new("info"))
        .with(
            fmt::layer()
                .with_writer(non_blocking)
                .with_ansi(false)
                .with_target(true),
        )
        .with(fmt::layer().with_writer(std::io::stderr))
        .try_init();

    // Leak the guard so tracing stays active for the app lifetime
    std::mem::forget(_guard);
}

#[tauri::command]
fn log_from_frontend(level: String, message: String) {
    match level.as_str() {
        "error" => tracing::error!(source = "frontend", "{message}"),
        "warn" => tracing::warn!(source = "frontend", "{message}"),
        _ => tracing::info!(source = "frontend", "{message}"),
    }
}
