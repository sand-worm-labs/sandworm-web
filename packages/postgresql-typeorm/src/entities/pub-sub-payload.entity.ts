import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "./abstract.entity";

@Entity("pub_sub_payload")
export class PubSubPayloadEntity extends AbstractEntity {
    @PrimaryGeneratedColumn("uuid", { name: "id" })
    id!: string;

    @Column({ type: "bytea", nullable: false })
    payload!: Buffer;
}