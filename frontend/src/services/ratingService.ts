import axios, { AxiosError } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Configuration d'axios pour inclure le token automatiquement
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Timeout de 10 secondes
});

// Intercepteur pour ajouter automatiquement le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      console.warn('Token expiré ou invalide détecté');
      // Nettoyer le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Rejeter l'erreur pour que le composant la gère
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

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

// Service pour gérer les ratings avec gestion d'erreurs améliorée
export const ratingService = {
  /**
   * Crée un nouveau rating pour une recette
   * @param ratingData - Données du rating à créer
   * @returns Promise<Rating> - Le rating créé
   * @throws Error si la création échoue
   */
  async createRating(ratingData: CreateRatingDto): Promise<Rating> {
    try {
      const response = await api.post<Rating>('/ratings', ratingData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du rating:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Erreur lors de la création du rating';
        throw new Error(message);
      }
      throw new Error('Erreur inattendue lors de la création du rating');
    }
  },

  /**
   * Met à jour un rating existant
   * @param ratingId - ID du rating à modifier
   * @param ratingData - Nouvelles données du rating
   * @returns Promise<Rating> - Le rating mis à jour
   * @throws Error si la mise à jour échoue
   */
  async updateRating(ratingId: string, ratingData: UpdateRatingDto): Promise<Rating> {
    try {
      const response = await api.put<Rating>(`/ratings/${ratingId}`, ratingData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rating:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Erreur lors de la mise à jour du rating';
        throw new Error(message);
      }
      throw new Error('Erreur inattendue lors de la mise à jour du rating');
    }
  },

  /**
   * Supprime un rating
   * @param ratingId - ID du rating à supprimer
   * @throws Error si la suppression échoue
   */
  async deleteRating(ratingId: string): Promise<void> {
    try {
      await api.delete(`/ratings/${ratingId}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du rating:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Erreur lors de la suppression du rating';
        throw new Error(message);
      }
      throw new Error('Erreur inattendue lors de la suppression du rating');
    }
  },

  /**
   * Récupère tous les ratings d'une recette
   * @param recipeId - ID de la recette
   * @returns Promise<Rating[]> - Liste des ratings
   * @throws Error si la récupération échoue
   */
  async getRecipeRatings(recipeId: string): Promise<Rating[]> {
    try {
      const response = await api.get<Rating[]>(`/ratings/recipe/${recipeId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des ratings:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Erreur lors de la récupération des ratings';
        throw new Error(message);
      }
      throw new Error('Erreur inattendue lors de la récupération des ratings');
    }
  },

  /**
   * Récupère les ratings de l'utilisateur connecté
   * @returns Promise<Rating[]> - Liste des ratings de l'utilisateur
   * @throws Error si la récupération échoue ou si l'utilisateur n'est pas authentifié
   */
  async getUserRatings(): Promise<Rating[]> {
    try {
      const response = await api.get<Rating[]>('/ratings/user');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des ratings utilisateur:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Utilisateur non authentifié');
        }
        const message = error.response?.data?.message || 'Erreur lors de la récupération des ratings utilisateur';
        throw new Error(message);
      }
      throw new Error('Erreur inattendue lors de la récupération des ratings utilisateur');
    }
  },

  /**
   * Récupère la moyenne des ratings d'une recette
   * @param recipeId - ID de la recette
   * @returns Promise<RatingStats> - Statistiques des ratings
   * @throws Error si la récupération échoue
   */
  async getRecipeAverageRating(recipeId: string): Promise<RatingStats> {
    try {
      const response = await api.get<RatingStats>(`/ratings/recipe/${recipeId}/average`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la moyenne:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Erreur lors de la récupération de la moyenne';
        throw new Error(message);
      }
      throw new Error('Erreur inattendue lors de la récupération de la moyenne');
    }
  },

  /**
   * Récupère le rating d'un utilisateur pour une recette spécifique
   * @param recipeId - ID de la recette
   * @returns Promise<Rating | null> - Le rating de l'utilisateur ou null s'il n'existe pas
   * @throws Error si la récupération échoue (sauf 404 qui retourne null)
   */
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
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Erreur lors de la récupération du rating utilisateur';
        throw new Error(message);
      }
      throw new Error('Erreur inattendue lors de la récupération du rating utilisateur');
    }
  },

  /**
   * Récupère les ratings et statistiques d'une recette en une seule requête
   * @param recipeId - ID de la recette
   * @returns Promise<RatingsResponse> - Ratings et statistiques
   * @throws Error si la récupération échoue
   */
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
