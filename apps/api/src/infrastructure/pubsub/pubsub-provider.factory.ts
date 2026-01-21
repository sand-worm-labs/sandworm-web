import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PubSubPayloadEntity } from '@sandworm/postgresql-typeorm';
import * as Y from 'yjs';
import { PubSubService } from '@/infrastructure/pubsub/service/pubsub.service';
import { PubSubProvider } from '@/infrastructure/pubsub/pubsub.provider';

@Injectable()
export class PubSubProviderFactory {
    constructor(
        private readonly pubSubService: PubSubService,
        @InjectRepository(PubSubPayloadEntity)
        private readonly payloadRepository: Repository<PubSubPayloadEntity>
    ) { }

    create(
        id: string,
        ydoc: Y.Doc,
        clock: number,
        onNewerClock: (clock: number) => Promise<void>
    ): PubSubProvider {
        return new PubSubProvider(
            id,
            ydoc,
            clock,
            this.pubSubService,
            this.payloadRepository,
            onNewerClock
        );
    }
}