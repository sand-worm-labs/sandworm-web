import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import type { Relation } from "typeorm";
import { AbstractEntity } from "./abstract.entity";
import { WorkspaceEntity } from "./workspace.entity";

export enum EnvironmentStatus {
  Running = "Running",
  Stopped = "Stopped",
  Failing = "Failing",
  Starting = "Starting",
  Stopping = "Stopping",
}

@Entity("environment")
@Unique("unique_workspaceId", ["workspaceId"])
export class EnvironmentEntity extends AbstractEntity {
  constructor(data?: Partial<EnvironmentEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn("uuid", {
    primaryKeyConstraintName: "PK_environment_id",
  })
  id!: string;

  @Column({ name: "workspace_id", type: "uuid", unique: true })
  workspaceId!: string;

  @Column({
    name: "status",
    type: "enum",
    enum: EnvironmentStatus,
    default: EnvironmentStatus.Stopped,
  })
  status!: EnvironmentStatus;

  @Column({ name: "started_at", type: "timestamp", nullable: true })
  startedAt?: Date | null;

  @Column({ name: "last_activity_at", type: "timestamp", nullable: true })
  lastActivityAt?: Date | null;

  @Column({ name: "resource_version", type: "int", default: 0 })
  resourceVersion!: number;

  @Column({ name: "jupyter_token", type: "varchar", default: "" })
  jupyterToken!: string;

  
  @OneToOne(() => WorkspaceEntity, (workspace) => workspace.environment, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "workspace_id",
    referencedColumnName: "id",
    foreignKeyConstraintName: "FK_environment_workspace",
  })
  workspace!: Relation<WorkspaceEntity>;
}