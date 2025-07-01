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

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

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
  @ArrayMaxSize(10) // Reasonable limit for intolerances
  @IsIn(['Lactose', 'Gluten'], {
    each: true,
    message: 'Invalid intolerance. Valid options are: Lactose, Gluten',
  })
  intolerances?: string[];

  @IsString()
  @IsNotEmpty()
  instructions: string;

  @IsOptional()
  @IsString()
  nutritionId?: string;
}
