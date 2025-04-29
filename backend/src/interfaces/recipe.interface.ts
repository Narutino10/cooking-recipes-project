export interface Recipe {
  id: string;
  fields: {
    Nom: string;
    'Type de plat': string;
    Ingrédients: string[];
    'Nombre de personnes': number;
    Intolérances?: string[];
    Instructions: string;
    'Analyse nutritionnelle'?: string[];
    Image?: any;
    [key: string]: any;
  };
}
