import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";

import { AbstractEntity } from "./abstract.entity";
import { UserEntity } from "./user.entity";
import { DocumentEntity } from "./document.entity";

@Entity('document_fork')
export class DocumentForkEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'source_document_id', type: 'uuid' })
    sourceDocumentId!: string;

    @Column({ name: 'forked_document_id', type: 'uuid' })
    forkedDocumentId!: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @ManyToOne(() => DocumentEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'source_document_id' })
    sourceDocument!: Relation<DocumentEntity>;

    @ManyToOne(() => DocumentEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'forked_document_id' })
    forkedDocument!: Relation<DocumentEntity>;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: Relation<UserEntity>;
}