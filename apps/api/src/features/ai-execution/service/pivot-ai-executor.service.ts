import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { z } from 'zod'

import { BaseAiExecutorService, StreamResult } from './base-ai-executor.service'


export type AggregationFunction = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'first' | 'last'

export type SortDirection = 'asc' | 'desc'

export interface PivotColumn {
  field: string
  label: string
}

export interface PivotValue {
  field: string
  aggregation: AggregationFunction
  label: string
}

export interface PivotSort {
  field: string
  direction: SortDirection
}

export interface PivotConfig {
  rows: PivotColumn[]
  columns: PivotColumn[]
  values: PivotValue[]
  sort: PivotSort | null
  filters: Record<string, string[]>
}

export interface PivotGenerateOptions {
  prompt: string
  dataFrames: Array<{ name: string; columns: Array<{ name: string; type: string }> }>
  existingConfig: PivotConfig | null
  modelId: string | null
  openaiApiKey: string | null
}

export interface PivotGenerateResponse {
  config: PivotConfig
  explanation: string
}

export interface PivotGenerateStreamedOptions extends PivotGenerateOptions {
  onConfig: (config: PivotConfig) => void
}

export interface PivotEditOptions {
  config: PivotConfig
  instructions: string
  dataFrames: Array<{ name: string; columns: Array<{ name: string; type: string }> }>
  modelId: string | null
  openaiApiKey: string | null
}

export interface PivotEditResponse {
  config: PivotConfig
}

// =====================================================
// ⬢ SCHEMAS
// =====================================================

const pivotColumnSchema = z.object({
  field: z.string(),
  label: z.string(),
})

const pivotValueSchema = z.object({
  field: z.string(),
  aggregation: z.enum(['sum', 'avg', 'count', 'min', 'max', 'first', 'last']),
  label: z.string(),
})

const pivotConfigSchema = z.object({
  rows: z.array(pivotColumnSchema),
  columns: z.array(pivotColumnSchema),
  values: z.array(pivotValueSchema),
  sort: z.object({ field: z.string(), direction: z.enum(['asc', 'desc']) }).nullable(),
  filters: z.record(z.array(z.string())),
})

// =====================================================
// ⬢ SERVICE
// =====================================================

@Injectable()
export class PivotAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(PivotAiExecutorService.name)

  constructor(configService: ConfigService) {
    super(configService)
  }

  // ─── Generate ────────────────────────────────────

  async generatePivot(opts: PivotGenerateOptions): Promise<PivotGenerateResponse> {
    const { prompt, dataFrames, existingConfig, modelId, openaiApiKey } = opts

    const res = await fetch(`${this.baseUrl}/v1/pivot/generate`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify({ prompt, dataFrames, existingConfig, modelId, openaiApiKey }),
    })

    return res.json() as Promise<PivotGenerateResponse>
  }

  async generatePivotStreamed(opts: PivotGenerateStreamedOptions): Promise<StreamResult> {
    const { prompt, dataFrames, existingConfig, modelId, openaiApiKey, onConfig } = opts

    const responseP = axios.post(
      `${this.baseUrl}/v1/stream/pivot/generate`,
      { prompt, dataFrames, existingConfig, modelId, openaiApiKey },
      { headers: this.defaultHeaders, responseType: 'stream' },
    )

    const schema = z.object({ config: pivotConfigSchema })

    return this.buildStreamPromise(responseP, schema, (data) => onConfig(data.config))
  }

  // ─── Edit ────────────────────────────────────────

  async editPivot(opts: PivotEditOptions): Promise<PivotEditResponse> {
    const { config, instructions, dataFrames, modelId, openaiApiKey } = opts

    const res = await fetch(`${this.baseUrl}/v1/pivot/edit`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify({ config, instructions, dataFrames, modelId, openaiApiKey }),
    })

    return res.json() as Promise<PivotEditResponse>
  }
}