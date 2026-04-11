# Smart Features

**Version:** 1.6.0  
**Updated:** 2026-04-11  
**AI Confidence:** Medium  
**Ambiguity:** Medium  
**Priority:** P3 — Future  
**Resolves:** SEC-WEBHOOK-001

---

## Keywords

`weather`, `location`, `webhook`, `voice`, `timezone`, `native`, `ssrf`

---

## Scoring

| Criterion | Status |
|-----------|--------|
| Version present | ✅ |
| Keywords present | ✅ |
| Cross-References present | ✅ |
| Acceptance Criteria present | ✅ |


## Description

Advanced features for future iterations: weather briefing, location-based alarms, webhook integrations, system tray enhancements, and voice commands.

---

## Features

### Weather Briefing on Wake (P3)

- After dismissal, show temperature, rain chance, wind for user's location
- Uses a weather API (requires API key) — HTTP requests from Rust backend
- Configurable: show/hide per alarm

### Location-Based Alarms (P3)

- Geofence triggers: "Alert when I arrive at gym" or "Alert when I leave office"
- **Desktop:** Uses system location services (CoreLocation on macOS, WinRT on Windows)
- **Mobile:** Native GPS/geofencing APIs (CLLocationManager on iOS, Geofencing API on Android)
- Configurable radius per geofence

### Webhook / API Triggers (P3)

- On alarm dismiss, send HTTP POST to a configured URL
- HTTP requests handled by Rust backend (no CORS limitations)
- Use cases: smart home (lights, coffee machine), logging, IFTTT
- Configurable URL and payload per alarm

#### SSRF Protection (Security)

> **Resolves SEC-WEBHOOK-001.** Webhook URLs are user-configured. Without validation, a malicious URL could target internal services.

**URL Validation Rules:**

#### WebhookError Enum

> **Resolves P15-012.** The `WebhookError` enum is used throughout webhook validation and HTTP code but was never formally defined.

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum WebhookError {
    #[error("Invalid URL format")]
    InvalidUrl,

    #[error("URL must use HTTPS scheme")]
    InsecureScheme,

    #[error("Blocked host: localhost or internal address")]
    BlockedHost,

    #[error("URL has no host")]
    MissingHost,

    #[error("URL resolves to a private/internal IP address")]
    PrivateIp,

    #[error("Non-standard port: only port 443 is allowed")]
    NonStandardPort,

    #[error("HTTP request failed: {0}")]
    RequestFailed(String),
}
```

**URL Validation Rules:**

```rust
use std::net::IpAddr;
use url::Url;

const BLOCKED_HOSTS: &[&str] = &[
    "localhost", "127.0.0.1", "::1", "0.0.0.0",
    "[::1]", "host.docker.internal", "metadata.google.internal",
];

/// Validate a webhook URL. Decomposed into ≤15-line subfunctions.
pub fn validate_webhook_url(url_str: &str) -> Result<Url, WebhookError> {
    let url = Url::parse(url_str).map_err(|_| WebhookError::InvalidUrl)?;
    require_https(&url)?;
    reject_blocked_host(&url)?;
    reject_private_ip(&url)?;
    reject_non_standard_port(&url)?;
    Ok(url)
}

fn require_https(url: &Url) -> Result<(), WebhookError> {
    if url.scheme() != "https" { return Err(WebhookError::InsecureScheme); }
    Ok(())
}

fn reject_blocked_host(url: &Url) -> Result<(), WebhookError> {
    let host = url.host_str().ok_or(WebhookError::MissingHost)?;
    if BLOCKED_HOSTS.contains(&host) { return Err(WebhookError::BlockedHost); }
    Ok(())
}

fn reject_private_ip(url: &Url) -> Result<(), WebhookError> {
    let host = url.host_str().ok_or(WebhookError::MissingHost)?;
    if let Ok(ip) = host.parse::<IpAddr>() {
        if is_private_ip(&ip) { return Err(WebhookError::PrivateIp); }
    }
    Ok(())
}

fn reject_non_standard_port(url: &Url) -> Result<(), WebhookError> {
    if let Some(port) = url.port() {
        if port != 443 { return Err(WebhookError::NonStandardPort); }
    }
    Ok(())
}

fn is_private_v4(v4: &std::net::Ipv4Addr) -> bool {
    v4.is_loopback() || v4.is_private() || v4.is_link_local()
        || v4.is_broadcast() || v4.is_unspecified()
        || v4.octets()[0] == 100 // CGNAT
}

fn is_private_v6(v6: &std::net::Ipv6Addr) -> bool {
    v6.is_loopback() || v6.is_unspecified()
        || (v6.segments()[0] & 0xffc0) == 0xfe80  // link-local
        || (v6.segments()[0] & 0xfe00) == 0xfc00   // unique-local
}

fn is_private_ip(ip: &IpAddr) -> bool {
    match ip {
        IpAddr::V4(v4) => is_private_v4(v4),
        IpAddr::V6(v6) => is_private_v6(v6),
    }
}
```

**HTTP Client Rules:**

| Rule | Value | Reason |
|------|-------|--------|
| **Timeout** | 5 seconds | Prevent slow-loris attacks |
| **Follow redirects** | Disabled | Redirect could bypass URL validation |
| **Max response body** | 1 KB (discard) | We don't need the response, prevent memory exhaustion |
| **Retry** | 1 retry after 2s | Handle transient failures |
| **User-Agent** | `AlarmApp/1.0 Webhook` | Identify traffic |
| **Logging** | Log every call: URL, status code, latency | Audit trail |

**Webhook HTTP Client Implementation:**

```rust
use reqwest::Client;

/// Build HTTP client with security constraints (no redirects, 5s timeout)
fn build_webhook_client() -> Result<Client, WebhookError> {
    Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .redirect(reqwest::redirect::Policy::none())
        .user_agent("AlarmApp/1.0 Webhook")
        .build()
        .map_err(|e| WebhookError::RequestFailed(e.to_string()))
}

/// WebhookPayload sent to user-configured webhook URL on alarm dismiss.
///
/// ```typescript
/// interface WebhookPayload {
///   AlarmId: string;
///   AlarmLabel: string;
///   FiredAt: string;        // ISO 8601
///   DismissedAt: string;    // ISO 8601
///   SnoozeCount: number;
///   AppVersion: string;
/// }
/// ```
pub async fn fire_webhook(url: &Url, payload: &WebhookPayload) -> Result<(), WebhookError> {
    let client = build_webhook_client()?;
    let response = client.post(url.as_str()).json(payload).send().await;
    log_webhook_result(url, response)
}

fn log_webhook_result(url: &Url, response: Result<reqwest::Response, reqwest::Error>) -> Result<(), WebhookError> {
    match response {
        Ok(resp) => {
            tracing::info!(url = %url, status = %resp.status(), "Webhook delivered");
            Ok(())
        }
        Err(e) => {
            tracing::warn!(url = %url, error = %e, "Webhook failed");
            Err(WebhookError::RequestFailed(e.to_string()))
        }
    }
}
```

**Validation Timing:**
- **On save:** Validate URL when user configures webhook → reject invalid URLs immediately with clear error message
- **On fire:** Re-validate URL before sending (user may have edited config file directly)
- **DNS re-resolution:** Always resolve DNS fresh on each call (don't cache — IP could change to internal)

### System Tray Enhancements (P3)

- Quick-create alarm from tray menu
- Show next alarm time in menu bar (macOS) / tray tooltip (Windows)
- Tray notification badge when alarm is snoozed
- One-click toggle all alarms from tray

### Voice Command Integration (P3)

- "Set alarm for 7 AM" via native speech recognition
- **macOS:** NSSpeechRecognizer / Speech framework
- **Mobile:** Platform speech APIs (Speech framework on iOS, SpeechRecognizer on Android)
- Basic commands: set, edit, delete, toggle

### Multiple Time Zone Support (P2)

- Set alarms in different time zones (e.g., "9:00 AM Tokyo time")
- Alarm list shows both local and target times
- Useful for remote workers and travelers

---

## IPC Commands

> Smart features that require backend interaction. Webhook CRUD, weather, location, and voice all need Tauri IPC commands.

| Command | Payload | Returns |
|---------|---------|---------|
| `create_webhook` | `CreateWebhookPayload` | `WebhookConfig` |
| `delete_webhook` | `{ WebhookId: string }` | `void` |
| `test_webhook` | `{ WebhookId: string }` | `TestWebhookResult` |
| `get_weather_briefing` | `GetWeatherPayload` | `WeatherBriefing` |

> **Note:** Location-based alarms and voice commands use platform-native APIs invoked directly from Rust — no frontend IPC commands needed. Multi-timezone support is a P3 future feature — when implemented, a per-alarm `Timezone` field will be added to the `Alarm` interface and `CreateAlarmPayload`/`UpdateAlarmPayload`. Until then, all alarms use the global `SystemTimezone` setting.

### Payload Interfaces

```typescript
/** JSON-safe value types for webhook payloads — `unknown` is banned per type-safety guidelines. */
type JsonSafeValue = string | number | boolean | null;

interface CreateWebhookPayload {
  AlarmId: string;
  Url: string;
  Payload?: Record<string, JsonSafeValue>;
}

interface GetWeatherPayload {
  Latitude: number;
  Longitude: number;
}

interface TestWebhookResult {
  Success: boolean;
  StatusCode: number | null;
  Error: string | null;
}

interface WebhookConfig {
  WebhookId: string;
  AlarmId: string;
  Url: string;
  Payload: Record<string, JsonSafeValue> | null;
  CreatedAt: string;  // ISO 8601
}

interface WeatherBriefing {
  Temperature: number;     // Celsius
  RainChance: number;      // 0–100 percentage
  WindSpeed: number;       // km/h
  Description: string;     // e.g., "Partly cloudy"
  FetchedAt: string;       // ISO 8601
}

/// Payload sent to user-configured webhook URL on alarm dismiss.
interface WebhookPayload {
  AlarmId: string;
  AlarmLabel: string;
  FiredAt: string;        // ISO 8601
  DismissedAt: string;    // ISO 8601
  SnoozeCount: number;
  AppVersion: string;
}
```

> **Resolves PY-003, PY-004, P35-003, P35-004, P35-007, P35-010.** Rust struct counterparts for IPC serialization.

#### Rust Structs

```rust
#[derive(Debug, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct CreateWebhookPayload {
    pub alarm_id: String,
    pub url: String,
    pub payload: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct GetWeatherPayload {
    pub latitude: f64,
    pub longitude: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "PascalCase")]
pub struct TestWebhookResult {
    pub success: bool,
    pub status_code: Option<u16>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "PascalCase")]
pub struct WebhookConfig {
    pub webhook_id: String,
    pub alarm_id: String,
    pub url: String,
    pub payload: Option<serde_json::Value>,
    pub created_at: String,
}

impl WebhookConfig {
    /// Convert from rusqlite::Row — EXEMPT from 15-line limit (field-per-line mapping, no logic)
    pub fn from_row(row: &rusqlite::Row) -> rusqlite::Result<Self> {
        Ok(Self {
            webhook_id: row.get("WebhookId")?,
            alarm_id: row.get("AlarmId")?,
            url: row.get("Url")?,
            payload: row.get::<_, Option<String>>("Payload")?
                .and_then(|s| serde_json::from_str(&s).ok()),
            created_at: row.get("CreatedAt")?,
        })
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "PascalCase")]
pub struct WeatherBriefing {
    pub temperature: f64,
    pub rain_chance: u8,
    pub wind_speed: f64,
    pub description: String,
    pub fetched_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "PascalCase")]
pub struct WebhookPayload {
    pub alarm_id: String,
    pub alarm_label: String,
    pub fired_at: String,
    pub dismissed_at: String,
    pub snooze_count: u32,
    pub app_version: String,
}
```

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Webhook URL returns 500 error | Log error, retry once after 2s, then give up. Show "Webhook failed" in alarm history. |
| Webhook URL times out (>5s) | Cancel request, log timeout, do not retry. Alarm dismissal is NOT blocked. |
| Weather API key missing or invalid | Show "Weather unavailable" placeholder instead of briefing. Log warning. |
| Weather API returns stale data (>30 min old) | Show data with "(last updated X min ago)" note. |
| Location permission denied by user | Hide location-based alarm option. Show toast explaining why. |
| Geofence radius < 50m | Clamp to 50m minimum. GPS accuracy makes smaller radii unreliable. |
| Voice command in unsupported language | Show "Voice commands not available in {language}" toast. |
| Multiple webhooks on same alarm | Fire all webhooks in parallel. Each has independent timeout and retry. |
| Webhook URL changes between alarm fire and dismiss | Use URL as configured at dismiss time (read fresh from DB). |
| DNS resolution of webhook URL returns private IP | Block request — SSRF protection catches this at fire time, not just at save time. |

---

## Acceptance Criteria

- [ ] Webhook URL validated with 5 SSRF checks (HTTPS, blocked hosts, private IP, standard port, valid URL)
- [ ] `WebhookError` enum used for all validation failures (never raw strings)
- [ ] Webhook HTTP client: 5s timeout, no redirects, 1KB max response, 1 retry
- [ ] Weather briefing shows temp, rain chance, wind after alarm dismissal (when configured)
- [ ] Location-based alarms hidden on desktop (no GPS); visible on mobile
- [ ] Voice commands support: set, edit, delete, toggle (when platform speech API available)
- [ ] Multi-timezone alarms show both local and target time in alarm list

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Platform Constraints | `../01-fundamentals/04-platform-constraints.md` |
| Alarm Firing | `./03-alarm-firing.md` |
| Security Issues | `../03-app-issues/05-security-issues.md` → SEC-WEBHOOK-001 |
| Domain Enums | `../01-fundamentals/01-data-model.md` → Domain Enums section |
