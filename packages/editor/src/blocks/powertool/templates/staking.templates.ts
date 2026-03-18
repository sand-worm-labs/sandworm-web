import type { TemplateMap } from "../types.js";

export const STAKING_TEMPLATES: TemplateMap = {

  "staking.validator_performance": `
SELECT
  DATE_TRUNC('day', ts)           AS day,
  validator_index,
  SUM(attestation_reward)         AS daily_attestation_reward_gwei,
  COUNT(*) FILTER (WHERE missed)  AS missed_attestations,
  COUNT(*)                        AS total_slots,
  SUM(proposal_reward)            AS proposal_reward_gwei,
  SUM(attestation_reward + proposal_reward) / 1e9 AS daily_reward_eth
FROM staking.validator_stats
WHERE validator_index = {{validator_index}}
  AND ts >= NOW() - INTERVAL '{{days}} days'
GROUP BY 1, 2
ORDER BY 1
`,

  "staking.flows": `
SELECT
  DATE_TRUNC('day', block_time)  AS day,
  event_type,
  COUNT(*)                       AS count,
  SUM(amount / 1e9)              AS eth_amount,
  COUNT(DISTINCT depositor)      AS unique_depositors
FROM staking.events
WHERE blockchain = 'ethereum'
  AND event_type IN ('deposit', 'withdrawal')
  {{__time_where}}
GROUP BY 1, 2
ORDER BY 1, 2
`,

  "staking.rewards": `
SELECT
  DATE_TRUNC('day', block_time)  AS day,
  SUM(amount / 1e18)             AS daily_reward_eth,
  SUM(SUM(amount / 1e18)) OVER (
    ORDER BY DATE_TRUNC('day', block_time)
  )                              AS cumulative_reward_eth,
  COUNT(*)                       AS withdrawal_count
FROM staking.withdrawals
WHERE blockchain = 'ethereum'
  AND LOWER(withdrawal_address) = LOWER('{{withdrawal_address}}')
  {{__time_where}}
GROUP BY 1
ORDER BY 1
`,

  "staking.validator_queue": `
SELECT
  DATE_TRUNC('day', ts)          AS day,
  entering_validators,
  exiting_validators,
  estimated_wait_hours_entry,
  estimated_wait_hours_exit,
  total_active_validators,
  churn_limit
FROM staking.queue_snapshots
WHERE ts >= NOW() - INTERVAL '{{days}} days'
ORDER BY day
`,

  "staking.liquid_staking_tvl": `
SELECT
  DATE_TRUNC('day', ts)  AS day,
  protocol,
  tvl_eth,
  tvl_usd,
  tvl_usd / NULLIF(
    SUM(tvl_usd) OVER (PARTITION BY DATE_TRUNC('day', ts)), 0
  ) * 100 AS market_share_pct
FROM staking.lst_tvl
WHERE blockchain = '{{chain}}'
  AND ('{{protocol}}' = 'all' OR protocol = '{{protocol}}')
  AND ts >= NOW() - INTERVAL '{{days}} days'
ORDER BY day, tvl_usd DESC
`,

  "staking.restaking": `
SELECT
  DATE_TRUNC('day', block_time)  AS day,
  avs_address,
  operator_address,
  strategy,
  COUNT(DISTINCT staker)         AS unique_stakers,
  SUM(shares / 1e18)             AS total_shares_eth
FROM eigenlayer.delegation_events
WHERE 1 = 1
  AND (
    '{{avs_address}}' = ''
    OR LOWER(avs_address) = LOWER('{{avs_address}}')
  )
  {{__time_where}}
GROUP BY 1, 2, 3, 4
ORDER BY 1, total_shares_eth DESC
`,

  "staking.slash_events": `
SELECT
  block_time,
  validator_index,
  slash_type,
  penalty_eth,
  whistleblower_reward_eth,
  tx_hash,
  block_number
FROM staking.slashings
WHERE block_time >= NOW() - INTERVAL '{{days}} days'
ORDER BY block_time DESC
`,

  "staking.delegation": `
SELECT
  block_time,
  event_type,
  delegator,
  operator,
  amount / 1e18 AS amount_eth,
  tx_hash
FROM staking.delegation_events
WHERE blockchain = '{{chain}}'
  AND (
    LOWER(delegator) = LOWER('{{address}}')
    OR LOWER(operator) = LOWER('{{address}}')
  )
  {{__time_where}}
ORDER BY block_time DESC
`,

};