import type { TemplateMap } from "../types.js";

export const NFT_TEMPLATES: TemplateMap = {

  "nft.collection_volume": `
SELECT
  DATE_TRUNC('day', block_time)  AS day,
  COUNT(*)                       AS sale_count,
  COUNT(DISTINCT buyer)          AS unique_buyers,
  COUNT(DISTINCT seller)         AS unique_sellers,
  SUM(price_usd)                 AS volume_usd,
  MIN(price_usd)                 AS floor_usd,
  AVG(price_usd)                 AS avg_sale_usd,
  MAX(price_usd)                 AS max_sale_usd
FROM nft.trades
WHERE blockchain = '{{chain}}'
  AND LOWER(nft_contract_address) = LOWER('{{contract_address}}')
  AND ('{{marketplace}}' = 'all' OR project = '{{marketplace}}')
  {{__time_where}}
GROUP BY 1
ORDER BY 1
`,

  "nft.holder_distribution": `
WITH holdings AS (
  SELECT
    address,
    SUM(amount) AS token_count
  FROM (
    SELECT "to"   AS address,  1 AS amount FROM nft.transfers
    WHERE blockchain = '{{chain}}'
      AND LOWER(contract_address) = LOWER('{{contract_address}}')
    UNION ALL
    SELECT "from" AS address, -1 AS amount FROM nft.transfers
    WHERE blockchain = '{{chain}}'
      AND LOWER(contract_address) = LOWER('{{contract_address}}')
  ) t
  GROUP BY address
  HAVING SUM(amount) > 0
    AND address != '0x0000000000000000000000000000000000000000'
)
SELECT
  CASE
    WHEN token_count = 1       THEN '1'
    WHEN token_count BETWEEN 2 AND 5  THEN '2–5'
    WHEN token_count BETWEEN 6 AND 20 THEN '6–20'
    ELSE '20+'
  END AS bucket,
  COUNT(*)         AS wallet_count,
  SUM(token_count) AS nfts_held,
  COUNT(*)::FLOAT / SUM(COUNT(*)) OVER () * 100 AS wallet_share_pct
FROM holdings
GROUP BY 1
ORDER BY MIN(token_count)
`,

  "nft.mint_activity": `
SELECT
  DATE_TRUNC('day', t.block_time)  AS day,
  COUNT(*)                         AS mints,
  COUNT(DISTINCT t."to")           AS unique_minters,
  SUM(tx.value / 1e18)             AS eth_revenue
FROM nft.transfers t
JOIN {{chain}}.transactions tx ON t.tx_hash = tx.hash
WHERE t.blockchain = '{{chain}}'
  AND LOWER(t.contract_address) = LOWER('{{contract_address}}')
  AND LOWER(t."from") = '0x0000000000000000000000000000000000000000'
  {{__time_where}}
GROUP BY 1
ORDER BY 1
`,

  "nft.wash_trading": `
WITH trades AS (
  SELECT
    buyer,
    seller,
    token_id,
    price_usd,
    block_time,
    tx_hash
  FROM nft.trades
  WHERE blockchain = '{{chain}}'
    AND LOWER(nft_contract_address) = LOWER('{{contract_address}}')
    {{__time_where}}
),
round_trips AS (
  SELECT
    a.buyer        AS wallet_a,
    a.seller       AS wallet_b,
    a.token_id,
    a.price_usd    AS price_a,
    b.price_usd    AS price_b,
    b.price_usd - a.price_usd AS apparent_gain_usd,
    a.tx_hash      AS tx_a,
    b.tx_hash      AS tx_b,
    a.block_time   AS time_a,
    b.block_time   AS time_b
  FROM trades a
  JOIN trades b
    ON  a.buyer    = b.seller
    AND a.seller   = b.buyer
    AND a.token_id = b.token_id
    AND b.block_time > a.block_time
)
SELECT *
FROM round_trips
ORDER BY ABS(apparent_gain_usd) DESC
`,

  "nft.floor_price_history": `
SELECT
  DATE_TRUNC('day', block_time)  AS day,
  MIN(price_eth)                 AS floor_eth,
  MIN(price_usd)                 AS floor_usd,
  COUNT(*)                       AS sales_count,
  SUM(price_usd)                 AS volume_usd,
  AVG(price_usd)                 AS avg_sale_usd
FROM nft.trades
WHERE blockchain = '{{chain}}'
  AND LOWER(nft_contract_address) = LOWER('{{contract_address}}')
  {{__time_where}}
GROUP BY 1
ORDER BY 1
`,

  "nft.whale_holders": `
SELECT
  address,
  SUM(amount) AS token_count
FROM (
  SELECT "to"   AS address,  1 AS amount FROM nft.transfers
  WHERE blockchain = '{{chain}}'
    AND LOWER(contract_address) = LOWER('{{contract_address}}')
  UNION ALL
  SELECT "from" AS address, -1 AS amount FROM nft.transfers
  WHERE blockchain = '{{chain}}'
    AND LOWER(contract_address) = LOWER('{{contract_address}}')
) t
GROUP BY 1
HAVING SUM(amount) > 0
  AND address != '0x0000000000000000000000000000000000000000'
ORDER BY token_count DESC
LIMIT {{top_n}}
`,

  "nft.wallet_pnl": `
SELECT
  nft_contract_address,
  collection_name,
  SUM(CASE WHEN LOWER(buyer)  = LOWER('{{wallet}}') THEN -price_usd ELSE 0 END) AS cost_usd,
  SUM(CASE WHEN LOWER(seller) = LOWER('{{wallet}}') THEN  price_usd ELSE 0 END) AS proceeds_usd,
  SUM(CASE
    WHEN LOWER(seller) = LOWER('{{wallet}}') THEN  price_usd
    WHEN LOWER(buyer)  = LOWER('{{wallet}}') THEN -price_usd
    ELSE 0
  END) AS realised_pnl_usd,
  COUNT(DISTINCT token_id) AS nfts_traded
FROM nft.trades
WHERE blockchain = '{{chain}}'
  AND (
    LOWER(buyer)  = LOWER('{{wallet}}')
    OR LOWER(seller) = LOWER('{{wallet}}')
  )
  {{__time_where}}
GROUP BY 1, 2
ORDER BY realised_pnl_usd DESC
`,

  "nft.marketplace_breakdown": `
SELECT
  project AS marketplace,
  COUNT(*)    AS sale_count,
  SUM(price_usd) AS volume_usd,
  SUM(price_usd) / NULLIF(SUM(SUM(price_usd)) OVER (), 0) * 100 AS volume_share_pct,
  AVG(price_usd) AS avg_sale_usd
FROM nft.trades
WHERE blockchain = '{{chain}}'
  AND LOWER(nft_contract_address) = LOWER('{{contract_address}}')
  {{__time_where}}
GROUP BY 1
ORDER BY volume_usd DESC
`,

  "nft.holder_overlap": `
WITH holdings AS (
  SELECT
    address,
    contract_address,
    SUM(amount) AS bal
  FROM (
    SELECT "to"   AS address, contract_address,  1 AS amount FROM nft.transfers
    WHERE blockchain = '{{chain}}'
      AND LOWER(contract_address) IN ({{collections}})
    UNION ALL
    SELECT "from" AS address, contract_address, -1 AS amount FROM nft.transfers
    WHERE blockchain = '{{chain}}'
      AND LOWER(contract_address) IN ({{collections}})
  ) t
  GROUP BY 1, 2
  HAVING SUM(amount) > 0
    AND address != '0x0000000000000000000000000000000000000000'
)
SELECT
  address,
  COUNT(DISTINCT contract_address)    AS collections_held,
  ARRAY_AGG(DISTINCT contract_address) AS held_collections
FROM holdings
GROUP BY 1
HAVING COUNT(DISTINCT contract_address) > 1
ORDER BY collections_held DESC
`,

  "nft.trait_price": `
SELECT
  trait_type,
  trait_value,
  COUNT(DISTINCT t.token_id)  AS token_count,
  COUNT(s.tx_hash)            AS sale_count,
  AVG(s.price_usd)            AS avg_sale_usd,
  MIN(s.price_usd)            AS min_sale_usd,
  MAX(s.price_usd)            AS max_sale_usd,
  COUNT(DISTINCT t.token_id)::FLOAT /
    NULLIF(SUM(COUNT(DISTINCT t.token_id)) OVER (PARTITION BY trait_type), 0) * 100 AS rarity_pct
FROM nft.token_attributes t
LEFT JOIN nft.trades s
  ON LOWER(s.nft_contract_address) = LOWER(t.contract_address)
  AND s.token_id = t.token_id
  AND s.blockchain = '{{chain}}'
  {{__time_where}}
WHERE t.blockchain = '{{chain}}'
  AND LOWER(t.contract_address) = LOWER('{{contract_address}}')
GROUP BY 1, 2
ORDER BY avg_sale_usd DESC NULLS LAST
`,

};