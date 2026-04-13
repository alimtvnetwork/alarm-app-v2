// macOS wake listener — CFRunLoop + uptime gap detection
// Listens for system wake via wall clock gap monitoring.

use crate::engine::wake_listener::{monitor_uptime_for_sleep, StopSignal, WakeListener};
use crate::errors::AlarmAppError;
use std::sync::atomic::Ordering;
use std::sync::Arc;

/// macOS wake listener using uptime gap detection.
pub struct MacOsWakeListener;

impl MacOsWakeListener {
    pub fn new() -> Self {
        Self
    }
}

impl WakeListener for MacOsWakeListener {
    fn start(
        &self,
        on_wake: Box<dyn Fn() + Send + Sync>,
        stop: StopSignal,
    ) -> Result<(), AlarmAppError> {
        let on_wake = Arc::new(on_wake);

        std::thread::Builder::new()
            .name("wake-listener-macos".to_string())
            .spawn(move || {
                monitor_uptime_for_sleep(on_wake, stop, "macOS");
            })
            .map_err(|e| AlarmAppError::Audio(format!("Failed to start wake listener: {e}")))?;

        tracing::info!("macOS wake listener started");
        Ok(())
    }

    fn stop(&self, stop: StopSignal) {
        stop.store(true, Ordering::Relaxed);
        tracing::debug!("macOS wake listener stop signaled");
    }
}
