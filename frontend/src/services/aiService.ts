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
    // Test endpoint first
    console.log('Sending data to test endpoint:', data);
    const testResponse = await axios.post(`${API_URL}/test`, data);
    console.log('Test response:', testResponse.data);
    
    const response = await axios.post(`${API_URL}/generate-recipe-text`, data);
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

    // Parse the recipe text to extract components (simplified parsing)
    const lines = recipeText.split('\n');
    const name = lines.find(line => line.includes('Nom') || line.includes('recette') || line.includes('Titre')) || 'Recette générée';
    const ingredients = lines.filter(line => line.includes('-') && (line.includes('g') || line.includes('ml') || line.includes('cuillère') || line.includes('pincée')));
    const instructions = lines.filter(line => /^\d+\./.test(line.trim()) || line.includes('étape') || line.includes('Étape'));

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

    let generatedImage: GeneratedImage | undefined;

    // Generate image if requested
    if (data.generateImage) {
      const imagePrompt = `Une belle photo culinaire professionnelle de: ${recipe.name}, plat ${data.dietType || 'gourmand'}, présentation élégante, éclairage naturel, style gastronomique`;
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
