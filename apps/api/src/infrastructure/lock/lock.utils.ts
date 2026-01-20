import crypto from 'crypto';
import { LOCK_CONFIG } from './lock.constants';

export function getPartition(name: string): number {
    const hash = crypto.createHash('md5').update(name).digest('hex');
    const hashValue = parseInt(hash.slice(0, 8), 16);
    return hashValue % LOCK_CONFIG.NUM_PARTITIONS;
}

export function getChannel(name: string): string {
    return `lock_releases_${getPartition(name)}`;
}