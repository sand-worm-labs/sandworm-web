import type * as Y from 'yjs';

// Stands in for the MCP server's update_cell: the AI service has it change the
// cell's text in the shared document, and the executors read the result back.
export function writeSource(source: Y.Text, text: string): void {
  source.doc!.transact(() => {
    source.delete(0, source.length);
    source.insert(0, text);
  });
}
