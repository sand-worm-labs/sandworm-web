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
import { ReusableComponentType } from "./enums";
import { AbstractEntity } from "./abstract.entity";
import { ReusableComponentInstanceEntity } from "./reusable_component_instance.entity";


@Entity("reusable_component")
export class ReusableComponentEntity extends AbstractEntity {
    @PrimaryGeneratedColumn("uuid", { name: "id" })
    id!: string;

    @Column({ type: "bytea" })
    state!: Buffer;

    @Column({ type: "enum", enum: ReusableComponentType })
    type!: ReusableComponentType;

    @Column()
    title!: string;

    @Column({ type: "uuid", unique: true, name: "block_id" })
    blockId!: string;

    @Column({ type: "uuid", name: "document_id" })
    documentId!: string;

    @Column({ default: true, name: "instances_created" })
    instancesCreated!: boolean;

    // Relations
    @ManyToOne(() => DocumentEntity, (document) => document.reusableComponents, { onDelete: "CASCADE" })
    @JoinColumn({ name: "document_id", referencedColumnName: "id" })
    document!: Relation<DocumentEntity>;

    @OneToMany(() => ReusableComponentInstanceEntity, (instance) => instance.reusableComponent)
    reusableComponentInstances!: Relation<ReusableComponentInstanceEntity[]>;
}