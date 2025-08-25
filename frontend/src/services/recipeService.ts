import axios from 'axios';
import { Recipe } from '../types/recipe.type';
import { CreateRecipeDto } from '../types/create-recipe-dto.type';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Configuration d'axios pour inclure le token automatiquement
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types pour les nouvelles recettes (avec notre backend)
export interface NewRecipe {
  id: string;
  name: string;
  description: string;
  instructions: string;
  ingredients: string[];
  servings: number;
  prepTime?: number;
  cookTime?: number;
  tags?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  intolerances?: string[];
  allergens?: string[];
  calories?: number;
  imageUrl?: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RecipesResponse {
  recipes: NewRecipe[];
  total: number;
}

// Services existants (Airtable)
export const getAllRecipes = async (): Promise<Recipe[]> => {
  const response = await axios.get(`${API_URL}/recipes`);
  const data = response.data;
  // Support both legacy Airtable (array) and new backend ({ recipes, total }) shapes
  if (Array.isArray(data)) return data as Recipe[];
  if (data && Array.isArray(data.recipes)) return data.recipes as Recipe[];
  // Fallback to empty array to prevent runtime errors in components
  return [];
};

export const getRecipeById = async (id: string): Promise<Recipe> => {
  const response = await axios.get(`${API_URL}/recipes/${id}`);
  return response.data;
};

export const createRecipe = async (data: CreateRecipeDto): Promise<Recipe> => {
  const response = await axios.post(`${API_URL}/recipes`, data);
  return response.data;
};

// Nouveaux services (avec authentification)
export const getNewRecipes = async (page = 1, limit = 10): Promise<RecipesResponse> => {
  const response = await api.get(`/recipes?page=${page}&limit=${limit}`);
  return response.data;
};

export const getNewRecipeById = async (id: string): Promise<NewRecipe> => {
  const response = await api.get(`/recipes/${id}`);
  return response.data;
};

export const createNewRecipe = async (data: Partial<NewRecipe>): Promise<NewRecipe> => {
  const response = await api.post('/recipes', data);
  return response.data;
};

export const createRecipeWithImage = async (formData: FormData): Promise<NewRecipe> => {
  const response = await api.post('/recipes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateRecipe = async (id: string, data: Partial<NewRecipe>): Promise<NewRecipe> => {
  const response = await api.put(`/recipes/${id}`, data);
  return response.data;
};

export const deleteRecipe = async (id: string): Promise<void> => {
  await api.delete(`/recipes/${id}`);
};

export const getUserRecipes = async (page = 1, limit = 10): Promise<RecipesResponse> => {
  const response = await api.get(`/recipes/my-recipes?page=${page}&limit=${limit}`);
  return response.data;
};

export const searchRecipesByIngredients = async (ingredients: string[], page = 1, limit = 10): Promise<RecipesResponse> => {
  const response = await api.get(`/recipes?ingredients=${ingredients.join(',')}&page=${page}&limit=${limit}`);
  return response.data;
};

export const filterRecipesByIntolerances = async (intolerances: string[], page = 1, limit = 10): Promise<RecipesResponse> => {
  const response = await api.get(`/recipes?intolerances=${intolerances.join(',')}&page=${page}&limit=${limit}`);
  return response.data;
};
