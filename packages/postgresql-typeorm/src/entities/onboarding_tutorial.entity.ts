import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Unique,
    type Relation,
} from "typeorm";
import { OnboardingStep } from "./enums";
import { UserEntity } from "./user.entity";
import { AbstractEntity } from "./abstract.entity";
import { WorkspaceEntity } from "./workspace.entity";

@Entity("onboarding_tutorials")
@Unique("user_workspace_unique", ["userId", "workspaceId"])
export class OnboardingTutorialEntity extends AbstractEntity {
    @PrimaryGeneratedColumn("uuid", { primaryKeyConstraintName: "PK_onboarding_tutorial_id" })
    id!: string;

    @Column()
    userId!: string;

    @ManyToOne(() => UserEntity, (user) => user.onboardingTutorials, { onDelete: "CASCADE" })
    user!: Relation<UserEntity>;

    @Column()
    workspaceId!: string;

    @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.onboardingTutorials, { onDelete: "CASCADE" })
    workspace!: Relation<WorkspaceEntity>;

    @Column({ type: "enum", enum: OnboardingStep, default: OnboardingStep.RUN_QUERY })
    currentStep!: OnboardingStep;

    @Column({ default: false })
    isComplete!: boolean;

    @Column({ default: false })
    isDismissed!: boolean;
}