import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "./abstract.entity";

@Entity("socket_io_attachments")
export class SocketIoAttachmentsEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
    id!: string;

    @Column({ type: "bytea", nullable: false })
    payload!: Buffer;
}
