import { plainToInstance } from 'class-transformer';
import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export abstract class AbstractEntity extends BaseEntity {

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  toDto<Dto>(dtoClass: new () => Dto): Dto {
    return plainToInstance(dtoClass, this);
  }
}
