import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AirtableService } from './airtable/airtable.service';
import { RecipesController } from './recipes/recipes.controller';
import { RecipesModule } from './recipes/recipes.module';
import { AirtableModule } from './airtable/airtable.module';

@Module({
  imports: [RecipesModule, AirtableModule],
  controllers: [AppController, RecipesController],
  providers: [AppService, AirtableService],
})
export class AppModule {}
