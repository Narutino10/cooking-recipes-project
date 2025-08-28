import axios from 'axios';
import { GenerateRecipeRequest, GeneratedRecipe, NutritionAnalysis } from '../types/ai.type';

// Use the same backend base as other services (configurable via env)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_URL = `${API_BASE}/ai`;

// Configuration for external AI APIs
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const STABILITY_API_KEY = import.meta.env.VITE_STABILITY_API_KEY;

// Interface for image generation request
export interface GenerateImageRequest {
  prompt: string;
  style?: string;
  aspectRatio?: string;
}

// Interface for image generation response
export interface GeneratedImage {
  imageUrl: string;
  prompt: string;
}

// Interface for recipe generation with image
export interface GenerateRecipeWithImageRequest extends GenerateRecipeRequest {
  generateImage?: boolean;
  imageStyle?: string;
}

// Simple translation function for French cooking terms
const translateToEnglish = (text: string): string => {
  const translations: Record<string, string> = {
    'Délicieux': 'Delicious',
    'Savoureux': 'Tasty',
    'Parfumé': 'Fragrant',
    'Traditionnel': 'Traditional',
    'Moderne': 'Modern',
    'sauté': 'sautéed',
    'grillé': 'grilled',
    'mijoté': 'simmered',
    'rôti': 'roasted',
    'en sauce': 'in sauce',
    'légumes': 'vegetables',
    'viande': 'meat',
    'poisson': 'fish',
    'poulet': 'chicken',
    'riz': 'rice',
    'pâtes': 'pasta',
    'salade': 'salad',
    'soupe': 'soup',
    'dessert': 'dessert',
    'fromage': 'cheese',
    'œuf': 'egg',
    'oeuf': 'egg',
    'pain': 'bread',
    'huile': 'oil',
    'beurre': 'butter',
    'sel': 'salt',
    'poivre': 'pepper',
    'ail': 'garlic',
    'oignon': 'onion',
    'tomate': 'tomato',
    'carotte': 'carrot',
    'pomme': 'apple',
    'banane': 'banana',
    'gourmet': 'gourmet',
    'végétarien': 'vegetarian',
    'végétalien': 'vegan',
    'méditerranéen': 'mediterranean',
    // Additional nutrition terms
    'Analyse nutritionnelle': 'Nutritional analysis',
    'pour une recette avec': 'for a recipe with',
    'Cette recette apporte': 'This recipe provides',
    'calories': 'calories',
    'avec un bon équilibre': 'with a good balance',
    'de macronutriments': 'of macronutrients',
    'Riche en vitamines': 'Rich in vitamins',
    'et minéraux essentiels': 'and essential minerals',
    'Protéines': 'Proteins',
    'Glucides': 'Carbohydrates',
    'Lipides': 'Fats',
    'Vitamines': 'Vitamins',
    'Minéraux': 'Minerals',
    'Description': 'Description'
  };

  let translated = text;
  for (const [french, english] of Object.entries(translations)) {
    translated = translated.replace(new RegExp(french, 'gi'), english);
  }

  return translated;
};

export const generateRecipe = async (data: GenerateRecipeRequest): Promise<GeneratedRecipe> => {
  const response = await axios.post(`${API_URL}/generate-recipe`, data);
  return response.data;
};

export const analyzeNutrition = async (ingredients: string[]): Promise<NutritionAnalysis> => {
  const response = await axios.post(`${API_URL}/analyze-nutrition`, { ingredients });
  return response.data;
};

export const improveRecipe = async (
  recipeName: string,
  currentIngredients: string[],
  improvements: string
): Promise<{ suggestions: string }> => {
  const response = await axios.post(`${API_URL}/improve-recipe`, {
    recipeName,
    currentIngredients,
    improvements,
  });
  return response.data;
};

// New functions using backend proxy for AI APIs
export const generateRecipeWithMistral = async (data: GenerateRecipeRequest): Promise<string> => {
  try {
    // Extract only the fields needed for the DTO
    const { ingredients, nbPersons, intolerances, dietType, cookingTime } = data;
    
    const payload = {
      ingredients,
      nbPersons,
      intolerances,
      dietType,
      cookingTime,
    };
    
    // Test endpoint first
    console.log('Sending data to test endpoint:', payload);
    const testResponse = await axios.post(`${API_URL}/test`, payload);
    console.log('Test response:', testResponse.data);
    
    const response = await axios.post(`${API_URL}/generate-recipe-text`, payload);
    return response.data.recipeText;
  } catch (error) {
    console.error('Erreur lors de l\'appel au backend pour Mistral:', error);
    throw new Error('Erreur lors de la génération de la recette');
  }
};

export const generateImageWithStability = async (data: GenerateImageRequest): Promise<GeneratedImage> => {
  try {
    const response = await axios.post(`${API_URL}/generate-image`, data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'appel au backend pour Stability AI:', error);
    throw new Error('Erreur lors de la génération de l\'image');
  }
};

export const generateRecipeWithImage = async (data: GenerateRecipeWithImageRequest): Promise<GeneratedRecipe & { generatedImage?: GeneratedImage }> => {
  try {
    // First generate the recipe text with Mistral via backend
    const recipeText = await generateRecipeWithMistral(data);

    // Parse the recipe text to extract components (improved parsing)
    const lines = recipeText.split('\n');
    
    // Extract recipe name - look for the first line that starts with ** and contains the recipe name
    const nameLine = lines.find(line => line.startsWith('**') && !line.includes('Type:') && !line.includes('Ingrédients:') && !line.includes('Instructions:') && !line.includes('Analyse'));
    const name = nameLine ? nameLine.replace(/\*\*/g, '').trim() : 'Recette générée';
    
    // Extract ingredients - lines that start with - and contain measurements
    const ingredients = lines.filter(line => 
      line.trim().startsWith('-') && 
      (line.includes('g') || line.includes('ml') || line.includes('cuillère') || line.includes('pincée') || line.includes('unité'))
    );
    
    // Extract instructions - lines that start with numbers or contain step keywords
    const instructions = lines.filter(line => 
      /^\d+\./.test(line.trim()) || 
      line.includes('étape') || 
      line.includes('Étape') ||
      (line.trim().length > 10 && !line.includes('**') && !line.includes('-') && !line.includes('Type:') && !line.includes('Ingrédients:') && !line.includes('Instructions:') && !line.includes('Analyse'))
    );

    // Create the recipe object
    const recipe: GeneratedRecipe = {
      name: name.replace(/^(Nom:|Titre:|Recette:)/i, '').trim(),
      type: data.dietType || 'Plat principal',
      ingredients: ingredients.length > 0 ? ingredients : ['Ingrédients à définir'],
      instructions: instructions.length > 0 ? instructions.join('\n') : recipeText,
      nutritionAnalysis: {
        calories: 0,
        proteins: 0,
        carbohydrates: 0,
        fats: 0,
        vitamins: [],
        minerals: [],
        description: 'Analyse nutritionnelle à venir'
      }
    };

    // Generate nutrition analysis using the backend
    try {
      const nutritionData = await analyzeNutrition(recipe.ingredients);
      recipe.nutritionAnalysis = nutritionData;
    } catch (nutritionError) {
      console.warn('Erreur lors de l\'analyse nutritionnelle:', nutritionError);
      // Keep the default values if nutrition analysis fails
    }

    let generatedImage: GeneratedImage | undefined;

    // Generate image if requested
    if (data.generateImage) {
      // Translate the recipe name to English for the image prompt
      const englishRecipeName = translateToEnglish(recipe.name);
      const englishDietType = data.dietType ? translateToEnglish(data.dietType) : 'gourmet';
      const imagePrompt = `A beautiful professional culinary photo of: ${englishRecipeName}, ${englishDietType} dish, elegant presentation, natural lighting, gastronomic style`;
      console.log('Original recipe name:', recipe.name);
      console.log('Translated recipe name:', englishRecipeName);
      console.log('Image prompt:', imagePrompt);
      generatedImage = await generateImageWithStability({
        prompt: imagePrompt,
        style: data.imageStyle
      });
      recipe.imageUrl = generatedImage.imageUrl;
    }

    return {
      ...recipe,
      generatedImage
    };
  } catch (error) {
    console.error('Erreur lors de la génération de recette avec image:', error);
    throw error;
  }
};
