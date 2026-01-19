import { Global, Module } from '@nestjs/common';
import { LockService } from './lock.services';
import { PubSubModule } from '../pubsub/pubsub.module';
import { LockEntity } from '@sandworm/postgresql-typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([LockEntity]), PubSubModule],
    providers: [LockService],
    exports: [LockService],
})
export class LockModule { }