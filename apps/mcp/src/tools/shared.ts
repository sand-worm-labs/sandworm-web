import { z } from 'zod';

export const id = z.string().describe('ID of the resource');
export const workspaceId = z
  .uuid()
  .optional()
  .describe('Workspace to use. Defaults to the user\'s last visited workspace; omit it unless they named another.');

// Destructive tools require the caller to pass confirm: true explicitly, so an
// agent can't delete something by accident with a half-formed call. Each of
// these should also write an audit entry once implemented.
export const confirm = z.literal(true).describe('Must be true to confirm this destructive action');

export const jsonResult = (value: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
});

export const errorResult = (err: unknown) => ({
  isError: true,
  content: [{ type: 'text' as const, text: err instanceof Error ? err.message : String(err) }],
});
