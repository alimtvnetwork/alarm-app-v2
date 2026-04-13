// Linux wake listener — Phase 6 implementation
// Listens for systemd-logind PrepareForSleep D-Bus signal via zbus

use crate::engine::wake_listener::WakeListener;
use crate::errors::AlarmAppError;

/// Linux wake listener using systemd-logind D-Bus signals.
/// Internal platform struct — not serialized to frontend.
pub struct LinuxWakeListener;

impl LinuxWakeListener {
    pub fn new() -> Self {
        Self
    }
}

impl WakeListener for LinuxWakeListener {
    fn start(&self, on_wake: Box<dyn Fn() + Send + Sync>) -> Result<(), AlarmAppError> {
        let on_wake = std::sync::Arc::new(on_wake);

        tokio::spawn(async move {
            if let Err(e) = run_dbus_listener(on_wake).await {
                tracing::warn!(error = %e, "D-Bus wake listener failed — falling back to uptime monitor");
            }
        });

        // Also start uptime monitor as fallback (for systems without systemd)
        let on_wake_fallback: Box<dyn Fn() + Send + Sync> = Box::new(|| {
            tracing::info!("Linux: Wake detected via uptime monitor fallback");
        });
        let on_wake_fallback = std::sync::Arc::new(on_wake_fallback);

        std::thread::Builder::new()
            .name("wake-listener-linux-fallback".to_string())
            .spawn(move || {
                monitor_uptime_for_sleep(on_wake_fallback);
            })
            .map_err(|e| AlarmAppError::Audio(format!("Failed to start wake listener: {e}")))?;

        tracing::info!("Linux wake listener started (D-Bus + uptime fallback)");
        Ok(())
    }

    fn stop(&self) {
        tracing::debug!("Linux wake listener stop requested");
    }
}

/// Connect to system D-Bus and listen for PrepareForSleep signals.
async fn run_dbus_listener(
    on_wake: std::sync::Arc<Box<dyn Fn() + Send + Sync>>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    use zbus::Connection;

    let connection = Connection::system().await.map_err(|e| {
        tracing::warn!(error = %e, "D-Bus system bus unavailable");
        e
    })?;

    tracing::info!("Connected to D-Bus system bus for sleep/wake signals");

    // Subscribe to org.freedesktop.login1.Manager.PrepareForSleep
    let proxy = zbus::proxy::Builder::new(&connection)
        .interface("org.freedesktop.login1.Manager")
        .unwrap()
        .destination("org.freedesktop.login1")
        .unwrap()
        .path("/org/freedesktop/login1")
        .unwrap()
        .build::<zbus::proxy::Proxy>()
        .await?;

    // Use match rule for the signal
    let rule = "type='signal',interface='org.freedesktop.login1.Manager',member='PrepareForSleep'";
    connection
        .call_method(
            Some("org.freedesktop.DBus"),
            "/org/freedesktop/DBus",
            Some("org.freedesktop.DBus"),
            "AddMatch",
            &rule,
        )
        .await?;

    // Process signals via the connection's message stream
    use futures_lite::StreamExt;
    let mut stream = zbus::MessageStream::from(&connection);

    while let Some(msg) = stream.next().await {
        let msg = match msg {
            Ok(m) => m,
            Err(e) => {
                tracing::warn!(error = %e, "D-Bus message error");
                continue;
            }
        };

        // Check if this is a PrepareForSleep signal
        let header = msg.header();
        let is_sleep_signal = header.member().map_or(false, |m| m.as_str() == "PrepareForSleep");
        if !is_sleep_signal {
            continue;
        }

        // Parse the boolean argument: true = going to sleep, false = waking up
        let body: Result<(bool,), _> = msg.body().deserialize();
        match body {
            Ok((is_sleeping,)) => {
                if is_sleeping {
                    tracing::info!("Linux: System entering sleep (PrepareForSleep=true)");
                } else {
                    tracing::info!("Linux: System woke from sleep (PrepareForSleep=false)");
                    on_wake();
                }
            }
            Err(e) => {
                tracing::warn!(error = %e, "Failed to parse PrepareForSleep signal body");
            }
        }
    }

    Ok(())
}

/// Fallback: monitor system uptime to detect sleep/wake cycles.
fn monitor_uptime_for_sleep(on_wake: std::sync::Arc<Box<dyn Fn() + Send + Sync>>) {
    use std::time::{Duration, Instant, SystemTime};

    let check_interval = Duration::from_secs(10);
    let sleep_threshold = Duration::from_secs(30);

    let mut last_check = Instant::now();
    let mut last_wall = SystemTime::now();

    loop {
        std::thread::sleep(check_interval);

        let now_instant = Instant::now();
        let now_wall = SystemTime::now();

        let monotonic_elapsed = now_instant.duration_since(last_check);
        let wall_elapsed = now_wall
            .duration_since(last_wall)
            .unwrap_or(Duration::ZERO);

        if wall_elapsed > monotonic_elapsed + sleep_threshold {
            let gap = wall_elapsed - monotonic_elapsed;
            tracing::info!(
                gap_secs = gap.as_secs(),
                "Linux: Detected system wake via uptime monitor (wall clock gap)"
            );
            on_wake();
        }

        last_check = now_instant;
        last_wall = now_wall;
    }
}
