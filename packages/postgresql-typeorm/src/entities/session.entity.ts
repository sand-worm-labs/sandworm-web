import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    DeleteDateColumn,
    ManyToOne,
    Index,
    BeforeInsert,
    BeforeUpdate,
  } from 'typeorm';
import { UserEntity } from './user.entity';
import { AbstractEntity } from './abstract.entity';;
import { generateSessionHash } from "@sandworm/nest-common";
  
@Entity({ name: 'sessions' })
export class SessionEntity  extends AbstractEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => UserEntity, { eager: true })
    @Index()
    user: UserEntity;
  
    
    @Column()
    hash: string;

    @BeforeInsert()
    async hashSession() {
      if (this.hash) {
        let {session,hash} = generateSessionHash();
        this.hash = hash
      }
    }

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;
}