import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { z } from 'zod'

import { BaseAiExecutorService, StreamResult } from './base-ai-executor.service'

// =====================================================
// ⬢ TYPES
// =====================================================

export interface PythonEditOptions {
  source: string
  instructions: string
}

export interface PythonEditResponse {
  source: string
}

export interface PythonEditStreamedOptions {
  source: string
  instructions: string
  dataFrames: Array<{ name: string; columns: Array<{ name: string }> }>
  modelId: string | null
  openaiApiKey: string | null
  onSource: (source: string) => void
}

// =====================================================
// ⬢ SERVICE
// =====================================================

@Injectable()
export class PythonAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(PythonAiExecutorService.name)

  constructor(configService: ConfigService) {
    super(configService)
  }

  // ─── Non-streaming ───────────────────────────────

  async pythonEdit(opts: PythonEditOptions): Promise<PythonEditResponse> {
    const { source, instructions } = opts
    const allowedLibraries = this.getAllowedLibraries()

    const res = await fetch(`${this.baseUrl}/v1/python/edit`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify({ source, instructions, allowedLibraries }),
    })

    return res.json() as Promise<PythonEditResponse>
  }

  // ─── Streaming ───────────────────────────────────

  async pythonEditStreamed(opts: PythonEditStreamedOptions): Promise<StreamResult> {
    const { source, instructions, dataFrames, modelId, openaiApiKey, onSource } = opts

    const allowedLibraries = this.getAllowedLibraries()
    const variables = this.dataframesToPython(dataFrames)

    const responseP = axios.post(
      `${this.baseUrl}/v1/stream/python/edit`,
      { source, instructions, allowedLibraries, variables, modelId, openaiApiKey },
      { headers: this.defaultHeaders, responseType: 'stream' },
    )

    const schema = z.object({ source: z.string() })

    return this.buildStreamPromise(responseP, schema, (data) => onSource(data.source))
  }

  // ─── Utils ───────────────────────────────────────

  private getAllowedLibraries(): string[] {
    const raw = this.configService.get<string>('ai.pythonAllowedLibraries') ?? ''
    return raw.split(',').map((s) => s.trim()).filter(Boolean)
  }

  private dataframesToPython(
    dataframes: Array<{ name: string; columns: Array<{ name: string }> }>,
  ): string {
    return dataframes
      .map(({ name, columns }) => {
        const cols = columns.map((c) => `'${c.name}'`).join(', ')
        return `${name} = pd.DataFrame(columns=[${cols}])`
      })
      .join('\n')
  }
}
