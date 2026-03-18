import type { TemplateMap } from "../types.js";

export const FORENSICS_TEMPLATES: TemplateMap = {

  "forensics.fund_trace": `
WITH RECURSIVE trace AS (
  SELECT
    "from"        AS origin,
    "to"          AS destination,
    value / 1e18  AS eth_value,
    tx_hash,
    block_time,
    1             AS hop,
    ARRAY["from", "to"] AS path
  FROM {{chain}}.transactions
  WHERE (
    ('{{direction}}' = 'out' AND LOWER("from") = LOWER('{{address}}'))
    OR
    ('{{direction}}' = 'in'  AND LOWER("to")   = LOWER('{{address}}'))
  )
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
    tr.hop + 1,
    tr.path || t."to"
  FROM {{chain}}.transactions t
  JOIN trace tr ON (
    ('{{direction}}' = 'out' AND LOWER(t."from") = LOWER(tr.destination))
    OR
    ('{{direction}}' = 'in'  AND LOWER(t."to")   = LOWER(tr.origin))
  )
  WHERE tr.hop < {{hops}}
    AND t.value / 1e18 >= {{min_eth}}
    AND t.success = TRUE
    AND NOT (LOWER(t."to") = ANY(tr.path))
    AND t.block_time >= NOW() - INTERVAL '{{days}} days'
)
SELECT
  origin,
  destination,
  SUM(eth_value)   AS total_eth,
  COUNT(*)         AS tx_count,
  MIN(block_time)  AS first_seen,
  MAX(block_time)  AS last_seen,
  MIN(hop)         AS hop_depth
FROM trace
GROUP BY origin, destination
ORDER BY hop_depth, total_eth DESC
`,

  "forensics.mixer_detector": `
SELECT
  t.block_time,
  t.hash AS tx_hash,
  t."from",
  t."to",
  t.value / 1e18  AS eth_value,
  l.name          AS mixer_name,
  l.address       AS mixer_address,
  CASE
    WHEN LOWER(t."from") = LOWER('{{address}}') THEN 'deposit'
    ELSE 'withdrawal'
  END AS interaction_type
FROM {{chain}}.transactions t
JOIN labels.addresses l
  ON (
    LOWER(t."to")   = LOWER(l.address)
    OR LOWER(t."from") = LOWER(l.address)
  )
  AND l.category = 'mixer'
WHERE (
  LOWER(t."from") = LOWER('{{address}}')
  OR LOWER(t."to") = LOWER('{{address}}')
)
AND t.success = TRUE
{{__time_where}}
ORDER BY t.block_time DESC
`,

  "forensics.peel_chain": `
WITH hops AS (
  SELECT
    "from"        AS sender,
    "to"          AS receiver,
    value / 1e18  AS eth_value,
    block_time,
    tx_hash,
    LAG(value / 1e18) OVER (
      PARTITION BY "to" ORDER BY block_time
    ) AS prev_received
  FROM {{chain}}.transactions
  WHERE success = TRUE
    AND value > 0
    {{__time_where}}
)
SELECT
  sender,
  receiver,
  eth_value,
  prev_received,
  CASE
    WHEN prev_received > 0 THEN ROUND(eth_value / prev_received, 4)
    ELSE NULL
  END AS passthrough_ratio,
  block_time,
  tx_hash
FROM hops
WHERE (
  LOWER(sender)   = LOWER('{{address}}')
  OR LOWER(receiver) = LOWER('{{address}}')
)
ORDER BY block_time
`,

  "forensics.rug_pull": `
WITH deployer AS (
  SELECT "from" AS address
  FROM {{chain}}.creation_traces
  WHERE LOWER(address) = LOWER('{{token_address}}')
  LIMIT 1
),
lp_events AS (
  SELECT
    DATE_TRUNC('hour', block_time) AS hour,
    event_type,
    SUM(amount_usd) AS usd_amount,
    COUNT(*)        AS event_count
  FROM dex.liquidity_events
  WHERE blockchain = '{{chain}}'
    AND (
      LOWER(token0) = LOWER('{{token_address}}')
      OR LOWER(token1) = LOWER('{{token_address}}')
    )
  GROUP BY 1, 2
),
deployer_outflows AS (
  SELECT
    t.block_time,
    t.tx_hash,
    t.value / 1e18 AS eth_out,
    t."to"
  FROM {{chain}}.transactions t
  JOIN deployer d ON LOWER(t."from") = LOWER(d.address)
  WHERE t.value > 0
    AND t.success = TRUE
)
SELECT
  'lp_event'          AS signal_type,
  hour::VARCHAR       AS ts,
  event_type          AS detail,
  usd_amount          AS value_usd,
  event_count
FROM lp_events
UNION ALL
SELECT
  'deployer_outflow',
  block_time::VARCHAR,
  'to: ' || "to",
  eth_out * 2000,
  1
FROM deployer_outflows
ORDER BY ts
`,

  "forensics.sandwich_detector": `
SELECT
  block_time,
  block_number,
  frontrun_tx_hash,
  victim_tx_hash,
  backrun_tx_hash,
  attacker_address,
  victim_address,
  profit_usd,
  victim_slippage_pct,
  pool_address
FROM mev.sandwiches
WHERE blockchain = '{{chain}}'
  AND (
    '{{victim_address}}' = ''
    OR LOWER(victim_address) = LOWER('{{victim_address}}')
  )
  {{__time_where}}
ORDER BY profit_usd DESC
`,

  "forensics.frontrunning": `
SELECT
  block_time,
  block_number,
  victim_tx_hash,
  frontrun_tx_hash,
  attacker_address,
  victim_address,
  victim_gas_price / 1e9    AS victim_gwei,
  attacker_gas_price / 1e9  AS attacker_gwei,
  profit_usd,
  token_symbol
FROM mev.frontrunning
WHERE blockchain = '{{chain}}'
  AND (
    '{{wallet}}' = ''
    OR LOWER(victim_address) = LOWER('{{wallet}}')
  )
  {{__time_where}}
ORDER BY profit_usd DESC
`,

  "forensics.token_launch_forensics": `
WITH launch AS (
  SELECT MIN(block_time) AS launch_time
  FROM erc20.transfers
  WHERE blockchain = '{{chain}}'
    AND LOWER(contract_address) = LOWER('{{token_address}}')
),
early_buys AS (
  SELECT
    s.taker             AS buyer,
    s.tx_hash,
    s.block_time,
    s.amount_usd,
    s.token_bought_amount AS tokens_bought,
    DATE_DIFF('minute', l.launch_time, s.block_time) AS minutes_after_launch
  FROM dex.swaps s, launch l
  WHERE s.blockchain = '{{chain}}'
    AND LOWER(s.token_bought_address) = LOWER('{{token_address}}')
    AND s.block_time <= l.launch_time + INTERVAL '{{launch_window_minutes}} minutes'
)
SELECT
  buyer,
  COUNT(*)             AS buy_count,
  SUM(amount_usd)      AS total_spent_usd,
  SUM(tokens_bought)   AS tokens_accumulated,
  MIN(minutes_after_launch) AS first_buy_minutes_after_launch,
  COUNT(*) > 1 AND MIN(minutes_after_launch) < 1 AS likely_sniper
FROM early_buys
GROUP BY 1
ORDER BY first_buy_minutes_after_launch, total_spent_usd DESC
`,

  "forensics.address_clustering": `
WITH seed_txs AS (
  SELECT DISTINCT tx_hash
  FROM {{chain}}.transactions
  WHERE LOWER("from") IN ({{seed_addresses}})
    {{__time_where}}
),
co_signers AS (
  SELECT
    t."from"         AS address,
    COUNT(DISTINCT t.tx_hash) AS shared_tx_count
  FROM {{chain}}.transactions t
  JOIN seed_txs s ON t.tx_hash = s.tx_hash
  WHERE LOWER(t."from") NOT IN ({{seed_addresses}})
  GROUP BY 1
)
SELECT
  address,
  shared_tx_count,
  shared_tx_count::FLOAT / NULLIF(
    (SELECT COUNT(DISTINCT tx_hash) FROM seed_txs), 0
  ) AS co_occurrence_rate
FROM co_signers
ORDER BY shared_tx_count DESC
`,

  "forensics.dusting_detector": `
SELECT
  t.block_time,
  t.tx_hash,
  t."from"      AS sender,
  t.value / POW(10, t.decimals) AS amount,
  t.symbol,
  t.value / POW(10, t.decimals) * COALESCE(p.price, 0) AS usd_value,
  t.contract_address
FROM erc20.transfers t
LEFT JOIN prices.usd p
  ON LOWER(p.contract_address) = LOWER(t.contract_address)
  AND p.blockchain = t.blockchain
  AND p.minute = DATE_TRUNC('minute', t.block_time)
WHERE t.blockchain = '{{chain}}'
  AND LOWER(t."to") = LOWER('{{wallet}}')
  AND t.value / POW(10, t.decimals) * COALESCE(p.price, 0) < {{max_usd}}
  AND t.value / POW(10, t.decimals) * COALESCE(p.price, 0) > 0
  {{__time_where}}
ORDER BY t.block_time DESC
`,

  "forensics.sanctions_check": `
SELECT
  t.block_time,
  t.hash          AS tx_hash,
  t."from",
  t."to",
  t.value / 1e18  AS eth_value,
  s.address       AS sanctioned_address,
  s.entity_name,
  s.list,
  'direct'        AS exposure_type
FROM {{chain}}.transactions t
JOIN compliance.sanctions_list s
  ON LOWER(t."from") = LOWER(s.address)
  OR LOWER(t."to")   = LOWER(s.address)
WHERE (
  LOWER(t."from") IN ({{addresses}})
  OR LOWER(t."to") IN ({{addresses}})
)
{{__time_where}}

UNION ALL

SELECT
  t2.block_time,
  t2.hash,
  t2."from",
  t2."to",
  t2.value / 1e18,
  s.address,
  s.entity_name,
  s.list,
  'indirect_1_hop'
FROM {{chain}}.transactions t1
JOIN {{chain}}.transactions t2
  ON LOWER(t2."from") = LOWER(t1."to")
JOIN compliance.sanctions_list s
  ON LOWER(t2."to") = LOWER(s.address)
WHERE LOWER(t1."from") IN ({{addresses}})
  AND t1.block_time >= NOW() - INTERVAL '{{days}} days'

ORDER BY block_time DESC
`,

  "forensics.pig_butchering": `
WITH outflows AS (
  SELECT
    t."to"              AS destination,
    SUM(t.value / 1e18) AS eth_sent,
    COUNT(*)            AS tx_count,
    MIN(t.block_time)   AS first_send,
    MAX(t.block_time)   AS last_send
  FROM {{chain}}.transactions t
  WHERE LOWER(t."from") = LOWER('{{wallet}}')
    AND t.value > 0
    AND t.success = TRUE
    {{__time_where}}
  GROUP BY 1
),
risk_scored AS (
  SELECT
    o.*,
    COALESCE(l.category, 'unknown')  AS destination_label,
    COALESCE(l.risk_score, 50)       AS risk_score,
    l.name                           AS entity_name
  FROM outflows o
  LEFT JOIN labels.addresses l ON LOWER(l.address) = LOWER(o.destination)
)
SELECT
  destination,
  entity_name,
  destination_label,
  risk_score,
  eth_sent,
  tx_count,
  first_send,
  last_send,
  CASE
    WHEN destination_label IN ('scam', 'phishing', 'fraud') THEN 'HIGH — known scam address'
    WHEN eth_sent > 5 AND tx_count > 3                      THEN 'MEDIUM — large repeated outflows'
    ELSE 'LOW'
  END AS pig_butchering_risk
FROM risk_scored
ORDER BY risk_score DESC, eth_sent DESC
`,

  "forensics.wash_trading_cross": `
WITH swaps AS (
  SELECT
    taker,
    tx_hash,
    block_time,
    token_bought_address,
    token_sold_address,
    amount_usd,
    project
  FROM dex.swaps
  WHERE blockchain = '{{chain}}'
    AND (
      LOWER(token_bought_address) = LOWER('{{token_address}}')
      OR LOWER(token_sold_address) = LOWER('{{token_address}}')
    )
    {{__time_where}}
),
round_trips AS (
  SELECT
    a.taker,
    a.project     AS buy_dex,
    b.project     AS sell_dex,
    a.amount_usd  AS buy_usd,
    b.amount_usd  AS sell_usd,
    ABS(a.amount_usd - b.amount_usd) AS pnl_usd,
    a.block_time  AS buy_time,
    b.block_time  AS sell_time
  FROM swaps a
  JOIN swaps b
    ON  a.taker = b.taker
    AND LOWER(a.token_bought_address) = LOWER(b.token_sold_address)
    AND b.block_time > a.block_time
    AND b.block_time < a.block_time + INTERVAL '1 hour'
)
SELECT
  taker,
  COUNT(*)         AS round_trip_count,
  SUM(buy_usd)     AS total_volume_usd,
  AVG(pnl_usd)     AS avg_net_pnl_usd,
  MIN(pnl_usd)     AS min_pnl_usd
FROM round_trips
GROUP BY 1
HAVING COUNT(*) >= 3
ORDER BY round_trip_count DESC
`,

};