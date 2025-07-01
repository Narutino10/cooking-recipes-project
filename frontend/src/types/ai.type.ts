export interface NutritionAnalysis {
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  vitamins: string[];
  minerals: string[];
  description: string;
}

export interface GeneratedRecipe {
  name: string;
  type: string;
  ingredients: string[];
  instructions: string;
  nutritionAnalysis: NutritionAnalysis;
}

export interface GenerateRecipeRequest {
  ingredients: string[];
  nbPersons: number;
  intolerances?: string[];
  dietType?: string;
  cookingTime?: number;
}
