import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
  type Relation,
} from "typeorm";
import { hashPassword as hashPass } from "@sandworm/nest-common";
import { AbstractEntity } from "./abstract.entity";
import { CommentEntity } from "./comment.entity";
import { UserFollowsEntity } from "./user-follows.entity";
import { UserSettingEntity } from "./user-setting.entity";
import { DocumentEntity } from "./document.entity";
import { ChatEntity } from "./chat.entity";
import { VoteEntity } from "./vote.entity";
import { WorkspaceEntity } from "./workspace.entity";
import { TutorialEntity } from "./tutorial.entity";
import { YjsDocumentEntity } from "./yjs-document.entity";
import { YjsAppDocumentEntity } from "./yjs-app-document.entity";
import { FavoriteEntity } from "./favorite.entity";
import { Exclude } from "class-transformer";

@Entity("users")
export class UserEntity extends AbstractEntity {
  
  @PrimaryGeneratedColumn("uuid", {
    primaryKeyConstraintName: "PK_users_id",
  })
  id!: string;

  @Column({ type: 'varchar', default: 'email' })
  provider!: string;

  @Column({ name: 'social_id', nullable: true })
  @Index('IDX_users_social_id')
  socialId?: string | null;

  @Column({ unique: true, nullable: true })
  @Index("UQ_users_username", ["username"], { unique: true })
  username?: string;

  @Column({ nullable: true })
  @Index("UQ_users_email", ["email"], { unique: true })
  email?: string;

  @Column({ name: "first_name", nullable: true })
  firstName?: string;

  @Column({ name: "last_name", nullable: true })
  lastName?: string;

  @Column({ name: "full_name", nullable: true })
  fullName?: string;

  @Column({ name: "avater", nullable: true })
  avater?: string;

  @Column({ name: "is_onboarded", default: false })
  isOnboarded!: boolean;

  @Column({
    name: "email_verified_at",
    type: "timestamptz",
    nullable: true,
  })
  emailVerifiedAt?: Date | null;

  @Column({
    name: "email_verified",
    type: "bool",
    nullable: true,
  })
  emailVerified?: boolean | null;


  @Column({ nullable: true, select: false }) // Added select: false for security
  @Exclude({ toPlainOnly: true }) 
  password?: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await hashPass(this.password);
    }
  }
  @OneToOne(() => UserSettingEntity, (userSetting) => userSetting)
  @JoinColumn()
  settings?: Relation<UserSettingEntity>;

  @OneToMany(() => DocumentEntity, (document) => document.author)
  documents?: Relation<DocumentEntity[]>;

  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments?: Relation<CommentEntity[]>;

  @OneToMany(() => FavoriteEntity, (userfavorite) => userfavorite.user)
  favorites!: Relation<FavoriteEntity[]>;

  @OneToMany(() => UserFollowsEntity, (userFollow) => userFollow.follower)
  following?: Relation<UserFollowsEntity[]>;

  @OneToMany(() => UserFollowsEntity, (userFollow) => userFollow.followee)
  followers?: Relation<UserFollowsEntity[]>;

  @OneToMany(() => ChatEntity, (chat) => chat.user)
  chats!: Relation<ChatEntity[]>;

  @OneToMany(() => VoteEntity, (vote) => vote.user)
  votes!: Relation<VoteEntity[]>;

  @OneToMany(() => WorkspaceEntity, (workspace) => workspace.owner)
  workspaces!: Relation<WorkspaceEntity[]>;

  @OneToMany(() => TutorialEntity, (onboarding_tutorial) => onboarding_tutorial.user)
  onboardingTutorials!: Relation<TutorialEntity[]>;


  @OneToMany(() => YjsDocumentEntity, (yjsDoc) => yjsDoc.document)
  yjsDocuments!: Relation<YjsDocumentEntity[]>;

  @OneToMany(() => YjsAppDocumentEntity, (yjsAppDoc) => yjsAppDoc.document)
  yjsAppDocuments!: Relation<YjsAppDocumentEntity[]>;

  getDisplayName(): string {
    return this.fullName || this.username || this.email || 'Anonymous';
  }

}