import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Index,
    type Relation,
} from "typeorm";
import { AbstractEntity } from "./abstract.entity";
import { DocumentEntity } from "./document.entity";

// ----- Enum -----
export enum ExecutionScheduleType {
    HOURLY = "hourly",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    CRON = "cron",
}

@Entity("execution_schedule")
export class ExecutionScheduleEntity extends AbstractEntity {
    @PrimaryGeneratedColumn("uuid", { name: "id" })
    id!: string;

    @Column({ type: "enum", enum: ExecutionScheduleType })
    type!: ExecutionScheduleType;

    @Column({ type: "int", nullable: true })
    hour?: number;

    @Column({ type: "int", nullable: true })
    minute?: number;

    @Column({ type: "text", nullable: true })
    cron?: string;

    @Column({ type: "text", nullable: true })
    weekdays?: string; // serialized array of integers, e.g., "[1,3,5]"

    @Column({ type: "text", nullable: true })
    days?: string; // serialized array of integers, e.g., "[1,15,30]"

    @Column({ type: "text" })
    timezone!: string;

    // ----- Relation to Document -----
    @Column({ name: "document_id" })
    documentId!: string;

    @ManyToOne(() => DocumentEntity, (document) => document.executionSchedules, {
        onDelete: "CASCADE",
    })
    @JoinColumn({
        name: "document_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "FK_execution_schedule_document",
    })
    document!: Relation<DocumentEntity>;
}
