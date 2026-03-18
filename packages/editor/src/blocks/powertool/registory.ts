import type {
    ToolDefinition,
    ToolCategory,
    TemplateMap,
    ResolvedParams,
    GenerateResult,
    SelectOption,
  } from "./types.js";
  
  import { renderTool } from "./renderer.js";
  import { TOOL_CATEGORIES } from "./categories.js";
  
  // ─── Definition imports ───────────────────────────────────────────────────────
  
  import { PRIMITIVE_DEFINITIONS } from "./definitions/primitives.js";
  import { WALLET_DEFINITIONS } from "./definitions/wallet.js";
  import { DEFI_DEFINITIONS } from "./definitions/defi.js";
  import { NFT_DEFINITIONS } from "./definitions/nft.js";
  import { STAKING_DEFINITIONS } from "./definitions/staking.js";
  import { BRIDGE_DEFINITIONS } from "./definitions/bridges.js";
  import { ATTESTATION_DEFINITIONS } from "./definitions/attestation.js";
  import { FORENSICS_DEFINITIONS } from "./definitions/forensis.js";
  import { CONTRACT_DEFINITIONS } from "./definitions/contracts.js";
  import { CHAIN_DEFINITIONS } from "./definitions/chains.js";
  
  // ─── Template imports ─────────────────────────────────────────────────────────
  
  import { PRIMITIVES_TEMPLATES } from "./templates/primitives.templates.js";
  import { WALLET_TEMPLATES } from "./templates/wallets.templates.js";
  import { DEFI_TEMPLATES } from "./templates/defi.templates.js"
  import { NFT_TEMPLATES } from "./templates/nft.templates.js";
  import { STAKING_TEMPLATES } from "./templates/staking.templates.js";
  import { BRIDGE_TEMPLATES } from "./templates/bridges.templates.js";
  import { ATTESTATION_TEMPLATES } from "./templates/attestation.templates.js";
  import { FORENSICS_TEMPLATES } from "./templates/forensis.templates.js";
  import { CONTRACT_TEMPLATES } from "./templates/contracts.templates.js";
  import { CHAIN_TEMPLATES } from "./templates/chains.templates.js";
  
  // ─── Options registry ─────────────────────────────────────────────────────────
  
  /**
   * Mutable registry for SelectOption arrays.
   *
   * Seeded from constants.ts at module load time. Phase 2 DB loader calls
   * `OptionsRegistry.register(key, entries)` at startup to inject additional
   * chains, protocols, or community-contributed option sets without touching
   * any definition file.
   *
   * Keys are the same strings used in ParamDefinition.key or a semantic
   * namespace like "chains" or "dex_protocols".
   */
  class OptionsRegistryClass {
    private store: Map<string, SelectOption[]> = new Map();
  
    /** Seed or replace an option set. */
    register(key: string, options: SelectOption[]): void {
      this.store.set(key, options);
    }
  
    /** Append entries to an existing option set without replacing it. */
    extend(key: string, options: SelectOption[]): void {
      const existing = this.store.get(key) ?? [];
      const existingValues = new Set(existing.map(o => o.value));
      const novel = options.filter(o => !existingValues.has(o.value));
      this.store.set(key, [...existing, ...novel]);
    }
  
    /** Retrieve an option set. Returns empty array if key not registered. */
    get(key: string): SelectOption[] {
      return this.store.get(key) ?? [];
    }
  
    has(key: string): boolean {
      return this.store.has(key);
    }
  }
  
  export const OptionsRegistry = new OptionsRegistryClass();
  
  // ─── Build master maps ────────────────────────────────────────────────────────
  
  const ALL_DEFINITIONS: ToolDefinition[] = [
    ...PRIMITIVE_DEFINITIONS,
    ...WALLET_DEFINITIONS,
    ...DEFI_DEFINITIONS,
    ...NFT_DEFINITIONS,
    ...STAKING_DEFINITIONS,
    ...BRIDGE_DEFINITIONS,
    ...ATTESTATION_DEFINITIONS,
    ...FORENSICS_DEFINITIONS,
    ...CONTRACT_DEFINITIONS,
    ...CHAIN_DEFINITIONS,
  ];
  
  const ALL_TEMPLATES: TemplateMap = {
    ...PRIMITIVES_TEMPLATES,
    ...WALLET_TEMPLATES,
    ...DEFI_TEMPLATES,
    ...NFT_TEMPLATES,
    ...STAKING_TEMPLATES,
    ...BRIDGE_TEMPLATES,
    ...ATTESTATION_TEMPLATES,
    ...FORENSICS_TEMPLATES,
    ...CONTRACT_TEMPLATES,
    ...CHAIN_TEMPLATES,
  };
  
  /** toolId → ToolDefinition */
  const DEFINITION_MAP = new Map<string, ToolDefinition>(
    ALL_DEFINITIONS.map(d => [d.id, d])
  );
  
  /** categoryId → ToolCategory */
  const CATEGORY_MAP = new Map<string, ToolCategory>(
    TOOL_CATEGORIES.map(c => [c.id, c])
  );
  
  // ─── Integrity check (dev only) ───────────────────────────────────────────────
  
  const _isDev =
    typeof process !== "undefined" &&
    process.env["NODE_ENV"] !== "production";
  
  if (_isDev) {
    const missingTemplates: string[] = [];
    const missingDefinitions: string[] = [];
  
    for (const def of ALL_DEFINITIONS) {
      if (!ALL_TEMPLATES[def.templateId]) {
        missingTemplates.push(def.templateId);
      }
    }
  
    for (const templateId of Object.keys(ALL_TEMPLATES)) {
      if (!DEFINITION_MAP.has(templateId)) {
        missingDefinitions.push(templateId);
      }
    }
  
    if (missingTemplates.length > 0) {
      console.warn(
        `[PowerToolbox] ${missingTemplates.length} definition(s) have no matching template:\n` +
        missingTemplates.map(id => `  - ${id}`).join("\n")
      );
    }
  
    if (missingDefinitions.length > 0) {
      console.warn(
        `[PowerToolbox] ${missingDefinitions.length} template(s) have no matching definition:\n` +
        missingDefinitions.map(id => `  - ${id}`).join("\n")
      );
    }
  }
  
  // ─── Search index ─────────────────────────────────────────────────────────────
  
  /**
   * Pre-built search tokens per tool. Combines name words, description words,
   * and tags — all lowercased. Used by searchTools() for fast client-side
   * filtering without a backend round-trip.
   */
  const SEARCH_INDEX = new Map<string, string[]>(
    ALL_DEFINITIONS.map(def => [
      def.id,
      [
        ...def.name.toLowerCase().split(/\s+/),
        ...def.description.toLowerCase().split(/\s+/),
        ...def.tags.map(t => t.toLowerCase()),
        def.categoryId.toLowerCase(),
      ],
    ])
  );
  
  // ─── Public API ───────────────────────────────────────────────────────────────
  
  /**
   * All tool definitions in registry order (category order, then insertion order
   * within each category). Safe to iterate for UI rendering.
   */
  export function getAllTools(): ToolDefinition[] {
    return ALL_DEFINITIONS;
  }
  
  /**
   * All categories in display order.
   */
  export function getAllCategories(): ToolCategory[] {
    return TOOL_CATEGORIES;
  }
  
  /**
   * Tools belonging to a specific category.
   */
  export function getToolsByCategory(categoryId: string): ToolDefinition[] {
    return ALL_DEFINITIONS.filter(d => d.categoryId === categoryId);
  }
  
  /**
   * Single tool definition by id. Returns undefined if not found.
   */
  export function getToolById(toolId: string): ToolDefinition | undefined {
    return DEFINITION_MAP.get(toolId);
  }
  
  /**
   * Single category by id. Returns undefined if not found.
   */
  export function getCategoryById(categoryId: string): ToolCategory | undefined {
    return CATEGORY_MAP.get(categoryId);
  }
  
  /**
   * Full-text search across name, description, and tags.
   *
   * Each word in the query must appear in at least one token of the tool's
   * search index — AND logic across words, OR logic within each word (prefix
   * match). Returns results sorted by match score descending.
   *
   * @example
   *   searchTools("wallet pnl")     // returns wallet.pnl + related
   *   searchTools("attestation eas") // returns all attestation tools
   */
  export function searchTools(query: string): ToolDefinition[] {
    const words = query
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  
    if (words.length === 0) return ALL_DEFINITIONS;
  
    const scored: Array<{ tool: ToolDefinition; score: number }> = [];
  
    for (const def of ALL_DEFINITIONS) {
      const tokens = SEARCH_INDEX.get(def.id) ?? [];
      let score = 0;
      let allMatch = true;
  
      for (const word of words) {
        const matchingTokens = tokens.filter(t => t.startsWith(word));
        if (matchingTokens.length === 0) {
          allMatch = false;
          break;
        }
        // Exact token match scores higher than prefix match.
        score += matchingTokens.some(t => t === word) ? 2 : 1;
      }
  
      if (allMatch) {
        scored.push({ tool: def, score });
      }
    }
  
    return scored
      .sort((a, b) => b.score - a.score)
      .map(s => s.tool);
  }
  
  /**
   * Returns a count summary for display in the UI (e.g. "110 blocks").
   */
  export function getToolCount(): number {
    return ALL_DEFINITIONS.length;
  }
  
  /**
   * Returns tool count per category — used to render the category list
   * with counts as shown in the mockup.
   */
  export function getToolCountByCategory(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const def of ALL_DEFINITIONS) {
      counts[def.categoryId] = (counts[def.categoryId] ?? 0) + 1;
    }
    return counts;
  }
  
  // ─── Render ───────────────────────────────────────────────────────────────────
  
  /**
   * Validates required params, then renders the tool template with the
   * user-supplied param values into executable Python source.
   *
   * Throws a descriptive error if:
   *  - toolId is not registered
   *  - template is missing for the tool
   *  - a required param is missing from params
   *
   * Optional params that are absent are coerced to "" so templates can use
   * `'{{param}}' = ''` as the bypass condition.
   */
  export function renderToolById(
    toolId: string,
    params: ResolvedParams
  ): GenerateResult {
    const definition = DEFINITION_MAP.get(toolId);
    if (!definition) {
      throw new Error(`[PowerToolbox] Unknown toolId: "${toolId}"`);
    }
  
    const template = ALL_TEMPLATES[definition.templateId];
    if (!template) {
      throw new Error(
        `[PowerToolbox] No template registered for templateId: "${definition.templateId}"`
      );
    }
  
    // Validate required params and coerce missing optional ones to "".
    const resolved: ResolvedParams = {};
    const missing: string[] = [];
  
    for (const paramDef of definition.params) {
      const value = params[paramDef.key];
  
      if (value === undefined || value === null || value === "") {
        if (paramDef.required) {
          missing.push(paramDef.key);
        } else {
          // Optional — coerce to empty string so templates short-circuit cleanly.
          resolved[paramDef.key] = "";
        }
      } else {
        resolved[paramDef.key] = value;
      }
    }
  
    if (missing.length > 0) {
      throw new Error(
        `[PowerToolbox] Missing required params for "${toolId}": ${missing.join(", ")}`
      );
    }
  
    return renderTool(definition, template, resolved);
  }
  
  /**
   * Phase 2 extension point: register additional tool definitions and their
   * templates at runtime (e.g. from a DB-backed community tool loader).
   *
   * Definitions registered this way are immediately available to all registry
   * functions including search and renderToolById.
   *
   * Throws if a toolId is already registered (no silent overwrites).
   */
  export function registerTool(
    definition: ToolDefinition,
    template: string
  ): void {
    if (DEFINITION_MAP.has(definition.id)) {
      throw new Error(
        `[PowerToolbox] Tool "${definition.id}" is already registered. ` +
        `Use a unique id for community tools.`
      );
    }
  
    ALL_DEFINITIONS.push(definition);
    ALL_TEMPLATES[definition.templateId] = template;
    DEFINITION_MAP.set(definition.id, definition);
  
    // Update search index.
    SEARCH_INDEX.set(definition.id, [
      ...definition.name.toLowerCase().split(/\s+/),
      ...definition.description.toLowerCase().split(/\s+/),
      ...definition.tags.map(t => t.toLowerCase()),
      definition.categoryId.toLowerCase(),
    ]);
  }