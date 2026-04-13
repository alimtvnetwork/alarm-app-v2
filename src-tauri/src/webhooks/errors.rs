use thiserror::Error;

#[derive(Error, Debug)]
pub enum WebhookError {
    #[error("Database error: {0}")]
    Database(String),

    #[error("Network error: {0}")]
    Network(String),

    #[error("Invalid URL: {0}")]
    InvalidUrl(String),

    #[error("Payload too large: {size_bytes} bytes (max {max_bytes})")]
    PayloadTooLarge { size_bytes: usize, max_bytes: usize },

    #[error("Timeout after {timeout_secs}s")]
    Timeout { timeout_secs: u64 },

    #[error("Rate limited: retry after {retry_after_secs}s")]
    RateLimited { retry_after_secs: u64 },

    #[error("Webhook delivery failed after {attempts} attempts: {message}")]
    DeliveryFailed { attempts: u32, message: String },
}
