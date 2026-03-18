import type { TemplateMap } from "../types.js";

export const DEFI_TEMPLATES: TemplateMap = {

  "defi.dex_volume": `
SELECT
  DATE_TRUNC('day', block_time)  AS day,
  project,
  COUNT(*)                       AS swap_count,
  COUNT(DISTINCT taker)          AS unique_traders,
  SUM(amount_usd)                AS volume_usd,
  AVG(amount_usd)                AS avg_swap_usd,
  SUM(fee_usd)                   AS total_fees_usd
FROM dex.swaps
WHERE blockchain = '{{chain}}'
  AND (
    LOWER(token_bought_address) = LOWER('{{token_address}}')
    OR LOWER(token_sold_address) = LOWER('{{token_address}}')
  )
  {{__protocol_where}}
  {{__time_where}}
GROUP BY 1, 2
ORDER BY 1, volume_usd DESC
`,

  "defi.lp_positions": `
SELECT
  block_time,
  tx_hash,
  pool,
  token0,
  token1,
  amount0,
  amount1,
  amount_usd,
  event_type,
  nft_token_id
FROM dex.liquidity_events
WHERE blockchain = '{{chain}}'
  AND LOWER(provider) = LOWER('{{wallet}}')
  {{__protocol_where}}
  {{__time_where}}
ORDER BY block_time DESC
`,

  "defi.pool_tvl": `
SELECT
  DATE_TRUNC('day', ts)  AS day,
  pool_address,
  token0_symbol,
  token1_symbol,
  tvl_usd,
  token0_amount,
  token1_amount,
  fee_tier
FROM dex.pool_stats
WHERE blockchain = '{{chain}}'
  AND LOWER(pool_address) = LOWER('{{pool_address}}')
  AND ts >= NOW() - INTERVAL '{{days}} days'
ORDER BY day
`,

  "defi.token_price_dex": `
SELECT
  DATE_TRUNC('{{granularity}}', minute)  AS period,
  AVG(price)                             AS twap_usd,
  MIN(price)                             AS low_usd,
  MAX(price)                             AS high_usd,
  FIRST_VALUE(price) OVER (
    PARTITION BY DATE_TRUNC('{{granularity}}', minute)
    ORDER BY minute
  ) AS open_usd,
  LAST_VALUE(price) OVER (
    PARTITION BY DATE_TRUNC('{{granularity}}', minute)
    ORDER BY minute
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS close_usd
FROM prices.usd
WHERE blockchain = '{{chain}}'
  AND LOWER(contract_address) = LOWER('{{token_address}}')
  AND minute >= NOW() - INTERVAL '{{days}} days'
GROUP BY 1
ORDER BY 1
`,

  "defi.lending_positions": `
SELECT
  block_time,
  tx_hash,
  event_type,
  asset_symbol,
  amount / POW(10, decimals) AS amount,
  amount_usd,
  project,
  on_behalf_of
FROM lending.events
WHERE blockchain = '{{chain}}'
  AND LOWER(user_address) = LOWER('{{wallet}}')
  AND project = '{{protocol}}'
ORDER BY block_time DESC
`,

  "defi.liquidations": `
SELECT
  DATE_TRUNC('day', block_time)   AS day,
  collateral_asset_symbol,
  debt_asset_symbol,
  COUNT(*)                        AS liquidation_count,
  SUM(collateral_amount_usd)      AS total_collateral_seized_usd,
  SUM(debt_amount_usd)            AS total_debt_covered_usd,
  AVG(collateral_amount_usd)      AS avg_collateral_usd,
  COUNT(DISTINCT liquidatee)      AS unique_liquidatees,
  COUNT(DISTINCT liquidator)      AS unique_liquidators
FROM lending.liquidations
WHERE blockchain = '{{chain}}'
  AND project = '{{protocol}}'
  {{__time_where}}
GROUP BY 1, 2, 3
ORDER BY 1, total_collateral_seized_usd DESC
`,

  "defi.protocol_revenue": `
SELECT
  DATE_TRUNC('day', block_time)  AS day,
  project,
  SUM(fee_usd)                   AS total_fees_usd,
  COUNT(*)                       AS swap_count,
  SUM(amount_usd)                AS volume_usd,
  SUM(fee_usd) / NULLIF(SUM(amount_usd), 0) * 100 AS effective_fee_pct
FROM dex.swaps
WHERE blockchain = '{{chain}}'
  {{__protocol_where}}
  {{__time_where}}
GROUP BY 1, 2
ORDER BY 1
`,

  "defi.protocol_dau": `
SELECT
  DATE_TRUNC('day', block_time)  AS day,
  COUNT(DISTINCT taker)          AS dau,
  COUNT(DISTINCT taker) OVER (
    ORDER BY DATE_TRUNC('day', block_time)
    ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
  )                              AS mau_trailing_30d,
  COUNT(*)                       AS swap_count
FROM dex.swaps
WHERE blockchain = '{{chain}}'
  {{__protocol_where}}
  {{__time_where}}
GROUP BY 1
ORDER BY 1
`,

  "defi.protocol_tvl": `
SELECT
  DATE_TRUNC('day', ts)  AS day,
  protocol,
  blockchain,
  tvl_usd
FROM defi.tvl_snapshots
WHERE blockchain = '{{chain}}'
  AND protocol = '{{protocol}}'
  AND ts >= NOW() - INTERVAL '{{days}} days'
ORDER BY day
`,

  "defi.stablecoin_peg": `
SELECT
  DATE_TRUNC('hour', minute)   AS hour,
  AVG(price)                   AS avg_price_usd,
  MIN(price)                   AS min_price_usd,
  MAX(price)                   AS max_price_usd,
  AVG(price) - 1.0             AS avg_deviation,
  ABS(AVG(price) - 1.0) * 100  AS deviation_pct,
  MAX(ABS(price - 1.0)) * 100  AS max_deviation_pct
FROM prices.usd
WHERE blockchain = '{{chain}}'
  AND LOWER(contract_address) = LOWER('{{token_address}}')
  AND minute >= NOW() - INTERVAL '{{days}} days'
GROUP BY 1
ORDER BY 1
`,

  "defi.perps_oi": `
SELECT
  DATE_TRUNC('day', block_time)                              AS day,
  market,
  SUM(CASE WHEN side = 'long'  THEN size_usd ELSE 0 END)    AS long_oi_usd,
  SUM(CASE WHEN side = 'short' THEN size_usd ELSE 0 END)    AS short_oi_usd,
  AVG(funding_rate)                                          AS avg_funding_rate,
  SUM(volume_usd)                                            AS daily_volume_usd,
  COUNT(DISTINCT trader)                                     AS unique_traders
FROM perps.trades
WHERE blockchain = '{{chain}}'
  AND project = '{{protocol}}'
  {{__time_where}}
GROUP BY 1, 2
ORDER BY 1, daily_volume_usd DESC
`,

  "defi.governance": `
SELECT
  proposal_id,
  block_time          AS created_at,
  description,
  votes_for,
  votes_against,
  votes_abstain,
  votes_for + votes_against + votes_abstain          AS total_votes,
  votes_for::FLOAT / NULLIF(votes_for + votes_against + votes_abstain, 0) * 100 AS for_pct,
  CASE WHEN votes_for > votes_against THEN 'passed' ELSE 'defeated' END AS outcome,
  quorum_reached
FROM governance.proposals
WHERE blockchain = '{{chain}}'
  AND LOWER(governor_address) = LOWER('{{governor_address}}')
  {{__time_where}}
ORDER BY block_time DESC
`,

  "defi.treasury": `
WITH flows AS (
  SELECT
    DATE_TRUNC('day', t.block_time) AS day,
    t.contract_address,
    t.symbol,
    SUM(CASE
      WHEN LOWER("to")   = LOWER('{{treasury_address}}') THEN  t.value / POW(10, t.decimals) * COALESCE(p.price, 0)
      ELSE 0
    END) AS inflow_usd,
    SUM(CASE
      WHEN LOWER("from") = LOWER('{{treasury_address}}') THEN  t.value / POW(10, t.decimals) * COALESCE(p.price, 0)
      ELSE 0
    END) AS outflow_usd
  FROM erc20.transfers t
  LEFT JOIN prices.usd p
    ON LOWER(p.contract_address) = LOWER(t.contract_address)
    AND p.blockchain = t.blockchain
    AND p.minute = DATE_TRUNC('minute', t.block_time)
  WHERE t.blockchain = '{{chain}}'
    AND (
      LOWER("from") = LOWER('{{treasury_address}}')
      OR LOWER("to") = LOWER('{{treasury_address}}')
    )
    {{__time_where}}
  GROUP BY 1, 2, 3
)
SELECT
  day,
  SUM(inflow_usd)  AS total_inflows_usd,
  SUM(outflow_usd) AS total_outflows_usd,
  SUM(inflow_usd - outflow_usd) AS net_flow_usd,
  SUM(SUM(inflow_usd - outflow_usd)) OVER (ORDER BY day) AS running_balance_usd
FROM flows
GROUP BY day
ORDER BY day
`,

  "defi.mev_arb": `
SELECT
  DATE_TRUNC('day', block_time)  AS day,
  searcher_address,
  COUNT(*)                       AS arb_count,
  SUM(profit_usd)                AS total_profit_usd,
  AVG(profit_usd)                AS avg_profit_usd,
  SUM(gas_cost_usd)              AS total_gas_cost_usd,
  SUM(profit_usd) - SUM(gas_cost_usd) AS net_profit_usd
FROM mev.arbitrages
WHERE blockchain = '{{chain}}'
  {{__time_where}}
GROUP BY 1, 2
ORDER BY net_profit_usd DESC
LIMIT {{top_n}}
`,

  "defi.mev_sandwich": `
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

  "defi.flashloans": `
SELECT
  DATE_TRUNC('day', block_time)  AS day,
  project,
  asset_symbol,
  COUNT(*)                       AS flashloan_count,
  SUM(amount_usd)                AS total_volume_usd,
  SUM(fee_usd)                   AS total_fees_usd,
  COUNT(DISTINCT initiator)      AS unique_borrowers
FROM lending.flashloans
WHERE blockchain = '{{chain}}'
  {{__protocol_where}}
  {{__time_where}}
GROUP BY 1, 2, 3
ORDER BY 1, total_volume_usd DESC
`,

  "defi.user_retention": `
WITH first_use AS (
  SELECT
    taker,
    DATE_TRUNC('week', MIN(block_time)) AS cohort_week
  FROM dex.swaps
  WHERE blockchain = '{{chain}}'
    {{__protocol_where}}
  GROUP BY 1
),
weekly_activity AS (
  SELECT
    taker,
    DATE_TRUNC('week', block_time) AS activity_week
  FROM dex.swaps
  WHERE blockchain = '{{chain}}'
    {{__protocol_where}}
    {{__time_where}}
  GROUP BY 1, 2
)
SELECT
  f.cohort_week,
  DATE_DIFF('week', f.cohort_week, wa.activity_week) AS weeks_since_first_use,
  COUNT(DISTINCT wa.taker)                            AS active_users,
  COUNT(DISTINCT wa.taker)::FLOAT /
    NULLIF(COUNT(DISTINCT f.taker) OVER (
      PARTITION BY f.cohort_week
    ), 0) * 100                                       AS retention_pct
FROM first_use f
JOIN weekly_activity wa
  ON f.taker = wa.taker
  AND wa.activity_week >= f.cohort_week
GROUP BY 1, 2
ORDER BY 1, 2
`,

  "defi.token_vesting": `
SELECT
  block_time              AS unlock_time,
  tx_hash,
  recipient,
  amount / POW(10, 18)    AS unlocked_amount,
  vesting_contract,
  vest_type
FROM token_unlocks.events
WHERE blockchain = '{{chain}}'
  AND LOWER(token_address) = LOWER('{{token_address}}')
  {{__time_where}}
ORDER BY block_time
`,

  "defi.yield_farming": `
SELECT
  DATE_TRUNC('day', block_time)  AS day,
  reward_token_symbol,
  SUM(reward_amount_usd)         AS daily_rewards_usd,
  AVG(apy)                       AS avg_apy,
  COUNT(DISTINCT farmer)         AS unique_farmers,
  SUM(tvl_usd)                   AS pool_tvl_usd
FROM farming.reward_events
WHERE blockchain = '{{chain}}'
  AND LOWER(pool_address) = LOWER('{{pool_address}}')
  {{__time_where}}
GROUP BY 1, 2
ORDER BY 1
`,

  "defi.protocol_comparison": `
SELECT
  project,
  COUNT(*)               AS swap_count,
  COUNT(DISTINCT taker)  AS unique_users,
  SUM(amount_usd)        AS volume_usd,
  SUM(fee_usd)           AS total_fees_usd,
  AVG(fee_usd / NULLIF(amount_usd, 0)) * 100                      AS avg_fee_pct,
  SUM(amount_usd) / NULLIF(SUM(SUM(amount_usd)) OVER (), 0) * 100 AS volume_share_pct
FROM dex.swaps
WHERE blockchain = '{{chain}}'
  {{__time_where}}
GROUP BY 1
ORDER BY volume_usd DESC
`,

};