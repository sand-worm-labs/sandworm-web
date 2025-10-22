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

@Entity("yjs_document")
export class YjsDocumentEntity extends AbstractEntity {
    @PrimaryGeneratedColumn("uuid", { name: "id" })
    id!: string;

    @Column({ name: "clock", type: "int", default: 0 })
    clock!: number;

    @Column({ name: "clock_updated_at", type: "timestamptz", nullable: true })
    clockUpdatedAt?: Date;

    @Column({ name: "state", type: "bytea" })
    state!: Buffer;

    @Column({ name: "document_id", type: "uuid", unique: true })
    documentId!: string;

    @ManyToOne(() => DocumentEntity, (document) => document.yjsDocuments, { onDelete: "CASCADE" })
    @JoinColumn({
        name: "document_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "FK_yjs_document_document",
    })
    document!: Relation<DocumentEntity>;

    @OneToMany(() => YjsUpdateEntity, (update) => update.yjsDocument)
    yjsUpdates!: Relation<YjsUpdateEntity>[];
}