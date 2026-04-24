import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    PrimaryColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { AbstractEntity } from "./abstract.entity";
import { UserEntity } from "./user.entity";
import { YjsAppDocumentEntity } from "./yjs-app-document.entity";
import { YjsUpdateEntity } from "./yjs-update.entity";


@Entity("user_yjs_app_document")
export class UserYjsAppDocumentEntity extends AbstractEntity {
    @PrimaryColumn("uuid", { name: "yjs_app_document_id" })
    yjsAppDocumentId!: string;

    @PrimaryColumn("uuid", { name: "user_id" })
    userId!: string;

    @Column({ name: "clock", type: "int", default: 0 })
    clock!: number;

    @Column({ name: "clock_updated_at", type: "timestamptz", nullable: true })
    clockUpdatedAt?: Date;

    @Column({ name: "state", type: "bytea" })
    state!: Buffer;

    @Column({ name: "user_changed_state", type: "boolean", default: false })
    userChangedState!: boolean;

    @Column({ name: "state_hash", type: "varchar", length: 40 })
    stateHash!: string;

    @ManyToOne(() => YjsAppDocumentEntity, (appDoc) => appDoc.userYjsAppDocuments, { onDelete: "CASCADE" })
    @JoinColumn({
        name: "yjs_app_document_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "FK_user_yjs_app_document_yjs_app_document",
    })
    yjsAppDocument!: Relation<YjsAppDocumentEntity>;

    @ManyToOne(() => UserEntity, (user) => user.yjsAppDocuments, { onDelete: "CASCADE" })
    @JoinColumn({
        name: "user_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "FK_user_yjs_app_document_user",
    })
    user!: Relation<UserEntity>;

    @OneToMany(() => YjsUpdateEntity, (update) => update.userYjsAppDocument)
    yjsUpdates!: Relation<YjsUpdateEntity>[];
}