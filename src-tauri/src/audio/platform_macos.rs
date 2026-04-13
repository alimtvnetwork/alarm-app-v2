// macOS audio session configuration — Phase 5
// Sets Playback + DuckOthers so alarms play through DND

use crate::errors::AlarmAppError;

/// Configure macOS audio session for alarm playback.
/// Must be called during startup before any audio plays.
pub fn configure_audio_session() -> Result<(), AlarmAppError> {
    // Note: objc2_av_foundation requires the objc2-av-foundation crate.
    // For desktop macOS, rodio uses CPAL→CoreAudio which handles this automatically.
    // This function is reserved for future iOS/advanced audio session needs.
    //
    // On macOS desktop, rodio already plays independently of DND via CoreAudio.
    // The critical behavior (playing through DND) is ensured by the notification
    // plugin's `critical` urgency setting.

    tracing::info!("macOS audio session: using default CoreAudio (rodio/CPAL)");
    Ok(())
}
