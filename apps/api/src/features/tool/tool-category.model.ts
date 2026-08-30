import { ObjectType } from '@nestjs/graphql';
import { StringField } from '@sandworm/graphql';
import { ToolCategoryEntity } from '@sandworm/postgresql-typeorm';

@ObjectType()
export class ToolCategory {
  @StringField()
  categoryId!: string;

  @StringField()
  name!: string;

  @StringField()
  description!: string;

  static fromEntity(entity: ToolCategoryEntity): ToolCategory {
    const category = new ToolCategory();
    category.categoryId = entity.categoryId;
    category.name = entity.name;
    category.description = entity.description;
    return category;
  }

  static fromEntities(entities: ToolCategoryEntity[]): ToolCategory[] {
    return entities.map((entity) => ToolCategory.fromEntity(entity));
  }
}
