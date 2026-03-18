import type { TemplateMap } from "../types.js";

export const PRIMITIVES_TEMPLATES: TemplateMap = {

  "primitives.erc20_transfers": `
SELECT
  block_time,
  tx_hash,
  "from",
  "to",
  value / POW(10, decimals) AS amount,
  symbol,
  contract_address
FROM erc20.transfers
WHERE blockchain = '{{chain}}'
  AND LOWER(contract_address) = LOWER('{{token_address}}')
  AND (
    '{{wallet}}' = ''
    OR LOWER("from") = LOWER('{{wallet}}')
    OR LOWER("to")   = LOWER('{{wallet}}')
  )
  {{__time_where}}
ORDER BY block_time DESC
LIMIT {{limit}}
`,

  "primitives.token_holders": `
WITH net_balances AS (
  SELECT
    address,
    SUM(amount) AS balance
  FROM (
    SELECT "to"   AS address,  value / POW(10, decimals) AS amount
    FROM erc20.transfers
    WHERE blockchain = '{{chain}}'
      AND LOWER(contract_address) = LOWER('{{token_address}}')
    UNION ALL
    SELECT "from" AS address, -value / POW(10, decimals) AS amount
    FROM erc20.transfers
    WHERE blockchain = '{{chain}}'
      AND LOWER(contract_address) = LOWER('{{token_address}}')
  ) t
  GROUP BY address
  HAVING SUM(amount) > 0
)
SELECT
  address,
  balance,
  balance / SUM(balance) OVER () * 100 AS pct_supply,
  ROW_NUMBER() OVER (ORDER BY balance DESC) AS rank
FROM net_balances
ORDER BY balance DESC
LIMIT {{top_n}}
`,

  "primitives.token_approvals": `
SELECT
  block_time,
  tx_hash,
  owner,
  spender,
  CASE
    WHEN value >= POW(2, 200) THEN 'Unlimited'
    ELSE CAST(ROUND(value / POW(10, decimals), 4) AS VARCHAR)
  END AS approved_amount,
  value >= POW(2, 200) AS is_unlimited,
  symbol,
  contract_address
FROM erc20.approvals
WHERE blockchain = '{{chain}}'
  AND LOWER(contract_address) = LOWER('{{token_address}}')
  {{__time_where}}
ORDER BY block_time DESC
`,

  "primitives.wallet_balance": `
WITH daily_flows AS (
  SELECT
    DATE_TRUNC('day', block_time) AS day,
    SUM(CASE
      WHEN LOWER("to")   = LOWER('{{wallet}}') THEN  value / POW(10, decimals)
      ELSE 0
    END) AS inflow,
    SUM(CASE
      WHEN LOWER("from") = LOWER('{{wallet}}') THEN  value / POW(10, decimals)
      ELSE 0
    END) AS outflow
  FROM erc20.transfers
  WHERE blockchain = '{{chain}}'
    AND LOWER(contract_address) = LOWER('{{token_address}}')
    AND (
      LOWER("from") = LOWER('{{wallet}}')
      OR LOWER("to") = LOWER('{{wallet}}')
    )
    {{__time_where}}
  GROUP BY 1
)
SELECT
  day,
  inflow,
  outflow,
  inflow - outflow AS net_flow,
  SUM(inflow - outflow) OVER (ORDER BY day) AS running_balance
FROM daily_flows
ORDER BY day
`,

  "primitives.native_flows": `
SELECT
  DATE_TRUNC('day', block_time) AS day,
  SUM(CASE
    WHEN LOWER("to")   = LOWER('{{wallet}}') THEN value / 1e18
    ELSE 0
  END) AS inflow_eth,
  SUM(CASE
    WHEN LOWER("from") = LOWER('{{wallet}}') THEN value / 1e18
    ELSE 0
  END) AS outflow_eth,
  SUM(CASE
    WHEN LOWER("to")   = LOWER('{{wallet}}') THEN  value / 1e18
    WHEN LOWER("from") = LOWER('{{wallet}}') THEN -value / 1e18
    ELSE 0
  END) AS net_eth,
  COUNT(*) AS tx_count
FROM {{chain}}.transactions
WHERE (
  LOWER("from") = LOWER('{{wallet}}')
  OR LOWER("to") = LOWER('{{wallet}}')
)
AND value > 0
AND success = TRUE
{{__time_where}}
GROUP BY 1
ORDER BY 1
`,

  "primitives.gas_analysis": `
SELECT
  DATE_TRUNC('day', block_time)          AS day,
  COUNT(*)                               AS tx_count,
  SUM(gas_used * gas_price) / 1e18       AS total_eth_fees,
  AVG(gas_used)                          AS avg_gas_used,
  AVG(gas_price / 1e9)                   AS avg_gas_price_gwei,
  MAX(gas_price / 1e9)                   AS max_gas_price_gwei,
  MIN(gas_price / 1e9)                   AS min_gas_price_gwei
FROM {{chain}}.transactions
WHERE LOWER("from") = LOWER('{{wallet}}')
  {{__time_where}}
GROUP BY 1
ORDER BY 1
`,

  "primitives.tx_history": `
SELECT
  block_time,
  block_number,
  hash             AS tx_hash,
  "from",
  "to",
  value / 1e18     AS eth_value,
  gas_used,
  gas_price / 1e9  AS gas_price_gwei,
  gas_used * gas_price / 1e18 AS fee_eth,
  function_name,
  success
FROM {{chain}}.transactions
WHERE (
  LOWER("from") = LOWER('{{wallet}}')
  OR LOWER("to") = LOWER('{{wallet}}')
)
{{__time_where}}
ORDER BY block_time DESC
LIMIT {{limit}}
`,

  "primitives.internal_txs": `
SELECT
  block_time,
  block_number,
  tx_hash,
  "from",
  "to",
  value / 1e18 AS eth_value,
  call_type,
  success
FROM {{chain}}.traces
WHERE (
  LOWER("from") = LOWER('{{wallet}}')
  OR LOWER("to") = LOWER('{{wallet}}')
)
AND value > 0
{{__time_where}}
ORDER BY block_time DESC
LIMIT {{limit}}
`,

  "primitives.contract_deployments": `
SELECT
  block_time,
  block_number,
  tx_hash,
  "from"   AS deployer,
  address  AS contract_address
FROM {{chain}}.creation_traces
WHERE 1 = 1
  AND ('{{deployer}}' = '' OR LOWER("from") = LOWER('{{deployer}}'))
  {{__time_where}}
ORDER BY block_time DESC
LIMIT {{limit}}
`,

  "primitives.erc721_transfers": `
SELECT
  block_time,
  tx_hash,
  "from",
  "to",
  token_id,
  contract_address
FROM nft.transfers
WHERE blockchain = '{{chain}}'
  AND LOWER(contract_address) = LOWER('{{contract_address}}')
  AND (
    '{{wallet}}' = ''
    OR LOWER("from") = LOWER('{{wallet}}')
    OR LOWER("to")   = LOWER('{{wallet}}')
  )
  {{__time_where}}
ORDER BY block_time DESC
LIMIT {{limit}}
`,

  "primitives.erc1155_transfers": `
SELECT
  block_time,
  tx_hash,
  "from",
  "to",
  id      AS token_id,
  value   AS amount,
  contract_address
FROM erc1155.transfers
WHERE blockchain = '{{chain}}'
  AND LOWER(contract_address) = LOWER('{{contract_address}}')
  {{__time_where}}
ORDER BY block_time DESC
LIMIT {{limit}}
`,

  "primitives.event_decoder": `
SELECT
  block_time,
  block_number,
  tx_hash,
  log_index,
  event_name,
  topic0,
  topic1,
  topic2,
  topic3,
  data,
  contract_address
FROM {{chain}}.logs
WHERE LOWER(contract_address) = LOWER('{{contract_address}}')
  AND event_name = '{{event_name}}'
  {{__time_where}}
ORDER BY block_time DESC
LIMIT {{limit}}
`,

  "primitives.calldata_decoder": `
SELECT
  block_time,
  block_number,
  hash         AS tx_hash,
  "from"       AS caller,
  "to"         AS contract,
  function_name,
  input        AS raw_calldata,
  success
FROM {{chain}}.transactions
WHERE LOWER("to") = LOWER('{{contract_address}}')
  AND function_name = '{{function_name}}'
  {{__time_where}}
ORDER BY block_time DESC
LIMIT {{limit}}
`,

  "primitives.nonce_tracker": `
SELECT
  DATE_TRUNC('day', block_time)  AS day,
  COUNT(*)                       AS daily_tx_count,
  SUM(COUNT(*)) OVER (
    ORDER BY DATE_TRUNC('day', block_time)
  )                              AS cumulative_tx_count
FROM {{chain}}.transactions
WHERE LOWER("from") = LOWER('{{wallet}}')
  {{__time_where}}
GROUP BY 1
ORDER BY 1
`,

  "primitives.block_activity": `
SELECT
  DATE_TRUNC('hour', time)                           AS hour,
  COUNT(*)                                           AS block_count,
  AVG(tx_count)                                      AS avg_txs_per_block,
  SUM(tx_count)                                      AS total_txs,
  AVG(gas_used)                                      AS avg_gas_used,
  AVG(gas_used::FLOAT / NULLIF(gas_limit, 0)) * 100  AS avg_utilization_pct,
  AVG(base_fee_per_gas / 1e9)                        AS avg_base_fee_gwei
FROM {{chain}}.blocks
WHERE time >= NOW() - INTERVAL '{{days}} days'
GROUP BY 1
ORDER BY 1
`,

};