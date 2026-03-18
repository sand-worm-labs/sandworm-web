import type { TemplateMap } from "../types.js";

export const CONTRACT_TEMPLATES: TemplateMap = {

  "contracts.event_volume": `
SELECT
  DATE_TRUNC('day', block_time)  AS day,
  COUNT(*)                       AS event_count,
  COUNT(DISTINCT tx_hash)        AS unique_txs,
  COUNT(DISTINCT topic1)         AS unique_callers
FROM {{chain}}.logs
WHERE LOWER(contract_address) = LOWER('{{contract_address}}')
  AND event_name = '{{event_name}}'
  {{__time_where}}
GROUP BY 1
ORDER BY 1
`,

  "contracts.unique_wallets": `
SELECT
  DATE_TRUNC('day', block_time)           AS day,
  COUNT(DISTINCT "from")                  AS unique_wallets,
  COUNT(*)                                AS tx_count,
  COUNT(DISTINCT function_name)           AS unique_functions_called,
  COUNT(*) FILTER (WHERE success = FALSE) AS failed_tx_count
FROM {{chain}}.transactions
WHERE LOWER("to") = LOWER('{{contract_address}}')
  AND success = TRUE
  {{__time_where}}
GROUP BY 1
ORDER BY 1
`,

  "contracts.revenue": `
SELECT
  DATE_TRUNC('day', block_time)  AS day,
  SUM(value / 1e18)              AS eth_received,
  COUNT(*)                       AS tx_count,
  COUNT(DISTINCT "from")         AS unique_payers,
  AVG(value / 1e18)              AS avg_payment_eth
FROM {{chain}}.transactions
WHERE LOWER("to") = LOWER('{{contract_address}}')
  AND value > 0
  AND success = TRUE
  {{__time_where}}
GROUP BY 1
ORDER BY 1
`,

  "contracts.function_breakdown": `
SELECT
  function_name,
  COUNT(*)                       AS call_count,
  COUNT(DISTINCT "from")         AS unique_callers,
  COUNT(*) FILTER (WHERE success = FALSE) AS failed_count,
  COUNT(*) FILTER (WHERE success = FALSE)::FLOAT
    / NULLIF(COUNT(*), 0) * 100  AS failure_rate_pct,
  AVG(gas_used)                  AS avg_gas_used,
  MIN(block_time)                AS first_called,
  MAX(block_time)                AS last_called
FROM {{chain}}.transactions
WHERE LOWER("to") = LOWER('{{contract_address}}')
  AND function_name IS NOT NULL
  {{__time_where}}
GROUP BY 1
ORDER BY call_count DESC
`,

  "contracts.multi_contract": `
SELECT
  LOWER(contract_address)        AS contract_address,
  DATE_TRUNC('day', block_time)  AS day,
  COUNT(*)                       AS event_count,
  COUNT(DISTINCT topic1)         AS unique_callers,
  COUNT(DISTINCT tx_hash)        AS unique_txs
FROM {{chain}}.logs
WHERE LOWER(contract_address) IN ({{contract_addresses}})
  AND event_name = '{{event_name}}'
  {{__time_where}}
GROUP BY 1, 2
ORDER BY 2, event_count DESC
`,

  "contracts.interaction_graph": `
SELECT
  t."to"            AS called_contract,
  COUNT(*)          AS call_count,
  COUNT(DISTINCT "from") AS unique_callers,
  MIN(block_time)   AS first_call,
  MAX(block_time)   AS last_call
FROM {{chain}}.transactions t
WHERE LOWER("from") IN (
  -- All addresses that called the root contract
  SELECT DISTINCT LOWER("from")
  FROM {{chain}}.transactions
  WHERE LOWER("to") = LOWER('{{contract_address}}')
    {{__time_where}}
)
AND "to" != '{{contract_address}}'
AND success = TRUE
{{__time_where}}
GROUP BY 1
ORDER BY call_count DESC
LIMIT {{top_n}}
`,

  "contracts.tvl": `
WITH eth_balance AS (
  SELECT
    DATE_TRUNC('day', block_time) AS day,
    SUM(CASE
      WHEN LOWER("to")   = LOWER('{{contract_address}}') THEN  value / 1e18
      WHEN LOWER("from") = LOWER('{{contract_address}}') THEN -value / 1e18
      ELSE 0
    END) AS net_eth
  FROM {{chain}}.transactions
  WHERE (
    LOWER("to")   = LOWER('{{contract_address}}')
    OR LOWER("from") = LOWER('{{contract_address}}')
  )
  AND value > 0
  AND success = TRUE
  {{__time_where}}
  GROUP BY 1
),
token_flows AS (
  SELECT
    DATE_TRUNC('day', block_time) AS day,
    contract_address              AS token,
    symbol,
    SUM(CASE
      WHEN LOWER("to")   = LOWER('{{contract_address}}') THEN  value / POW(10, decimals) * COALESCE(p.price, 0)
      WHEN LOWER("from") = LOWER('{{contract_address}}') THEN -value / POW(10, decimals) * COALESCE(p.price, 0)
      ELSE 0
    END) AS net_usd
  FROM erc20.transfers t
  LEFT JOIN prices.usd p
    ON LOWER(p.contract_address) = LOWER(t.contract_address)
    AND p.blockchain = t.blockchain
    AND p.minute = DATE_TRUNC('minute', t.block_time)
  WHERE t.blockchain = '{{chain}}'
    AND (
      LOWER("from") = LOWER('{{contract_address}}')
      OR LOWER("to") = LOWER('{{contract_address}}')
    )
    {{__time_where}}
  GROUP BY 1, 2, 3
)
SELECT
  eb.day,
  SUM(eb.net_eth) OVER (ORDER BY eb.day) AS cumulative_eth_balance,
  SUM(COALESCE(tf.net_usd, 0)) OVER (ORDER BY eb.day) AS cumulative_token_value_usd
FROM eth_balance eb
LEFT JOIN (
  SELECT day, SUM(net_usd) AS net_usd FROM token_flows GROUP BY day
) tf ON tf.day = eb.day
ORDER BY eb.day
`,

  "contracts.error_analysis": `
SELECT
  function_name,
  error_reason,
  COUNT(*)               AS failure_count,
  COUNT(DISTINCT "from") AS unique_affected_callers,
  MIN(block_time)        AS first_seen,
  MAX(block_time)        AS last_seen,
  AVG(gas_used)          AS avg_gas_wasted
FROM {{chain}}.transactions
WHERE LOWER("to") = LOWER('{{contract_address}}')
  AND success = FALSE
  {{__time_where}}
GROUP BY 1, 2
ORDER BY failure_count DESC
`,

};