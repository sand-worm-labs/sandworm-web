import type { TemplateMap } from "../types.js";

export const CHAIN_TEMPLATES: TemplateMap = {

  "chains.dau_tps": `
SELECT
  DATE_TRUNC('{{granularity}}', block_time)  AS period,
  COUNT(DISTINCT "from")                     AS dau,
  COUNT(*)                                   AS tx_count,
  COUNT(*) / (
    CASE '{{granularity}}'
      WHEN 'hour' THEN 3600
      WHEN 'day'  THEN 86400
      WHEN 'week' THEN 604800
    END
  )                                          AS avg_tps,
  COUNT(DISTINCT "to")                       AS unique_contracts_called
FROM {{chain}}.transactions
WHERE success = TRUE
  {{__time_where}}
GROUP BY 1
ORDER BY 1
`,

  "chains.l2_sequencer": `
SELECT
  DATE_TRUNC('day', block_time)  AS day,
  COUNT(*)                       AS batches_submitted,
  AVG(tx_count)                  AS avg_txs_per_batch,
  SUM(tx_count)                  AS total_txs_submitted,
  AVG(compressed_size_bytes)     AS avg_batch_size_bytes,
  AVG(compression_ratio)         AS avg_compression_ratio,
  SUM(l1_fee_eth)                AS total_l1_fees_eth
FROM {{chain}}.sequencer_batches
WHERE block_time >= NOW() - INTERVAL '{{days}} days'
GROUP BY 1
ORDER BY 1
`,

  "chains.l2_vs_l1_cost": `
SELECT
  DATE_TRUNC('day', block_time)          AS day,
  '{{l2_chain}}'                         AS l2_chain,
  AVG(l2_gas_price / 1e9)               AS avg_l2_gas_gwei,
  AVG(l1_gas_price / 1e9)               AS avg_l1_gas_gwei,
  AVG(l2_tx_fee_eth)                     AS avg_l2_fee_eth,
  AVG(l1_equivalent_fee_eth)             AS avg_l1_equivalent_fee_eth,
  AVG(1 - l2_tx_fee_eth / NULLIF(l1_equivalent_fee_eth, 0)) * 100 AS avg_savings_pct
FROM {{l2_chain}}.tx_fee_comparison
WHERE block_time >= NOW() - INTERVAL '{{days}} days'
GROUP BY 1
ORDER BY 1
`,

  "chains.cross_chain_comparison": `
SELECT
  blockchain,
  DATE_TRUNC('day', block_time)  AS day,
  COUNT(DISTINCT "from")         AS dau,
  COUNT(*)                       AS tx_count,
  AVG(gas_price / 1e9)           AS avg_gas_gwei,
  SUM(gas_used * gas_price / 1e18) AS total_fees_eth
FROM (
  SELECT blockchain, block_time, "from", gas_price, gas_used
  FROM ethereum.transactions  WHERE blockchain = 'ethereum'
  UNION ALL
  SELECT blockchain, block_time, "from", gas_price, gas_used
  FROM base.transactions      WHERE blockchain = 'base'
  UNION ALL
  SELECT blockchain, block_time, "from", gas_price, gas_used
  FROM arbitrum.transactions  WHERE blockchain = 'arbitrum'
  UNION ALL
  SELECT blockchain, block_time, "from", gas_price, gas_used
  FROM optimism.transactions  WHERE blockchain = 'optimism'
  UNION ALL
  SELECT blockchain, block_time, "from", gas_price, gas_used
  FROM polygon.transactions   WHERE blockchain = 'polygon'
) combined
{{__time_where}}
GROUP BY 1, 2
ORDER BY 2, dau DESC
`,

  "chains.l2_bridge_flows": `
SELECT
  DATE_TRUNC('day', block_time)  AS day,
  event_type,
  token_symbol,
  COUNT(*)                       AS transfer_count,
  COUNT(DISTINCT sender)         AS unique_users,
  SUM(amount_usd)                AS volume_usd,
  SUM(CASE WHEN event_type = 'deposit'    THEN amount_usd ELSE 0 END)
    - SUM(CASE WHEN event_type = 'withdrawal' THEN amount_usd ELSE 0 END) AS net_inflow_usd
FROM bridge.canonical_transfers
WHERE dest_chain = '{{chain}}'
  OR source_chain = '{{chain}}'
  {{__time_where}}
GROUP BY 1, 2, 3
ORDER BY 1, volume_usd DESC
`,

  "chains.blob_usage": `
SELECT
  DATE_TRUNC('day', block_time)   AS day,
  COUNT(*)                        AS blob_tx_count,
  SUM(blob_count)                 AS total_blobs,
  AVG(blob_count)                 AS avg_blobs_per_tx,
  SUM(blob_fee_eth)               AS total_blob_fees_eth,
  AVG(blob_base_fee / 1e9)        AS avg_blob_base_fee_gwei,
  COUNT(DISTINCT sender)          AS unique_submitters
FROM ethereum.blob_transactions
WHERE block_time >= NOW() - INTERVAL '{{days}} days'
GROUP BY 1
ORDER BY 1
`,

  "chains.gas_price_history": `
SELECT
  DATE_TRUNC('{{granularity}}', block_time)  AS period,
  AVG(base_fee_per_gas / 1e9)                AS avg_base_fee_gwei,
  PERCENTILE_CONT(0.5) WITHIN GROUP (
    ORDER BY base_fee_per_gas / 1e9
  )                                          AS p50_base_fee_gwei,
  PERCENTILE_CONT(0.95) WITHIN GROUP (
    ORDER BY (base_fee_per_gas + COALESCE(priority_fee_per_gas, 0)) / 1e9
  )                                          AS p95_total_gwei,
  MIN(base_fee_per_gas / 1e9)                AS min_base_fee_gwei,
  MAX(base_fee_per_gas / 1e9)                AS max_base_fee_gwei,
  AVG(COALESCE(priority_fee_per_gas, 0) / 1e9) AS avg_priority_fee_gwei
FROM {{chain}}.transactions
WHERE success = TRUE
  {{__time_where}}
GROUP BY 1
ORDER BY 1
`,

  "chains.market_share": `
SELECT
  DATE_TRUNC('{{granularity}}', block_time)  AS period,
  blockchain,
  COUNT(*)                                   AS tx_count,
  COUNT(DISTINCT "from")                     AS unique_wallets,
  COUNT(*) / NULLIF(
    SUM(COUNT(*)) OVER (PARTITION BY DATE_TRUNC('{{granularity}}', block_time)), 0
  ) * 100                                    AS tx_share_pct
FROM (
  SELECT 'ethereum' AS blockchain, block_time, "from" FROM ethereum.transactions WHERE success = TRUE
  UNION ALL
  SELECT 'base',      block_time, "from" FROM base.transactions      WHERE success = TRUE
  UNION ALL
  SELECT 'arbitrum',  block_time, "from" FROM arbitrum.transactions  WHERE success = TRUE
  UNION ALL
  SELECT 'optimism',  block_time, "from" FROM optimism.transactions  WHERE success = TRUE
  UNION ALL
  SELECT 'polygon',   block_time, "from" FROM polygon.transactions   WHERE success = TRUE
  UNION ALL
  SELECT 'zksync',    block_time, "from" FROM zksync.transactions    WHERE success = TRUE
) combined
WHERE block_time >= NOW() - INTERVAL '{{days}} days'
GROUP BY 1, 2
ORDER BY 1, tx_count DESC
`,

  "chains.l2_user_overlap": `
WITH active_users AS (
  SELECT 'base'     AS chain, LOWER("from") AS wallet FROM base.transactions
    WHERE success = TRUE AND block_time >= NOW() - INTERVAL '{{days}} days'
  UNION
  SELECT 'arbitrum', LOWER("from") FROM arbitrum.transactions
    WHERE success = TRUE AND block_time >= NOW() - INTERVAL '{{days}} days'
  UNION
  SELECT 'optimism', LOWER("from") FROM optimism.transactions
    WHERE success = TRUE AND block_time >= NOW() - INTERVAL '{{days}} days'
  UNION
  SELECT 'polygon',  LOWER("from") FROM polygon.transactions
    WHERE success = TRUE AND block_time >= NOW() - INTERVAL '{{days}} days'
  UNION
  SELECT 'zksync',   LOWER("from") FROM zksync.transactions
    WHERE success = TRUE AND block_time >= NOW() - INTERVAL '{{days}} days'
)
SELECT
  wallet,
  COUNT(DISTINCT chain)       AS chains_active_on,
  ARRAY_AGG(DISTINCT chain)   AS active_chains
FROM active_users
GROUP BY 1
HAVING COUNT(DISTINCT chain) > 1
ORDER BY chains_active_on DESC
`,

  "chains.sequencer_decentralization": `
SELECT
  DATE_TRUNC('day', block_time)                           AS day,
  COUNT(*)                                                AS total_txs,
  COUNT(*) FILTER (WHERE forced_inclusion = TRUE)         AS forced_inclusion_count,
  COUNT(*) FILTER (WHERE sequencer_downtime = TRUE)       AS downtime_events,
  AVG(sequencer_lag_seconds)                              AS avg_sequencer_lag_seconds,
  MAX(sequencer_lag_seconds)                              AS max_sequencer_lag_seconds
FROM {{chain}}.sequencer_health
WHERE block_time >= NOW() - INTERVAL '{{days}} days'
GROUP BY 1
ORDER BY 1
`,

};