import { Injectable } from '@nestjs/common'
import { Redis } from 'ioredis'
import { ISocketAdapter } from './socket-adapter.interface'

@Injectable()
export class RedisPubSubAdapter implements ISocketAdapter {
  private redis: Redis | null = null
  private subscriber: Redis | null = null

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
    this.subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
  }

  emit(event: string, data: any): void {
    if (!this.redis) throw new Error('Redis not initialized')
    this.redis.publish('app:emit', JSON.stringify({ event, data }))
  }

  on(event: string, handler: (data: any) => void): void {
    if (!this.subscriber) throw new Error('Redis subscriber not initialized')
    this.subscriber.subscribe(event, (err, count) => {
      if (err) console.error('Failed to subscribe:', err)
    })

    this.subscriber.on('message', (channel, message) => {
      if (channel === event) {
        handler(JSON.parse(message))
      }
    })
  }

  broadcast(channel: string, event: string, data: any): void {
    if (!this.redis) throw new Error('Redis not initialized')
    const key = `${channel}:${event}`
    this.redis.publish(key, JSON.stringify(data))
  }

  broadcastToRoom(room: string, event: string, data: any): void {
    if (!this.redis) throw new Error('Redis not initialized')
    this.redis.publish(`room:${room}:${event}`, JSON.stringify(data))
  }
}