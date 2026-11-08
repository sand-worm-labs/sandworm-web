# Uptime Kuma

Uptime Kuma tells you when something is down. Run it **off the main server**: a
second small VPS, so it can still alert when the main server is the thing that
died. Its checks are set in its web UI, so this file is the list to enter.

## Install (on the second box)

```bash
docker run -d --name uptime-kuma --restart unless-stopped \
  -p 127.0.0.1:3001:3001 -v uptime-kuma:/app/data louislam/uptime-kuma:1
```

Put it behind HTTPS (Caddy or Traefik on that box, e.g. `status.sandwormlab.xyz`),
or reach it over an SSH tunnel. Create the admin account on first visit, then
add a notification (Discord, Slack, Telegram or email) and tick
"Default enabled" so every monitor uses it.

## Monitors

Interval 60s, retries 2 unless noted. Replace `<domain>` with
`sandwormlab.xyz` (production) or `staging.sandwormlab.xyz` (staging).

| Name | Type | Target | Expect |
|---|---|---|---|
| Web app | HTTP(s) | `https://app.<domain>/` | 200 |
| API | HTTP(s) - Keyword | `https://app.<domain>/.well-known/oauth-authorization-server` | keyword `issuer` |
| Terminal | HTTP(s) | `https://terminal.<domain>/` | 2xx/3xx |
| MCP | HTTP(s) | `https://mcp.<domain>/health` | 200 |
| Landing | HTTP(s) | `https://<domain>/` (production: `https://sandwormlab.xyz/`) | 200 |
| Live editing (Yjs) | TCP Port | `app.<domain>` port 443 | open |
| TLS expiry | (on each HTTP monitor) | tick "Certificate Expiry Notification" | warns 14 days ahead |
| Nightly backup | Push | copy its URL into `BACKUP_PING_URL` in `/etc/sandworm/restic.env` | heartbeat interval 26h |
| Grafana | HTTP(s) | `https://grafana.<domain>/api/health` | 200 |

The backup Push monitor turns a silent failure into an alert: if the nightly
backup doesn't check in within 26 hours, Kuma says so.
