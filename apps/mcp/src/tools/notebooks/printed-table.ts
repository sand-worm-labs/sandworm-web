// A table printed as text (`print(df.to_string())`) shows as monospace output
// instead of a rendered table. The guidance says not to, and agents do it
// anyway, so add_cell and update_cell refuse the cell and say what to write.
const PRINTED_TABLE = /\bprint\s*\([^\n]*\.to_(string|markdown)\s*\(/;

export function printedTableProblem(source: string | undefined): string | undefined {
  const line = source?.split('\n').find((l) => !l.trimStart().startsWith('#') && PRINTED_TABLE.test(l));
  if (!line) return undefined;
  return `This cell prints a table as text: \`${line.trim()}\`. Never print a DataFrame or Series, with or without .to_string() or .to_markdown(). Return it instead: end the cell with just the variable on its own line (e.g. \`yr\`; a Series with \`.reset_index()\`), so the notebook renders a real table. One table per cell: give each table its own python cell, and put any title or caption in a markdown cell, not in a print().`;
}
