// Turns what someone typed into what the database matches against. The text rules
// mirror the search_normalize() SQL function (see the add-search-index migration): both
// reduce text to lower-case letters and digits separated by single spaces, so a query
// and the index always agree on what a word is.
import { MAX_QUERY_LENGTH } from './search.constants';

export type ParsedQuery = {
  // Normalized text: lower-case letters and digits, single spaces. Empty means "browse".
  term: string;
  // A Postgres tsquery where every word is a prefix, or null when there is no word.
  tsquery: string | null;
  // The same, but a word counts only when it is in the title (weight A), so a match in the
  // title can outrank one in the keywords or subtitle.
  titleTsquery: string | null;
};

export function normalizeText(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function parseQuery(raw: string): ParsedQuery {
  const term = normalizeText(raw.slice(0, MAX_QUERY_LENGTH));
  if (!term) return { term: '', tsquery: null, titleTsquery: null };
  // Words hold only [a-z0-9], so nothing here can be read as tsquery syntax.
  const words = term.split(' ');
  const join = (suffix: string) =>
    words.map((word) => `${word}${suffix}`).join(' & ');
  return { term, tsquery: join(':*'), titleTsquery: join(':*A') };
}
