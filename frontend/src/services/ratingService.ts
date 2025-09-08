import axios from 'axios';

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

// Types pour les ratings
export interface Rating {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  recipeId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRatingDto {
  rating: number;
  comment?: string;
  recipeId: string;
}

export interface UpdateRatingDto {
  rating?: number;
  comment?: string;
}

export interface RatingStats {
  average: number;
  count: number;
}

export interface RatingsResponse {
  ratings: Rating[];
  stats: RatingStats;
}

// Service pour gérer les ratings
export const ratingService = {
  // Créer un nouveau rating
  async createRating(ratingData: CreateRatingDto): Promise<Rating> {
    try {
      const response = await api.post<Rating>('/ratings', ratingData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du rating:', error);
      throw error;
    }
  },

  // Mettre à jour un rating existant
  async updateRating(ratingId: string, ratingData: UpdateRatingDto): Promise<Rating> {
    try {
      const response = await api.put<Rating>(`/ratings/${ratingId}`, ratingData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rating:', error);
      throw error;
    }
  },

  // Supprimer un rating
  async deleteRating(ratingId: string): Promise<void> {
    try {
      await api.delete(`/ratings/${ratingId}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du rating:', error);
      throw error;
    }
  },

  // Récupérer tous les ratings d'une recette
  async getRecipeRatings(recipeId: string): Promise<Rating[]> {
    try {
      const response = await api.get<Rating[]>(`/ratings/recipe/${recipeId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des ratings:', error);
      throw error;
    }
  },

  // Récupérer les ratings de l'utilisateur connecté
  async getUserRatings(): Promise<Rating[]> {
    try {
      const response = await api.get<Rating[]>('/ratings/user');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des ratings utilisateur:', error);
      throw error;
    }
  },

  // Récupérer la moyenne des ratings d'une recette
  async getRecipeAverageRating(recipeId: string): Promise<RatingStats> {
    try {
      const response = await api.get<RatingStats>(`/ratings/recipe/${recipeId}/average`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la moyenne:', error);
      throw error;
    }
  },

  // Récupérer le rating d'un utilisateur pour une recette spécifique
  async getUserRatingForRecipe(recipeId: string): Promise<Rating | null> {
    try {
      const response = await api.get<Rating>(`/ratings/recipe/${recipeId}/user`);
      return response.data;
    } catch (error) {
      // Si l'utilisateur n'a pas encore noté cette recette, l'API retourne une erreur 404
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      // Si le token est expiré (401), on laisse l'erreur remonter pour que le composant la gère
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw error;
      }
      console.error('Erreur lors de la récupération du rating utilisateur:', error);
      throw error;
    }
  },

  // Récupérer les ratings et statistiques d'une recette
  async getRecipeRatingsWithStats(recipeId: string): Promise<RatingsResponse> {
    try {
      const [ratings, stats] = await Promise.all([
        this.getRecipeRatings(recipeId),
        this.getRecipeAverageRating(recipeId),
      ]);

      return {
        ratings,
        stats,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des ratings avec stats:', error);
      throw error;
    }
  },
};
