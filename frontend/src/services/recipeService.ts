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
  try {
    const response = await api.get('/recipes');
    const data = response.data;
  // Support both legacy Airtable (array) and new backend ({ recipes, total }) shapes
  const normalize = (raw: any): Recipe => {
    if (raw && raw.fields) return raw as Recipe;
    // backend shape -> { id, name, ingredients, servings, instructions, imageUrl, intolerances, nutrition }
    const fields: any = {
      Nom: raw.name ?? raw.title ?? '',
      'Type de plat': raw.type ?? '',
      Ingrédients: Array.isArray(raw.ingredients) ? raw.ingredients : (raw.ingredients ? String(raw.ingredients).split(',').map((s: string) => s.trim()) : []),
      'Nombre de personnes': raw.servings ?? raw.nbPersons ?? 1,
      Instructions:
        raw.instructions ?? raw.Instructions ?? raw.description ?? raw.desc ?? raw.text ?? raw.steps ?? '',
      Intolérances: raw.intolerances ?? raw.intolerance ?? [],
      'Analyse nutritionnelle': raw.nutrition ?? raw['Analyse nutritionnelle'] ?? [],
    };
    // image handling: keep Airtable-like Image array if possible
    if (raw.imageUrl) {
      const img = String(raw.imageUrl);
      fields.Image = img.startsWith('/') ? `${API_URL}${img}` : img;
    } else if (raw.image) {
      // could be array or string
      if (Array.isArray(raw.image)) {
        // normalize array urls
        fields.Image = raw.image.map((it: any) => {
          const u = (it && it.url) ? it.url : String(it);
          return typeof u === 'string' && u.startsWith('/') ? `${API_URL}${u}` : u;
        });
      } else {
        const img = String(raw.image);
        fields.Image = img.startsWith('/') ? `${API_URL}${img}` : img;
      }
    }
    return { id: raw.id ?? raw._id ?? '', fields };
  };

    if (Array.isArray(data)) return data.map(normalize);
    if (data && Array.isArray(data.recipes)) return data.recipes.map(normalize);
    return [];
  } catch (err) {
    console.error('getAllRecipes error', err);
    return [];
  }
};

export const getRecipeById = async (id: string): Promise<Recipe | null> => {
  try {
    const response = await api.get(`/recipes/${id}`);
    const raw = response.data;
    if (raw && raw.fields) return raw as Recipe;
  const fields: any = {
    Nom: raw.name ?? raw.title ?? '',
    'Type de plat': raw.type ?? '',
    Ingrédients: Array.isArray(raw.ingredients) ? raw.ingredients : (raw.ingredients ? String(raw.ingredients).split(',').map((s: string) => s.trim()) : []),
    'Nombre de personnes': raw.servings ?? raw.nbPersons ?? 1,
  Instructions: raw.instructions ?? raw.Instructions ?? raw.description ?? raw.desc ?? raw.text ?? raw.steps ?? '',
    Intolérances: raw.intolerances ?? raw.intolerance ?? [],
    'Analyse nutritionnelle': raw.nutrition ?? raw['Analyse nutritionnelle'] ?? [],
  };
  if (raw.imageUrl) fields.Image = raw.imageUrl;
  else if (raw.image) fields.Image = raw.image;
  // ensure relative urls are prefixed with API_URL
  if (fields.Image) {
    if (typeof fields.Image === 'string' && fields.Image.startsWith('/')) {
      fields.Image = `${API_URL}${fields.Image}`;
    }
    if (Array.isArray(fields.Image)) {
      fields.Image = fields.Image.map((it: any) => {
        const u = (it && it.url) ? it.url : it;
        return (typeof u === 'string' && u.startsWith('/')) ? `${API_URL}${u}` : u;
      });
    }
  }
    return { id: raw.id ?? raw._id ?? id, fields };
  } catch (err) {
    console.error('getRecipeById error', err);
    return null;
  }
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
