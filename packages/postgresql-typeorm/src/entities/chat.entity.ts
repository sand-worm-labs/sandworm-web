import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import type { Relation } from "typeorm";
import { UserEntity } from "./user.entity";
import { WorkspaceEntity } from "./workspace.entity";
import { DocumentEntity } from "./document.entity";
import { AbstractEntity } from "./abstract.entity";
import { MessageEntity } from "./message.entity";
import { VoteEntity } from "./vote.entity";

@Entity("chats")
export class ChatEntity extends AbstractEntity {
  @PrimaryGeneratedColumn("uuid", { primaryKeyConstraintName: "PK_chat_id" })
  id!: string;

  @Column({ name: "user_id", type: "uuid", nullable: false })
  userId!: string;

  @Column({ name: "workspace_id", type: "uuid", nullable: false })
  workspaceId!: string;

  @Column({ name: "document_id", type: "uuid", nullable: false })
  documentId!: string;

  @Column({ type: "text", nullable: false })
  title!: string;

  @Column({ name: "is_visible", type: "boolean", default: false })
  private!: boolean;

  @Column({ name: "last_context", type: "jsonb", nullable: true })
  lastContext?: Record<string, any> | null;

  @ManyToOne(() => UserEntity, (user) => user.chats, { onDelete: "CASCADE" })
  @JoinColumn({
    name: "user_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "FK_chat_user",
  })
  user!: Relation<UserEntity>;

  @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.chats, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "workspace_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "FK_chat_workspace",
  })
  workspace!: Relation<WorkspaceEntity>;

  @ManyToOne(() => DocumentEntity, (document) => document.chats, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "document_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "FK_chat_document",
  })
  document!: Relation<DocumentEntity>;

  @OneToMany(() => MessageEntity, (message) => message.chat)
  messages!: Relation<MessageEntity[]>;
}