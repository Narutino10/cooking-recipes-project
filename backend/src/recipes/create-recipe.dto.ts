export class CreateRecipeDto {
  name: string;
  type: string;
  ingredients: string[];
  nbPersons: number;
  intolerances?: string[];
  instructions: string;
  nutritionId?: string;
}
