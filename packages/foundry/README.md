# @sandworm/foundry

The Sandworm bounty escrow contract: a sponsor locks a stablecoin reward for a bounty, winners are paid from it, and whatever is left goes back to the sponsor.

## Deployments

| Network | Chain ID | Address | Tokens accepted |
|---|---|---|---|
| Robinhood Chain testnet | 46630 | [`0xad903cC1ca34d7b86bE44Ff64a69B1C0F03FB788`](https://explorer.testnet.chain.robinhood.com/address/0xad903cC1ca34d7b86bE44Ff64a69B1C0F03FB788) | USDG `0x7E955252E15c84f5768B83c41a71F9eba181802F` |

The contract is verified on Blockscout. Current settings: fee 5%, judging period 14 days. Owner, treasury and arbiter are all the testnet deployer wallet `0xD3db10a52a789D7B75A325759FA4915AA49291ce`, so this deployment is for testing only.

The deploy script also knows these networks, none deployed yet:

| Network | Chain ID | Tokens accepted |
|---|---|---|
| Robinhood Chain | 4663 | USDG `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168` |
| Arbitrum One | 42161 | USDC `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`, USDG `0x004B506865409877C9fA29bfb1ebA929984B9bbC` |
| Arbitrum Sepolia | 421614 | USDC `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`, USDG `0xFFC95faa3d63Cde504a05B567C600B78C0b41892` |

## How it works

Roles:

| Role | Can |
|---|---|
| Sponsor | Lock a reward with `createBounty`. Pay winners with `award` at any time. Take back what was not awarded with `refund`, once 14 days have passed since the deadline. |
| Winner | Nothing onchain. Receives their award, less the fee, in their wallet. |
| Arbiter | Call `award` after the deadline. Call `refund` at any time to cancel a bounty; the money only ever goes back to the sponsor. |
| Owner | Allow or disallow tokens, and change the treasury, arbiter and fee. Cannot move locked funds. |

Flow:

1. The sponsor calls `createBounty(token, amount, deadline, ref)`, or `createBountyWithPermit` to approve and deposit in one transaction. `ref` links the bounty to its record in Sandworm, for example the hash of its slug.
2. The sponsor calls `award(id, winners, amounts)` with one or more winners. Each receives their amount less the fee; the fee goes to the treasury. The call can be repeated until the reward is used up.
3. Once the deadline plus 14 days has passed, `refund(id)` returns the unawarded balance to the sponsor and closes the bounty.

Rules worth knowing:

- Only tokens on the allowlist are accepted.
- The fee, up to 10%, is fixed for each bounty when it is created. Later changes do not affect it.
- A bounty never pays out more than it holds, and one bounty's funds cannot be used for another.
- The contract does not check the prize split a sponsor advertises, only that the total stays within the reward.

## Setup

```bash
forge soldeer install
forge test
```

The tests cover each action, who may call what and when, edge cases at the deadlines, and an invariant test that the contract always holds exactly what open bounties still owe.

## Deploy

Create a deployer account once. This makes a new encrypted keystore and prints its address, which you then fund with gas:

```bash
cast wallet new ~/.foundry/keystores <account-name>
```

Deploy and verify:

```bash
SENDER=$(cast wallet address --account <account-name>)
forge script script/DeployBountyEscrow.s.sol \
  --rpc-url robinhoodTestnet \
  --account <account-name> \
  --sender $SENDER \
  --broadcast \
  --verify --verifier blockscout \
  --verifier-url https://explorer.testnet.chain.robinhood.com/api/
```

- Always pass `--sender`. Without it Foundry uses its default address and refuses to broadcast.
- For Robinhood Chain mainnet use `--rpc-url robinhood` and `--verifier-url https://robinhoodchain.blockscout.com/api/`.
- For Arbitrum, use the `arbitrumSepolia` or `arbitrum` RPC names and set `ETHERSCAN_API_KEY` in `.env`.
- The treasury and arbiter default to the deployer, and the fee to 5%. Set `TREASURY`, `ARBITER` or `FEE_BPS` in `.env` to change them.
- The script writes the new address to `deployments/<chain id>.json`.
- The scaffold's `pnpm deploy` script is not used. `pnpm deploy` is a built-in pnpm command, and the script's ABI export step points at a folder that does not exist in this repo.

## Demo tokens (testnet only)

`script/DeployDemoTokens.s.sol` deploys ten mintable test tokens (USDG, USDC, USDT, DAI, PYTH, ARB, UNI, OP, MNT, WETH), mints 1,000,000 of each to the deployer, and allows them in the escrow. It must be run by the escrow's owner. Then run `pnpm export` so the web app and API accept them: it reads the broadcast and writes `packages/types/src/escrow/demoTokens.ts`.

```bash
ESCROW=0xad903cC1ca34d7b86bE44Ff64a69B1C0F03FB788 forge script script/DeployDemoTokens.s.sol \
  --rpc-url robinhoodTestnet \
  --account <account-name> \
  --sender $(cast wallet address --account <account-name>) \
  --broadcast \
  --verify --verifier blockscout \
  --verifier-url https://explorer.testnet.chain.robinhood.com/api/
pnpm export
```

## Before using real funds

- The contract has not been audited.
- The arbiter can award a bounty to any address after its deadline. Use a multisig for it, not a single wallet.
- Deploy mainnet with a wallet you control, not a throwaway one.
