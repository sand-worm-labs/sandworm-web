import crypto from 'crypto';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

export const generateSessionHash = (): { session: string; hash: string } => {
  const session = randomStringGenerator();
  const hash = crypto
    .createHash('sha256')
    .update(session)
    .digest('hex');
  
  return { session, hash };
};