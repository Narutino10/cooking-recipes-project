import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { AirtableService } from '../airtable/airtable.service';
import { Recipe } from '../interfaces/recipe.interface';
import { CreateRecipeDto } from './create-recipe.dto';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly airtableService: AirtableService) {}

  @Get()
  async getAll(
    @Query('name') name?: string,
    @Query('type') type?: string,
    @Query('ingredient') ingredient?: string,
  ): Promise<Recipe[]> {
    return this.airtableService.searchRecipes({ name, type, ingredient });
  }

  @Post()
  async create(@Body() createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    return await this.airtableService.createRecipe(createRecipeDto);
  }
}
