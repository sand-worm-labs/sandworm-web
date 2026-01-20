// src/pubsub/pubsub.module.ts
import { Global, Module } from '@nestjs/common';
import { PubSubService } from './service/pubsub.service';

@Global()
@Module({
    providers: [PubSubService],
    exports: [PubSubService],
})
export class PubSubModule { }