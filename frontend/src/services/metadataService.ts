import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface RecipeMetadata {
  intolerances: string[];
}

export const metadataService = {
  /**
   * Récupère les options d'intolérances valides depuis le backend
   */
  async getValidIntolerances(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/recipes/metadata/intolerances`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des intolérances valides:', error);
      // Fallback sur les valeurs connues si l'API n'est pas disponible
      return [
        'Lactose',
        'Gluten',
        'Arachides',
        'Fruits à coque',
        'Œufs',
        'Poisson',
        'Crustacés',
        'Soja',
        'Sésame',
        'Moutarde',
        'Céleri',
        'Sulfites'
      ];
    }
  },

  /**
   * Valide que les intolérances fournies sont dans la liste des valeurs valides
   */
  validateIntolerances(intolerances: string[], validOptions: string[]): {
    valid: string[];
    invalid: string[];
  } {
    const valid: string[] = [];
    const invalid: string[] = [];

    intolerances.forEach(intolerance => {
      const trimmed = intolerance.trim();
      if (validOptions.includes(trimmed)) {
        valid.push(trimmed);
      } else {
        invalid.push(trimmed);
      }
    });

    return { valid, invalid };
  }
};
