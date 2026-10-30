export type JwtPayloadType = {
  id: string;
  sub: string;
  // The user's tokenVersion when the token was issued. Missing on old tokens.
  ver?: number;
  iat: number;
  exp: number;
};