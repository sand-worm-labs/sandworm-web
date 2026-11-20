# Deploying Sandworm on Coolify

Everything that runs Sandworm in staging and production: one server per
environment, managed by Coolify, with Traefik in front, Prometheus + Grafana
and Uptime Kuma watching it, and restic backing it up offsite.

```
deployment/coolify/
  server/bootstrap.sh        fresh Ubuntu → Coolify host (firewall, swap, Coolify, restic)
  server/restic/             nightly backup + restore, systemd timer
  docker/node.Dockerfile     api, web, terminal, landing, mcp (one recipe, APP build arg)
  docker/ai.Dockerfile       the AI service (apps/ai submodule)
  stack/docker-compose.yml   the product: apps, data, Traefik routing, migrations
  stack/.env.example         every setting the stack reads
  deploy.sh                  settings → Coolify + GitHub, then build and deploy (replaces start-prod.sh)
  monitoring/                Prometheus, Grafana, exporters, alert rules, Kuma checklist
.github/workflows/images.yml build → GHCR → deploy on Coolify
```

Settings and secrets live in Coolify and in GitHub environments, never in git.

## How it fits together

- **CI builds images.** A push to `staging` (or `main`) builds all seven images,
  tags them `staging` (or `production`), pushes them to GHCR and calls Coolify's
  deploy API. The server never builds anything, so builds can't starve live traffic.
- **Coolify runs one compose stack per server**, from `stack/docker-compose.yml`
  in this repo. Staging and production run the same file; only env values differ.
- **Traefik routes by labels in that file.** `app.` splits by path: `/api`,
  `/socket.io`, the OAuth discovery document and `/authorize|/token|/register`
  go to the api, `/yjs` to the api's live-editing socket (port 8005), the rest to
  web. `terminal.` sends `/api` to the api too, so cookies work without CORS.
- **Migrations run before the api starts**, as the one-shot `migrate` service.
  A failed migration stops the deploy: the api never runs against an old schema.
- **mcp runs exactly one replica**: it runs the notebook scheduler.

## Setting up a server (staging first)

1. **Server.** Fresh Ubuntu 22.04/24.04, at least 4 vCPU / 8 GB (Jupyter and
   Next.js are hungry). Add your SSH key.
2. **DNS.** A records to the server's IP: `app.`, `terminal.`, `mcp.`,
   `grafana.` and the bare domain (staging: under `staging.sandwormlab.xyz`).
3. **Bootstrap.** Copy `server/` to the server and run as root:
   ```bash
   ./bootstrap.sh            # asks before changing anything
   ```
4. **Coolify dashboard** over an SSH tunnel (its ports are closed to the internet):
   ```bash
   ssh -L 8000:localhost:8000 -L 6001:localhost:6001 -L 6002:localhost:6002 root@<server>
   ```
   Open http://localhost:8000 and create the admin account straight away.
5. **GHCR access** on the server: `docker login ghcr.io` with a GitHub token that
   has `read:packages`.
6. **Traefik timeouts.** Servers > your server > Proxy: under the `https` (and
   `http`) entrypoint add
   `--entrypoints.https.transport.respondingTimeouts.readTimeout=0` (and the same
   for `http`), then restart the proxy. Traefik v3 otherwise cuts uploads that
   take longer than 60s.
7. **The stack.** New resource > Docker Compose > from this GitHub repo, branch
   `staging`, compose path `deployment/coolify/stack/docker-compose.yml`. Leave
   every service's domain empty (Traefik labels do the routing). Don't deploy yet.
8. **Access for deploy.sh.** Create a Coolify API token (Keys & Tokens, write +
   deploy) and put it, with the stack's UUID, in
   `~/.config/sandworm/coolify-staging.env` on your machine (see `deploy.sh`'s
   header). In GitHub, create the `staging` environment (Settings > Environments)
   with variables `COOLIFY_URL`, `COOLIFY_RESOURCE_UUID` and secret
   `COOLIFY_TOKEN`, so CI can deploy; plus repository secret `SUBMODULES_TOKEN`
   if `apps/ai` is private.
9. **Settings.** You don't write env files by hand: `deploy.sh` makes them from
   your root `sandworm-*.env` files and works out every domain-based value.
   ```bash
   deployment/coolify/deploy.sh secrets staging         # its own sign-in, DB and token secrets
   deployment/coolify/deploy.sh envs staging --write    # sandworm-stack-staging.env to look over
   deployment/coolify/deploy.sh envs staging --apply    # send to Coolify + GitHub
   ```
   Staging needs its own secrets: with production's, a token signed on staging
   would be accepted by production (the script warns). Add the staging callback
   URLs to the Google and GitHub OAuth apps.
10. **First deploy.** `deployment/coolify/deploy.sh staging` runs the `images`
    workflow and follows it; `--no-build` just redeploys. A push to the
    `staging` branch does the same. (Running the workflow by hand needs it on
    `main` first: GitHub only offers "Run workflow" for workflows on the default
    branch. Until then, push to `staging`.)
11. **Monitoring.** New resource > Docker Compose, compose path
    `deployment/coolify/monitoring/docker-compose.yml`, env from
    `monitoring/.env.example`. In Grafana: set a contact point (Alerting >
    Contact points) as the default, and import dashboards 1860 (server),
    14282 (containers), 9628 (Postgres) and 763 (Redis).
12. **Uptime Kuma** on a second box: `monitoring/uptime-kuma.md`.
13. **Backups**: below.

## Backups (restic)

```bash
mkdir -p /opt/sandworm /etc/sandworm
cp -r server/restic /opt/sandworm/restic
cp server/restic/restic.env.example /etc/sandworm/restic.env    # fill it in
openssl rand -base64 48 > /etc/sandworm/restic.password
chmod 600 /etc/sandworm/restic.env /etc/sandworm/restic.password
/opt/sandworm/restic/backup.sh                                   # first run, by hand
cp /opt/sandworm/restic/sandworm-backup.{service,timer} /etc/systemd/system/
systemctl daemon-reload && systemctl enable --now sandworm-backup.timer
```

**Put the restic password in your password manager.** Without it the backups
can't be read.

It backs up the Postgres dump, a Qdrant snapshot, the Jupyter volume, and
Coolify itself (`/data/coolify` plus its database). Redis isn't backed up: it
holds caches and short-lived state.

### Restore

```bash
/opt/sandworm/restic/restore.sh list
/opt/sandworm/restic/restore.sh files /var/tmp/restore            # look before you load
/opt/sandworm/restic/restore.sh postgres latest --yes             # stop the api first
```

Qdrant: upload `qdrant.snapshot` from the restored files with Qdrant's snapshot
upload API, or start a fresh Qdrant with `--storage-snapshot`. Jupyter: copy the
restored volume directory back into the `jupyter-work` volume.

**Restore on staging at least once before cutover.** A backup that has never
been restored isn't one yet.

## Moving production over

1. Staging works end to end: sign-in (Google, GitHub), notebooks run, chat
   streams, live editing syncs, MCP OAuth from a real client, terminal sign-in.
2. Set up the production server the same way (`main` branch, `production`
   GitHub environment, production hostnames, `LANDING_WWW_HOST=www.sandwormlab.xyz`).
   Deploy it once against an empty database to check it boots.
3. A day before: lower the DNS TTL of every record to 300s.
4. Cutover (about 30 minutes):
   - stop writes on the old server: `pm2 stop api mcp` (web shows errors meanwhile)
   - dump the old database:
     `docker exec sandworm-postgres pg_dump -U postgres -d sandworm -Fc > sandworm.dump`
   - Qdrant: take a snapshot on the old server the same way `backup.sh` does
   - copy the dumps to the new server; stop the new stack's api, mcp and migrate;
     `pg_restore --clean --if-exists --no-owner` into the new postgres; load the
     Qdrant snapshot; start the stack (migrations then run on the restored data)
   - point DNS at the new server; watch Uptime Kuma and Grafana
5. **Rollback**: DNS back to the old server and `pm2 start api mcp`. Writes
   made on the new server after cutover would be lost, so decide within the
   first hour.
6. After a week with good backups and a test restore: turn off the old server,
   then remove `ecosystem.config.js`, `push-envs.sh`, `push-prod-envs.sh`,
   `scripts/start-prod.sh`, `stop-prod.sh`, `rebuild.sh` and `deployment/docker/docker-compose.yml`.
   (The production Caddyfile is already gone from the repo: don't `git pull` and
   restart the infra compose on the old server before cutover, or it loses its proxy.)

## Check on staging first

Things written to Coolify's conventions that only a real deploy proves:

- Coolify passes its env vars to `env_file: .env` (the api and migrate use it).
- Coolify's proxy joins the stack's network, so the Traefik labels route.
  If routes 404, add the label `traefik.docker.network` with the stack's network name.
- `$$` in the OAuth rewrite labels reaches Traefik as a single `$`.
- `exclude_from_hc` keeps the finished `migrate` container from marking the stack unhealthy.
- The web and terminal builds don't need the api during `next build`.
