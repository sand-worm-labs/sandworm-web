import { Global, Module } from '@nestjs/common';
import { LockService } from './lock.services';
import { PubSubModule } from '../pubsub/pubsub.module';

@Global()
@Module({
    imports: [PubSubModule],
    providers: [LockService],
    exports: [LockService],
})
export class LockModule { }