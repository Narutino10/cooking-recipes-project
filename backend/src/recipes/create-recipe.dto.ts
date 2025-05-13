import { IsArray, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecipeDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsArray()
  @Type(() => String)
  ingredients: string[];

  @IsNumber()
  @Type(() => Number)
  nbPersons: number;

  @IsArray()
  @IsOptional()
  @Type(() => String)
  intolerances?: string[];

  @IsString()
  instructions: string;

  @IsString()
  @IsOptional()
  nutritionId?: string;
}
