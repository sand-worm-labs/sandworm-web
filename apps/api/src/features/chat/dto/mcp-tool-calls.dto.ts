import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

// How a call is shown in the chat (built by apps/mcp, tools/call-display.ts).
export class McpDisplayDto {
  @ApiProperty()
  @IsIn(['thinking', 'block', 'text', 'prompt'])
  kind: 'thinking' | 'block' | 'text' | 'prompt';

  // On a prompt: it arrived with the closing reply, after the work it asked for.
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  afterWork?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  text?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['created', 'edited', 'ran', 'deleted'])
  action?: 'created' | 'edited' | 'ran' | 'deleted';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  blockId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  blockType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  blockTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  executedAt?: string;
}

export class McpToolCallDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  toolName: string;

  @ApiProperty()
  @IsObject()
  arguments: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50_000)
  result?: string;

  @ApiProperty()
  @IsBoolean()
  isError: boolean;

  @ApiProperty()
  @IsInt()
  @Min(0)
  durationMs: number;

  @ApiProperty()
  @IsISO8601()
  at: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  requestId?: string;

  @ApiPropertyOptional({ type: [McpDisplayDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(300)
  @ValidateNested({ each: true })
  @Type(() => McpDisplayDto)
  display?: McpDisplayDto[];
}

export class RecordMcpToolCallsDto {
  @ApiProperty()
  @IsUUID()
  documentId: string;

  @ApiProperty({ type: [McpToolCallDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => McpToolCallDto)
  calls: McpToolCallDto[];

  // The MCP client, e.g. "claude-code/2.1".
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  userAgent?: string;
}
