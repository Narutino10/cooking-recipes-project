export interface CreateRecipeDto {
    name: string;
    type: string;
    ingredients: string[];
  servings: number;
    intolerances?: string[];
    instructions: string;
  }
  