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
  @IsIn(['thinking', 'block', 'text'])
  kind: 'thinking' | 'block' | 'text';

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

// What the user asked the agent, saved as their message in the chat.
export class McpPromptDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  text: string;

  // It arrived with the closing reply, after the work it asked for.
  @ApiProperty()
  @IsBoolean()
  afterWork: boolean;
}

// What the MCP client calls itself (clientInfo from its `initialize`).
export class McpClientDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  version?: string;
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

  @ApiPropertyOptional({ type: McpPromptDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => McpPromptDto)
  prompt?: McpPromptDto;

  @ApiPropertyOptional({ type: McpClientDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => McpClientDto)
  client?: McpClientDto;
}
