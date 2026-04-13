// Wake listener — Phase 6 implementation
// Platform-specific wake detection

#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "windows")]
mod windows;
#[cfg(target_os = "linux")]
mod linux;

use crate::errors::AlarmAppError;

/// Platform-agnostic wake listener trait.
pub trait WakeListener: Send + Sync {
    fn start(&self, on_wake: Box<dyn Fn() + Send + Sync>) -> Result<(), AlarmAppError>;
    fn stop(&self);
}

/// Factory: create the correct wake listener for the current platform.
pub fn create_wake_listener() -> Box<dyn WakeListener> {
    #[cfg(target_os = "macos")]
    {
        Box::new(macos::MacOsWakeListener::new())
    }
    #[cfg(target_os = "windows")]
    {
        Box::new(windows::WindowsWakeListener::new())
    }
    #[cfg(target_os = "linux")]
    {
        Box::new(linux::LinuxWakeListener::new())
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    {
        Box::new(NoOpWakeListener)
    }
}

/// No-op wake listener for unsupported platforms.
#[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
struct NoOpWakeListener;

#[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
impl WakeListener for NoOpWakeListener {
    fn start(&self, _on_wake: Box<dyn Fn() + Send + Sync>) -> Result<(), AlarmAppError> {
        tracing::warn!("Wake listener not supported on this platform");
        Ok(())
    }
    fn stop(&self) {}
}
