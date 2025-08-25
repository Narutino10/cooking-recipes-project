import { Recipe } from '../types/recipe.type';

/**
 * Extrait les ingrédients d'une recette en gérant les deux formats possibles
 */
export const getIngredientsFromRecipe = (recipe: Recipe): string[] => {
  // Nouveau format: "Liste ingrédients" comme texte
  const liste = recipe.fields?.['Liste ingrédients'];
  if (typeof liste === 'string' && liste.trim() !== '') {
    return liste.split('\n').map(s => s.trim()).filter(ingredient => ingredient !== '');
  }

  // Ancien format: "Ingrédients" comme array
  const ingr = recipe.fields?.Ingrédients;
  if (Array.isArray(ingr)) {
    return ingr.map(String).map(s => s.trim()).filter(s => s !== '');
  }
  
  return [];
};

/**
 * Extrait les intolérances d'une recette en gérant les deux formats possibles
 */
export const getIntolerancesFromRecipe = (recipe: Recipe): string[] => {
  const maybe = recipe.fields?.['Intolérances'];
  if (!maybe) return [];

  if (typeof maybe === 'string') {
    return maybe.split(',').map(item => item.trim()).filter(item => item !== '');
  }

  if (Array.isArray(maybe)) {
    return maybe.map(String).map(s => s.trim()).filter(s => s !== '');
  }

  return [];
};

/**
 * Formate les ingrédients pour la recherche (pour la compatibilité avec l'ancien système)
 */
export const formatIngredientsForSearch = (ingredients: string[]): string => {
  return ingredients.join(', ').toLowerCase();
};
