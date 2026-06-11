# Deployment Guide

## Stack

- **Apps** — PM2 (api, web, landing, ai)
- **Infra** — Docker Compose (Postgres, Redis, Qdrant, Caddy, Portainer, Logdy, Jupyter)
- **Proxy** — Caddy (auto HTTPS via Let's Encrypt)

---

## Deploy

### Staging
```bash
./scripts/start-prod.sh staging
```

### Production
```bash
./scripts/start-prod.sh prod
```

### Dev
```bash
./scripts/start-dev.sh
```

The start script handles everything in order: env setup → domain config → Docker services → build → PM2.

---

## Stop

```bash
./scripts/stop-prod.sh
```

---

## Scripts

| Script | What it does |
|---|---|
| `start-prod.sh [staging\|prod]` | Full deploy — envs, Docker, build, PM2 |
| `start-dev.sh` | Start dev environment |
| `stop-prod.sh` | Stop all apps and Docker services |
| `setup-envs.sh` | Create `.env` files from scratch if missing |
| `setup-domain-envs.sh [dev\|staging\|prod]` | Patch domain-related vars in all `.env` files |

---

## Caddy (Proxy)

Caddy runs as a Docker container and handles routing and automatic SSL.

| Config | Used for |
|---|---|
| `deployment/caddy/Caddyfile.dev` | Local dev — plain HTTP, `localhost` upstreams |
| `deployment/caddy/Caddyfile.staging` | Staging — HTTPS, basic auth, `host.docker.internal` upstreams |
| `deployment/caddy/Caddyfile.prod` | Production — HTTPS, `localhost` upstreams |

SSL certs are stored in the `sandworm-caddy-data` Docker volume and auto-renewed.

### Requirements for HTTPS
- DNS A records pointing to the server IP
- Ports 80 and 443 open:
```bash
sudo ufw allow 80 && sudo ufw allow 443
```

---

## DNS Records (Production)

```
sandwormlab.xyz          A  <PROD_SERVER_IP>
www.sandwormlab.xyz      A  <PROD_SERVER_IP>
app.sandwormlab.xyz      A  <PROD_SERVER_IP>
```

---

## Portainer

Docker management UI. Port is not public — access via SSH tunnel:
```bash
ssh -L 9000:localhost:9000 root@<SERVER_IP>
```
Then open `http://localhost:9000`.

---

## Common Issues

**`wss://null` in browser console**
`NEXT_PUBLIC_*` vars are baked in at build time. Re-run envs then rebuild:
```bash
./scripts/setup-domain-envs.sh staging  # or prod
pnpm --filter web build
pm2 restart web
```

**SSL cert not issuing**
```bash
sudo ufw status                          # check ports 80/443 open
docker logs sandworm-proxy --tail 50    # check Caddy logs
```

**Cookie / auth not working**
- Always access via the domain, not the server IP
- `localhost` and `127.0.0.1` are different origins — always use `localhost`
- Rebuild web after any domain env change

**Redis not receiving events**
```bash
docker exec -it sandworm-redis redis-cli PSUBSCRIBE 'job:*'
```

**PM2 app down**
```bash
pm2 logs api    # tail API logs
pm2 restart all
```
