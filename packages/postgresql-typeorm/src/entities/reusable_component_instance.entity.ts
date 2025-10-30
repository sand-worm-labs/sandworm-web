import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
    type Relation,
} from "typeorm";
import { DocumentEntity } from "./document.entity";
import { AbstractEntity } from "./abstract.entity";
import { ReusableComponentEntity } from "./reusable_component.entity";


@Entity("reusable_component_instance")
export class ReusableComponentInstanceEntity extends AbstractEntity {
    @PrimaryGeneratedColumn("uuid", { name: "id" })
    id!: string;

    @Column({ type: "uuid", unique: true, name: "block_id" })
    blockId!: string;

    @Column({ type: "uuid", name: "reusable_component_id" })
    reusableComponentId!: string;

    @Column({ type: "uuid", name: "document_id" })
    documentId!: string;

    // Relations
    @ManyToOne(() => ReusableComponentEntity, (component) => component.reusableComponentInstances, { onDelete: "CASCADE" })
    @JoinColumn({ name: "reusable_component_id", referencedColumnName: "id" })
    reusableComponent!: Relation<ReusableComponentEntity>;

    @ManyToOne(() => DocumentEntity, (document) => document.reusableComponentInstances, { onDelete: "CASCADE" })
    @JoinColumn({ name: "document_id", referencedColumnName: "id" })
    document!: Relation<DocumentEntity>;
}