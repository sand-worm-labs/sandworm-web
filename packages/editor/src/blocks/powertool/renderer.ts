import type { GenerateResult, ResolvedParams, ToolDefinition, ToolTemplate } from "./types.js";

// ─── Template interpolation ───────────────────────────────────────────────────

/**
 * Replaces all {{key}} placeholders in a template string with the
 * corresponding value from params. Handles three value shapes:
 *
 *  - string / number / boolean  →  inserted as-is
 *  - string[]                   →  joined as comma-separated SQL literals
 *                                   e.g. ['0xabc','0xdef'] → "'0xabc','0xdef'"
 *
 * Unknown keys are left as-is (no error) so partial renders are safe
 * during development.
 */
export function interpolate(template: string, params: ResolvedParams): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const value = params[key];
    if (value === undefined || value === null) return `{{${key}}}`;
    if (Array.isArray(value)) {
      return value.map(v => `'${v}'`).join(", ");
    }
    return String(value);
  });
}

// ─── SQL clause helpers ───────────────────────────────────────────────────────

/**
 * Returns a WHERE clause fragment that filters rows to the last N days.
 * Returns an empty string when days === "all".
 *
 * @param days   string value from TIME_RANGE_OPTIONS, or "all"
 * @param col    the timestamp column to filter on (default "block_time")
 */
export function timeWhere(days: string | number, col = "block_time"): string {
  if (String(days) === "all") return "";
  return `AND ${col} >= NOW() - INTERVAL '${days} days'`;
}

/**
 * Returns a WHERE clause fragment that filters by protocol/project name.
 * Returns an empty string when protocol is "all" or undefined.
 *
 * @param protocol  value from a protocol SelectOption
 * @param col       the column to match on (default "project")
 */
export function protocolWhere(protocol: string | undefined, col = "project"): string {
  if (!protocol || protocol === "all") return "";
  return `AND ${col} = '${protocol}'`;
}

/**
 * Wraps a SQL string in a Python cell with a standard Sandworm header comment.
 * Assigns the result to `dfName` using the platform's `_sandworm_query()` runner
 * (namespaced rather than a bare `query` so it can't collide with a user's own
 * variable of that name in the same persisted kernel session).
 *
 * The header comment lists each resolved param so notebooks are self-documenting.
 */
export function wrapSqlInPython(
  toolName: string,
  sql: string,
  dfName: string,
  params: ResolvedParams
): string {
  const paramLines = Object.entries(params)
    .map(([k, v]) => `#   ${k}: ${JSON.stringify(v)}`)
    .join("\n");

  return `# Sandworm Power Toolbox — ${toolName}
${paramLines}

import pandas as pd

sql = """
${sql.trim()}
"""

${dfName} = _sandworm_query(sql)
${dfName}
`;
}

// ─── Dataframe name derivation ────────────────────────────────────────────────

/**
 * Derives a safe Python variable name from a tool id, optionally with a
 * numeric suffix to disambiguate from an existing variable of the same name.
 * "forensics.fund_trace" → "ptb_forensics_fund_trace"
 * "forensics.fund_trace" + 2 → "ptb_forensics_fund_trace_2"
 *
 * The "ptb_" prefix namespaces toolbox dataframes in doc.dataframes, avoiding
 * collisions with user-defined variable names. Without a dfSuffix, two blocks
 * running the *same* tool in one notebook session would both compute the
 * identical name and silently overwrite each other's dataframe in the
 * shared, persisted kernel — the caller is expected to check the session's
 * existing variable names and pass the smallest suffix (2, 3, ...) that
 * isn't already taken (see PowerToolboxBlockExecutorService.run).
 */
export function dfNameFromToolId(toolId: string, dfSuffix?: string | number): string {
  const base = "ptb_" + toolId.replace(/[^a-zA-Z0-9]/g, "_");
  if (dfSuffix === undefined || dfSuffix === "") return base;
  return `${base}_${dfSuffix}`;
}

// ─── Main render entry point ──────────────────────────────────────────────────

// A template is treated as raw SQL (and gets wrapped via wrapSqlInPython)
// only when it looks like a bare SQL statement — starts with one of the
// usual statement keywords once comments/whitespace are stripped. Anything
// else (print statements, a `sql = """..."""` + _sandworm_query(...) template, plain
// Python) is assumed to already be valid Python and passed through as-is
// after interpolation, unwrapped.
const SQL_STATEMENT_RE = /^(select|with|insert|update|delete)\b/i;

function looksLikeBareSql(template: string): boolean {
  const withoutComments = template
    .split("\n")
    .filter(line => !line.trim().startsWith("#"))
    .join("\n")
    .trim();
  return SQL_STATEMENT_RE.test(withoutComments);
}

/**
 * Renders a tool template with the user-supplied params.
 *
 * Steps:
 *  1. Fill in each param's declared default for any key the caller didn't
 *     supply — a param the user never touched in the form (or that an AI
 *     block-creation call omitted) still needs a value in scope, otherwise
 *     its {{placeholder}} is left un-interpolated and the raw `{{...}}`
 *     reaches Python as literal syntax (e.g. `{{count}}` parses as a nested
 *     set literal referencing an undefined `count` name).
 *  2. Inject renderer-controlled reserved keys (__df_name, __tool_name,
 *     __time_where, __protocol_where) into params before interpolation.
 *  3. Interpolate all {{key}} placeholders.
 *  4. If the template is bare SQL, wrap it in a Python cell via
 *     wrapSqlInPython. Otherwise it's already Python (print statements, a
 *     `sql = """..."""` + _sandworm_query(...) mix, etc.) — pass it through unwrapped.
 *
 * The caller (registry.ts) is responsible for looking up the correct
 * template from the TemplateMap.
 *
 * @param dfSuffix  a numeric suffix (2, 3, ...) to disambiguate __df_name when
 *   the caller has determined the plain tool-derived name is already in use
 *   in this notebook's kernel session. Omit for the first/only use of a tool.
 */
export function renderTool(
  definition: ToolDefinition,
  template: ToolTemplate,
  params: ResolvedParams,
  dfSuffix?: string | number
): GenerateResult {
  const dfName = dfNameFromToolId(definition.id, dfSuffix);

  const defaults: ResolvedParams = {};
  for (const param of definition.params) {
    if (param.default !== undefined) defaults[param.key] = param.default;
  }

  // Reserved keys available in every template — no tool needs to redeclare these.
  const augmented: ResolvedParams = {
    ...defaults,
    ...params,
    __df_name: dfName,
    __tool_name: definition.name,
    // Pre-render the common WHERE fragments so templates stay readable.
    // Templates that need a non-default column pass the clause manually.
    __time_where: timeWhere((params["days"] as string) ?? "30"),
    __protocol_where: protocolWhere(params["protocol"] as string),
  };

  if (!looksLikeBareSql(template)) {
    return { language: "python", source: interpolate(template, augmented) };
  }

  const sql = interpolate(template, augmented);
  const source = wrapSqlInPython(definition.name, sql, dfName, params);

  return { language: "python", source };
}