import { Module } from '@nestjs/common';
import { RecipesController } from './recipes.controller';
import { AirtableService } from '../airtable/airtable.service';
import { MistralModule } from '../mistral/mistral.module';

@Module({
  imports: [MistralModule],
  controllers: [RecipesController],
  providers: [AirtableService],
})
export class RecipesModule {}
