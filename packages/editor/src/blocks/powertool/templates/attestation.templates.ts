import type { TemplateMap } from "../types.js";

export const ATTESTATION_TEMPLATES: TemplateMap = {

  "attestations.volume": `
SELECT
  DATE_TRUNC('day', block_time)              AS day,
  schema_uid,
  COUNT(*)                                   AS attestation_count,
  COUNT(DISTINCT attester)                   AS unique_attesters,
  COUNT(DISTINCT recipient)                  AS unique_recipients,
  COUNT(*) FILTER (WHERE revoked = TRUE)     AS revoked_count
FROM eas.attestations
WHERE blockchain = '{{chain}}'
  {{__time_where}}
GROUP BY 1, 2
ORDER BY 1, attestation_count DESC
`,

  "attestations.by_schema": `
SELECT
  DATE_TRUNC('day', block_time)                        AS day,
  COUNT(*)                                             AS attestation_count,
  COUNT(DISTINCT attester)                             AS unique_attesters,
  COUNT(DISTINCT recipient)                            AS unique_recipients,
  COUNT(*) FILTER (WHERE revoked = TRUE)               AS revoked_count,
  COUNT(*) FILTER (WHERE revocation_time IS NULL)      AS active_count,
  SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', block_time)) AS cumulative_count
FROM eas.attestations
WHERE blockchain = '{{chain}}'
  AND schema_uid = '{{schema_uid}}'
  {{__time_where}}
GROUP BY 1
ORDER BY 1
`,

  "attestations.multi_schema": `
SELECT
  DATE_TRUNC('day', block_time)           AS day,
  schema_uid,
  COUNT(*)                                AS attestation_count,
  COUNT(DISTINCT attester)                AS unique_attesters,
  COUNT(DISTINCT recipient)               AS unique_recipients,
  COUNT(*) FILTER (WHERE revoked = TRUE)  AS revoked_count
FROM eas.attestations
WHERE blockchain = '{{chain}}'
  AND schema_uid IN ({{schema_uids}})
  {{__time_where}}
GROUP BY 1, 2
ORDER BY 1, attestation_count DESC
`,

  "attestations.attestor_analytics": `
SELECT
  DATE_TRUNC('day', block_time)           AS day,
  schema_uid,
  COUNT(*)                                AS attestation_count,
  COUNT(DISTINCT recipient)               AS unique_recipients,
  COUNT(*) FILTER (WHERE revoked = TRUE)  AS revocations,
  COUNT(*) FILTER (WHERE expiration_time IS NOT NULL) AS expiring_count
FROM eas.attestations
WHERE blockchain = '{{chain}}'
  AND LOWER(attester) = LOWER('{{attestor_address}}')
  {{__time_where}}
GROUP BY 1, 2
ORDER BY 1, attestation_count DESC
`,

  "attestations.recipient_analytics": `
SELECT
  block_time,
  uid,
  schema_uid,
  attester,
  expiration_time,
  revoked,
  revocation_time,
  ref_uid,
  data
FROM eas.attestations
WHERE blockchain = '{{chain}}'
  AND LOWER(recipient) = LOWER('{{recipient_address}}')
ORDER BY block_time DESC
`,

  "attestations.gitcoin_passport": `
SELECT
  CASE
    WHEN '{{wallet}}' != '' THEN stamp_type
    ELSE CAST(FLOOR(score / 5) * 5 AS VARCHAR) || '–' || CAST(FLOOR(score / 5) * 5 + 4 AS VARCHAR)
  END AS label,
  CASE
    WHEN '{{wallet}}' != '' THEN COUNT(*)
    ELSE COUNT(DISTINCT address)
  END AS count,
  AVG(score) AS avg_score,
  MIN(score) AS min_score,
  MAX(score) AS max_score
FROM gitcoin.passport_scores
WHERE blockchain = '{{chain}}'
  AND (
    '{{wallet}}' = ''
    OR LOWER(address) = LOWER('{{wallet}}')
  )
GROUP BY 1
ORDER BY
  CASE WHEN '{{wallet}}' != '' THEN block_time::VARCHAR ELSE label END
`,

};