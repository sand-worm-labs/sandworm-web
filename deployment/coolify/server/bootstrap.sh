#!/usr/bin/env bash
# Turns a fresh Ubuntu 22.04/24.04 server into a Sandworm Coolify host. Same
# script for staging and production. Safe to run again.
#
# Usage (as root, on the server):
#   ./bootstrap.sh [--swap 4G] [--ssh-port 22] [--yes]
#
# What it does:
#   1. Updates the system and turns on unattended security upgrades.
#   2. Adds swap if there is none (Next.js builds and Jupyter are memory hungry).
#   3. Firewall: only SSH, 80 and 443 are open. Docker publishes ports past ufw,
#      so Coolify's own ports (8000 dashboard, 6001/6002 realtime and terminal)
#      are also dropped from outside through the DOCKER-USER chain. Reach the
#      dashboard over an SSH tunnel until it has its own domain (see README).
#   4. fail2ban for SSH.
#   5. Installs Coolify (which installs Docker and its Traefik proxy).
#   6. Installs restic and creates the shared sandworm-monitoring network.
#
# It never touches sshd's configuration: a wrong change there locks you out.
set -euo pipefail

SWAP_SIZE=4G
SSH_PORT=22
ASSUME_YES=false

while [ $# -gt 0 ]; do
  case "$1" in
    --swap) SWAP_SIZE="$2"; shift 2 ;;
    --ssh-port) SSH_PORT="$2"; shift 2 ;;
    --yes) ASSUME_YES=true; shift ;;
    -h|--help) sed -n '2,21p' "$0"; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
done

log() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }

[ "$(id -u)" -eq 0 ] || { echo "Run as root." >&2; exit 1; }
. /etc/os-release
[ "${ID:-}" = "ubuntu" ] || { echo "This script expects Ubuntu (found ${ID:-unknown})." >&2; exit 1; }

# The SSH port must be the one you are connected on, or enabling the firewall
# cuts the session.
CURRENT_SSH_PORT="$(echo "${SSH_CONNECTION:-}" | awk '{print $4}')"
if [ -n "$CURRENT_SSH_PORT" ] && [ "$CURRENT_SSH_PORT" != "$SSH_PORT" ]; then
  echo "You are connected on port $CURRENT_SSH_PORT but --ssh-port is $SSH_PORT. Refusing, to keep you from being locked out." >&2
  exit 1
fi

EXT_IF="$(ip route get 1.1.1.1 | awk '{for (i=1;i<=NF;i++) if ($i=="dev") {print $(i+1); exit}}')"
[ -n "$EXT_IF" ] || { echo "Could not find the public network interface." >&2; exit 1; }

cat <<EOF
This will, on $(hostname) (public interface $EXT_IF):
  - upgrade packages and enable unattended security upgrades
  - add ${SWAP_SIZE} swap if there is none
  - enable ufw: allow SSH ($SSH_PORT), 80, 443; drop Coolify's 8000/6001/6002 from outside
  - install fail2ban, restic, and Coolify (with Docker and Traefik)
EOF
if [ "$ASSUME_YES" != true ]; then
  read -r -p "Continue? [y/N] " answer
  [ "$answer" = "y" ] || [ "$answer" = "Y" ] || exit 1
fi

export DEBIAN_FRONTEND=noninteractive

log "Updating packages"
apt-get update -q
apt-get upgrade -yq
apt-get install -yq curl ca-certificates jq ufw fail2ban unattended-upgrades restic

log "Unattended security upgrades"
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF

log "Swap"
if swapon --show | grep -q .; then
  echo "Swap already on, leaving it."
else
  fallocate -l "$SWAP_SIZE" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl -w vm.swappiness=10
  echo 'vm.swappiness=10' > /etc/sysctl.d/99-swappiness.conf
fi

log "Firewall"
# Docker's published ports bypass ufw's INPUT rules. DOCKER-USER runs first for
# container traffic, so drop Coolify's own ports there for anything arriving on
# the public interface. Localhost (an SSH tunnel) still reaches them.
MARK_BEGIN="# BEGIN sandworm DOCKER-USER"
MARK_END="# END sandworm DOCKER-USER"
if ! grep -q "$MARK_BEGIN" /etc/ufw/after.rules; then
  cat >> /etc/ufw/after.rules <<EOF

$MARK_BEGIN
*filter
:DOCKER-USER - [0:0]
-A DOCKER-USER -i $EXT_IF -p tcp -m conntrack --ctorigdstport 8000 --ctdir ORIGINAL -j DROP
-A DOCKER-USER -i $EXT_IF -p tcp -m conntrack --ctorigdstport 6001 --ctdir ORIGINAL -j DROP
-A DOCKER-USER -i $EXT_IF -p tcp -m conntrack --ctorigdstport 6002 --ctdir ORIGINAL -j DROP
-A DOCKER-USER -j RETURN
COMMIT
$MARK_END
EOF
fi
ufw default deny incoming
ufw default allow outgoing
ufw limit "$SSH_PORT/tcp" comment 'SSH'
ufw allow 80/tcp comment 'HTTP (Traefik)'
ufw allow 443/tcp comment 'HTTPS (Traefik)'
ufw allow 443/udp comment 'HTTP/3 (Traefik)'
ufw --force enable
ufw reload

log "fail2ban"
systemctl enable --now fail2ban

log "Coolify"
if [ -d /data/coolify/source ]; then
  echo "Coolify is already installed. Upgrade it from its dashboard."
else
  # The official installer: installs Docker, Coolify and its Traefik proxy.
  curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
fi

log "Shared monitoring network"
docker network inspect sandworm-monitoring >/dev/null 2>&1 || docker network create sandworm-monitoring

log "Done"
cat <<EOF
Next:
  1. Open the dashboard through a tunnel from your machine:
       ssh -L 8000:localhost:8000 -L 6001:localhost:6001 -L 6002:localhost:6002 root@<server>
     then http://localhost:8000. Create the admin account right away.
  2. Let Docker pull private images:  docker login ghcr.io  (a token with read:packages)
  3. Backups: follow "Backups (restic)" in deployment/coolify/README.md
  4. Recommended by hand (not done here): key-only SSH, no root password login.
EOF
