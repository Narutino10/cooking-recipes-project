import { Controller, Post, Body } from '@nestjs/common';
import {
  MistralService,
  GeneratedRecipe,
  NutritionAnalysis,
} from '../mistral/mistral.service';

export class GenerateRecipeDto {
  ingredients: string[];
  nbPersons: number;
  intolerances?: string[];
  dietType?: string;
  cookingTime?: number;
}

export class AnalyzeNutritionDto {
  ingredients: string[];
}

export class ImproveRecipeDto {
  recipeName: string;
  currentIngredients: string[];
  improvements: string;
}

@Controller('ai')
export class AiController {
  constructor(private readonly mistralService: MistralService) {}

  @Post('generate-recipe')
  async generateRecipe(@Body() generateRecipeDto: GenerateRecipeDto): Promise<GeneratedRecipe> {
    return await this.mistralService.generateRecipe(generateRecipeDto);
  }

  @Post('analyze-nutrition')
  async analyzeNutrition(@Body() analyzeNutritionDto: AnalyzeNutritionDto): Promise<NutritionAnalysis> {
    return await this.mistralService.generateNutritionAnalysis(analyzeNutritionDto.ingredients);
  }

  @Post('improve-recipe')
  async improveRecipe(@Body() improveRecipeDto: ImproveRecipeDto): Promise<{ suggestions: string }> {
    const suggestions = await this.mistralService.improveRecipe(
      improveRecipeDto.recipeName,
      improveRecipeDto.currentIngredients,
      improveRecipeDto.improvements,
    );
    return { suggestions };
  }
}
