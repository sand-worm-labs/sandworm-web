import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    type Relation,
} from "typeorm";
import { Plan } from "./enums";
import { UserEntity } from "./user.entity";
import { AbstractEntity } from "./abstract.entity";
import { OnboardingTutorialEntity } from "./onboarding_tutorial.entity";

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

    @Column()
    ownerId!: string;

    @ManyToOne(() => UserEntity, (user) => user.workspaces, { onDelete: "CASCADE" })
    owner!: Relation<UserEntity>;

    @OneToMany(() => OnboardingTutorialEntity, (tut) => tut.workspace)
    onboardingTutorials!: Relation<OnboardingTutorialEntity[]>;
}

