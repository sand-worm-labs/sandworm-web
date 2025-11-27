import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    DeleteDateColumn,
    ManyToOne,
    Index,
  } from 'typeorm';
import { UserEntity } from './user.entity';
import { AbstractEntity } from './abstract.entity';
  
@Entity({ name: 'sessions' })
export class SessionEntity  extends AbstractEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => UserEntity, { eager: true })
    @Index()
    user: UserEntity;
  
    @Column()
    hash: string;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;
}