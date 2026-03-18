// ─── Param types ─────────────────────────────────────────────────────────────

/**
 * The set of input control types the form renderer knows how to mount.
 * Each maps to a specific UI widget — see ParamDefinition for per-type config.
 */
export type ParamType =
  | "address"      // single EVM address, checksum-validated
  | "address[]"    // multi-address list builder
  | "chain"        // single chain dropdown
  | "chain[]"      // multi-chain selector
  | "select"       // static options dropdown
  | "schema_uid"   // 66-char hex string (EAS schema UID)
  | "token_address"// address with token metadata resolution attempt
  | "text"         // free-text input
  | "number"       // numeric with optional min/max
  | "date_range";  // from/to date picker pair

/**
 * Controls which UI surface is mounted for the tool's param form.
 * Only "form" is implemented in phase 1. Others are declared now so
 * tool definitions can carry the correct hint without a later migration.
 */
export type UiHint =
  | "form"          // standard labelled form — covers ~80% of tools
  | "graph-canvas"  // node/edge canvas (fund trace, clustering)
  | "list-builder"  // add/remove item list (multi-address, cohort)
  | "timeline";     // draggable time window

export interface SelectOption {
  label: string;
  value: string;
}

export interface ParamDefinition {
  key: string;
  label: string;
  description?: string;
  type: ParamType;
  required: boolean;
  /** For type "select" | "chain" | "chain[]" */
  options?: SelectOption[];
  /** For type "number" */
  min?: number;
  max?: number;
  default?: string | number | boolean | string[];
  placeholder?: string;
}

// ─── Tool & category types ────────────────────────────────────────────────────

export type SupportedLanguage = "python" | "sql";

/**
 * The rendered output of a tool — ready to hand to PythonExecutorService
 * or SQLExecutorService unchanged.
 */
export interface GenerateResult {
  language: SupportedLanguage;
  source: string;
}

/**
 * A single analytics tool in the registry.
 *
 * `templateId` links this definition to its entry in the template map
 * (same value as `id` by convention — kept explicit so the two layers
 * can diverge without a refactor).
 */
export interface ToolDefinition {
  id: string;
  templateId: string;
  categoryId: string;
  name: string;
  description: string;
  /** Free-text tags that drive the search index. */
  tags: string[];
  uiHint: UiHint;
  params: ParamDefinition[];
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
}

// ─── Registry types ───────────────────────────────────────────────────────────

/**
 * A raw SQL/Python template string. Placeholders use {{key}} syntax.
 * The key matches a ParamDefinition.key on the corresponding ToolDefinition,
 * or one of the reserved renderer keys:
 *   {{__df_name}}   — the output dataframe variable name (derived from tool id)
 *   {{__tool_name}} — human-readable tool name for the header comment
 */
export type ToolTemplate = string;

/** Map of toolId → raw template string. */
export type TemplateMap = Record<string, ToolTemplate>;

/**
 * Resolved param values supplied by the user at run time.
 * Values are always primitives or string[] — the form renderer coerces
 * everything to this shape before handing it to the renderer.
 */
export type ResolvedParams = Record<string, string | number | boolean | string[]>;