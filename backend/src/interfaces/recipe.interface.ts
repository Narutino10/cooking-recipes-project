export interface Recipe {
  id: string;
  fields: {
    Nom: string;
    'Type de plat': string;
    Ingrédients?: string[]; // Garde pour compatibilité avec les anciennes recettes
    'Liste ingrédients'?: string; // Nouveau champ pour les ingrédients comme texte
    'Nombre de personnes': number;
    Intolérances?: string[] | string; // Peut être array ou string selon le cas
    Instructions: string;
    'Analyse nutritionnelle'?: string[];
    Image?: any;
    [key: string]: any;
  };
}
