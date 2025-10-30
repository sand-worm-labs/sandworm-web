import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { AbstractEntity } from "./abstract.entity";
import { DocumentEntity } from "./document.entity";
import { YjsUpdateEntity } from "./yjs-update.entity";
import { UserYjsAppDocumentEntity } from "./user-yjs-app-document.entity";

@Entity("yjs_app_document")
export class YjsAppDocumentEntity extends AbstractEntity {
    @PrimaryGeneratedColumn("uuid", { name: "id" })
    id!: string;

    @Column({ name: "clock", type: "int", default: 0 })
    clock!: number;

    @Column({ name: "clock_updated_at", type: "timestamptz", nullable: true })
    clockUpdatedAt?: Date;

    @Column({ name: "state", type: "bytea" })
    state!: Buffer;

    @Column({ name: "has_dashboard", type: "boolean", default: false })
    hasDashboard!: boolean;

    @Column({ name: "document_id", type: "uuid" })
    documentId!: string;

    @ManyToOne(() => DocumentEntity, (document) => document.yjsAppDocuments, { onDelete: "CASCADE" })
    @JoinColumn({
        name: "document_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "FK_yjs_app_document_document",
    })
    document!: Relation<DocumentEntity>;

    @OneToMany(() => UserYjsAppDocumentEntity, (userDoc) => userDoc.yjsAppDocument)
    userYjsAppDocuments!: Relation<UserYjsAppDocumentEntity>[];

    @OneToMany(() => YjsUpdateEntity, (update) => update.yjsAppDocument)
    yjsUpdates!: Relation<YjsUpdateEntity>[];
}