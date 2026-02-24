import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { WorkspaceEntity } from './workspace.entity';
import { UserWorkspaceRole, UserWorkspaceStatus } from './enums';
import { AbstractEntity } from './abstract.entity';

@Entity('user_workspace')
@Index(['userId', 'workspaceId'], { unique: true })
export class UserWorkspaceEntity extends AbstractEntity {
  @PrimaryColumn('uuid', { name: 'user_id' })
  userId!: string;

  @PrimaryColumn('uuid', { name: 'workspace_id' })
  workspaceId!: string;

  @Column('uuid', { name: 'inviter_id', nullable: true })
  inviterId?: string | null;

  @Column({
    type: 'enum',
    enum: UserWorkspaceRole,
    default: UserWorkspaceRole.EDITOR,
  })
  role!: UserWorkspaceRole;

  @Column({
    type: 'enum',
    enum: UserWorkspaceStatus,
    default: UserWorkspaceStatus.PENDING,
  })
  status!: UserWorkspaceStatus;

  @Column({
    type: 'enum',
    enum: UserWorkspaceRole,
    nullable: true,
    name: 'requested_role',
  })
  requestedRole?: UserWorkspaceRole | null;

  @ManyToOne(() => UserEntity, (user) => user.userWorkspaces, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<UserEntity>;

  @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspace_id' })
  workspace!: Relation<WorkspaceEntity>;

  @ManyToOne(() => UserEntity, (user) => user.workspacesInvitees, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'inviter_id' })
  inviter?: Relation<UserEntity> | null;
}