# Smart Features

**Version:** 1.2.0  
**Updated:** 2026-04-09  
**AI Confidence:** Medium  
**Ambiguity:** Medium  
**Priority:** P3 — Future  
**Resolves:** SEC-WEBHOOK-001

---

## Keywords

`weather`, `location`, `webhook`, `voice`, `timezone`, `native`, `ssrf`

---

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

```rust
use std::net::IpAddr;
use url::Url;

/// Validate a webhook URL before allowing it to be saved or called.
pub fn validate_webhook_url(url_str: &str) -> Result<Url, WebhookError> {
    let url = Url::parse(url_str).map_err(|_| WebhookError::InvalidUrl)?;

    // 1. Scheme must be HTTPS (reject HTTP in production)
    if url.scheme() != "https" {
        return Err(WebhookError::InsecureScheme);
    }

    // 2. Reject localhost and loopback
    let host = url.host_str().ok_or(WebhookError::MissingHost)?;
    let blocked_hosts = ["localhost", "127.0.0.1", "::1", "0.0.0.0",
                         "[::1]", "host.docker.internal", "metadata.google.internal"];
    if blocked_hosts.contains(&host) {
        return Err(WebhookError::BlockedHost);
    }

    // 3. Resolve DNS and check for private/reserved IP ranges
    if let Ok(ip) = host.parse::<IpAddr>() {
        if is_private_ip(&ip) {
            return Err(WebhookError::PrivateIp);
        }
    }

    // 4. Reject non-standard ports (only 443 for HTTPS)
    if let Some(port) = url.port() {
        if port != 443 {
            return Err(WebhookError::NonStandardPort);
        }
    }

    Ok(url)
}

fn is_private_ip(ip: &IpAddr) -> bool {
    match ip {
        IpAddr::V4(v4) => {
            v4.is_loopback()           // 127.0.0.0/8
            || v4.is_private()         // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
            || v4.is_link_local()      // 169.254.0.0/16
            || v4.is_broadcast()       // 255.255.255.255
            || v4.is_unspecified()     // 0.0.0.0
            || v4.octets()[0] == 100   // 100.64.0.0/10 (CGNAT)
        }
        IpAddr::V6(v6) => {
            v6.is_loopback()           // ::1
            || v6.is_unspecified()     // ::
            // Link-local: fe80::/10
            || (v6.segments()[0] & 0xffc0) == 0xfe80
            // Unique local: fc00::/7
            || (v6.segments()[0] & 0xfe00) == 0xfc00
        }
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

pub async fn fire_webhook(url: &Url, payload: &WebhookPayload) -> Result<(), WebhookError> {
    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .redirect(reqwest::redirect::Policy::none())  // NO redirects
        .user_agent("AlarmApp/1.0 Webhook")
        .build()?;

    let response = client
        .post(url.as_str())
        .json(payload)
        .send()
        .await;

    match response {
        Ok(resp) => {
            tracing::info!(
                url = %url, status = %resp.status(),
                "Webhook delivered"
            );
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

## Cross-References

| Reference | Location |
|-----------|----------|
| Platform Constraints | `../01-fundamentals/04-platform-constraints.md` |
| Alarm Firing | `./03-alarm-firing.md` |
| Security Issues | `../03-app-issues/05-security-issues.md` → SEC-WEBHOOK-001 |
