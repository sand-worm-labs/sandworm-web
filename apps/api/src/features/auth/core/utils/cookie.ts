import '@fastify/cookie';
import { type FastifyReply } from 'fastify';
import { TokenPair } from "../types/token.type";
import { path } from 'ramda';


const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const isProduction = process.env.NODE_ENV === 'production';

export function setTokenCookies(res: FastifyReply, tokens: TokenPair): void {
  const base = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    path:"/"
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

export function clearTokenCookies(res: any): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE);
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/auth/refresh' });
}