import '@fastify/cookie';
import { FastifyRequest, type FastifyReply } from 'fastify';
import { TokenPair } from "../types/token.type";

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

export const COOKIES = {
  ACCESS_TOKEN: ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN: REFRESH_TOKEN_COOKIE,
} as const;

export type CookieName = typeof COOKIES[keyof typeof COOKIES];

const isProduction = process.env.NODE_ENV === 'production';

// The parent domain the session cookies are set on, e.g. ".sandwormlab.xyz",
// so that app. and terminal. both receive them. Left unset (dev), the cookies
// stay on the API's own host; browsers ignore ports, so localhost:8081 and
// localhost:8082 still share them.
const cookieDomain = process.env.AUTH_COOKIE_DOMAIN?.trim() || undefined;

const TOKEN_COOKIES = [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE] as const;

function clearCookies(res: FastifyReply, domain?: string): void {
  for (const name of TOKEN_COOKIES) {
    res.clearCookie(name, { path: '/', ...(domain && { domain }) });
  }
}

export function setTokenCookies(res: FastifyReply, tokens: TokenPair): void {
  // Cookies set before AUTH_COOKIE_DOMAIN existed live on the host only. The
  // browser would send them next to the new ones under the same name, and the
  // stale one could win, so they are removed first.
  if (cookieDomain) clearCookies(res);

  const base = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    ...(cookieDomain && { domain: cookieDomain }),
  };

  res.setCookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...base,
    expires: tokens.accessTokenExpires,
  });
  res.setCookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...base,
    expires: tokens.refreshTokenExpires,
  });
}

export function clearTokenCookies(res: FastifyReply): void {
  // Browsers only delete a cookie when its path and domain match the ones it
  // was set with (see setTokenCookies), so both variants are cleared.
  clearCookies(res);
  if (cookieDomain) clearCookies(res, cookieDomain);
}

export function getTokenFromCookie(req: FastifyRequest, cookie:CookieName): string | null {
  return req.cookies?.[cookie];
}