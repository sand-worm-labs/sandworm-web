export type JwtRefreshPayloadType = {
  id: string;
  hash: string;
  iat: number;
  exp: number;
};