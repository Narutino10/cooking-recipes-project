import { Recipe } from '../types/recipe.type';

/**
 * Extrait les ingrédients d'une recette en gérant les deux formats possibles
 */
export const getIngredientsFromRecipe = (recipe: Recipe): string[] => {
  // Nouveau format: "Liste ingrédients" comme texte
  if (recipe.fields["Liste ingrédients"]) {
    return recipe.fields["Liste ingrédients"].split('\n').filter(ingredient => ingredient.trim() !== '');
  }
  
  // Ancien format: "Ingrédients" comme array
  if (recipe.fields.Ingrédients && Array.isArray(recipe.fields.Ingrédients)) {
    return recipe.fields.Ingrédients;
  }
  
  return [];
};

/**
 * Extrait les intolérances d'une recette en gérant les deux formats possibles
 */
export const getIntolerancesFromRecipe = (recipe: Recipe): string[] => {
  if (!recipe.fields.Intolérances) {
    return [];
  }
  
  // Si c'est un string, on le split par virgule
  if (typeof recipe.fields.Intolérances === 'string') {
    return recipe.fields.Intolérances.split(',').map(item => item.trim()).filter(item => item !== '');
  }
  
  // Si c'est déjà un array
  if (Array.isArray(recipe.fields.Intolérances)) {
    return recipe.fields.Intolérances;
  }
  
  return [];
};

/**
 * Formate les ingrédients pour la recherche (pour la compatibilité avec l'ancien système)
 */
export const formatIngredientsForSearch = (ingredients: string[]): string => {
  return ingredients.join(', ').toLowerCase();
};
