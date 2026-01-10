import { decoding } from 'lib0';
import { EntityManager } from 'typeorm';
import { LoadStateResult, ReplaceStateResult } from './load-state-result.interface';
import { WSSharedDoc } from './ws-shared-doc.interface';
import { TransactionOrigin } from './transaction-origin.interface';

export interface Persistor {
  load(tx?: EntityManager): Promise<LoadStateResult>;
  
  persist(ydoc: WSSharedDoc, tx?: EntityManager): Promise<void>;
  
  canWrite(
    decoder: decoding.Decoder,
    doc: WSSharedDoc,
    transactionOrigin: TransactionOrigin
  ): boolean;
  
  replaceState(clock: number, newState: Buffer): Promise<ReplaceStateResult>;
}