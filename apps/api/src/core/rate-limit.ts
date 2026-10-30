import { createHash } from 'node:crypto';
import type { FastifyRequest } from 'fastify';
import { ACCESS_TOKEN_COOKIE } from '@/features/auth/core/utils/cookie';

// Per-minute budgets. Sign-in and password routes are tight to stop brute
// force; running notebooks costs kernel time and paid data, so it sits between.
export const RATE_LIMITS = {
  auth: 10,
  refresh: 60,
  run: 120,
  default: 1200,
} as const;

type Bucket = keyof typeof RATE_LIMITS;

const AUTH_PATHS = /\/auth\/(email\/(login|register|confirm(\/new)?)|forgot\/password|reset\/password|(google|github)\/login)\/?$/;
const RUN_PATHS = /\/documents\/[^/]+\/(run|view\/run)\/?$/;

function path(request: FastifyRequest): string {
  return (request.url ?? '').split('?')[0];
}

// The GraphQL `login` mutation is a password check like /auth/email/login.
function isGraphqlLogin(request: FastifyRequest): boolean {
  if (!path(request).endsWith('/graphql')) return false;
  const query = (request.body as { query?: unknown } | undefined)?.query;
  return typeof query === 'string' && /\bmutation\b/.test(query) && /\blogin\s*\(/.test(query);
}

export function bucketOf(request: FastifyRequest): Bucket {
  if (request.method !== 'POST') return 'default';
  const p = path(request);
  if (AUTH_PATHS.test(p) || isGraphqlLogin(request)) return 'auth';
  if (/\/auth\/refresh\/?$/.test(p)) return 'refresh';
  if (RUN_PATHS.test(p)) return 'run';
  return 'default';
}

// Signed-in calls are counted per session, not per IP: every MCP and AI
// service request reaches the API from the same server address. Sign-in
// routes are always counted per IP, since there is no session yet.
export function rateLimitKey(request: FastifyRequest): string {
  const bucket = bucketOf(request);
  const token = request.cookies?.[ACCESS_TOKEN_COOKIE];
  if (bucket !== 'auth' && token) {
    return `${bucket}:tok:${createHash('sha256').update(token).digest('hex').slice(0, 32)}`;
  }
  return `${bucket}:ip:${request.ip}`;
}

export function rateLimitMax(request: FastifyRequest): number {
  return RATE_LIMITS[bucketOf(request)];
}
