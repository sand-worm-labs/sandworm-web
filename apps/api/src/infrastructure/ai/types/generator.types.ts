export interface GeneratorContext {
  user_id: string;
  workspace_id: string;
  document_id: string;
  chat_id?: string;
}

export interface BaseEditRequest {
  prompt: string;
  openrouter_api_key: string;
  model: string;
  context: GeneratorContext;
}

export interface BaseFixRequest {
  error_message: string;
  openrouter_api_key: string;
  model: string;
  context: GeneratorContext;
}
