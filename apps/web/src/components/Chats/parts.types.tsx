// =====================================
// ⬢ Part Payload Types
// =====================================

export interface ThinkingPart {
  type: "thinking";
  thinking: string;
  duration_ms: number;
  contextUsed?: Array<{
    blockId: string;
    blockTitle: string;
    blockType: string;
  }>;
}

export interface ToolCallPart {
  type: "tool_call";
  toolName: string;
  category?: string;
  params?: Record<string, string>;
}

export interface ToolResultPart {
  type: "tool_result";
  summary: string;
  rowCount?: number;
  hasError?: boolean;
}

export interface BlockActionPart {
  type: "block_action";
  action: "generating" | "created" | "edited" | "ran" | "deleted";
  status?: "completed" | "rejected";
  blockType: string;
  blockTitle: string;
  blockId: string;
  previewResult?: {
    rowCount: number;
    hasError: boolean;
    errorMsg?: string;
  };
}

export interface PendingBlock {
  blockId: string;
  blockType: string;
  blockTitle: string;
  action: "created" | "edited";
}

export interface PendingReviewPart {
  type: "pending_review";
  blocks: PendingBlock[];
}

export interface FollowUpQuestion {
  id: string;
  text: string;
  input_type: "radio" | "text";
  // An option with free_text is an escape hatch ("Something else — I'll
  // describe it") — picking it prompts the user to type their own answer
  // instead of accepting the option's value verbatim.
  options?: Array<{ value: string; label: string; free_text?: boolean }>;
  placeholder?: string;
  required?: boolean;
}

export interface FollowUpPart {
  type: "follow_up";
  message: string;
  questions: FollowUpQuestion[];
}

export interface ErrorPart {
  type: "error";
  message: string;
  retryable?: boolean;
}

export type PartPayload =
  | ThinkingPart
  | ToolCallPart
  | ToolResultPart
  | BlockActionPart
  | PendingReviewPart
  | FollowUpPart
  | ErrorPart;
