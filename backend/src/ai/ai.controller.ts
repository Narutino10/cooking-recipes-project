import { Controller, Post, Body } from '@nestjs/common';
import {
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  MistralService,
  GeneratedRecipe,
  NutritionAnalysis,
} from '../mistral/mistral.service';

export class GenerateRecipeDto {
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    // Filter out empty strings and trim whitespace
    if (Array.isArray(value)) {
      return value
        .filter((item: string) => item && item.trim())
        .map((item: string) => item.trim());
    }
    return value as string[];
  })
  ingredients: string[];

  @IsNumber()
  @Min(1)
  nbPersons: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  intolerances?: string[];

  @IsOptional()
  @IsString()
  dietType?: string;

  @IsOptional()
  @IsNumber()
  cookingTime?: number;
}

export class GenerateRecipeTextDto extends GenerateRecipeDto {}

export class GenerateImageDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @IsString()
  aspectRatio?: string;
}

export class GenerateRecipeWithImageDto extends GenerateRecipeDto {
  @IsOptional()
  @IsBoolean()
  generateImage?: boolean;

  @IsOptional()
  @IsString()
  imageStyle?: string;
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

  @Post('test')
  testEndpoint(@Body() body: any): { received: any; message: string } {
    console.log('Test endpoint received:', JSON.stringify(body, null, 2));
    return { received: body, message: 'Test successful' };
  }

  @Post('generate-recipe-text')
  async generateRecipeText(
    @Body() generateRecipeTextDto: GenerateRecipeTextDto,
  ): Promise<{ recipeText: string }> {
    try {
      console.log(
        'Received generateRecipeText request:',
        JSON.stringify(generateRecipeTextDto, null, 2),
      );

      const recipe = await this.mistralService.generateRecipeText(
        generateRecipeTextDto,
      );
      const recipeText = `**${recipe.name}**

**Type:** ${recipe.type}
**Ingrédients:**
${recipe.ingredients.map((ing) => `- ${ing}`).join('\n')}

**Instructions:**
${recipe.instructions}

**Analyse nutritionnelle:**
- Calories: ${recipe.nutritionAnalysis.calories}
- Protéines: ${recipe.nutritionAnalysis.proteins}g
- Glucides: ${recipe.nutritionAnalysis.carbohydrates}g
- Lipides: ${recipe.nutritionAnalysis.fats}g
- Vitamines: ${recipe.nutritionAnalysis.vitamins.join(', ')}
- Minéraux: ${recipe.nutritionAnalysis.minerals.join(', ')}
- Description: ${recipe.nutritionAnalysis.description}`;

      return { recipeText };
    } catch (error) {
      console.error('Error in generateRecipeText:', error);
      throw error;
    }
  }

  @Post('generate-image')
  async generateImage(
    @Body() generateImageDto: GenerateImageDto,
  ): Promise<{ imageUrl: string; prompt: string }> {
    const imageUrl = await this.mistralService.generateImageFromPrompt(
      generateImageDto.prompt,
    );
    if (!imageUrl) {
      throw new Error('Failed to generate image');
    }
    return { imageUrl, prompt: generateImageDto.prompt };
  }

  @Post('generate-recipe-with-image')
  async generateRecipeWithImage(
    @Body() generateRecipeWithImageDto: GenerateRecipeWithImageDto,
  ): Promise<
    GeneratedRecipe & { generatedImage?: { imageUrl: string; prompt: string } }
  > {
    const result = await this.mistralService.generateRecipeWithImage(
      generateRecipeWithImageDto,
    );
    return result;
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
