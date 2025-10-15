import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity('tag')
export class TagEntity extends AbstractEntity {
  @PrimaryGeneratedColumn("uuid", { primaryKeyConstraintName: 'PK_tag_id' })
  id!: string;

  @Column()
  @Index('UQ_tag_name', ['name'], { unique: true })
  name!: string;
}
