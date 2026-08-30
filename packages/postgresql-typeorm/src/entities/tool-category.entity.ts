import { Column, Entity, PrimaryColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity('tool_category')
export class ToolCategoryEntity extends AbstractEntity {
  constructor(data?: Partial<ToolCategoryEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryColumn('varchar', { name: 'category_id', primaryKeyConstraintName: 'PK_tool_category_category_id' })
  categoryId!: string;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  description!: string;
}
