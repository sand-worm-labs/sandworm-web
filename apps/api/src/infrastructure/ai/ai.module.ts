import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import aiServiceConfig from './config/ai-service.config';
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forFeature(aiServiceConfig), 
  ]
})
export class AiModule { }