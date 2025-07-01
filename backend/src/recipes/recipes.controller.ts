import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
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

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Recipe> {
    return await this.airtableService.getRecipeById(id);
  }

  @Get('metadata/intolerances')
  getValidIntolerances(): string[] {
    return this.airtableService.getValidIntolerances();
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string): Promise<{ message: string }> {
    await this.airtableService.deleteRecipeById(id);
    return { message: 'Recipe deleted successfully' };
  }
}
