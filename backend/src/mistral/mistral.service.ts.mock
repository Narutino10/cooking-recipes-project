import { Injectable } from '@nestjs/common';

export interface NutritionAnalysis {
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  vitamins: string[];
  minerals: string[];
  description: string;
}

export interface GenerateRecipeRequest {
  ingredients: string[];
  nbPersons: number;
  intolerances?: string[];
  dietType?: string;
  cookingTime?: number;
}

export interface GeneratedRecipe {
  name: string;
  type: string;
  ingredients: string[];
  instructions: string;
  nutritionAnalysis: NutritionAnalysis;
}

@Injectable()
export class MistralService {
  constructor() {
    console.log('MistralService initialized in mock mode');
  }

  async generateNutritionAnalysis(
    ingredients: string[],
  ): Promise<NutritionAnalysis> {
    // Simulation d'un délai d'API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return this.getMockNutritionAnalysis(ingredients);
  }

  private getMockNutritionAnalysis(ingredients: string[]): NutritionAnalysis {
    // Calculer des valeurs basées sur les ingrédients
    const baseCalories = ingredients.length * 80;
    const baseProteins = Math.floor(ingredients.length * 3.5);
    const baseCarbs = Math.floor(ingredients.length * 12);
    const baseFats = Math.floor(ingredients.length * 2.8);
    
    return {
      calories: baseCalories,
      proteins: baseProteins,
      carbohydrates: baseCarbs,
      fats: baseFats,
      vitamins: ['A', 'C', 'B6', 'B12'],
      minerals: ['Fer', 'Calcium', 'Magnésium', 'Potassium'],
      description: `Analyse nutritionnelle pour une recette avec ${ingredients.join(', ')}. Cette recette apporte ${baseCalories} calories avec un bon équilibre de macronutriments. Riche en vitamines et minéraux essentiels.`,
    };
  }

  async generateRecipe(
    request: GenerateRecipeRequest,
  ): Promise<GeneratedRecipe> {
    // Simulation d'un délai d'API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return this.getMockRecipe(request);
  }

  private getMockRecipe(request: GenerateRecipeRequest): GeneratedRecipe {
    const { ingredients, nbPersons, intolerances = [], dietType } = request;
    
    const primaryIngredient = ingredients[0] || 'légumes';
    const recipeName = this.generateRecipeName(primaryIngredient, dietType);
    const recipeIngredients = this.generateIngredientsList(ingredients, nbPersons);
    const instructions = this.generateInstructions(ingredients, nbPersons, intolerances);
    
    return {
      name: recipeName,
      type: this.getRecipeType(ingredients),
      ingredients: recipeIngredients,
      instructions,
      nutritionAnalysis: this.getMockNutritionAnalysis(ingredients),
    };
  }

  private generateRecipeName(primaryIngredient: string, dietType?: string): string {
    const adjectives = ['Délicieux', 'Savoureux', 'Parfumé', 'Traditionnel', 'Moderne'];
    const cookingMethods = ['sauté', 'grillé', 'mijoté', 'rôti', 'en sauce'];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const method = cookingMethods[Math.floor(Math.random() * cookingMethods.length)];
    
    let name = `${adjective} ${primaryIngredient} ${method}`;
    
    if (dietType) {
      name += ` (${dietType})`;
    }
    
    return name;
  }

  private generateIngredientsList(ingredients: string[], nbPersons: number): string[] {
    const result: string[] = [];
    
    ingredients.forEach((ingredient, index) => {
      const baseQuantity = (200 + index * 50) * nbPersons / 2;
      const unit = this.getUnit(ingredient);
      result.push(`${ingredient} - ${Math.round(baseQuantity)}${unit}`);
    });
    
    // Ajouter des ingrédients de base
    result.push(`Huile d'olive - ${Math.ceil(nbPersons)}c cuillères à soupe`);
    result.push('Sel et poivre - selon le goût');
    
    if (Math.random() > 0.5) {
      result.push('Ail - 2 gousses');
    }
    
    if (Math.random() > 0.5) {
      result.push('Herbes de Provence - 1 cuillère à café');
    }
    
    return result;
  }

  private getUnit(ingredient: string): string {
    const lowerIngredient = ingredient.toLowerCase();
    
    if (lowerIngredient.includes('huile') || lowerIngredient.includes('vinaigre')) {
      return 'ml';
    }
    if (lowerIngredient.includes('farine') || lowerIngredient.includes('sucre')) {
      return 'g';
    }
    if (lowerIngredient.includes('œuf') || lowerIngredient.includes('oeuf')) {
      return ' unité(s)';
    }
    
    return 'g';
  }

  private generateInstructions(ingredients: string[], nbPersons: number, intolerances: string[]): string {
    const steps: string[] = [];
    
    steps.push('1. Préparer tous les ingrédients en les lavant et les découpant selon les besoins');
    steps.push('2. Faire chauffer l\'huile d\'olive dans une grande poêle ou casserole');
    
    if (ingredients.some(ing => ing.toLowerCase().includes('ail'))) {
      steps.push('3. Faire revenir l\'ail émincé pendant 1 minute');
    }
    
    steps.push(`${steps.length + 1}. Ajouter les ingrédients principaux et cuire pendant 10-15 minutes`);
    
    if (intolerances.length === 0) {
      steps.push(`${steps.length + 1}. Assaisonner avec sel, poivre et herbes selon le goût`);
    } else {
      steps.push(`${steps.length + 1}. Assaisonner en évitant: ${intolerances.join(', ')}`);
    }
    
    steps.push(`${steps.length + 1}. Laisser mijoter quelques minutes pour que les saveurs se mélangent`);
    steps.push(`${steps.length + 1}. Servir chaud pour ${nbPersons} personne(s)`);
    
    return steps.join('\n');
  }

  private getRecipeType(ingredients: string[]): string {
    const lowerIngredients = ingredients.map(ing => ing.toLowerCase());
    
    if (lowerIngredients.some(ing => ing.includes('chocolat') || ing.includes('sucre') || ing.includes('farine'))) {
      return 'Dessert';
    }
    
    if (lowerIngredients.some(ing => ing.includes('salade') || ing.includes('tomate'))) {
      return 'Entrée';
    }
    
    if (lowerIngredients.some(ing => ing.includes('viande') || ing.includes('poisson') || ing.includes('poulet'))) {
      return 'Plat principal';
    }
    
    return 'Plat principal';
  }

  async improveRecipe(
    recipeName: string,
    currentIngredients: string[],
    improvements: string,
  ): Promise<string> {
    // Simulation d'un délai d'API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const suggestions: string[] = [];
    
    suggestions.push(`🔧 Améliorations pour "${recipeName}"`);
    suggestions.push('');
    suggestions.push(`📝 Demande: ${improvements}`);
    suggestions.push('');
    suggestions.push('💡 Suggestions:');
    
    // Suggestions basées sur les ingrédients actuels
    if (currentIngredients.some(ing => ing.toLowerCase().includes('tomate'))) {
      suggestions.push('• Ajouter du basilic frais pour rehausser les saveurs');
    }
    
    if (currentIngredients.some(ing => ing.toLowerCase().includes('viande'))) {
      suggestions.push('• Mariner la viande 30min avant cuisson pour plus de tendreté');
    }
    
    suggestions.push('• Ajuster les temps de cuisson selon la texture désirée');
    suggestions.push('• Goûter et ajuster l\'assaisonnement en cours de cuisson');
    
    // Suggestions basées sur la demande d'amélioration
    if (improvements.toLowerCase().includes('épic')) {
      suggestions.push('• Ajouter du piment d\'Espelette ou du paprika fumé');
      suggestions.push('• Incorporer des épices comme le cumin ou la coriandre');
    }
    
    if (improvements.toLowerCase().includes('onctueux') || improvements.toLowerCase().includes('crémeux')) {
      suggestions.push('• Ajouter une touche de crème fraîche en fin de cuisson');
      suggestions.push('• Incorporer un peu de beurre pour la brillance');
    }
    
    suggestions.push('');
    suggestions.push('👨‍🍳 Conseil du chef: La clé d\'une bonne recette est l\'équilibre des saveurs et la qualité des ingrédients!');
    
    return suggestions.join('\n');
  }
}
