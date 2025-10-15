import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { CommentEntity } from './comment.entity';
import { TagEntity } from './tag.entity';
import { UserEntity } from './user.entity';

@Entity('document')
export class DocumentEntity extends AbstractEntity {
  constructor(data?: Partial<DocumentEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_document_id' })
  id!: string;

  @Column()
  @Index('UQ_document_slug', ['slug'], { unique: true })
  slug!: string;

  @Column()
  title!: string;

  @Column({ default: '' })
  description!: string;

  @Column({ default: '' })
  body!: string;

  @Column({ name: 'author_id' })
  authorId: number;

  @ManyToOne(() => UserEntity, (user) => user.documents)
  @JoinColumn({
    name: 'author_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_document_user',
  })
  author: UserEntity;

  @ManyToMany(() => TagEntity)
  @JoinTable({
    name: 'document_to_tag',
    joinColumn: {
      name: 'document_id',
      foreignKeyConstraintName: 'FK_document_to_tag_document',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      foreignKeyConstraintName: 'FK_document_to_tag_tag',
      referencedColumnName: 'id',
    },
  })
  tags: Relation<TagEntity[]>;

  @OneToMany(() => CommentEntity, (comment) => comment.document)
  comments: Relation<CommentEntity[]>;

  @ManyToMany(() => UserEntity, (user) => user.favorites)
  favoritedBy: Relation<UserEntity[]>;


  @ManyToOne(() => DocumentEntity, (doc) => doc.forks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'forked_from_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_document_forked_from',
  })
  forkedFrom?: Relation<DocumentEntity>;


  @OneToMany(() => DocumentEntity, (doc) => doc.forkedFrom)
  forks: Relation<DocumentEntity[]>;
}