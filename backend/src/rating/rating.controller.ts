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
import {
  JwtAuthGuard
} from '../auth/guards/jwt-auth.guard';
import {
  RatingService,
  CreateRatingDto,
  UpdateRatingDto
} from './rating.service';

@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  async createRating(
    @Body() createRatingDto: CreateRatingDto,
    @Request() req: any,
  ) {
    return this.ratingService.createRating(createRatingDto, req.user.id);
  }

  @Put(':id')
  async updateRating(
    @Param('id') id: string,
    @Body() updateRatingDto: UpdateRatingDto,
    @Request() req: any,
  ) {
    return this.ratingService.updateRating(id, updateRatingDto, req.user.id);
  }

  @Delete(':id')
  async deleteRating(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    await this.ratingService.deleteRating(id, req.user.id);
    return { message: 'Rating deleted successfully' };
  }

  @Get('recipe/:recipeId')
  async getRecipeRatings(@Param('recipeId') recipeId: string) {
    return this.ratingService.getRecipeRatings(recipeId);
  }

  @Get('user')
  async getUserRatings(@Request() req: any) {
    return this.ratingService.getUserRatings(req.user.id);
  }

  @Get('recipe/:recipeId/average')
  async getRecipeAverageRating(@Param('recipeId') recipeId: string) {
    return this.ratingService.getRecipeAverageRating(recipeId);
  }

  @Get('recipe/:recipeId/user')
  async getUserRatingForRecipe(
    @Param('recipeId') recipeId: string,
    @Request() req: any,
  ) {
    return this.ratingService.getUserRatingForRecipe(req.user.id, recipeId);
  }
}
