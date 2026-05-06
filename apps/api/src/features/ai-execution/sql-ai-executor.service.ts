import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { z } from 'zod';
import { BaseAiExecutorService, StreamResult } from './base-ai-executor.service';

export interface SqlEditStreamedOptions {
  query: string
  instructions: string
  dialect: string
  tableInfo: string | null
  modelId: string | null
  openaiApiKey: string | null
  onSQL: (sql: string) => void
}


@Injectable()
export class SqlAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(SqlAiExecutorService.name)

  constructor(configService: ConfigService) {
    super(configService)
  }

  // ─── Streaming ───────────────────────────────────

  async sqlEditStreamed(opts: SqlEditStreamedOptions): Promise<StreamResult> {
    const { query, instructions, dialect, tableInfo, modelId, openaiApiKey, onSQL } = opts

    const responseP = axios.post(
      `${this.baseUrl}/v1/stream/sql/edit`,
      { query, instructions, dialect, tableInfo, modelId, openaiApiKey },
      { headers: this.defaultHeaders, responseType: 'stream' },
    )

    const schema = z.object({ sql: z.string() })

    return this.buildStreamPromise(responseP, schema, (data) => onSQL(data.sql))
  }
}
