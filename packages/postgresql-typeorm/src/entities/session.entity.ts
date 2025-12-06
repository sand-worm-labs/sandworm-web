import { generateSessionHash } from '@sandworm/nest-common';
import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'sessions' })
export class SessionEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @ManyToOne(() => UserEntity, { eager: true })
  @Index()
  user: UserEntity;

  @Column()
  hash: string;

  @BeforeInsert()
  hashSession() {
    if (!this.hash) {
      let { session, hash } = generateSessionHash();
      this.hash = hash;
    }
  }

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
