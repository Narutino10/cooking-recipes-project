import {
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
  IsEnum,
  IsIn,
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
  @IsIn(['public', 'private'])
  visibility?: 'public' | 'private';

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
  imageUrls?: string[];
}
