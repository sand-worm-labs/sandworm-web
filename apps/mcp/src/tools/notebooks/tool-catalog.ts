import { graphql, type ToolContext } from '../../graphql.ts';

export type Param = {
  key: string;
  label: string;
  type: string;
  required: boolean;
  default?: unknown;
  description?: string;
  options?: { value: string; label?: string }[];
};

export type CatalogTool = {
  toolId: string;
  name: string;
  description: string;
  tags: string[];
  g1?: string | null;
  g2?: string | null;
  g3?: string | null;
  g4?: string | null;
  g5?: string | null;
  params: Param[];
  returns: { name: string; type: string }[];
};

export type Match = { tool: CatalogTool; score: number; allWords: boolean };

const CATALOG_TTL_MS = 10 * 60 * 1000;
let cached: { at: number; tools: CatalogTool[] } | null = null;

// The catalog is public and the same for everyone, so one copy is shared.
export async function loadCatalog(ctx: ToolContext): Promise<CatalogTool[]> {
  if (cached && Date.now() - cached.at < CATALOG_TTL_MS) return cached.tools;
  const { getTools } = await graphql<{ getTools: CatalogTool[] }>(
    ctx,
    `query { getTools { toolId name description tags g1 g2 g3 g4 g5 params returns } }`,
  );
  cached = { at: Date.now(), tools: getTools };
  return getTools;
}

const STOPWORDS = new Set(['the', 'and', 'for', 'with', 'over', 'last', 'show', 'all', 'per', 'how', 'what', 'are', 'from', 'that', 'this', 'into', 'its', 'our', 'you', 'your', 'can', 'has', 'have', 'was', 'were', 'will', 'who', 'which', 'when', 'where']);

const singular = (word: string) => (word.length > 3 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word);

export const tokens = (text: string) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => (t.length > 2 || /\d/.test(t)) && !STOPWORDS.has(t))
    .map(singular);

// Matches at the start of a word, so "on" does not hit "contract" but "block" hits "blocks".
const hasWord = (text: string, word: string) => new RegExp(`(^|[^a-z0-9])${word}`).test(text);

// Two query words in a row that appear together in a tool id ("block activity") beat two stray hits.
const PHRASE_BONUS = 8;
const phraseBonus = (idText: string, words: string[]) =>
  words.slice(1).reduce((sum, word, i) => (idText.includes(`${words[i]} ${word}`) ? sum + PHRASE_BONUS : sum), 0);

// Keyword ranking: a query word counts most in the id and name, then tags and
// category, then the description. A tool must match every word somewhere to
// rank above one that matches only some.
function score(tool: CatalogTool, words: string[]): Omit<Match, 'tool'> {
  const idText = `${tool.toolId} ${tool.name}`.toLowerCase().replace(/[._]/g, ' ');
  const fields: [string, number][] = [
    [idText, 5],
    [[...tool.tags, tool.g1, tool.g2, tool.g3, tool.g4, tool.g5].filter(Boolean).join(' '), 3],
    [tool.description, 1],
  ];
  let total = 0;
  let matched = 0;
  for (const word of words) {
    const hit = fields.reduce((best, [text, weight]) => (hasWord(text.toLowerCase().replace(/_/g, ' '), word) ? Math.max(best, weight) : best), 0);
    if (hit) matched++;
    total += hit;
  }
  const allWords = matched === words.length;
  total += phraseBonus(idText, words);
  return { score: allWords ? total + 100 : total, allWords };
}

export async function keywordSearch(ctx: ToolContext, query: string, limit: number): Promise<Match[]> {
  const words = tokens(query);
  if (!words.length) return [];
  return (await loadCatalog(ctx))
    .map(tool => ({ tool, ...score(tool, words) }))
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Semantic search runs in the API; if it is down or finds nothing, fall back to keywords.
export async function searchCatalog(ctx: ToolContext, query: string, limit: number): Promise<Match[]> {
  try {
    const { searchTools } = await graphql<{ searchTools: CatalogTool[] }>(
      ctx,
      `query ($query: String!, $limit: Int!) {
        searchTools(query: $query, limit: $limit) { toolId name description tags g1 g2 g3 g4 g5 params returns }
      }`,
      { query, limit },
    );
    if (searchTools?.length) return searchTools.map((tool, i) => ({ tool, score: searchTools.length - i, allWords: false }));
  } catch (err) {
    console.error('Semantic tool search failed, using keyword search', err);
  }
  return keywordSearch(ctx, query, limit);
}

const compactParam = ({ key, label, type, required, default: def, options }: Param) => ({
  key,
  label,
  type,
  required,
  ...(def !== undefined ? { default: def } : {}),
  ...(options?.length ? { options: options.map(o => o.value) } : {}),
});

export const describeTool = (tool: CatalogTool) => ({
  toolId: tool.toolId,
  name: tool.name,
  description: tool.description,
  category: [tool.g1, tool.g2, tool.g3].filter(Boolean).join(' > '),
  inputs: tool.params.map(compactParam),
  returns: tool.returns,
});
