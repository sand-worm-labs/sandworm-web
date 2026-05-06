import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { z } from 'zod'

import { BaseAiExecutorService, StreamResult } from './base-ai-executor.service'

// =====================================================
// ⬢ TYPES
// =====================================================

export type InputType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean'

export interface InputField {
  name: string
  type: InputType
  label: string
  defaultValue?: string | number | boolean | null
  options?: string[]
}

export interface InputGenerateOptions {
  prompt: string
  context: string | null
  existingFields: InputField[]
  modelId: string | null
  openaiApiKey: string | null
}

export interface InputGenerateResponse {
  fields: InputField[]
  explanation: string
}

export interface InputGenerateStreamedOptions extends InputGenerateOptions {
  onFields: (fields: InputField[]) => void
}

export interface InputEditOptions {
  fields: InputField[]
  instructions: string
  modelId: string | null
  openaiApiKey: string | null
}

export interface InputEditResponse {
  fields: InputField[]
}

// =====================================================
// ⬢ SERVICE
// =====================================================

@Injectable()
export class InputAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(InputAiExecutorService.name)

  constructor(configService: ConfigService) {
    super(configService)
  }

  // ─── Generate ────────────────────────────────────

  async generateInputs(opts: InputGenerateOptions): Promise<InputGenerateResponse> {
    const { prompt, context, existingFields, modelId, openaiApiKey } = opts

    const res = await fetch(`${this.baseUrl}/v1/input/generate`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify({ prompt, context, existingFields, modelId, openaiApiKey }),
    })

    return res.json() as Promise<InputGenerateResponse>
  }

  async generateInputsStreamed(opts: InputGenerateStreamedOptions): Promise<StreamResult> {
    const { prompt, context, existingFields, modelId, openaiApiKey, onFields } = opts

    const responseP = axios.post(
      `${this.baseUrl}/v1/stream/input/generate`,
      { prompt, context, existingFields, modelId, openaiApiKey },
      { headers: this.defaultHeaders, responseType: 'stream' },
    )

    const schema = z.object({
      fields: z.array(
        z.object({
          name: z.string(),
          type: z.enum(['text', 'number', 'date', 'select', 'multiselect', 'boolean']),
          label: z.string(),
          defaultValue: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
          options: z.array(z.string()).optional(),
        }),
      ),
    })

    return this.buildStreamPromise(responseP, schema, (data) => onFields(data.fields))
  }

  // ─── Edit ────────────────────────────────────────

  async editInputs(opts: InputEditOptions): Promise<InputEditResponse> {
    const { fields, instructions, modelId, openaiApiKey } = opts

    const res = await fetch(`${this.baseUrl}/v1/input/edit`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify({ fields, instructions, modelId, openaiApiKey }),
    })

    return res.json() as Promise<InputEditResponse>
  }
}