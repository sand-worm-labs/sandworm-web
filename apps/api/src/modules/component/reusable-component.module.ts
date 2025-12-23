// reusable-component.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
    ReusableComponentEntity,
    ReusableComponentInstanceEntity,
    DocumentEntity,
} from '@sandworm/postgresql-typeorm';
import { ReusableComponentService } from './reusable-component.service';
import { ReusableComponentResolver } from './reusable-component.resolver';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ReusableComponentEntity,
            ReusableComponentInstanceEntity,
            DocumentEntity,
        ]),
    ],
    providers: [ReusableComponentService, ReusableComponentResolver],
    exports: [ReusableComponentService],
})
export class ReusableComponentModule { }