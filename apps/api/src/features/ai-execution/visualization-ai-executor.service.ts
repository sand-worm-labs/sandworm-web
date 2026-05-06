import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { z } from 'zod'

import { BaseAiExecutorService, StreamResult } from './base-ai-executor.service'

// =====================================================
// ⬢ TYPES
// =====================================================

export interface VisualizationEditStreamedOptions {
  code: string
  instructions: string
  dataFrames: Array<{ name: string; columns: Array<{ name: string }> }>
  modelId: string | null
  openaiApiKey: string | null
  onCode: (code: string) => void
}

export interface VisualizationEditOptions {
  code: string
  instructions: string
  dataFrames: Array<{ name: string; columns: Array<{ name: string }> }>
}

export interface VisualizationEditResponse {
  code: string
}

// =====================================================
// ⬢ SERVICE
// =====================================================

@Injectable()
export class VisualizationAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(VisualizationAiExecutorService.name)

  constructor(configService: ConfigService) {
    super(configService)
  }

  // ─── Non-Streaming ───────────────────────────────

  async visualizationEdit(opts: VisualizationEditOptions): Promise<VisualizationEditResponse> {
    const { code, instructions, dataFrames } = opts

    const res = await fetch(`${this.baseUrl}/v1/visualization/edit`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify({ code, instructions, dataFrames }),
    })

    return res.json() as Promise<VisualizationEditResponse>
  }

  // ─── Streaming ───────────────────────────────────

  async visualizationEditStreamed(opts: VisualizationEditStreamedOptions): Promise<StreamResult> {
    const { code, instructions, dataFrames, modelId, openaiApiKey, onCode } = opts

    const responseP = axios.post(
      `${this.baseUrl}/v1/stream/visualization/edit`,
      { code, instructions, dataFrames, modelId, openaiApiKey },
      { headers: this.defaultHeaders, responseType: 'stream' },
    )

    const schema = z.object({ code: z.string() })

    return this.buildStreamPromise(responseP, schema, (data) => onCode(data.code))
  }
}
