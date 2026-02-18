import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  type Relation,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Plan } from './enums';
import { UserEntity } from './user.entity';
import { AbstractEntity } from './abstract.entity';
import { TutorialEntity } from './tutorial.entity';
import { DocumentEntity } from './document.entity';
import { EnvironmentEntity } from './environment.entity';
import { EnvironmentVariableEntity } from './environment_variable.entity';
import { UserWorkspaceEntity } from './user-workspace.entity';

@Entity('workspaces')
export class WorkspaceEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_workspace_id',
  })
  id!: string;

  @Column({ nullable: false })
  icon?: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  source?: string;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  useCases!: string[];

  @Column({ name: 'use_context', nullable: true })
  useContext?: string;

  @Column({ type: 'enum', enum: Plan, default: Plan.FREE })
  plan!: Plan;

  @Column({ name: 'owner_id', nullable: true })
  ownerId!: string;

  @Column({ name: 'assistant_model', default: 'gpt-4o' })
  assistantModel!: string;

  // Relations
  @ManyToOne(() => UserEntity, (user) => user.ownedWorkspaces, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_id' })
  owner!: Relation<UserEntity>;

  @OneToMany(() => DocumentEntity, (document) => document.workspace)
  documents!: Relation<DocumentEntity[]>;

  @OneToMany(() => TutorialEntity, (tutorial) => tutorial.workspace)
  onboardingTutorials!: Relation<TutorialEntity[]>;

  @OneToOne(() => EnvironmentEntity, (environment) => environment.workspace, {
    onDelete: 'CASCADE',
  })
  environment?: Relation<EnvironmentEntity>;

  @OneToMany(() => EnvironmentVariableEntity, (envVar) => envVar.workspace, {
    onDelete: 'CASCADE',
  })
  environmentVariables!: Relation<EnvironmentVariableEntity[]>;

  @OneToMany(() => UserWorkspaceEntity, (uw) => uw.workspace)
  users!: Relation<UserWorkspaceEntity[]>;
}