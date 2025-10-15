import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import type { Relation } from "typeorm"
import { AbstractEntity } from "./abstract.entity";
import { ChatEntity } from "./chat.entity";

@Entity("messages")
export class MessageEntity extends AbstractEntity {
  @PrimaryGeneratedColumn("uuid", { primaryKeyConstraintName: "PK_message_id" })
  id!: string;

  @ManyToOne(() => ChatEntity, (chat) => chat.messages, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "chat_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "FK_message_chat",
  })
  chat!: Relation<ChatEntity>;

  @Column({ type: "varchar", name: "role", nullable: false })
  role!: string;

  @Column({ type: "jsonb", name: "parts", nullable: false })
  parts!: Record<string, any>;

  @Column({ type: "jsonb", name: "attachments", nullable: false })
  attachments!: Record<string, any>;

  @CreateDateColumn({ name: "created_at", type: "timestamp with time zone" })
  createdAt!: Date;
}