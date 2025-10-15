import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Index,
  type Relation,
} from "typeorm";
import { hashPassword as hashPass } from "@sandworm/nest-common";
import { AbstractEntity } from "./abstract.entity";
import { CommentEntity } from "./comment.entity";
import { UserFollowsEntity } from "./user-follows.entity";
import { UserSettingEntity } from "./user-settings.entity";
import { DocumentEntity } from "./document.entity";
import { ChatEntity } from "./chat.entity";
import { VoteEntity } from "./vote.entity";

@Entity("users")
export class UserEntity extends AbstractEntity {
  @PrimaryGeneratedColumn("uuid", {
    primaryKeyConstraintName: "PK_users_id",
  })
  id!: string;

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


  @Column({ nullable: true })
  password?: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await hashPass(this.password);
    }
  }

  // --- RELATIONS ---

  @OneToOne(() => UserSettingEntity, (userSetting) => userSetting)
  @JoinColumn()
  settings?: Relation<UserSettingEntity>;

  @OneToMany(() => DocumentEntity, (document) => document.author)
  documents?: Relation<DocumentEntity[]>;

  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments?: Relation<CommentEntity[]>;

  @ManyToMany(() => DocumentEntity, (document) => document.favoritedBy)
  @JoinTable({
    name: "user_favorites",
    joinColumn: {
      name: "user_id",
      referencedColumnName: "id",
      foreignKeyConstraintName: "FK_user_favorites_user",
    },
    inverseJoinColumn: {
      name: "document_id",
      referencedColumnName: "id",
      foreignKeyConstraintName: "FK_user_favorites_document",
    },
  })
  favorites?: Relation<DocumentEntity[]>;

  @OneToMany(() => UserFollowsEntity, (userFollow) => userFollow.follower)
  following?: Relation<UserFollowsEntity[]>;

  @OneToMany(() => UserFollowsEntity, (userFollow) => userFollow.followee)
  followers?: Relation<UserFollowsEntity[]>;

  @OneToMany(() => ChatEntity, (chat) => chat.user)
  chats!: Relation<ChatEntity[]>;

  @OneToMany(() => VoteEntity, (vote) => vote.user)
  votes!: Relation<VoteEntity[]>;
}