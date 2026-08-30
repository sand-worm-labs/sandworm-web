import type {
    ToolDefinition,
    ToolCategory,
    TemplateMap,
    ResolvedParams,
    GenerateResult,
    SelectOption,
  } from "./types.js";

  import { renderTool } from "./renderer.js";

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
  
  // ─── Master maps ──────────────────────────────────────────────────────────────
  //
  // No static tool data lives here anymore — the catalog starts empty and is
  // populated exclusively via registerTool(), normally driven by
  // loadToolsFromApi() fetching the DB-backed catalog at app startup. This
  // keeps every function below (getAllTools, searchTools, renderToolById, …)
  // working exactly as before; only how the maps get filled has changed.

  const ALL_DEFINITIONS: ToolDefinition[] = [];

  const ALL_TEMPLATES: TemplateMap = {};

  const ALL_CATEGORIES: ToolCategory[] = [];

  /** toolId → ToolDefinition */
  const DEFINITION_MAP = new Map<string, ToolDefinition>(
    ALL_DEFINITIONS.map(d => [d.id, d])
  );

  /** categoryId → ToolCategory */
  const CATEGORY_MAP = new Map<string, ToolCategory>();

  // ─── Integrity check (dev only) ───────────────────────────────────────────────
  //
  // Runs once loadToolsFromApi() finishes (see below) rather than at module
  // load, since the catalog is empty until then.

  const _isDev =
    typeof process !== "undefined" &&
    process.env["NODE_ENV"] !== "production";

  function _runIntegrityCheck(): void {
    if (!_isDev) return;

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
    return ALL_CATEGORIES;
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

  /**
   * Phase 2 extension point: register a category at runtime (e.g. from a
   * DB-backed category loader). Throws if the categoryId is already
   * registered (no silent overwrites).
   */
  export function registerCategory(category: ToolCategory): void {
    if (CATEGORY_MAP.has(category.id)) {
      throw new Error(
        `[PowerToolbox] Category "${category.id}" is already registered.`
      );
    }

    ALL_CATEGORIES.push(category);
    CATEGORY_MAP.set(category.id, category);
  }

  // ─── DB-backed catalog load ───────────────────────────────────────────────────

  let _toolsLoaded = false;
  let _loadPromise: Promise<void> | null = null;

  let _categoriesLoaded = false;
  let _categoriesLoadPromise: Promise<void> | null = null;

  /**
   * Fetches the tool catalog and registers every tool via registerTool().
   *
   * Call once, early in the app lifecycle — every read function above
   * (getAllTools, getToolsByCategory, searchTools, renderToolById, …) reads
   * synchronously from the in-memory maps, which start empty until this
   * resolves. Consumers that render before load completes should gate on
   * isToolsLoaded().
   *
   * Safe to call more than once — later calls reuse the same in-flight or
   * completed load instead of re-fetching/re-registering.
   *
   * The fetch itself is injected rather than performed here so this package
   * doesn't need a hard dependency on any particular GraphQL client — the
   * caller (e.g. apps/web) supplies a function that runs the GetTools query
   * and shapes the response into ToolDefinition + template pairs.
   */
  export function loadToolsFromApi(
    fetchTools: () => Promise<Array<ToolDefinition & { template: string }>>
  ): Promise<void> {
    if (_loadPromise) return _loadPromise;

    _loadPromise = fetchTools()
      .then(tools => {
        for (const { template, ...definition } of tools) {
          try {
            registerTool(definition, template);
          } catch (err) {
            console.error(`[PowerToolbox] failed to register tool "${definition.id}":`, err);
          }
        }
        _runIntegrityCheck();
      })
      .catch(err => {
        console.error("[PowerToolbox] failed to load tool catalog:", err);
      })
      .finally(() => {
        _toolsLoaded = true;
      });

    return _loadPromise;
  }

  /**
   * Fetches the category taxonomy and registers every category via
   * registerCategory(). Same shape/contract as loadToolsFromApi() — safe to
   * call more than once, the fetch is injected to keep this package free of
   * a hard GraphQL client dependency.
   */
  export function loadCategoriesFromApi(
    fetchCategories: () => Promise<ToolCategory[]>
  ): Promise<void> {
    if (_categoriesLoadPromise) return _categoriesLoadPromise;

    _categoriesLoadPromise = fetchCategories()
      .then(categories => {
        for (const category of categories) {
          try {
            registerCategory(category);
          } catch (err) {
            console.error(`[PowerToolbox] failed to register category "${category.id}":`, err);
          }
        }
      })
      .catch(err => {
        console.error("[PowerToolbox] failed to load category taxonomy:", err);
      })
      .finally(() => {
        _categoriesLoaded = true;
      });

    return _categoriesLoadPromise;
  }

  /**
   * True once loadCategoriesFromApi() has settled — successfully or not.
   */
  export function isCategoriesLoaded(): boolean {
    return _categoriesLoaded;
  }

  /**
   * True once loadToolsFromApi() has settled — successfully or not. A failed
   * load still flips this to true (with an empty catalog) rather than
   * leaving consumers waiting forever on a request that already failed.
   */
  export function isToolsLoaded(): boolean {
    return _toolsLoaded;
  }