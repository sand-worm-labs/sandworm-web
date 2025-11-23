import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import type { Relation } from "typeorm";
import { AbstractEntity } from "./abstract.entity";
import { DocumentEntity } from "./document.entity";
import { UserEntity } from "./user.entity";

@Entity("comment")
export class CommentEntity extends AbstractEntity {
  constructor(data?: Partial<CommentEntity>) {
    super();
    Object.assign(this, data);
  }
  @PrimaryGeneratedColumn("uuid", { primaryKeyConstraintName: "PK_comment_id" })
  id!: string;

  @Column()
  body!: string;

  // ----- Relation to Document -----
  @Column({ name: "document_id" })
  documentId!: string;

  @ManyToOne(() => DocumentEntity, (document) => document.comments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "document_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "FK_comment_document",
  })
  document!: Relation<DocumentEntity>;

  // ----- Relation to Author/User -----
  @Column({ name: "author_id" })
  authorId!: string;

  @ManyToOne(() => UserEntity, (user) => user.comments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "author_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "FK_comment_user",
  })
  author!: Relation<UserEntity>;
}