import { AllConfigType } from '@/core/config/config.type';
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { publish, subscribe, initPubSub } from '@sandworm/postgresql-typeorm';

@Injectable()
export class PubSubService implements OnModuleDestroy {
    private readonly logger = new Logger(PubSubService.name);
    private readonly subscriptions = new Set<() => Promise<void>>();

    constructor(
        private configService: ConfigService<AllConfigType>,) {
        
    }
     async onModuleInit(): Promise<void> {
        const db = this.configService.get('database', { infer: true });
        initPubSub({
            connectionString: `postgresql://${db.username}:${db.password}@${db.host}:${db.port}/${db.name}`,
            ssl: db.sslEnabled ? { rejectUnauthorized: db.rejectUnauthorized, ca: db.ca || undefined } : false,
        });
        this.logger.log('PubSub initialized');
    }

    async publish(channel: string, message: string): Promise<void> {
        await publish(channel, message);
    }

    async subscribe(
        channel: string,
        callback: (event: string) => Promise<void>,
    ): Promise<() => Promise<void>> {
        const cleanup = await subscribe(channel, callback);
        this.subscriptions.add(cleanup);

        return async () => {
            this.subscriptions.delete(cleanup);
            await cleanup();
        };
    }

    async onModuleDestroy() {
        this.logger.log('Cleaning up all subscriptions');

        await Promise.all(
            Array.from(this.subscriptions).map((cleanup) => cleanup()),
        );

        this.subscriptions.clear();
    }
}