import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipes } from './recipes.entity';
import { CreateRecipeDto } from './create-recipe.dto';
import { UpdateRecipeDto } from './update-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipes)
    private recipeRepository: Repository<Recipes>,
  ) {}

  async create(
    createRecipeDto: CreateRecipeDto,
    authorId: string,
  ): Promise<Recipes> {
    const recipe = this.recipeRepository.create({
      ...createRecipeDto,
      authorId,
    });
    return await this.recipeRepository.save(recipe);
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ recipes: Recipes[]; total: number }> {
    const [recipes, total] = await this.recipeRepository.findAndCount({
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
