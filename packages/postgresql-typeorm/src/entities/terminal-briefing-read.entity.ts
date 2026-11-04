import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';
import { TerminalBriefingItemEntity } from './terminal-briefing-item.entity';
import { TerminalMemberEntity } from './terminal-member.entity';

// A member has read a briefing item. No row means unread.
@Entity('terminal_briefing_read')
@Index('IDX_terminal_briefing_read_member', ['memberId'])
export class TerminalBriefingReadEntity extends BaseEntity {
  constructor(data?: Partial<TerminalBriefingReadEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryColumn({ name: 'item_id', type: 'uuid', primaryKeyConstraintName: 'PK_terminal_briefing_read' })
  itemId!: string;

  @PrimaryColumn({ name: 'member_id', type: 'uuid', primaryKeyConstraintName: 'PK_terminal_briefing_read' })
  memberId!: string;

  @Column({ name: 'read_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  readAt!: Date;

  @ManyToOne(() => TerminalBriefingItemEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_terminal_briefing_read_item' })
  item!: Relation<TerminalBriefingItemEntity>;

  @ManyToOne(() => TerminalMemberEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_terminal_briefing_read_member' })
  member!: Relation<TerminalMemberEntity>;
}
