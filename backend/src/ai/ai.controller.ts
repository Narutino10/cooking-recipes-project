import { Controller, Post, Body } from '@nestjs/common';
import {
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  ArrayMaxSize,
  IsIn,
  IsNotEmpty,
  Min,
} from 'class-validator';
import {
  MistralService,
  GeneratedRecipe,
  NutritionAnalysis,
} from '../mistral/mistral.service';

export class GenerateRecipeDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ingredients: string[];

  @IsNumber()
  @Min(1)
  nbPersons: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @IsIn(['Lactose', 'Gluten', 'Nuts', 'Shellfish', 'Soy', 'Eggs', 'Peanuts'], {
    each: true,
    message:
      'Invalid intolerance. Valid options are: Lactose, Gluten, Nuts, Shellfish, Soy, Eggs, Peanuts',
  })
  intolerances?: string[];

  @IsOptional()
  @IsString()
  dietType?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  cookingTime?: number;
}

export class AnalyzeNutritionDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ingredients: string[];
}

export class ImproveRecipeDto {
  @IsString()
  @IsNotEmpty()
  recipeName: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  currentIngredients: string[];

  @IsString()
  @IsNotEmpty()
  improvements: string;
}

@Controller('ai')
export class AiController {
  constructor(private readonly mistralService: MistralService) {}

  @Post('generate-recipe')
  async generateRecipe(
    @Body() generateRecipeDto: GenerateRecipeDto,
  ): Promise<GeneratedRecipe> {
    return await this.mistralService.generateRecipe(generateRecipeDto);
  }

  @Post('analyze-nutrition')
  async analyzeNutrition(
    @Body() analyzeNutritionDto: AnalyzeNutritionDto,
  ): Promise<NutritionAnalysis> {
    return await this.mistralService.generateNutritionAnalysis(
      analyzeNutritionDto.ingredients,
    );
  }

  @Post('improve-recipe')
  async improveRecipe(
    @Body() improveRecipeDto: ImproveRecipeDto,
  ): Promise<{ suggestions: string }> {
    const suggestions = await this.mistralService.improveRecipe(
      improveRecipeDto.recipeName,
      improveRecipeDto.currentIngredients,
      improveRecipeDto.improvements,
    );
    return { suggestions };
  }
}
