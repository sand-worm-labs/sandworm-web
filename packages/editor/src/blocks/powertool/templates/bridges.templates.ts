import type { TemplateMap } from "../types.js";

export const BRIDGE_TEMPLATES: TemplateMap = {

  "bridges.volume": `
SELECT
  DATE_TRUNC('day', block_time)  AS day,
  project,
  token_symbol,
  COUNT(*)                       AS transfer_count,
  COUNT(DISTINCT sender)         AS unique_users,
  SUM(amount_usd)                AS volume_usd,
  AVG(amount_usd)                AS avg_transfer_usd
FROM bridge.transfers
WHERE source_chain = '{{source_chain}}'
  AND dest_chain   = '{{dest_chain}}'
  {{__protocol_where}}
  {{__time_where}}
GROUP BY 1, 2, 3
ORDER BY 1, volume_usd DESC
`,

  "bridges.user_flows": `
SELECT
  source_chain,
  dest_chain,
  COUNT(DISTINCT sender)  AS unique_users,
  COUNT(*)                AS transfer_count,
  SUM(amount_usd)         AS volume_usd,
  SUM(amount_usd) / NULLIF(SUM(SUM(amount_usd)) OVER (), 0) * 100 AS volume_share_pct
FROM bridge.transfers
WHERE 1 = 1
  {{__protocol_where}}
  {{__time_where}}
GROUP BY 1, 2
ORDER BY volume_usd DESC
`,

  "bridges.cross_chain_wallet": `
SELECT
  block_time,
  project,
  source_chain,
  dest_chain,
  token_symbol,
  amount,
  amount_usd,
  tx_hash,
  CASE
    WHEN LOWER(sender)    = LOWER('{{wallet}}') THEN 'outbound'
    WHEN LOWER(recipient) = LOWER('{{wallet}}') THEN 'inbound'
  END AS direction
FROM bridge.transfers
WHERE (
  LOWER(sender)    = LOWER('{{wallet}}')
  OR LOWER(recipient) = LOWER('{{wallet}}')
)
{{__time_where}}
ORDER BY block_time DESC
`,

  "bridges.fees": `
SELECT
  DATE_TRUNC('day', block_time)  AS day,
  project,
  source_chain,
  dest_chain,
  COUNT(*)                       AS transfer_count,
  AVG(fee_usd)                   AS avg_fee_usd,
  SUM(fee_usd)                   AS total_fees_usd,
  AVG(fee_usd / NULLIF(amount_usd, 0)) * 100 AS avg_fee_pct
FROM bridge.transfers
WHERE 1 = 1
  {{__protocol_where}}
  {{__time_where}}
GROUP BY 1, 2, 3, 4
ORDER BY 1, total_fees_usd DESC
`,

  "bridges.tvl": `
SELECT
  DATE_TRUNC('day', ts)  AS day,
  project,
  chain,
  tvl_usd,
  tvl_usd / NULLIF(
    SUM(tvl_usd) OVER (PARTITION BY DATE_TRUNC('day', ts)), 0
  ) * 100 AS market_share_pct
FROM bridge.tvl_snapshots
WHERE chain = '{{chain}}'
  AND ('{{protocol}}' = 'all' OR project = '{{protocol}}')
  AND ts >= NOW() - INTERVAL '{{days}} days'
ORDER BY day, tvl_usd DESC
`,

  "bridges.comparison": `
SELECT
  project,
  COUNT(*)               AS transfer_count,
  COUNT(DISTINCT sender) AS unique_users,
  SUM(amount_usd)        AS volume_usd,
  SUM(fee_usd)           AS total_fees_usd,
  AVG(fee_usd / NULLIF(amount_usd, 0)) * 100                      AS avg_fee_pct,
  SUM(amount_usd) / NULLIF(SUM(SUM(amount_usd)) OVER (), 0) * 100 AS volume_share_pct
FROM bridge.transfers
{{__time_where}}
GROUP BY 1
ORDER BY volume_usd DESC
`,

  "bridges.latency": `
SELECT
  DATE_TRUNC('day', source_block_time)  AS day,
  project,
  source_chain,
  dest_chain,
  COUNT(*)                              AS transfer_count,
  AVG(
    DATE_DIFF('second', source_block_time, dest_block_time)
  )                                     AS avg_settlement_seconds,
  PERCENTILE_CONT(0.5) WITHIN GROUP (
    ORDER BY DATE_DIFF('second', source_block_time, dest_block_time)
  )                                     AS p50_seconds,
  PERCENTILE_CONT(0.95) WITHIN GROUP (
    ORDER BY DATE_DIFF('second', source_block_time, dest_block_time)
  )                                     AS p95_seconds
FROM bridge.transfers
WHERE dest_block_time IS NOT NULL
  {{__protocol_where}}
  AND source_block_time >= NOW() - INTERVAL '{{days}} days'
GROUP BY 1, 2, 3, 4
ORDER BY 1
`,

};