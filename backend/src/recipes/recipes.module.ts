import { Module } from '@nestjs/common';
import { RecipesController } from './recipes.controller';
import { AirtableService } from '../airtable/airtable.service';

@Module({
  controllers: [RecipesController],
  providers: [AirtableService],
})
export class RecipesModule {}
