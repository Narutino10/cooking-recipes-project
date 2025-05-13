export interface Ingredient {
  id: string;
  fields: {
    Nom: string;
    Quantité?: number;
    [key: string]: any;
  };
}
