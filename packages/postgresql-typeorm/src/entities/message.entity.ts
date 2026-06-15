import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Unique,
  type Relation,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { ChatEntity } from './chat.entity';
import { VoteEntity } from './vote.entity';

export enum MessageRole {
  USER      = 'user',
  ASSISTANT = 'assistant',
  SYSTEM    = 'system',
  TOOL      = 'tool',
}

export enum MessageContentType {
  TEXT         = 'text',
  TOOL_CALL    = 'tool_call',
  TOOL_RESULT  = 'tool_result',
  BLOCK_ACTION = 'block_action',
}

export enum FinishReason {
  STOP           = 'stop',
  TOOL_CALLS     = 'tool_calls',
  LENGTH         = 'length',
  CONTENT_FILTER = 'content_filter',
  ERROR          = 'error',
}

interface BaseContentPart {
  type: MessageContentType;
}

export interface TextPart extends BaseContentPart {
  type: MessageContentType.TEXT;
  text: string;
}

export interface ToolCallPart extends BaseContentPart {
  type: MessageContentType.TOOL_CALL;
  id: string;
  toolName: string;
  category?: string;
  params?: Record<string, string>;
}

export interface ToolResultPart extends BaseContentPart {
  type: MessageContentType.TOOL_RESULT;
  tool_call_id: string;
  summary?: string;
  rowCount?: number;
}

export interface BlockActionPart extends BaseContentPart {
  type: MessageContentType.BLOCK_ACTION;
  action: 'created' | 'edited' | 'ran' | 'deleted';
  blockType: string;
  blockTitle: string;
  blockId: string;
}

export type MessageContentPart =
  | TextPart
  | ToolCallPart
  | ToolResultPart
  | BlockActionPart;

export interface MessageUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  reasoningTokens?: number;
  cachedTokens?: number;
}

export interface MessageAttachment {
  type: 'image' | 'file';
  url: string;
  mimeType?: string;
  name?: string;
  size?: number;
}

export interface FocusedBlock {
  id: string;
  title: string;
  type: string;
}

@Entity('messages')
@Unique(['jobId', 'chat'])
export class MessageEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_message_id' })
  id!: string;

  @Column({ default: false })
  isAnswered!: boolean;

  @ManyToOne(() => ChatEntity, (chat) => chat.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat!: Relation<ChatEntity>;

  @Column({ type: 'enum', enum: MessageRole })
  role!: MessageRole;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'jsonb', nullable: true })
  parts?: MessageContentPart[];

  @Column({ nullable: true })
  model?: string;

  @Column({ type: 'enum', enum: FinishReason, nullable: true })
  finishReason?: FinishReason;

  @Column({ nullable: true })
  generationId?: string;

  @Column({ nullable: true })
  jobId?: string;

  @Column({ name: 'focused_blocks', type: 'jsonb', nullable: true })
  focusedBlocks?: FocusedBlock[];

  @Column({ type: 'jsonb', nullable: true })
  usage?: MessageUsage;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: MessageAttachment[];

  @OneToOne(() => VoteEntity, (vote) => vote.message)
  vote?: Relation<VoteEntity>;
}