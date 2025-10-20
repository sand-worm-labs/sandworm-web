import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  type Relation,
  OneToOne,
} from "typeorm";
import { ChatEntity } from "./chat.entity";
import { AbstractEntity } from "./abstract.entity";
import { VoteEntity } from "./vote.entity";

export type MessagePart = any; // You can refine this later
export type MessageAttachment = any;

@Entity("messages")
export class MessageEntity extends AbstractEntity {
  @PrimaryGeneratedColumn("uuid", { primaryKeyConstraintName: "PK_message_id" })
  id!: string;

  @ManyToOne(() => ChatEntity, (chat) => chat.messages, { onDelete: "CASCADE" })
  @JoinColumn({ name: "chat_id" })
  chat!: Relation<ChatEntity>;

  @Column()
  role!: string;

  @Column("jsonb")
  parts!: MessagePart;

  @Column("jsonb")
  attachments!: MessageAttachment;

  @OneToOne(() => VoteEntity, (vote) => vote.message)
  vote: Relation<VoteEntity>;

}
