import { createHash } from 'crypto';

export const hashState = (state: Buffer): string => {
  return createHash('md5').update(state).digest('hex');
};