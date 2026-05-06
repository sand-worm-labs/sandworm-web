import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { z } from 'zod'

import { BaseAiExecutorService, StreamResult } from './base-ai-executor.service'

// =====================================================
// ⬢ TYPES
// =====================================================

export interface ToolParam {
  name: string
  value: string | number | boolean | null
}

export interface ToolExecutionOptions {
  toolId: string
  params: ToolParam[]
  context: string | null
  modelId: string | null
  openaiApiKey: string | null
}

export interface ToolExecutionResponse {
  result: string
  toolId: string
  executedAt: string
}

export interface ToolExecutionStreamedOptions extends ToolExecutionOptions {
  onResult: (result: string) => void
}

export interface ToolComposeOptions {
  prompt: string
  availableTools: string[]
  context: string | null
  modelId: string | null
  openaiApiKey: string | null
}

export interface ToolComposeResponse {
  toolId: string
  params: ToolParam[]
  explanation: string
}

// =====================================================
// ⬢ SERVICE
// =====================================================

@Injectable()
export class ToolsAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(ToolsAiExecutorService.name)

  constructor(configService: ConfigService) {
    super(configService)
  }

  // ─── Tool Execution ──────────────────────────────

  async executeTool(opts: ToolExecutionOptions): Promise<ToolExecutionResponse> {
    const { toolId, params, context, modelId, openaiApiKey } = opts

    const res = await fetch(`${this.baseUrl}/v1/tools/execute`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify({ toolId, params, context, modelId, openaiApiKey }),
    })

    return res.json() as Promise<ToolExecutionResponse>
  }

  async executeToolStreamed(opts: ToolExecutionStreamedOptions): Promise<StreamResult> {
    const { toolId, params, context, modelId, openaiApiKey, onResult } = opts

    const responseP = axios.post(
      `${this.baseUrl}/v1/stream/tools/execute`,
      { toolId, params, context, modelId, openaiApiKey },
      { headers: this.defaultHeaders, responseType: 'stream' },
    )

    const schema = z.object({ result: z.string() })

    return this.buildStreamPromise(responseP, schema, (data) => onResult(data.result))
  }

  // ─── Tool Compose (prompt → tool selection) ──────

  async composeTool(opts: ToolComposeOptions): Promise<ToolComposeResponse> {
    const { prompt, availableTools, context, modelId, openaiApiKey } = opts

    const res = await fetch(`${this.baseUrl}/v1/tools/compose`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify({ prompt, availableTools, context, modelId, openaiApiKey }),
    })

    return res.json() as Promise<ToolComposeResponse>
  }
}
