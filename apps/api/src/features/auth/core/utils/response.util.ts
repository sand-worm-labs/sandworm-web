import { FastifyReply } from 'fastify';

const REFRESH_TOKEN_KEY = 'refresh_token';

export const setRefreshTokenToHttpOnlyCookie = (
  response: FastifyReply,
  token: string,
) => {
  response.setCookie(REFRESH_TOKEN_KEY, token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'strict',
  });
};

export const terminateRefreshTokenHttpOnlyCookie = (response: FastifyReply) => {
  response.clearCookie(REFRESH_TOKEN_KEY);
};