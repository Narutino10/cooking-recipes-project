import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { Recipes } from '../recipes/recipes.entity';
import { User } from '../users/user.entity';

export interface CreateRatingDto {
  rating: number;
  comment?: string;
  recipeId: string;
}

export interface UpdateRatingDto {
  rating?: number;
  comment?: string;
}

interface RatingQueryResult {
  average: string | null;
  count: string | null;
}

// Extended User type with name property
interface UserWithName extends User {
  name: string;
}

// Extended Rating type with user that has name
export interface RatingWithUserName extends Omit<Rating, 'user'> {
  user: UserWithName;
}

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(Recipes)
    private recipeRepository: Repository<Recipes>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createRating(
    createRatingDto: CreateRatingDto,
    userId: string,
  ): Promise<Rating> {
    const { rating, comment, recipeId } = createRatingDto;

    // Validate rating range
    if (rating < 1 || rating > 5) {
      throw new ForbiddenException('Rating must be between 1 and 5');
    }

    // Check if recipe exists
    const recipe = await this.recipeRepository.findOne({
      where: { id: recipeId },
    });
    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    // Check if user already rated this recipe
    const existingRating = await this.ratingRepository.findOne({
      where: { userId, recipeId },
    });

    if (existingRating) {
      throw new ForbiddenException('You have already rated this recipe');
    }

    // Create new rating
    const newRating = this.ratingRepository.create({
      rating,
      comment,
      userId,
      recipeId,
    });

    return this.ratingRepository.save(newRating);
  }

  async updateRating(
    id: string,
    updateRatingDto: UpdateRatingDto,
    userId: string,
  ): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (rating.userId !== userId) {
      throw new ForbiddenException('You can only update your own ratings');
    }

    const { rating: newRating, comment } = updateRatingDto;

    if (newRating !== undefined && (newRating < 1 || newRating > 5)) {
      throw new ForbiddenException('Rating must be between 1 and 5');
    }

    if (newRating !== undefined) {
      rating.rating = newRating;
    }
    if (comment !== undefined) {
      rating.comment = comment;
    }

    const updatedRating = await this.ratingRepository.save(rating);

    // Transform user data to include combined name
    if (updatedRating.user) {
      (updatedRating.user as UserWithName).name =
        `${updatedRating.user.firstName} ${updatedRating.user.lastName}`;
    }

    return updatedRating as RatingWithUserName;
  }

  async deleteRating(id: string, userId: string): Promise<void> {
    const rating = await this.ratingRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (rating.userId !== userId) {
      throw new ForbiddenException('You can only delete your own ratings');
    }

    await this.ratingRepository.remove(rating);
  }

  async getRecipeRatings(recipeId: string): Promise<RatingWithUserName[]> {
    const ratings = await this.ratingRepository.find({
      where: { recipeId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    // Transform user data to include combined name
    return ratings.map((rating): RatingWithUserName => {
      if (rating.user) {
        (rating.user as UserWithName).name =
          `${rating.user.firstName} ${rating.user.lastName}`;
      }
      return rating as RatingWithUserName;
    });
  }

  async getUserRatings(userId: string): Promise<Rating[]> {
    const ratings = await this.ratingRepository.find({
      where: { userId },
      relations: ['recipe'],
      order: { createdAt: 'DESC' },
    });

    // Transform user data to include combined name (though user is the same for all ratings)
    return ratings.map((rating) => {
      if (rating.user) {
        (rating.user as UserWithName).name =
          `${rating.user.firstName} ${rating.user.lastName}`;
      }
      return rating;
    });
  }

  async getRecipeAverageRating(
    recipeId: string,
  ): Promise<{ average: number; count: number }> {
    const result: RatingQueryResult | undefined = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'average')
      .addSelect('COUNT(rating.id)', 'count')
      .where('rating.recipeId = :recipeId', { recipeId })
      .getRawOne();

    const average = result?.average ? parseFloat(result.average) : 0;
    const count = result?.count ? parseInt(result.count, 10) : 0;

    return {
      average,
      count,
    };
  }

  async getUserRatingForRecipe(
    userId: string,
    recipeId: string,
  ): Promise<Rating | null> {
    return this.ratingRepository.findOne({
      where: { userId, recipeId },
    });
  }
}
