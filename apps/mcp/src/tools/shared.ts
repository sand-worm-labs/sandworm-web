import { z } from 'zod';

export const id = z.string().describe('ID of the resource');
export const workspaceId = z.string().describe('Workspace the resource belongs to');

export const notImplemented = (tool: string) => ({
  isError: true,
  content: [{ type: 'text' as const, text: `${tool} is not implemented yet` }],
});

// Destructive tools require the caller to pass confirm: true explicitly, so an
// agent can't delete something by accident with a half-formed call. Each of
// these should also write an audit entry once implemented.
export const confirm = z.literal(true).describe('Must be true to confirm this destructive action');
