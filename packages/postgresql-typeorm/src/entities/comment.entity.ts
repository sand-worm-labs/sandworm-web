import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { DocumentEntity } from './document.entity';
import { UserEntity } from './user.entity';

@Entity('comment')
export class CommentEntity extends AbstractEntity {
  constructor(data?: Partial<CommentEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_comment_id' })
  id!: string;

  @Column()
  body!: string;

  @Column({ name: 'document_id' })
  documentId!: number;

  @ManyToOne(() => DocumentEntity, (document) => document.comments)
  @JoinColumn({
    name: 'document_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_comment_document',
  })
  document: DocumentEntity;

  @Column({ name: 'author_id' })
  authorId!: number;

  @ManyToOne(() => UserEntity, (user) => user.comments)
  @JoinColumn({
    name: 'author_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_comment_user',
  })
  author: UserEntity;
}
