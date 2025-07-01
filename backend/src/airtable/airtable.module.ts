import { Module } from '@nestjs/common';
import { AirtableService } from './airtable.service';
import { MistralModule } from '../mistral/mistral.module';

@Module({
  imports: [MistralModule],
  providers: [AirtableService],
  exports: [AirtableService],
})
export class AirtableModule {}
