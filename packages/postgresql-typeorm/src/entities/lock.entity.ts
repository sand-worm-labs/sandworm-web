import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm'
import { AbstractEntity } from './abstract.entity'

@Entity('lock')
export class LockEntity extends AbstractEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Index({ unique: true })
    @Column()
    name!: string

    @CreateDateColumn({ name: 'acquired_at' })
    acquiredAt!: Date

    @Column({ name: 'expires_at', type: 'timestamptz' })
    expiresAt!: Date

    @Column({ name: 'is_locked', default: false })
    isLocked!: boolean

    @Column({ name: 'owner_id', type: 'uuid' })
    ownerId!: string

    @Column({ type: 'bigint', default: 0 })
    clock!: string
}
