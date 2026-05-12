export enum MessageRole {
  USER      = 'user',
  ASSISTANT = 'assistant',
  SYSTEM    = 'system',
  TOOL      = 'tool',
}

export enum MessageContentType {
  TEXT        = 'text',
  TOOL_CALL   = 'tool_call',
  TOOL_RESULT = 'tool_result',
  IMAGE_URL   = 'image_url',
  IMAGE_DATA  = 'image_data',
  REASONING   = 'reasoning',
  REFUSAL     = 'refusal',
  DOCUMENT    = 'document',
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

export interface ReasoningPart extends BaseContentPart {
  type: MessageContentType.REASONING;
  thinking: string;
}

export interface RefusalPart extends BaseContentPart {
  type: MessageContentType.REFUSAL;
  refusal: string;
}

export interface ImageUrlPart extends BaseContentPart {
  type: MessageContentType.IMAGE_URL;
  image_url: {
    url: string;
    detail?: 'auto' | 'low' | 'high';
  };
}

export interface ImageDataPart extends BaseContentPart {
  type: MessageContentType.IMAGE_DATA;
  b64_json: string;
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp';
  revisedPrompt?: string;
  width?: number;
  height?: number;
}

export interface ToolCallPart extends BaseContentPart {
  type: MessageContentType.TOOL_CALL;
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolResultPart extends BaseContentPart {
  type: MessageContentType.TOOL_RESULT;
  tool_call_id: string;
  content: string | MessageContentPart[];
}

export interface DocumentPart extends BaseContentPart {
  type: MessageContentType.DOCUMENT;
  source: {
    type: 'base64' | 'url';
    media_type: 'application/pdf';
    data?: string;
    url?: string;
  };
}

export type MessageContentPart =
  | TextPart
  | ReasoningPart
  | RefusalPart
  | ImageUrlPart
  | ImageDataPart
  | ToolCallPart
  | ToolResultPart
  | DocumentPart;


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