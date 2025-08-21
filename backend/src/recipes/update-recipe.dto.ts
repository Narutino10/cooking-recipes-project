import {
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
  IsEnum,
} from 'class-validator';

export class UpdateRecipeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsArray()
  ingredients?: string[];

  @IsOptional()
  @IsNumber()
  servings?: number;

  @IsOptional()
  @IsNumber()
  prepTime?: number;

  @IsOptional()
  @IsNumber()
  cookTime?: number;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: 'easy' | 'medium' | 'hard';

  @IsOptional()
  @IsArray()
  intolerances?: string[];

  @IsOptional()
  @IsArray()
  allergens?: string[];

  @IsOptional()
  @IsNumber()
  calories?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
