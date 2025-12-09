import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    type Relation,
    OneToOne,
} from "typeorm";
import { Plan } from "./enums";
import { UserEntity } from "./user.entity";
import { AbstractEntity } from "./abstract.entity";
import { TutorialEntity } from "./tutorial.entity";
import { DocumentEntity } from "./document.entity";
import { EnvironmentEntity } from "./environment.entity";
import { EnvironmentVariableEntity } from "./environment_variable.entity";

@Entity("workspaces")
export class WorkspaceEntity extends AbstractEntity {
    @PrimaryGeneratedColumn("uuid", { primaryKeyConstraintName: "PK_workspace_id" })
    id!: string;

    @Column()
    name!: string;

    @Column({ nullable: true })
    source?: string;

    @Column({ type: "text", array: true, default: () => "'{}'" })
    useCases!: string[];

    @Column({ nullable: true })
    useContext?: string;

    @Column({ type: "enum", enum: Plan, default: Plan.FREE })
    plan!: Plan;

    @Column({ nullable: true})
    ownerId!: string;

    @ManyToOne(() => UserEntity, (user) => user.workspaces, { onDelete: "CASCADE" })
    owner!: Relation<UserEntity>;

    @OneToMany(() => DocumentEntity, (documents) => documents.workspaceId, { onDelete: "CASCADE" })
    documents!: Relation<DocumentEntity[]>;

    @OneToMany(() => TutorialEntity, (tut) => tut.workspace)
    onboardingTutorials!: Relation<TutorialEntity[]>;

    @OneToOne(() => EnvironmentEntity, (environment) => environment.workspace, {onDelete: "CASCADE"})
    environment?: Relation<EnvironmentEntity>;
    
    @OneToMany(() => EnvironmentVariableEntity,(envVar) => envVar.workspace, {onDelete: "CASCADE"})
    environmentVariables!: Relation<EnvironmentVariableEntity[]>;
}

