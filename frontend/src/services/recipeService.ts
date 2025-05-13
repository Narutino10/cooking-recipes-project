import axios from 'axios';
import { Recipe } from '../types/recipe.type';
import { CreateRecipeDto } from '../types/create-recipe-dto.type'; // on va le créer juste après

const API_URL = 'http://localhost:3000'

export const getAllRecipes = async (): Promise<Recipe[]> => {
  const response = await axios.get(`${API_URL}/recipes`);
  return response.data;
};

export const getRecipeById = async (id: string): Promise<Recipe> => {
  const response = await axios.get(`${API_URL}/recipes/${id}`);
  return response.data;
};

export const createRecipe = async (data: CreateRecipeDto): Promise<Recipe> => {
  const response = await axios.post(`${API_URL}/recipes`, data);
  return response.data;
};

export async function searchRecipes(query: {
  name?: string;
  type?: string;
  ingredient?: string;
}) {
  const params = new URLSearchParams();
  if (query.name) params.append('name', query.name);
  if (query.type) params.append('type', query.type);
  if (query.ingredient) params.append('ingredient', query.ingredient);

  const res = await axios.get(`${API_URL}/recipes?${params.toString()}`);
  return res.data;
}

