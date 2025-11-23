import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Unique,
    type Relation,
} from "typeorm";
import { OnboardingTutorialStep } from "./enums";
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

    @Column()
    workspaceId!: string;

    @Column({ type: "enum", enum: OnboardingTutorialStep, default: OnboardingTutorialStep.RUN_QUERY })
    currentStep!: OnboardingTutorialStep;

    @Column({ default: false })
    isComplete!: boolean;

    @Column({ default: false })
    isDismissed!: boolean;

    @ManyToOne(() => UserEntity, (user) => user.onboardingTutorials, { onDelete: "CASCADE" })
    user!: Relation<UserEntity>;

    @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.onboardingTutorials, { onDelete: "CASCADE" })
    workspace!: Relation<WorkspaceEntity>;
}