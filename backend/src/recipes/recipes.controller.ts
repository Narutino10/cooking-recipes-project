import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './create-recipe.dto';
import { UpdateRecipeDto } from './update-recipe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('ingredients') ingredients?: string,
    @Query('intolerances') intolerances?: string,
  ) {
    const pageNum = page || 1;
    const limitNum = limit || 10;

    if (ingredients) {
      const ingredientsList = ingredients.split(',');
      return this.recipesService.searchByIngredients(
        ingredientsList,
        pageNum,
        limitNum,
      );
    }

    if (intolerances) {
      const intolerancesList = intolerances.split(',');
      return this.recipesService.filterByIntolerances(
        intolerancesList,
        pageNum,
        limitNum,
      );
    }

    return this.recipesService.findAll(pageNum, limitNum);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createRecipeDto: CreateRecipeDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.recipesService.create(createRecipeDto, req.user.id);
  }

  @Get('my-recipes')
  @UseGuards(JwtAuthGuard)
  async getMyRecipes(
    @Request() req: { user: { id: string } },
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const pageNum = page || 1;
    const limitNum = limit || 10;
    return this.recipesService.findByAuthor(req.user.id, pageNum, limitNum);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.recipesService.update(id, updateRecipeDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    await this.recipesService.remove(id, req.user.id);
    return { message: 'Recipe deleted successfully' };
  }
}
