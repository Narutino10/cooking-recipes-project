import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

export interface NutritionAnalysis {
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  vitamins: string[];
  minerals: string[];
  description: string;
}

export interface GenerateRecipeRequest {
  ingredients: string[];
  nbPersons: number;
  intolerances?: string[];
  dietType?: string;
  cookingTime?: number;
}

export interface GeneratedRecipe {
  name: string;
  type: string;
  ingredients: string[];
  instructions: string;
  imageUrl?: string;
  nutritionAnalysis: NutritionAnalysis;
}

@Injectable()
export class MistralService {
  constructor() {
    console.log('MistralService initialized in mock mode');
  }

  async generateNutritionAnalysis(
    ingredients: string[],
  ): Promise<NutritionAnalysis> {
    // Simulation d'un délai d'API
    await new Promise((resolve) => setTimeout(resolve, 500));

    return this.getMockNutritionAnalysis(ingredients);
  }

  private getMockNutritionAnalysis(ingredients: string[]): NutritionAnalysis {
    // Calculer des valeurs basées sur les ingrédients
    const baseCalories = ingredients.length * 80;
    const baseProteins = Math.floor(ingredients.length * 3.5);
    const baseCarbs = Math.floor(ingredients.length * 12);
    const baseFats = Math.floor(ingredients.length * 2.8);

    return {
      calories: baseCalories,
      proteins: baseProteins,
      carbohydrates: baseCarbs,
      fats: baseFats,
      vitamins: ['A', 'C', 'B6', 'B12'],
      minerals: ['Fer', 'Calcium', 'Magnésium', 'Potassium'],
      description: `Analyse nutritionnelle pour une recette avec ${ingredients.join(', ')}. Cette recette apporte ${baseCalories} calories avec un bon équilibre de macronutriments. Riche en vitamines et minéraux essentiels.`,
    };
  }

  async generateRecipe(
    request: GenerateRecipeRequest,
  ): Promise<GeneratedRecipe> {
    // Simulation d'un délai d'API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const recipe = this.getMockRecipe(request);

    // Try to generate an image if an external image API is configured
    try {
      const originalPrompt = `${recipe.name} - image of the prepared dish`;
      const englishPrompt = this.translatePromptToEnglish(originalPrompt);
      console.log('Original prompt:', originalPrompt);
      console.log('Translated prompt:', englishPrompt);
      const img = await this.generateImage(englishPrompt);
      if (img) recipe.imageUrl = img;
    } catch {
      // ignore image generation errors and keep mock/random image
    }

    return recipe;
  }

  private getMockRecipe(request: GenerateRecipeRequest): GeneratedRecipe {
    const { ingredients, nbPersons, intolerances = [], dietType } = request;

    const primaryIngredient = ingredients[0] || 'légumes';
    const recipeName = this.generateRecipeName(primaryIngredient, dietType);
    const recipeIngredients = this.generateIngredientsList(
      ingredients,
      nbPersons,
    );
    const instructions = this.generateInstructions(
      ingredients,
      nbPersons,
      intolerances,
    );

    return {
      name: recipeName,
      type: this.getRecipeType(ingredients),
      ingredients: recipeIngredients,
      instructions,
      imageUrl: this.getRandomUploadImage(),
      nutritionAnalysis: this.getMockNutritionAnalysis(ingredients),
    };
  }

  private getRandomUploadImage(): string | undefined {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) return undefined;
      const files = fs.readdirSync(uploadDir).filter((f) => {
        const ext = path.extname(f).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
      });
      if (files.length === 0) return undefined;
      const choice = files[Math.floor(Math.random() * files.length)];
      return `/uploads/${choice}`;
    } catch {
      return undefined;
    }
  }

  private async generateImage(prompt: string): Promise<string | undefined> {
    // Provider selection allows switching image backend without code changes.
    // Supported providers: 'mistral' (uses MISTRAL_IMAGE_API_URL/MISTRAL_API_KEY),
    // 'stability' (uses STABILITY_API_KEY and optional STABILITY_API_URL),
    // If none configured, fall back to the original MISTRAL_* env vars if present.
    const provider = (process.env.IMAGE_API_PROVIDER || '').toLowerCase();

    try {
      if (provider === 'stability' || process.env.STABILITY_API_KEY) {
        const stabilityResult = await this.generateWithStability(
          prompt,
          process.env.STABILITY_API_KEY,
          process.env.STABILITY_API_URL,
        );
        if (stabilityResult) return stabilityResult;
      }

      // Default / generic Mistral-compatible provider (or explicit 'mistral')
      const mistralUrl =
        process.env.MISTRAL_IMAGE_API_URL || process.env.IMAGE_API_URL;
      const mistralKey =
        process.env.MISTRAL_API_KEY || process.env.IMAGE_API_KEY;
      if (mistralUrl && mistralKey) {
        const mistralResult = await this.generateWithGenericApi(
          prompt,
          mistralUrl,
          mistralKey,
        );
        if (mistralResult) return mistralResult;
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  // Generic HTTP-based image provider: send { prompt } and accept { url } or { base64 }
  private async generateWithGenericApi(
    prompt: string,
    apiUrl: string,
    apiKey: string | undefined,
  ): Promise<string | undefined> {
    try {
      const resp = await axios.post(
        apiUrl,
        { prompt },
        {
          headers: {
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            'Content-Type': 'application/json',
          },
          timeout: 20000,
        },
      );

      const data: unknown = resp.data;
      const obj = data as Record<string, unknown>;
      const urlVal = obj['url'];
      if (typeof urlVal === 'string' && urlVal.length > 0) return urlVal;
      const base64Val = obj['base64'];
      if (typeof base64Val === 'string' && base64Val.length > 0) {
        return this.saveBase64Image(base64Val);
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  // Minimal integration with Stability AI (text-to-image). This accepts an API key and optional base URL.
  // The exact request/response shape may differ depending on the Stability account; we accept either
  // a direct URL in the response or a base64 payload under 'base64'.
  private async generateWithStability(
    prompt: string,
    apiKey: string | undefined,
    apiUrl?: string,
  ): Promise<string | undefined> {
    if (!apiKey) return undefined;

    // Use the current Stability AI API v2 endpoint
    const url =
      apiUrl || 'https://api.stability.ai/v2beta/stable-image/generate/core';

    console.log('Sending to Stability AI:', prompt);

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('output_format', 'png');
      formData.append('aspect_ratio', '1:1');

      const resp = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'image/*',
        },
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      // Stability AI v2 returns the image directly as binary data
      if (resp.data && Buffer.isBuffer(resp.data) && resp.data.length > 0) {
        // Convert to base64 and save
        const base64 = Buffer.from(resp.data).toString('base64');
        const dataUrl = `data:image/png;base64,${base64}`;
        return this.saveBase64Image(dataUrl);
      }

      return undefined;
    } catch (error) {
      const err = error as { response?: { data?: unknown }; message?: string };

      // Try to parse error response if it's a buffer
      let errorMessage = err.message || 'Unknown error';
      if (err.response?.data) {
        if (Buffer.isBuffer(err.response.data)) {
          try {
            const errorText = err.response.data.toString('utf8');
            const errorJson = JSON.parse(errorText) as {
              errors?: string[];
              message?: string;
            };
            if (errorJson.errors && Array.isArray(errorJson.errors)) {
              errorMessage = errorJson.errors.join(', ');
            } else if (errorJson.message) {
              errorMessage = errorJson.message;
            } else {
              errorMessage = errorText;
            }
          } catch {
            errorMessage = err.response.data.toString('utf8');
          }
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      }

      console.error('Stability AI API error:', errorMessage);
      return undefined;
    }
  }

  private saveBase64Image(base64: string): string | undefined {
    try {
      const match = base64.match(
        /^data:(image\/(png|jpeg|jpg|webp));base64,(.*)$/,
      );
      let ext = '.png';
      let b64 = base64;
      if (match) {
        ext = match[2] === 'jpeg' ? '.jpg' : `.${match[2]}`;
        b64 = match[3];
      }
      const buffer = Buffer.from(b64, 'base64');
      const filename = `${Date.now()}_ai${ext}`;
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      return `/uploads/${filename}`;
    } catch {
      return undefined;
    }
  }

  private generateRecipeName(
    primaryIngredient: string,
    dietType?: string,
  ): string {
    const adjectives = [
      'Délicieux',
      'Savoureux',
      'Parfumé',
      'Traditionnel',
      'Moderne',
    ];
    const cookingMethods = ['sauté', 'grillé', 'mijoté', 'rôti', 'en sauce'];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const method =
      cookingMethods[Math.floor(Math.random() * cookingMethods.length)];

    let name = `${adjective} ${primaryIngredient} ${method}`;

    if (dietType) {
      name += ` (${dietType})`;
    }

    return name;
  }

  private generateIngredientsList(
    ingredients: string[],
    nbPersons: number,
  ): string[] {
    const result: string[] = [];

    ingredients.forEach((ingredient, index) => {
      const baseQuantity = ((200 + index * 50) * nbPersons) / 2;
      const unit = this.getUnit(ingredient);
      result.push(`${ingredient} - ${Math.round(baseQuantity)}${unit}`);
    });

    // Ajouter des ingrédients de base
    result.push(`Huile d'olive - ${Math.ceil(nbPersons)}c cuillères à soupe`);
    result.push('Sel et poivre - selon le goût');

    if (Math.random() > 0.5) {
      result.push('Ail - 2 gousses');
    }

    if (Math.random() > 0.5) {
      result.push('Herbes de Provence - 1 cuillère à café');
    }

    return result;
  }

  private getUnit(ingredient: string): string {
    const lowerIngredient = ingredient.toLowerCase();

    if (
      lowerIngredient.includes('huile') ||
      lowerIngredient.includes('vinaigre')
    ) {
      return 'ml';
    }
    if (
      lowerIngredient.includes('farine') ||
      lowerIngredient.includes('sucre')
    ) {
      return 'g';
    }
    if (lowerIngredient.includes('œuf') || lowerIngredient.includes('oeuf')) {
      return ' unité(s)';
    }

    return 'g';
  }

  private generateInstructions(
    ingredients: string[],
    nbPersons: number,
    intolerances: string[],
  ): string {
    const steps: string[] = [];

    steps.push(
      '1. Préparer tous les ingrédients en les lavant et les découpant selon les besoins',
    );
    steps.push(
      "2. Faire chauffer l'huile d'olive dans une grande poêle ou casserole",
    );

    if (ingredients.some((ing) => ing.toLowerCase().includes('ail'))) {
      steps.push("3. Faire revenir l'ail émincé pendant 1 minute");
    }

    steps.push(
      `${steps.length + 1}. Ajouter les ingrédients principaux et cuire pendant 10-15 minutes`,
    );

    if (intolerances.length === 0) {
      steps.push(
        `${steps.length + 1}. Assaisonner avec sel, poivre et herbes selon le goût`,
      );
    } else {
      steps.push(
        `${steps.length + 1}. Assaisonner en évitant: ${intolerances.join(', ')}`,
      );
    }

    steps.push(
      `${steps.length + 1}. Laisser mijoter quelques minutes pour que les saveurs se mélangent`,
    );
    steps.push(
      `${steps.length + 1}. Servir chaud pour ${nbPersons} personne(s)`,
    );

    return steps.join('\n');
  }

  private getRecipeType(ingredients: string[]): string {
    const lowerIngredients = ingredients.map((ing) => ing.toLowerCase());

    if (
      lowerIngredients.some(
        (ing) =>
          ing.includes('chocolat') ||
          ing.includes('sucre') ||
          ing.includes('farine'),
      )
    ) {
      return 'Dessert';
    }

    if (
      lowerIngredients.some(
        (ing) => ing.includes('salade') || ing.includes('tomate'),
      )
    ) {
      return 'Entrée';
    }

    if (
      lowerIngredients.some(
        (ing) =>
          ing.includes('viande') ||
          ing.includes('poisson') ||
          ing.includes('poulet'),
      )
    ) {
      return 'Plat principal';
    }

    return 'Plat principal';
  }

  async improveRecipe(
    recipeName: string,
    currentIngredients: string[],
    improvements: string,
  ): Promise<string> {
    // Simulation d'un délai d'API
    await new Promise((resolve) => setTimeout(resolve, 800));

    const suggestions: string[] = [];

    suggestions.push(`🔧 Améliorations pour "${recipeName}"`);
    suggestions.push('');
    suggestions.push(`📝 Demande: ${improvements}`);
    suggestions.push('');
    suggestions.push('💡 Suggestions:');

    // Suggestions basées sur les ingrédients actuels
    if (
      currentIngredients.some((ing) => ing.toLowerCase().includes('tomate'))
    ) {
      suggestions.push('• Ajouter du basilic frais pour rehausser les saveurs');
    }

    if (
      currentIngredients.some((ing) => ing.toLowerCase().includes('viande'))
    ) {
      suggestions.push(
        '• Mariner la viande 30min avant cuisson pour plus de tendreté',
      );
    }

    suggestions.push('• Ajuster les temps de cuisson selon la texture désirée');
    suggestions.push(
      "• Goûter et ajuster l'assaisonnement en cours de cuisson",
    );

    // Suggestions basées sur la demande d'amélioration
    if (improvements.toLowerCase().includes('épic')) {
      suggestions.push("• Ajouter du piment d'Espelette ou du paprika fumé");
      suggestions.push(
        '• Incorporer des épices comme le cumin ou la coriandre',
      );
    }

    if (
      improvements.toLowerCase().includes('onctueux') ||
      improvements.toLowerCase().includes('crémeux')
    ) {
      suggestions.push(
        '• Ajouter une touche de crème fraîche en fin de cuisson',
      );
      suggestions.push('• Incorporer un peu de beurre pour la brillance');
    }

    suggestions.push('');
    suggestions.push(
      "👨‍🍳 Conseil du chef: La clé d'une bonne recette est l'équilibre des saveurs et la qualité des ingrédients!",
    );

    return suggestions.join('\n');
  }

  async generateRecipeText(
    request: GenerateRecipeRequest,
  ): Promise<GeneratedRecipe> {
    // Simulation d'un délai d'API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const recipe = this.getMockRecipe(request);
    // Remove imageUrl for text-only generation
    recipe.imageUrl = undefined;

    return recipe;
  }

  async generateRecipeWithImage(
    request: GenerateRecipeRequest,
  ): Promise<GeneratedRecipe> {
    // This is the same as generateRecipe but ensures image is included
    return this.generateRecipe(request);
  }

  async generateImageFromPrompt(prompt: string): Promise<string | undefined> {
    // Translate the prompt to English before sending to Stability AI
    const englishPrompt = this.translatePromptToEnglish(prompt);
    console.log('Original prompt:', prompt);
    console.log('Translated prompt:', englishPrompt);
    return this.generateImage(englishPrompt);
  }

  private translatePromptToEnglish(prompt: string): string {
    // Simple translation mapping for common French cooking terms
    const translations: Record<string, string> = {
      Délicieux: 'Delicious',
      Savoureux: 'Tasty',
      Parfumé: 'Fragrant',
      Traditionnel: 'Traditional',
      Moderne: 'Modern',
      sauté: 'sautéed',
      grillé: 'grilled',
      mijoté: 'simmered',
      rôti: 'roasted',
      'en sauce': 'in sauce',
      légumes: 'vegetables',
      viande: 'meat',
      poisson: 'fish',
      poulet: 'chicken',
      riz: 'rice',
      pâtes: 'pasta',
      salade: 'salad',
      soupe: 'soup',
      dessert: 'dessert',
      fromage: 'cheese',
      œuf: 'egg',
      oeuf: 'egg',
      pain: 'bread',
      huile: 'oil',
      beurre: 'butter',
      sel: 'salt',
      poivre: 'pepper',
      ail: 'garlic',
      oignon: 'onion',
      tomate: 'tomato',
      carotte: 'carrot',
      pomme: 'apple',
      banane: 'banana',
      'image of the prepared dish': 'image of the prepared dish',
    };

    let translated = prompt;
    for (const [french, english] of Object.entries(translations)) {
      translated = translated.replace(new RegExp(french, 'gi'), english);
    }

    return translated;
  }
}
