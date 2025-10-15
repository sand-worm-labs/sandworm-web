import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { UserEntity } from "./user.entity";
import { AbstractEntity } from "./abstract.entity";

@Entity("chats")
export class ChatEntity extends AbstractEntity {
    @PrimaryGeneratedColumn("uuid", { primaryKeyConstraintName: "PK_chat_id" })
    id!: string;

    @Column({ type: "text", nullable: false })
    title!: string;

    @Column({ name: "visibility", type: "varchar", default: "private" })
    visibility!: "public" | "private";

    @Column({ name: "last_context", type: "jsonb", nullable: true })
    lastContext?: Record<string, any> | null;

    @Column({ name: "user_id", type: "uuid", nullable: false })
    userId!: string;

    @ManyToOne(() => UserEntity, (user) => user.chats, {
        onDelete: "CASCADE",
    })
    @JoinColumn({
        name: "user_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "FK_chat_user",
    })
    user!: Relation<UserEntity>;
}