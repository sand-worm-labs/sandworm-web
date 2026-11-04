-- Every cell change an agent made through MCP (add_cell / update_cell / delete_cell),
-- one row per call, oldest first. Read from the mcp_tool_call events in messages.parts.
SELECT
  (e->>'at')::timestamptz                       AS at,
  e->>'tool'                                    AS tool,
  d.title                                       AS notebook,
  c.document_id                                 AS notebook_id,
  coalesce(e->'arguments'->>'cellId', r->'cell'->>'id') AS cell_id,
  coalesce(e->'arguments'->>'type', r->'cell'->>'kind') AS cell_type,
  e->'arguments'->>'title'                      AS title,
  e->'arguments'->>'content'                    AS content,       -- new text (null on delete / title-only edits)
  e->'arguments'->>'dataSource'                 AS data_source,
  e->'arguments'->>'dataframeName'              AS dataframe_name,
  (e->>'is_error')::boolean                     AS is_error,
  CASE WHEN (e->>'is_error')::boolean THEN e->>'result' END AS error,
  (e->>'duration_ms')::int                      AS duration_ms,
  e->'arguments'->>'request'                    AS request,
  c.user_id,
  c.id                                          AS chat_id,
  m.id                                          AS message_id
FROM messages m
JOIN chats c    ON c.id = m.chat_id
JOIN document d ON d.id = c.document_id
CROSS JOIN LATERAL jsonb_array_elements(m.parts) AS e
-- `result` is stored as text; parse it only when it is valid JSON (errors are plain
-- text, and results over 20k chars were cut off). pg_input_is_valid needs Postgres 16+.
LEFT JOIN LATERAL (
  SELECT CASE WHEN pg_input_is_valid(e->>'result', 'jsonb') THEN (e->>'result')::jsonb END AS r
) parsed ON true
WHERE m."jobId" LIKE 'mcp-%'
  AND e->>'type' = 'mcp_tool_call'
  AND e->>'tool' IN ('add_cell', 'update_cell', 'delete_cell')
  -- AND c.document_id = '<notebook uuid>'
ORDER BY at;
