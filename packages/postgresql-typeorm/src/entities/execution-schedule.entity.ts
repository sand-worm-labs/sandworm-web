import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    type Relation,
} from "typeorm";
import { AbstractEntity } from "./abstract.entity";
import { DocumentEntity } from "./document.entity";
import { ExecutionScheduleType } from "./enums";

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
    weekdays?: string; 

    @Column({ type: "text", nullable: true })
    days?: string;

    @Column({ type: "text" })
    timezone!: string;

    @Column({ name: "document_id" })
    documentId!: string;

    @Column({ type: "boolean", default: false })
    isActive!: boolean;

    @Column({ type: "timestamp", nullable: true })
    lastExecutedAt?: Date;

    @Column({ type: "timestamp", nullable: true })
    nextExecutionAt?: Date;

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
