import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  RatingService,
  CreateRatingDto,
  UpdateRatingDto,
} from './rating.service';
import { User } from '../users/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('ratings')
// @UseGuards(JwtAuthGuard) // Removed from class level
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createRating(
    @Body() createRatingDto: CreateRatingDto,
    @Request() req: RequestWithUser,
  ) {
    return this.ratingService.createRating(createRatingDto, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateRating(
    @Param('id') id: string,
    @Body() updateRatingDto: UpdateRatingDto,
    @Request() req: RequestWithUser,
  ) {
    return this.ratingService.updateRating(id, updateRatingDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteRating(@Param('id') id: string, @Request() req: RequestWithUser) {
    await this.ratingService.deleteRating(id, req.user.id);
    return { message: 'Rating deleted successfully' };
  }

  @Get('recipe/:recipeId')
  // No guard - public endpoint to view ratings
  async getRecipeRatings(@Param('recipeId') recipeId: string) {
    return this.ratingService.getRecipeRatings(recipeId);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserRatings(@Request() req: RequestWithUser) {
    return this.ratingService.getUserRatings(req.user.id);
  }

  @Get('recipe/:recipeId/average')
  // No guard - public endpoint to view statistics
  async getRecipeAverageRating(@Param('recipeId') recipeId: string) {
    return this.ratingService.getRecipeAverageRating(recipeId);
  }

  @Get('recipe/:recipeId/user')
  @UseGuards(JwtAuthGuard)
  async getUserRatingForRecipe(
    @Param('recipeId') recipeId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.ratingService.getUserRatingForRecipe(req.user.id, recipeId);
  }
}
