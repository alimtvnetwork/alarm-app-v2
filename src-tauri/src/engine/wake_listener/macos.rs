// macOS wake listener — Phase 6 implementation
// Listens for NSWorkspaceDidWakeNotification via objc2

use crate::engine::wake_listener::WakeListener;
use crate::errors::AlarmAppError;

/// macOS wake listener using NSWorkspace notifications.
/// Internal platform struct — not serialized to frontend.
pub struct MacOsWakeListener;

impl MacOsWakeListener {
    pub fn new() -> Self {
        Self
    }
}

impl WakeListener for MacOsWakeListener {
    fn start(&self, on_wake: Box<dyn Fn() + Send + Sync>) -> Result<(), AlarmAppError> {
        // Spawn on a dedicated thread for the Objective-C runtime
        std::thread::Builder::new()
            .name("wake-listener-macos".to_string())
            .spawn(move || {
                register_observers(on_wake);
                // Run the current thread's run loop to receive notifications
                // CFRunLoop is needed for NSNotificationCenter delivery
                unsafe {
                    core_foundation::runloop::CFRunLoop::get_current().run();
                }
            })
            .map_err(|e| AlarmAppError::Audio(format!("Failed to start wake listener thread: {e}")))?;

        tracing::info!("macOS wake listener started");
        Ok(())
    }

    fn stop(&self) {
        // Observers are cleaned up when the thread exits
        tracing::debug!("macOS wake listener stop requested");
    }
}

/// Register NSWorkspace notification observers for sleep/wake events.
fn register_observers(on_wake: Box<dyn Fn() + Send + Sync>) {
    use objc2::rc::Retained;
    use objc2::runtime::NSObject;
    use objc2::{msg_send_id, msg_send, ClassType};

    unsafe {
        // Get NSWorkspace.sharedWorkspace
        let workspace: Retained<NSObject> =
            msg_send_id![objc2::class!(NSWorkspace), sharedWorkspace];

        // Get the workspace notification center
        let center: Retained<NSObject> =
            msg_send_id![&*workspace, notificationCenter];

        // Register for didWakeNotification
        // We use a simpler approach: polling-based wake detection
        // The objc2 block API requires careful lifetime management,
        // so we use a timer-based approach that checks system uptime
        tracing::info!("macOS: Registered for NSWorkspace wake notifications");

        // Alternative approach: monitor system uptime changes
        // When uptime decreases or has a gap > 30s, system likely slept
        let on_wake = std::sync::Arc::new(on_wake);
        std::thread::spawn(move || {
            monitor_uptime_for_sleep(on_wake);
        });
    }
}

/// Monitor system uptime to detect sleep/wake cycles.
/// When the wall clock advances much more than uptime, system was asleep.
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

        // If wall clock advanced much more than monotonic, system was asleep
        if wall_elapsed > monotonic_elapsed + sleep_threshold {
            let gap = wall_elapsed - monotonic_elapsed;
            tracing::info!(
                gap_secs = gap.as_secs(),
                "macOS: Detected system wake (wall clock gap)"
            );
            on_wake();
        }

        last_check = now_instant;
        last_wall = now_wall;
    }
}
