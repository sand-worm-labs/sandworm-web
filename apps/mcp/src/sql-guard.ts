// Every query on this server is paid for by an anonymous caller and runs with
// our Trino credentials, so anything that isn't a plain read is refused before
// a payment challenge is even issued. This is a first line of defence only —
// the Trino user this server connects as must also be read-only.

const MAX_SQL_LENGTH = 20_000;

// Statements that read data. Everything else (INSERT, DROP, CALL, SET, ...) is
// rejected, as is EXPLAIN because `EXPLAIN ANALYZE` executes the query.
const READ_ONLY_START = /^(select|with|show|describe|desc)\b/i;

export type GuardResult = { ok: true; sql: string } | { ok: false; reason: string };

// Blanks out comments, string literals and quoted identifiers so the checks
// below only ever look at real SQL syntax — `select 'a; drop table x'` is
// harmless, `select 1; drop table x` is not.
function stripLiteralsAndComments(sql: string): { code: string } | { error: string } {
  let code = '';
  let i = 0;

  while (i < sql.length) {
    const char = sql[i];
    const next = sql[i + 1];

    if (char === '-' && next === '-') {
      const end = sql.indexOf('\n', i);
      i = end === -1 ? sql.length : end;
      code += ' ';
    } else if (char === '/' && next === '*') {
      const end = sql.indexOf('*/', i + 2);
      if (end === -1) return { error: 'Unterminated /* comment' };
      i = end + 2;
      code += ' ';
    } else if (char === "'" || char === '"') {
      let j = i + 1;
      for (;;) {
        if (j >= sql.length) return { error: `Unterminated ${char === "'" ? 'string literal' : 'quoted identifier'}` };
        if (sql[j] === char) {
          // A doubled quote is an escaped quote, not the end of the literal.
          if (sql[j + 1] === char) {
            j += 2;
            continue;
          }
          break;
        }
        j += 1;
      }
      i = j + 1;
      code += ' ';
    } else {
      code += char;
      i += 1;
    }
  }

  return { code };
}

export function guardSql(input: string): GuardResult {
  const sql = input.trim().replace(/;+\s*$/, '').trim();

  if (sql.length === 0) return { ok: false, reason: 'Query is empty.' };
  if (sql.length > MAX_SQL_LENGTH) return { ok: false, reason: `Query is longer than ${MAX_SQL_LENGTH} characters.` };

  const stripped = stripLiteralsAndComments(sql);
  if ('error' in stripped) return { ok: false, reason: stripped.error };

  const code = stripped.code.trim();
  if (code.includes(';')) return { ok: false, reason: 'Only a single statement is allowed.' };
  if (!READ_ONLY_START.test(code)) {
    return { ok: false, reason: 'Only read-only queries are allowed (SELECT, WITH, SHOW, DESCRIBE).' };
  }

  return { ok: true, sql };
}
