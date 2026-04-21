import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";

import { AbstractEntity } from "./abstract.entity";
import { WorkspaceEntity } from "./workspace.entity";
import { YjsDocumentEntity } from "./yjs-document.entity";
import { YjsAppDocumentEntity } from "./yjs-app-document.entity";
import { CommentEntity } from "./comment.entity";
import { FavoriteEntity } from "./favorite.entity";
import { ExecutionScheduleEntity } from "./execution-schedule.entity";
import { ReusableComponentEntity } from "./reusable_component.entity";
import { ReusableComponentInstanceEntity } from "./reusable_component_instance.entity";
import { UserEntity } from "./user.entity";
import { DocumentVisibility } from "./enums";
import { DocumentForkEntity } from "./document_fork.entity";


@Entity("document")
export class DocumentEntity extends AbstractEntity {
  constructor(data?: Partial<DocumentEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn("uuid", { primaryKeyConstraintName: "PK_document_id" })
  id!: string;

  @Column({
    type: "enum",
    enum: DocumentVisibility,
    default: DocumentVisibility.WORKSPACE,
  })
  visibility!: DocumentVisibility;
  
  @Column()
  title!: string;

  @Index("IDX_document_published_slug", { unique: true, where: '"published_slug" IS NOT NULL' })
  @Column({ name: "published_slug", nullable: true, unique: false })
  publishedSlug!: string | null;

  @Column({ default: "DocumentIcon" })
  slug!: string;

  @Column({ name: "order_index" })
  orderIndex!: number;

  @Column({ type: "timestamp", name: "deleted_at", nullable: true })
  deletedAt?: Date | null;

  @Column({ default: 1 })
  version!: number;

  @Column({ default: false })
  isSyncedWithYjs!: boolean;

  @Column({ name: "workspace_id" })
  workspaceId!: string;

  @Column({ name: "author_id" })
  authorId!: string;


  @Column({ name: "parent_id", nullable: true })
  parentId?: string | null;

  @Column({ default: false })
  featuredDocument!: boolean;

  @Column({ default: false })
  runUnexecutedBlocks!: boolean;

  @Column({ default: true })
  runSQLSelection!: boolean;

  @Column({ default: true })
  shareLinksWithoutSidebar!: boolean;

  @Column({ type: "timestamp", nullable: true })
  publishedAt!: Date | null;


  @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.documents, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "workspace_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "FK_document_workspace",
  })
  workspace!: Relation<WorkspaceEntity>;

  @ManyToOne(() => UserEntity, (user) => user.documents, { onDelete: "CASCADE" })
  @JoinColumn({
    name: "author_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "FK_document_user",
  })
  author!: Relation<UserEntity>;

  @ManyToOne(() => DocumentEntity, (doc) => doc.children, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "parent_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "FK_document_parent",
  })
  parent?: Relation<DocumentEntity> | null;

  @OneToMany(() => DocumentEntity, (doc) => doc.parent)
  children!: Relation<DocumentEntity[]>;

  @OneToMany(() => YjsDocumentEntity, (yjs) => yjs.document)
  yjsDocuments!: Relation<YjsDocumentEntity[]>;

  @OneToMany(() => YjsAppDocumentEntity, (yjsApp) => yjsApp.document)
  yjsAppDocuments!: Relation<YjsAppDocumentEntity[]>;

  @OneToMany(() => CommentEntity, (comment) => comment.document)
  comments!: Relation<CommentEntity[]>;

  @OneToMany(() => FavoriteEntity, (favorite) => favorite.document)
  favorites!: Relation<FavoriteEntity[]>;

  @OneToMany(() => ExecutionScheduleEntity, (schedule) => schedule.document)
  executionSchedules!: Relation<ExecutionScheduleEntity[]>;


  @OneToMany(() => ReusableComponentEntity, (rc) => rc.document)
  reusableComponents!: Relation<ReusableComponentEntity[]>;

  @OneToMany(
    () => ReusableComponentInstanceEntity,
    (rci) => rci.document,
  )
  reusableComponentInstances!: Relation<ReusableComponentInstanceEntity[]>;

  @OneToMany(() => DocumentForkEntity, (fork) => fork.sourceDocument)
  forks!: Relation<DocumentForkEntity[]>;
}
