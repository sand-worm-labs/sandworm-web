import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

// Sign-up is closed: a new account needs a code with uses left.
@Entity('referral_code')
export class ReferralCodeEntity {
  @PrimaryColumn()
  code!: string;

  @Column({ name: 'max_uses', type: 'int', default: 1 })
  maxUses!: number;

  @Column({ type: 'int', default: 0 })
  uses!: number;

  @Column({ type: 'varchar', nullable: true })
  note?: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

// Who signed up with which code.
@Entity('referral_code_use')
export class ReferralCodeUseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  code!: string;

  @Index({ unique: true })
  @Column('uuid', { name: 'user_id' })
  userId!: string;

  @CreateDateColumn({ name: 'used_at', type: 'timestamptz' })
  usedAt!: Date;
}
