import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import { AbstractEntity } from "./abstract.entity";
import { CommentEntity } from "./comment.entity";
import { TagEntity } from "./tag.entity";
import { UserEntity } from "./user.entity";
import { WorkspaceEntity } from "./workspace.entity";

@Entity("document")
export class DocumentEntity extends AbstractEntity {
  constructor(data?: Partial<DocumentEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn("uuid", { primaryKeyConstraintName: "PK_document_id" })
  id!: string;

  @Column()
  @Index("UQ_document_slug", ["slug"], { unique: true })
  slug!: string;

  @Column()
  title!: string;

  @Column({ default: "" })
  description!: string;

  @Column({ default: "" })
  body!: string;

  // ----- Author -----
  @Column({ name: "author_id" })
  authorId!: string;

  @ManyToOne(() => UserEntity, (user) => user.documents, { onDelete: "CASCADE" })
  @JoinColumn({
    name: "author_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "FK_document_user",
  })
  author!: Relation<UserEntity>;

  // ----- Author -----
  @Column({ name: "workspace_id" })
  workspaceId!: string;

  @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.documents, { onDelete: "CASCADE" })
  @JoinColumn({
    name: "workspace_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "FK_workspace_document",
  })
  workspace!: Relation<WorkspaceEntity>;


  // ----- Tags -----
  @ManyToMany(() => TagEntity)
  @JoinTable({
    name: "document_to_tag",
    joinColumn: {
      name: "document_id",
      referencedColumnName: "id",
      foreignKeyConstraintName: "FK_document_to_tag_document",
    },
    inverseJoinColumn: {
      name: "tag_id",
      referencedColumnName: "id",
      foreignKeyConstraintName: "FK_document_to_tag_tag",
    },
  })
  tags!: Relation<TagEntity[]>;

  // ----- Comments -----
  @OneToMany(() => CommentEntity, (comment) => comment.document)
  comments!: Relation<CommentEntity[]>;

  // ----- Favorited By Users -----
  @ManyToMany(() => UserEntity, (user) => user.favorites)
  favoritedBy!: Relation<UserEntity[]>;

  // ----- Forking -----
  @ManyToOne(() => DocumentEntity, (doc) => doc.forks, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({
    name: "forked_from_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "FK_document_forked_from",
  })
  forkedFrom?: Relation<DocumentEntity>;

  @OneToMany(() => DocumentEntity, (doc) => doc.forkedFrom)
  forks!: Relation<DocumentEntity[]>;
}