# Deployment Guide

## Stack

- **Apps** — PM2 (api, web, landing, ai)
- **Infra** — Docker Compose (Postgres, Redis, Qdrant, Portainer, Logdy, Jupyter)
- **Proxy** — Traefik, run by Coolify (auto HTTPS via Let's Encrypt)

> Staging and production are moving to Coolify: see [deployment/coolify/README.md](../deployment/coolify/README.md).

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
| `setup-mcp-envs.sh [dev\|staging\|prod]` | Fill `apps/mcp/.env` and the matching MCP vars in `apps/api/.env` (run by `setup-domain-envs.sh`) |

---

## Proxy

Production and staging: Traefik, run by Coolify. Routes are labels in
`deployment/coolify/stack/docker-compose.yml`; see `deployment/coolify/README.md`.

Local dev only: Caddy with `deployment/caddy/Caddyfile.dev` (plain HTTP, `localhost` upstreams).

---

## DNS Records (Production)

```
sandwormlab.xyz          A  <PROD_SERVER_IP>
www.sandwormlab.xyz      A  <PROD_SERVER_IP>
app.sandwormlab.xyz      A  <PROD_SERVER_IP>
mcp.sandwormlab.xyz      A  <PROD_SERVER_IP>
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
