import {
  Entity,
  Column,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn
} from "typeorm";
import { UserEntity } from "./user.entity";
import { AbstractEntity } from "./abstract.entity";

@Entity({ name: "user_settings" })
export class UserSettingEntity extends AbstractEntity {

  @PrimaryGeneratedColumn("uuid", { primaryKeyConstraintName: 'PK_user_setting_id' })
  id: string;

  @Column({ type: "uuid", name: "user_id", unique: true })
  userId: string;

  @OneToOne(() => UserEntity, (user) => user.settings, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;


  @Column({
    type: "jsonb",
    name: "social_links",
    default: () => `'{}'::jsonb`,
  })
  socialLinks: {
    telegram?: string;
    twitter?: string;
    github?: string;
    discord?: string;
    email?: string;
    warpcast?: string;
  };

  @Column({
    type: "text",
    name: "status_text",
    default: "Just joined 🚀",
  })
  statusText: string;

  @Column({
    type: "timestamptz",
    name: "status_updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  statusUpdatedAt: Date;

  @Column({
    type: "varchar",
    name: "theme",
    default: "dark",
  })
  theme: 'light' | 'dark';

  @Column({
    type: "jsonb",
    name: "wallets",
    default: () => `'[]'::jsonb`,
  })
  wallets: { chain: string; address: string }[];
}