import type { TemplateMap } from "../types.js";

export const WALLET_TEMPLATES: TemplateMap = {

  "wallet.pnl": `
WITH flows AS (
  SELECT
    t.contract_address,
    t.symbol,
    SUM(CASE
      WHEN LOWER("to")   = LOWER('{{wallet}}') THEN  t.value / POW(10, t.decimals)
      ELSE 0
    END) AS tokens_in,
    SUM(CASE
      WHEN LOWER("from") = LOWER('{{wallet}}') THEN  t.value / POW(10, t.decimals)
      ELSE 0
    END) AS tokens_out,
    SUM(CASE
      WHEN LOWER("to")   = LOWER('{{wallet}}') THEN  t.value / POW(10, t.decimals) * COALESCE(p.price, 0)
      ELSE 0
    END) AS cost_basis_usd,
    SUM(CASE
      WHEN LOWER("from") = LOWER('{{wallet}}') THEN  t.value / POW(10, t.decimals) * COALESCE(p.price, 0)
      ELSE 0
    END) AS proceeds_usd
  FROM erc20.transfers t
  LEFT JOIN prices.usd p
    ON LOWER(p.contract_address) = LOWER(t.contract_address)
    AND p.blockchain = t.blockchain
    AND p.minute = DATE_TRUNC('minute', t.block_time)
  WHERE t.blockchain = '{{chain}}'
    AND (
      LOWER("from") = LOWER('{{wallet}}')
      OR LOWER("to") = LOWER('{{wallet}}')
    )
    {{__time_where}}
  GROUP BY 1, 2
)
SELECT
  contract_address,
  symbol,
  tokens_in,
  tokens_out,
  tokens_in - tokens_out        AS net_position,
  proceeds_usd - cost_basis_usd AS realised_pnl_usd,
  cost_basis_usd,
  proceeds_usd
FROM flows
ORDER BY realised_pnl_usd DESC
`,

  "wallet.portfolio_snapshot": `
WITH net_balances AS (
  SELECT
    contract_address,
    symbol,
    decimals,
    SUM(CASE WHEN LOWER("to")   = LOWER('{{wallet}}') THEN  value ELSE 0 END) -
    SUM(CASE WHEN LOWER("from") = LOWER('{{wallet}}') THEN  value ELSE 0 END) AS raw_balance
  FROM erc20.transfers
  WHERE blockchain = '{{chain}}'
    AND (
      LOWER("from") = LOWER('{{wallet}}')
      OR LOWER("to") = LOWER('{{wallet}}')
    )
  GROUP BY 1, 2, 3
  HAVING
    SUM(CASE WHEN LOWER("to")   = LOWER('{{wallet}}') THEN value ELSE 0 END) -
    SUM(CASE WHEN LOWER("from") = LOWER('{{wallet}}') THEN value ELSE 0 END) > 0
)
SELECT
  nb.symbol,
  nb.contract_address,
  nb.raw_balance / POW(10, nb.decimals)                                     AS balance,
  p.price                                                                    AS price_usd,
  nb.raw_balance / POW(10, nb.decimals) * COALESCE(p.price, 0)              AS value_usd
FROM net_balances nb
LEFT JOIN prices.usd p
  ON LOWER(p.contract_address) = LOWER(nb.contract_address)
  AND p.blockchain = '{{chain}}'
  AND p.minute = (
    SELECT MAX(minute) FROM prices.usd WHERE blockchain = '{{chain}}'
  )
ORDER BY value_usd DESC NULLS LAST
`,

  "wallet.activity_timeline": `
SELECT
  DATE_TRUNC('day', block_time)       AS day,
  COUNT(*)                            AS tx_count,
  COUNT(DISTINCT "to")                AS unique_contracts,
  SUM(value / 1e18)                   AS eth_sent,
  SUM(gas_used * gas_price / 1e18)    AS fees_eth,
  COUNT(*) FILTER (WHERE success = FALSE) AS failed_txs
FROM {{chain}}.transactions
WHERE LOWER("from") = LOWER('{{wallet}}')
  {{__time_where}}
GROUP BY 1
ORDER BY 1
`,

  "wallet.fund_flow_trace": `
WITH RECURSIVE flow AS (
  SELECT
    "from"       AS origin,
    "to"         AS destination,
    value / 1e18 AS eth_value,
    tx_hash,
    block_time,
    1            AS hop,
    ARRAY["from", "to"] AS path
  FROM {{chain}}.transactions
  WHERE LOWER("from") = LOWER('{{wallet}}')
    AND value / 1e18 >= {{min_eth}}
    AND success = TRUE
    {{__time_where}}

  UNION ALL

  SELECT
    t."from",
    t."to",
    t.value / 1e18,
    t.tx_hash,
    t.block_time,
    f.hop + 1,
    f.path || t."to"
  FROM {{chain}}.transactions t
  JOIN flow f ON LOWER(t."from") = LOWER(f.destination)
  WHERE f.hop < {{hops}}
    AND t.value / 1e18 >= {{min_eth}}
    AND t.success = TRUE
    AND NOT (LOWER(t."to") = ANY(f.path))
    AND t.block_time >= NOW() - INTERVAL '{{days}} days'
)
SELECT
  origin,
  destination,
  SUM(eth_value)  AS total_eth,
  COUNT(*)        AS tx_count,
  MIN(block_time) AS first_seen,
  MAX(block_time) AS last_seen,
  MIN(hop)        AS hop_depth
FROM flow
GROUP BY origin, destination
ORDER BY hop_depth, total_eth DESC
`,

  "wallet.common_funder": `
SELECT
  "from"                   AS funder,
  COUNT(DISTINCT "to")     AS funded_wallet_count,
  ARRAY_AGG(DISTINCT "to") AS funded_wallets,
  SUM(value / 1e18)        AS total_eth_sent,
  MIN(block_time)          AS first_funding,
  MAX(block_time)          AS last_funding
FROM {{chain}}.transactions
WHERE LOWER("to") IN ({{wallets}})
  AND value > 0
  AND success = TRUE
  {{__time_where}}
GROUP BY 1
HAVING COUNT(DISTINCT "to") > 1
ORDER BY funded_wallet_count DESC, total_eth_sent DESC
`,

  "wallet.wallet_age": `
SELECT
  MIN(block_time)                                AS first_tx_time,
  DATE_DIFF('day', MIN(block_time), NOW())       AS age_days,
  COUNT(*)                                       AS total_tx_count,
  MIN_BY("to", block_time)                       AS first_counterparty,
  MIN_BY(hash, block_time)                       AS first_tx_hash,
  COUNT(DISTINCT "to")                           AS unique_contracts_called
FROM {{chain}}.transactions
WHERE LOWER("from") = LOWER('{{wallet}}')
`,

  "wallet.counterparty_frequency": `
SELECT
  "to"              AS counterparty,
  COUNT(*)          AS tx_count,
  SUM(value / 1e18) AS total_eth_sent,
  MIN(block_time)   AS first_interaction,
  MAX(block_time)   AS last_interaction,
  COUNT(*) FILTER (WHERE success = FALSE) AS failed_count
FROM {{chain}}.transactions
WHERE LOWER("from") = LOWER('{{wallet}}')
  AND "to" IS NOT NULL
  {{__time_where}}
GROUP BY 1
ORDER BY tx_count DESC
LIMIT {{top_n}}
`,

  "wallet.cex_interactions": `
SELECT
  t.block_time,
  t.hash AS tx_hash,
  CASE
    WHEN LOWER(t."to") = LOWER('{{wallet}}') THEN 'withdrawal'
    ELSE 'deposit'
  END AS direction,
  CASE
    WHEN LOWER(t."to") = LOWER('{{wallet}}') THEN t."from"
    ELSE t."to"
  END AS cex_address,
  l.name    AS cex_name,
  t.value / 1e18 AS eth_amount
FROM {{chain}}.transactions t
JOIN labels.addresses l
  ON (
    LOWER(t."to")   = LOWER(l.address)
    OR LOWER(t."from") = LOWER(l.address)
  )
  AND l.category = 'cex'
WHERE (
  LOWER(t."from") = LOWER('{{wallet}}')
  OR LOWER(t."to") = LOWER('{{wallet}}')
)
AND t.success = TRUE
{{__time_where}}
ORDER BY t.block_time DESC
`,

  "wallet.smart_money": `
WITH wallet_activity AS (
  SELECT
    CASE
      WHEN LOWER("from") = LOWER('{{wallet}}') THEN "to"
      ELSE "from"
    END AS wallet,
    SUM(
      t.value / POW(10, t.decimals) * COALESCE(p.price, 0)
    ) AS volume_usd,
    COUNT(DISTINCT t.tx_hash) AS tx_count,
    MIN(t.block_time)         AS first_seen
  FROM erc20.transfers t
  LEFT JOIN prices.usd p
    ON LOWER(p.contract_address) = LOWER(t.contract_address)
    AND p.blockchain = t.blockchain
    AND p.minute = DATE_TRUNC('minute', t.block_time)
  WHERE t.blockchain = '{{chain}}'
    AND LOWER(t.contract_address) = LOWER('{{token_address}}')
    {{__time_where}}
  GROUP BY 1
)
SELECT
  wallet,
  volume_usd,
  tx_count,
  first_seen
FROM wallet_activity
ORDER BY volume_usd DESC
LIMIT {{top_n}}
`,

  "wallet.whale_watcher": `
SELECT
  t.block_time,
  t.tx_hash,
  t."from",
  t."to",
  t.value / POW(10, t.decimals)                                     AS amount,
  t.symbol,
  t.value / POW(10, t.decimals) * COALESCE(p.price, 0)              AS usd_value
FROM erc20.transfers t
LEFT JOIN prices.usd p
  ON LOWER(p.contract_address) = LOWER(t.contract_address)
  AND p.blockchain = t.blockchain
  AND p.minute = DATE_TRUNC('minute', t.block_time)
WHERE t.blockchain = '{{chain}}'
  AND LOWER(t.contract_address) = LOWER('{{token_address}}')
  AND t.value / POW(10, t.decimals) * COALESCE(p.price, 0) >= {{min_usd}}
  {{__time_where}}
ORDER BY usd_value DESC
`,

  "wallet.multi_wallet_compare": `
SELECT
  LOWER("from")                      AS wallet,
  COUNT(*)                           AS tx_count,
  COUNT(DISTINCT "to")               AS unique_contracts,
  SUM(value / 1e18)                  AS eth_sent,
  SUM(gas_used * gas_price / 1e18)   AS fees_eth,
  MIN(block_time)                    AS first_tx,
  MAX(block_time)                    AS last_tx,
  COUNT(*) FILTER (WHERE success = FALSE) AS failed_txs
FROM {{chain}}.transactions
WHERE LOWER("from") IN ({{wallets}})
  {{__time_where}}
GROUP BY 1
ORDER BY tx_count DESC
`,

  "wallet.realized_unrealized_gains": `
WITH positions AS (
  SELECT
    t.contract_address,
    t.symbol,
    t.decimals,
    SUM(CASE
      WHEN LOWER("to")   = LOWER('{{wallet}}') THEN  t.value / POW(10, t.decimals)
      ELSE 0
    END) AS total_bought,
    SUM(CASE
      WHEN LOWER("from") = LOWER('{{wallet}}') THEN  t.value / POW(10, t.decimals)
      ELSE 0
    END) AS total_sold,
    SUM(CASE
      WHEN LOWER("to")   = LOWER('{{wallet}}') THEN  t.value / POW(10, t.decimals) * COALESCE(p.price, 0)
      ELSE 0
    END) AS cost_basis_usd,
    SUM(CASE
      WHEN LOWER("from") = LOWER('{{wallet}}') THEN  t.value / POW(10, t.decimals) * COALESCE(p.price, 0)
      ELSE 0
    END) AS proceeds_usd
  FROM erc20.transfers t
  LEFT JOIN prices.usd p
    ON LOWER(p.contract_address) = LOWER(t.contract_address)
    AND p.blockchain = t.blockchain
    AND p.minute = DATE_TRUNC('minute', t.block_time)
  WHERE t.blockchain = '{{chain}}'
    AND (
      LOWER("from") = LOWER('{{wallet}}')
      OR LOWER("to") = LOWER('{{wallet}}')
    )
  GROUP BY 1, 2, 3
)
SELECT
  ps.symbol,
  ps.contract_address,
  ps.total_bought - ps.total_sold                                          AS current_balance,
  ps.proceeds_usd - ps.cost_basis_usd                                      AS realised_pnl_usd,
  (ps.total_bought - ps.total_sold) * COALESCE(cur.price, 0)               AS current_value_usd,
  (ps.total_bought - ps.total_sold) * COALESCE(cur.price, 0)
    - (ps.cost_basis_usd - ps.proceeds_usd)                                AS unrealised_pnl_usd
FROM positions ps
LEFT JOIN prices.usd cur
  ON LOWER(cur.contract_address) = LOWER(ps.contract_address)
  AND cur.blockchain = '{{chain}}'
  AND cur.minute = (
    SELECT MAX(minute) FROM prices.usd WHERE blockchain = '{{chain}}'
  )
WHERE ps.total_bought > 0
ORDER BY unrealised_pnl_usd DESC NULLS LAST
`,

};