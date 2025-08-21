import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { Recipes } from './recipes.entity';
import { AirtableService } from '../airtable/airtable.service';
import { MistralModule } from '../mistral/mistral.module';

@Module({
  imports: [TypeOrmModule.forFeature([Recipes]), MistralModule],
  controllers: [RecipesController],
  providers: [RecipesService, AirtableService],
  exports: [RecipesService],
})
export class RecipesModule {}
