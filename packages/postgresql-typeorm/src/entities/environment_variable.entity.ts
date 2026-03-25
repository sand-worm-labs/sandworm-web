import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    PrimaryGeneratedColumn,
    Unique,
} from "typeorm";
import type { Relation } from "typeorm";
import { AbstractEntity } from "./abstract.entity";
import { WorkspaceEntity } from "./workspace.entity";
import { encrypt, decrypt } from "@sandworm/nest-common";

@Entity("environment_variable")
@Unique("unique_workspaceId_name", ["workspaceId", "name"])
export class EnvironmentVariableEntity extends AbstractEntity {
    constructor(data?: Partial<EnvironmentVariableEntity>) {
        super();
        Object.assign(this, data);
    }

    @PrimaryGeneratedColumn("uuid", {
        primaryKeyConstraintName: "PK_environment_variable_id",
    })
    id!: string;

    @Column({ name: "name", type: "varchar" })
    name!: string;

    @Column({
        name: "value",
        type: "varchar",
        transformer: {
            to: (value: string) => encrypt(value, process.env.ENVIRONMENT_VARIABLES_ENCRYPTION_KEY),
            from: (value: string) => decrypt(value, process.env.ENVIRONMENT_VARIABLES_ENCRYPTION_KEY),
        },
    })
    value!: string;

    @Column({ name: "workspace_id", type: "uuid" })
    workspaceId!: string;

    @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.environmentVariables, {
        onDelete: "CASCADE",
    })
    @JoinColumn({
        name: "workspace_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "FK_environment_variable_workspace",
    })
    workspace!: Relation<WorkspaceEntity>;
}
