import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
    OneToOne
} from "typeorm";
import type { Relation } from "typeorm";
import { AbstractEntity } from "./abstract.entity";
import { UserEntity } from "./user.entity";
import { ChatEntity } from "./chat.entity";
import { MessageEntity } from "./message.entity";

@Entity("votes")
export class VoteEntity extends AbstractEntity {
    @PrimaryColumn("uuid", { name: "user_id" })
    userId!: string;

    @PrimaryColumn("uuid", { name: "chat_id" })
    chatId!: string;

    @PrimaryColumn("uuid", { name: "message_id" })
    messageId!: string;

    @Column({ name: "is_upvoted", type: "boolean", nullable: false })
    isUpvoted!: boolean;

    @OneToOne(() => MessageEntity, (message) => message.vote, { onDelete: "CASCADE" })
    @JoinColumn({
        name: "message_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "FK_votes_message",
    })
    message!: Relation<MessageEntity>;

    @ManyToOne(() => UserEntity, (user) => user.votes, {
        onDelete: "CASCADE",
    })
    @JoinColumn({
        name: "user_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "FK_votes_user",
    })
    user!: Relation<UserEntity>;

    @ManyToOne(() => ChatEntity, (chat) => chat.votes, {
        onDelete: "CASCADE",
    })
    @JoinColumn({
        name: "chat_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "FK_votes_chat",
    })
    chat!: Relation<ChatEntity>;

}
