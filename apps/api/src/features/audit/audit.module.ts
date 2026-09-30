import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity, UserWorkspaceEntity } from '@sandworm/postgresql-typeorm';
import { AuditInterceptor } from './audit.interceptor';
import { AuditResolver } from './audit.resolver';
import { AuditService } from './audit.service';

// Global so any feature can inject AuditService for explicit events
// (auth denials, secret reads, MCP tool calls).
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity, UserWorkspaceEntity])],
  providers: [AuditService, AuditResolver, { provide: APP_INTERCEPTOR, useClass: AuditInterceptor }],
  exports: [AuditService],
})
export class AuditModule {}
