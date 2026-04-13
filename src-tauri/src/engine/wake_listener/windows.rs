// Windows wake listener — Phase 6 implementation
// Monitors system wake via uptime gap detection
// (WM_POWERBROADCAST requires unsafe Win32 window creation;
//  uptime monitoring is simpler and equally reliable)

use crate::engine::wake_listener::WakeListener;
use crate::errors::AlarmAppError;

/// Windows wake listener.
/// Internal platform struct — not serialized to frontend.
pub struct WindowsWakeListener;

impl WindowsWakeListener {
    pub fn new() -> Self {
        Self
    }
}

impl WakeListener for WindowsWakeListener {
    fn start(&self, on_wake: Box<dyn Fn() + Send + Sync>) -> Result<(), AlarmAppError> {
        let on_wake = std::sync::Arc::new(on_wake);

        std::thread::Builder::new()
            .name("wake-listener-windows".to_string())
            .spawn(move || {
                monitor_uptime_for_sleep(on_wake);
            })
            .map_err(|e| AlarmAppError::Audio(format!("Failed to start wake listener: {e}")))?;

        tracing::info!("Windows wake listener started (uptime monitor)");
        Ok(())
    }

    fn stop(&self) {
        tracing::debug!("Windows wake listener stop requested");
    }
}

/// Monitor system uptime to detect sleep/wake cycles.
/// When wall clock advances much more than monotonic clock, system was asleep.
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
                "Windows: Detected system wake (wall clock gap)"
            );
            on_wake();
        }

        last_check = now_instant;
        last_wall = now_wall;
    }
}
