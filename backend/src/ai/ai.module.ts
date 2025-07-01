import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { MistralModule } from '../mistral/mistral.module';

@Module({
  imports: [MistralModule],
  controllers: [AiController],
})
export class AiModule {}
