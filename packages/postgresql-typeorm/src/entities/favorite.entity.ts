import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from "typeorm";
import { DocumentEntity } from "./document.entity";
import { UserEntity } from "./user.entity";
import { AbstractEntity } from "./abstract.entity";

@Entity('favorites')
@Index(
  'UQ_favorite_userid_documentdid',
  ['userId', 'documentId'],
  {
    unique: true,
  },
)
export class FavoriteEntity extends AbstractEntity {
    @PrimaryGeneratedColumn("uuid", { primaryKeyConstraintName: "PK_favorite_id" })
    id!: string;

    @Column({ type: "uuid", name: "document_id" })
    documentId!: string;

    @Column({ type: "uuid", name: "user_id" })
    userId!: string;

    @ManyToOne(() => DocumentEntity, (document) => document.favorites, { onDelete: "CASCADE" })
    @JoinColumn({
        name: "document_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "FK_favorite_document",
    })
    document!: DocumentEntity;

    @ManyToOne(() => UserEntity, (user) => user.favorites)
    @JoinColumn({
        name: "user_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "FK_favorite_user",
    })
    user!: UserEntity;
}