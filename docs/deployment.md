# Deployment Guide

Staging and production run on Coolify: see [deployment/coolify/README.md](../deployment/coolify/README.md).
`deployment/coolify/deploy.sh` makes their settings and deploys them, and
`deployment/coolify/local/test.sh` runs the same stack on your machine first.

This page is about running Sandworm locally.

## Dev

```bash
./scripts/start-dev.sh             # everything
./scripts/start-dev.sh --web       # Postgres, Redis, Caddy, API, web
./scripts/start-dev.sh --web --only
```

| Script | What it does |
|---|---|
| `start-dev.sh` | Env setup, Docker services, migrations, then `turbo dev` |
| `setup-envs.sh` | Create the apps' `.env` files if missing |
| `setup-domain-envs.sh` | Set the dev URLs in every `.env` (run by `start-dev.sh`) |
| `setup-mcp-envs.sh` | Fill `apps/mcp/.env` and the matching MCP vars in `apps/api/.env` (run by `setup-domain-envs.sh`) |

## Proxy

Dev: Caddy with `deployment/caddy/Caddyfile.dev`. Like Traefik in production, it puts the app
and the API on one origin (`localhost:8081`), so cookies work without CORS.

Staging and production: Traefik, run by Coolify. Routes are labels in
`deployment/coolify/stack/docker-compose.yml`.

## Common issues

**`wss://null` in the browser console**
`NEXT_PUBLIC_*` vars are baked in at build time. In dev, re-run `scripts/setup-domain-envs.sh`
and restart web. On Coolify they come from the GitHub environment: `deploy.sh envs <env> --apply`,
then redeploy.

**Cookie / auth not working**
- Use `localhost:8081`, not `127.0.0.1` or the dev server's own port
- Restart web after any domain env change

**Redis not receiving events**
```bash
docker exec -it sandworm-redis redis-cli PSUBSCRIBE 'job:*'
```
