import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type DeepPartial } from 'typeorm';
import { Recipes } from './recipes.entity';
import { CreateRecipeDto } from './create-recipe.dto';
import { UpdateRecipeDto } from './update-recipe.dto';
import { MistralService } from '../mistral/mistral.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipes)
    private recipeRepository: Repository<Recipes>,
    private readonly mistralService: MistralService,
    private readonly emailService: EmailService,
  ) {}

  async create(
    createRecipeDto: CreateRecipeDto,
    authorId: string,
  ): Promise<Recipes> {
    // generate nutrition analysis via Mistral (best-effort)
    try {
      await this.mistralService.generateNutritionAnalysis(
        createRecipeDto.ingredients,
      );
    } catch {
      // non-blocking: continue without nutrition if Mistral fails
    }

    // Only pass known entity properties to create()
    const description = createRecipeDto.instructions
      ? String(createRecipeDto.instructions).slice(0, 300)
      : '';

    const partial: DeepPartial<Recipes> = {
      name: createRecipeDto.name,
      description,
      instructions: createRecipeDto.instructions,
      ingredients: createRecipeDto.ingredients,
      servings: createRecipeDto.servings,
      prepTime: createRecipeDto.prepTime,
      cookTime: createRecipeDto.cookTime,
      tags: createRecipeDto.tags,
      difficulty: createRecipeDto.difficulty,
      intolerances: createRecipeDto.intolerances,
      calories: createRecipeDto.calories,
      imageUrls: createRecipeDto.imageUrls,
      visibility: createRecipeDto.visibility,
      authorId,
    };

    const recipe = this.recipeRepository.create(partial);
    const savedRecipe = await this.recipeRepository.save(recipe);

    // Send newsletter notification for public recipes
    if (savedRecipe.visibility === 'public') {
      try {
        // Get author name (you might need to fetch the user)
        const authorName = 'Un chef passionné'; // Placeholder - you can enhance this
        await this.emailService.sendNewRecipeNotification(
          savedRecipe.name,
          savedRecipe.id,
          authorName,
        );
      } catch (error) {
        console.error('Erreur lors de l\'envoi de la notification newsletter:', error);
        // Don't fail the recipe creation if newsletter fails
      }
    }

    return savedRecipe;
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ recipes: Recipes[]; total: number }> {
    const [recipes, total] = await this.recipeRepository.findAndCount({
      where: { visibility: 'public' },
      relations: ['author'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { recipes, total };
  }

  async findOne(id: string): Promise<Recipes> {
    const recipe = await this.recipeRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }
    return recipe;
  }

  async findByAuthor(
    authorId: string,
    page = 1,
    limit = 10,
  ): Promise<{ recipes: Recipes[]; total: number }> {
    const [recipes, total] = await this.recipeRepository.findAndCount({
      where: { authorId },
      relations: ['author'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { recipes, total };
  }

  async update(
    id: string,
    updateRecipeDto: UpdateRecipeDto,
    userId: string,
  ): Promise<Recipes> {
    const recipe = await this.findOne(id);

    if (recipe.authorId !== userId) {
      throw new ForbiddenException('You can only update your own recipes');
    }

    Object.assign(recipe, updateRecipeDto);
    return await this.recipeRepository.save(recipe);
  }

  async remove(id: string, userId: string): Promise<void> {
    const recipe = await this.findOne(id);

    if (recipe.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own recipes');
    }

    await this.recipeRepository.remove(recipe);
  }

  async searchByIngredients(
    ingredients: string[],
    page = 1,
    limit = 10,
  ): Promise<{ recipes: Recipes[]; total: number }> {
    const queryBuilder = this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.author', 'author');

    // only public recipes in search results
    queryBuilder.where('recipe.visibility = :vis', { vis: 'public' });

    ingredients.forEach((ingredient, index) => {
      queryBuilder.andWhere(`recipe.ingredients LIKE :ingredient${index}`, {
        [`ingredient${index}`]: `%${ingredient}%`,
      });
    });

    const [recipes, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('recipe.createdAt', 'DESC')
      .getManyAndCount();

    return { recipes, total };
  }

  async filterByIntolerances(
    intolerances: string[],
    page = 1,
    limit = 10,
  ): Promise<{ recipes: Recipes[]; total: number }> {
    const queryBuilder = this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.author', 'author');

    // only public recipes
    queryBuilder.where('recipe.visibility = :vis', { vis: 'public' });

    intolerances.forEach((intolerance, index) => {
      queryBuilder.andWhere(
        `recipe.intolerances NOT LIKE :intolerance${index}`,
        {
          [`intolerance${index}`]: `%${intolerance}%`,
        },
      );
    });

    const [recipes, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('recipe.createdAt', 'DESC')
      .getManyAndCount();

    return { recipes, total };
  }
}
