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
 * Assigns the result to `dfName` using the platform's `query()` runner.
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

${dfName} = query(sql)
${dfName}
`;
}

// ─── Dataframe name derivation ────────────────────────────────────────────────

/**
 * Derives a safe Python variable name from a tool id.
 * "forensics.fund_trace" → "ptb_forensics_fund_trace"
 *
 * The "ptb_" prefix namespaces toolbox dataframes in doc.dataframes,
 * avoiding collisions with user-defined variable names.
 */
export function dfNameFromToolId(toolId: string): string {
  return "ptb_" + toolId.replace(/[^a-zA-Z0-9]/g, "_");
}

// ─── Main render entry point ──────────────────────────────────────────────────

/**
 * Renders a tool template with the user-supplied params.
 *
 * Steps:
 *  1. Inject renderer-controlled reserved keys (__df_name, __tool_name,
 *     __time_where, __protocol_where) into params before interpolation.
 *  2. Interpolate all {{key}} placeholders.
 *  3. Wrap the result in a Python cell via wrapSqlInPython.
 *
 * The caller (registry.ts) is responsible for looking up the correct
 * template from the TemplateMap.
 */
export function renderTool(
  definition: ToolDefinition,
  template: ToolTemplate,
  params: ResolvedParams
): GenerateResult {
  const dfName = dfNameFromToolId(definition.id);

  // Reserved keys available in every template — no tool needs to redeclare these.
  const augmented: ResolvedParams = {
    ...params,
    __df_name: dfName,
    __tool_name: definition.name,
    // Pre-render the common WHERE fragments so templates stay readable.
    // Templates that need a non-default column pass the clause manually.
    __time_where: timeWhere((params["days"] as string) ?? "30"),
    __protocol_where: protocolWhere(params["protocol"] as string),
  };

  const sql = interpolate(template, augmented);
  const source = wrapSqlInPython(definition.name, sql, dfName, params);

  return { language: "python", source };
}