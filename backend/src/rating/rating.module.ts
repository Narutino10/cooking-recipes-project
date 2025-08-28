import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from './rating.entity';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { Recipes } from '../recipes/recipes.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Recipes, User])],
  providers: [RatingService],
  controllers: [RatingController],
  exports: [RatingService],
})
export class RatingModule {}
