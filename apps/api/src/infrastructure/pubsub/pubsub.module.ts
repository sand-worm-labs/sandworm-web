// src/pubsub/pubsub.module.ts
import { Global, Module } from '@nestjs/common';
import { PubSubService } from './service/pubsub.service';
import { PubSubProviderFactory } from './pubsub-provider.factory';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PubSubPayloadEntity } from '@sandworm/postgresql-typeorm';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([PubSubPayloadEntity]),
    ],
    providers: [PubSubService, PubSubProviderFactory],
    exports: [PubSubService, PubSubProviderFactory],
})
export class PubSubModule { }