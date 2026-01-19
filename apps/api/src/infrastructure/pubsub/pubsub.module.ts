// src/pubsub/pubsub.module.ts
import { Global, Module } from '@nestjs/common';
import { PubSubService } from './service/pubsub.service';

@Global()
@Module({
    imports: [
        
    ],
    providers: [PubSubService],
    exports: [PubSubService],
})
export class PubSubModule { }