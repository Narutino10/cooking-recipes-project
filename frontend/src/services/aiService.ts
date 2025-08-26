import axios from 'axios';
import { GenerateRecipeRequest, GeneratedRecipe, NutritionAnalysis } from '../types/ai.type';

// Use the same backend base as other services (configurable via env)
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const API_URL = `${API_BASE}/ai`;

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
