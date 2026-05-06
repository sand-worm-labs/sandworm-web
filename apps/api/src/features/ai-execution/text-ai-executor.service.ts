import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { z } from 'zod';
import { BaseAiExecutorService, StreamResult } from './base-ai-executor.service';


export type TextEditAction = 'improve' | 'summarize' | 'expand' | 'fix' | 'custom'

export interface TextEditOptions {
  content: string
  instructions: string
  action: TextEditAction
  modelId: string | null
  openaiApiKey: string | null
}

export interface TextEditResponse {
  content: string
}

export interface TextEditStreamedOptions extends TextEditOptions {
  onContent: (content: string) => void
}

// =====================================================
// ⬢ SERVICE
// =====================================================

@Injectable()
export class TextAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(TextAiExecutorService.name)

  constructor(configService: ConfigService) {
    super(configService)
  }

  // ─── Non-Streaming ───────────────────────────────

  async textEdit(opts: TextEditOptions): Promise<TextEditResponse> {
    const { content, instructions, action, modelId, openaiApiKey } = opts

    const res = await fetch(`${this.baseUrl}/v1/text/edit`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify({ content, instructions, action, modelId, openaiApiKey }),
    })

    return res.json() as Promise<TextEditResponse>
  }

  // ─── Streaming ───────────────────────────────────

  async textEditStreamed(opts: TextEditStreamedOptions): Promise<StreamResult> {
    const { content, instructions, action, modelId, openaiApiKey, onContent } = opts

    const responseP = axios.post(
      `${this.baseUrl}/v1/stream/text/edit`,
      { content, instructions, action, modelId, openaiApiKey },
      { headers: this.defaultHeaders, responseType: 'stream' },
    )

    const schema = z.object({ content: z.string() })

    return this.buildStreamPromise(responseP, schema, (data) => onContent(data.content))
  }
}
