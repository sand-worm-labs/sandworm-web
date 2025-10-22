import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { AbstractEntity } from "./abstract.entity";
import { YjsDocumentEntity } from "./yjs-document.entity";
import { YjsAppDocumentEntity } from "./yjs-app-document.entity";
import { UserYjsAppDocumentEntity } from "./user-yjs-app-document.entity";

@Entity("yjs_update")
export class YjsUpdateEntity extends AbstractEntity {
    @PrimaryGeneratedColumn("uuid", { name: "id" })
    id!: string;

    @Column({ name: "update", type: "bytea" })
    update!: Buffer;

    @Column({ name: "clock", type: "int" })
    clock!: number;

    @ManyToOne(() => YjsDocumentEntity, (doc) => doc.yjsUpdates, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({
        name: "yjs_document_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "FK_yjs_update_yjs_document",
    })
    yjsDocument?: Relation<YjsDocumentEntity>;

    @Column({ name: "yjs_document_id", type: "uuid", nullable: true })
    yjsDocumentId?: string;

    @ManyToOne(() => YjsAppDocumentEntity, (appDoc) => appDoc.yjsUpdates, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({
        name: "yjs_app_document_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "FK_yjs_update_yjs_app_document",
    })
    yjsAppDocument?: Relation<YjsAppDocumentEntity>;

    @Column({ name: "yjs_app_document_id", type: "uuid", nullable: true })
    yjsAppDocumentId?: string;

    @ManyToOne(
        () => UserYjsAppDocumentEntity,
        (userDoc) => userDoc.yjsUpdates,
        { nullable: true, onDelete: "CASCADE" }
    )
    @JoinColumn([
        {
            name: "user_yjs_app_document_yjs_app_document_id",
            referencedColumnName: "yjsAppDocumentId",
            foreignKeyConstraintName: "FK_yjs_update_user_yjs_app_document_yjs_app_document",
        },
        {
            name: "user_yjs_app_document_user_id",
            referencedColumnName: "userId",
            foreignKeyConstraintName: "FK_yjs_update_user_yjs_app_document_user",
        },
    ])
    userYjsAppDocument?: Relation<UserYjsAppDocumentEntity>;

    @Column({ name: "user_yjs_app_document_yjs_app_document_id", type: "uuid", nullable: true })
    userYjsAppDocumentYjsAppDocumentId?: string;

    @Column({ name: "user_yjs_app_document_user_id", type: "uuid", nullable: true })
    userYjsAppDocumentUserId?: string;
}