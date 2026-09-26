import { guardSql } from './sql-guard.ts';
import { TrinoQueryError, type QueryResult } from './trino.ts';

export type ToolResult = {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
};

// What the payment layer hands back after checking the caller's credential:
// either a challenge to send back (unpaid), or proof of payment to attach.
export type ChargeOutcome =
  | { status: 402; challenge: unknown }
  | { status: 200; withReceipt: (result: ToolResult) => ToolResult };

export type RunQueryDeps = {
  charge: (extra: unknown) => Promise<ChargeOutcome>;
  query: (sql: string) => Promise<QueryResult>;
};

const text = (value: string, isError = false): ToolResult => ({
  content: [{ type: 'text', text: value }],
  ...(isError ? { isError: true } : {}),
});

export async function handleRunQuery(input: { sql: string }, extra: unknown, deps: RunQueryDeps): Promise<ToolResult> {
  // Refuse bad queries before asking for money, so nobody pays for a rejection.
  const guarded = guardSql(input.sql);
  if (!guarded.ok) return text(guarded.reason, true);

  const outcome = await deps.charge(extra);
  // An unpaid call is answered with the challenge, which the client turns into
  // a payment and retries. The MCP transport expects it thrown, not returned.
  if (outcome.status === 402) throw outcome.challenge;

  // From here the caller has paid. Even a failed query gets a receipt, so they
  // hold proof of what they were charged for.
  try {
    const result = await deps.query(guarded.sql);
    return outcome.withReceipt(
      text(
        JSON.stringify({
          columns: result.columns,
          rows: result.rows,
          rowCount: result.rows.length,
          truncated: result.truncated,
        })
      )
    );
  } catch (err) {
    if (err instanceof TrinoQueryError) return outcome.withReceipt(text(err.message, true));
    throw err;
  }
}
