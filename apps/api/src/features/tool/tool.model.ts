import { Field, ObjectType } from '@nestjs/graphql';
import { StringField, StringFieldOptional } from '@sandworm/graphql';
import { ToolEntity } from '@sandworm/postgresql-typeorm';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class Tool {
  @StringField()
  toolId!: string;

  @StringField()
  categoryId!: string;

  @StringField()
  name!: string;

  @StringField()
  description!: string;

  @Field(() => [String])
  tags!: string[];

  @Field(() => GraphQLJSON)
  params!: unknown[];

  @StringFieldOptional()
  g1?: string;

  @StringFieldOptional()
  g2?: string;

  @StringFieldOptional()
  g3?: string;

  @StringFieldOptional()
  g4?: string;

  @StringFieldOptional()
  g5?: string;

  @StringFieldOptional()
  scope?: string;

  @Field(() => GraphQLJSON)
  returns!: unknown[];

  static fromEntity(entity: ToolEntity): Tool {
    const tool = new Tool();
    tool.toolId = entity.toolId;
    tool.categoryId = entity.categoryId;
    tool.name = entity.name;
    tool.description = entity.description;
    tool.tags = entity.tags;
    tool.params = entity.params;
    tool.g1 = entity.g1;
    tool.g2 = entity.g2;
    tool.g3 = entity.g3;
    tool.g4 = entity.g4;
    tool.g5 = entity.g5;
    tool.scope = entity.scope;
    tool.returns = entity.returns;
    return tool;
  }

  static fromEntities(entities: ToolEntity[]): Tool[] {
    return entities.map((entity) => Tool.fromEntity(entity));
  }
}
