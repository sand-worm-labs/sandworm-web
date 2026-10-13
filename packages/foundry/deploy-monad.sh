#!/usr/bin/env bash
# Deploys BountyEscrow and the demo tokens to Monad testnet, then exports the
# addresses to packages/types. Usage: ./deploy-monad.sh <keystore name>
# The keystore password is asked once and never written to disk.
set -euo pipefail
cd "$(dirname "$0")"

ACCOUNT="${1:?Usage: ./deploy-monad.sh <keystore name>  (see ~/.foundry/keystores)}"
RPC=monad_testnet
CHAIN_ID=10143
EXPECTED=0xd3db10a52a789d7b75a325759fa4915aa49291ce

read -rs -p "Keystore password for $ACCOUNT: " PASSWORD && echo

ADDRESS=$(cast wallet address --account "$ACCOUNT" --password "$PASSWORD")
if [ "${ADDRESS,,}" != "$EXPECTED" ]; then
  echo "Keystore $ACCOUNT is $ADDRESS, not the usual deployer $EXPECTED." >&2
  read -r -p "Deploy with it anyway? [y/N] " ok && [ "$ok" = y ] || exit 1
fi
echo "Deployer $ADDRESS: $(cast balance "$ADDRESS" --rpc-url $RPC --ether) MON"

echo "== 1/3 BountyEscrow"
forge script script/DeployBountyEscrow.s.sol --rpc-url $RPC --account "$ACCOUNT" \
  --password "$PASSWORD" --broadcast --legacy --ffi

ESCROW=$(python3 - <<PY
import json
run = json.load(open("broadcast/DeployBountyEscrow.s.sol/$CHAIN_ID/run-latest.json"))
print(next(t["contractAddress"] for t in run["transactions"]
           if t["transactionType"] == "CREATE" and t["contractName"] == "BountyEscrow"))
PY
)
echo "BountyEscrow at $ESCROW"

echo "== 2/3 Demo tokens"
ESCROW="$ESCROW" forge script script/DeployDemoTokens.s.sol --rpc-url $RPC --account "$ACCOUNT" \
  --password "$PASSWORD" --broadcast --legacy

echo "== 3/3 Export to packages/types"
pnpm export
echo "Done. Restart pnpm dev."
