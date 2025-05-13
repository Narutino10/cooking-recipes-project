import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AirtableService } from './airtable/airtable.service';
import { RecipesController } from './recipes/recipes.controller';
import { RecipesModule } from './recipes/recipes.module';
import { AirtableModule } from './airtable/airtable.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { NutritionService } from './nutrition/nutrition.service';

@Module({
  imports: [RecipesModule, AirtableModule, IngredientsModule],
  controllers: [AppController, RecipesController],
  providers: [AppService, AirtableService, NutritionService],
})
export class AppModule {}
