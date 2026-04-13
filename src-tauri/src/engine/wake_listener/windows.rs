// Windows wake listener — uptime gap detection
// Monitors wall clock vs monotonic clock to detect sleep/wake.

use crate::engine::wake_listener::{monitor_uptime_for_sleep, StopSignal, WakeListener};
use crate::errors::AlarmAppError;
use std::sync::atomic::Ordering;
use std::sync::Arc;

/// Windows wake listener using uptime gap detection.
pub struct WindowsWakeListener;

impl WindowsWakeListener {
    pub fn new() -> Self {
        Self
    }
}

impl WakeListener for WindowsWakeListener {
    fn start(
        &self,
        on_wake: Box<dyn Fn() + Send + Sync>,
        stop: StopSignal,
    ) -> Result<(), AlarmAppError> {
        let on_wake = Arc::new(on_wake);

        std::thread::Builder::new()
            .name("wake-listener-windows".to_string())
            .spawn(move || {
                monitor_uptime_for_sleep(on_wake, stop, "Windows");
            })
            .map_err(|e| AlarmAppError::Audio(format!("Failed to start wake listener: {e}")))?;

        tracing::info!("Windows wake listener started");
        Ok(())
    }

    fn stop(&self, stop: StopSignal) {
        stop.store(true, Ordering::Relaxed);
        tracing::debug!("Windows wake listener stop signaled");
    }
}
