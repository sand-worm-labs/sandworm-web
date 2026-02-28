import { FastifyReply } from 'fastify';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const setAuthCookies = (
  response: FastifyReply,
  accessToken: string,
  refreshToken: string,
  accessTokenExpiresMs: number,
) => {
  response.setCookie(ACCESS_TOKEN_KEY, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: accessTokenExpiresMs,
    path: '/',
  });

  response.setCookie(REFRESH_TOKEN_KEY, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

export const clearAuthCookies = (response: FastifyReply) => {
  response.clearCookie(ACCESS_TOKEN_KEY, { path: '/' });
  response.clearCookie(REFRESH_TOKEN_KEY, { path: '/' });
};