import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AuditResult } from '@sandworm/postgresql-typeorm';
import GraphQLJSON from 'graphql-type-json';

registerEnumType(AuditResult, { name: 'AuditResult' });

@ObjectType()
export class AuditLog {
  @Field(() => String) id!: string;
  @Field(() => Date) createdAt!: Date;
  @Field(() => String, { nullable: true }) actorId?: string;
  @Field(() => String, { nullable: true }) workspaceId?: string;
  @Field(() => String) action!: string;
  @Field(() => String, { nullable: true }) resourceType?: string;
  @Field(() => String, { nullable: true }) resourceId?: string;
  @Field(() => AuditResult) result!: AuditResult;
  @Field(() => String, { nullable: true }) errorMessage?: string;
  @Field(() => String, { nullable: true }) ip?: string;
  @Field(() => String, { nullable: true }) requestId?: string;
  @Field(() => GraphQLJSON, { nullable: true }) metadata?: Record<string, unknown>;
}
