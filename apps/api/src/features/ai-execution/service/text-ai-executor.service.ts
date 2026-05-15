import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { z } from 'zod';
import { BaseAiExecutorService, StreamResult } from './base-ai-executor.service';

export interface TextEditOptions {
  content: string
  instructions: string
  modelId: string | null
}

export interface TextEditResponse {
  content: string
}

export interface TextEditStreamedOptions extends TextEditOptions {
  onContent: (content: string) => void
}

@Injectable()
export class TextAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(TextAiExecutorService.name)

  constructor(configService: ConfigService) {
    super(configService)
  }

  // ─── Non-Streaming ───────────────────────────────

  async textEdit(opts: TextEditOptions): Promise<TextEditResponse> {
    const { content, instructions, modelId} = opts

    const res = await fetch(`${this.baseUrl}/v1/text/edit`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify({ content, instructions, modelId}),
    })

    return res.json() as Promise<TextEditResponse>
  }

  // ─── Streaming ───────────────────────────────────

  async textEditStreamed(opts: TextEditStreamedOptions): Promise<StreamResult> {
    const { content, instructions, modelId, onContent } = opts

    const responseP = axios.post(
      `${this.baseUrl}/v1/stream/text/edit`,
      { content, instructions, modelId },
      { headers: this.defaultHeaders, responseType: 'stream' },
    )

    const schema = z.object({ content: z.string() })

    return this.buildStreamPromise(responseP, schema, (data) => onContent(data.content))
  }
}
