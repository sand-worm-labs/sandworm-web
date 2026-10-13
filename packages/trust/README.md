# @sandworm/trust

An onchain receipt for a Sandworm finding, on Monad mainnet (chain 143), using the
ERC-8004 registries that are already deployed. No Solidity.

A Sandworm agent publishes a finding together with a receipt of **exactly what it ran**.
A second wallet re-checks the receipt and attests onchain.

## What it proves

- **Who made it.** The finding is tied to one agent identity (an ERC-8004 agent id), and only
  that agent's wallet can ask for it to be validated.
- **Exactly what was run.** The receipt holds the cells' code, data source and parameters, and
  the time they ran. Its hash is recorded onchain. Editing the notebook afterwards no longer matches it.
- **That it was checked by someone else.** A separate validator wallet re-ran the notebook and
  posted a verdict onchain, with a report of what it saw.

## What it does not prove

- **That the logic is correct.** A receipt says what was run, not whether it was the right thing to run.
- **That the data source is honest.** The receipt names it; it cannot vouch for it.
- **That the numbers today equal the numbers then.** Output is deliberately not hashed: row counts
  and values change as the data does. The receipt commits to the inputs and to *when* they ran, so a
  later difference in results is explained by time, and tells you nothing about tampering unless the code differs.

The validator's verdict is 100 when every check passes, otherwise 0:

| Check | Meaning |
| --- | --- |
| `receiptMatchesRequest` | The receipt fetched from the URI hashes to the `requestHash` onchain |
| `inputHashConsistent` | The cells inside the receipt hash to the hashes it states |
| `notebookStillMatches` | The notebook's cells today have the same code as the receipt (a re-run does not count as a change) |
| `reran` | Re-running the notebook completes with every chosen cell successful |

## Addresses (Monad mainnet, chain 143)

| Registry | Address |
| --- | --- |
| Identity | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` |
| Reputation (not used yet) | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` |
| Validation | `0x8004Cc8439f36fd5F9F049D9fF86523Df6dAAB58` |

ABIs are copied from [erc-8004/erc-8004-contracts](https://github.com/erc-8004/erc-8004-contracts) (`abis/`).

## Where it is used

- **API** (`apps/api/src/features/trust`): `attestNotebook` signs the receipt with the server's agent
  wallet and the validator's verdict with a second wallet, and `submitBountyEntry` accepts a notebook only
  if `TrustService.trusted` passes. That check is made from the chain and from the notebook, not from the
  database alone: the validator's verdict is 100 and the validator is trusted, the agent and validator are
  different wallets, the receipt matches its hash, the code is unchanged since, and every cell of the notebook
  is covered. The settings are in `apps/api/.env.example` (`TRUST_*`).
- **MCP** (`apps/mcp/src/tools/bounties`): `list_bounties`, `get_bounty`, `start_bounty`,
  `check_notebook_trust`, `attest_notebook`, `submit_to_bounty`, `list_bounty_entries` and `my_bounty_entries`.
  An agent builds and runs the notebook, attests it, publishes it, and submits it.
- **Web**: the bounty submit dialog has a Verify step, and the submissions table shows who is verified,
  linked to the validator's transaction.
- **Scripts** (below): the same steps by hand, with your own wallets.

## How to run the scripts

```bash
cd packages/trust
cp .env.example .env     # fill in the two private keys, the notebook, the token
pnpm install             # once, from the repo root, with `pnpm dev` stopped

pnpm register-agent      # 1. mint the agent identity, saves the agentId
pnpm build-receipt       # 2. read the notebook, hash its inputs and run time, pin the receipt
pnpm request-validation  # 3. the agent asks the validator to check it
pnpm validate            # 4. the validator re-checks and posts its verdict
pnpm links               # 5. print the explorer links
```

State is kept in `out/state.json`. Keys come from the environment only and are never written down.
Use two different wallets: the agent's wallet owns the agent id, the validator's does not.

- Set `PINATA_JWT` to pin to IPFS. Without it the files travel as `data:` URIs, which are just as
  checkable (the hash is onchain) but not on IPFS.
- The notebook should have been **run** before step 2: a cell that never ran has no run time, and
  the script refuses to build a receipt without one.
- The validator needs a Sandworm token that can read the notebook and re-run it. A published
  notebook is enough; the re-run happens on the validator's own copy and changes nothing.
- `pnpm test` checks hashing and the cell reader without a network.

## The receipt

`sandworm-input-receipt/v1`, canonical JSON (sorted keys): `agentId`, `finding`, `notebook`,
`inputs` (per cell: id, kind, source, dataSource, dataframe), `ranAt`, `codeHash` (code only),
`inputHash` (code and run time), `blockNumber` (a Monad block as a time anchor), `createdAt`.
`requestHash = keccak256(receipt bytes)`, and the bytes are pinned exactly as hashed.

## Roadmap

Reputation feedback, validator staking, publishing automatically from a Sandworm notebook,
several validators, and checking the output against a data version.
