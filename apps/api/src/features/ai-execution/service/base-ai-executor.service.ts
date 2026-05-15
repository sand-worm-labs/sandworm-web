import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CanceledError } from 'axios'
import split2 from 'split2'
import { z } from 'zod'

export interface StreamResult {
  promise: Promise<void>
  abortController: AbortController
}

@Injectable()
export abstract class BaseAiExecutorService {
  protected abstract readonly logger: Logger

  constructor(protected readonly configService: ConfigService) {}


  protected get baseUrl(): string {
    return this.configService.getOrThrow<string>('ai.apiUrl')
  }

  protected get defaultHeaders() {
    const username = this.configService.getOrThrow<string>('ai.apiUsername')
    const password = this.configService.getOrThrow<string>('ai.apiPassword')
    const token = Buffer.from(`${username}:${password}`).toString('base64')
    return {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    }
  }

  // ─── Stream Builder ──────────────────────────────

  protected buildStreamPromise<T>(
    responseP: Promise<any>,
    schema: z.ZodSchema<T>,
    onChunk: (data: T) => void,
  ): StreamResult {
    const abortController = new AbortController()

    const promise = new Promise<void>(async (resolve, reject) => {
      try {
        const response = await responseP

        let success = false
        let lastError: Error | null = null

        response.data
          .pipe(split2(JSON.parse))
          .on('data', (obj: unknown) => {
            const parsed = schema.safeParse(obj)
            if (parsed.success) {
              onChunk(parsed.data)
              success = true
            } else {
              lastError = parsed.error
            }
          })
          .on('error', reject)
          .on('finish', () => {
            if (!success) {
              reject(lastError ?? new Error('Stream ended with no valid data'))
            } else {
              resolve()
            }
          })
      } catch (e) {
        if (e instanceof CanceledError) {
          resolve()
          return
        }
        reject(e)
      }
    })

    return { promise, abortController }
  }
}
