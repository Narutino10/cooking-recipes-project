import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Body,
  Param,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Request as ExpressRequest } from 'express';

// Minimal Multer file shape used in this controller to avoid depending on global types
type MulterFile = {
  originalname?: string;
  filename?: string;
  [key: string]: unknown;
};
import * as fs from 'fs';
import * as path from 'path';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './create-recipe.dto';
import { UpdateRecipeDto } from './update-recipe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('ingredients') ingredients?: string,
    @Query('intolerances') intolerances?: string,
  ) {
    const pageNum = page || 1;
    const limitNum = limit || 10;

    if (ingredients) {
      const ingredientsList = ingredients.split(',');
      return this.recipesService.searchByIngredients(
        ingredientsList,
        pageNum,
        limitNum,
      );
    }

    if (intolerances) {
      const intolerancesList = intolerances.split(',');
      return this.recipesService.filterByIntolerances(
        intolerancesList,
        pageNum,
        limitNum,
      );
    }

    return this.recipesService.findAll(pageNum, limitNum);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createRecipeDto: CreateRecipeDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.recipesService.create(createRecipeDto, req.user.id);
  }

  // New endpoint: accepts multipart/form-data with an optional image file
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (
          req: ExpressRequest,
          file: MulterFile,
          cb: (err: unknown, destination: string) => void,
        ) => {
          const uploadPath = path.join(process.cwd(), 'uploads');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (
          req: ExpressRequest,
          file: MulterFile,
          cb: (err: unknown, filename: string) => void,
        ) => {
          const originalName =
            typeof file?.originalname === 'string' ? file.originalname : 'file';
          // safeName computed from a verified string
          const safeName = `${Date.now()}_${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          cb(null, safeName);
        },
      }),
    }),
  )
  /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
  async createWithImage(
    @UploadedFile() file: MulterFile | undefined,
    @Body() body: Record<string, string>,
    @Request() req: { user: { id: string } },
  ) {
    // Build DTO manually from form body (form fields are strings)
    const dto: Record<string, any> = {
      name: body['name'] ?? '',
      type: body['type'] ?? '',
      ingredients: body['ingredients']
        ? body['ingredients'].split(',').map((s) => s.trim())
        : [],
      nbPersons: body['nbPersons'] ? Number(body['nbPersons']) : 1,
      intolerances: body['intolerances']
        ? body['intolerances'].split(',').map((s) => s.trim())
        : [],
      instructions: body['instructions'] ?? '',
      visibility: body['visibility'] ?? undefined,
      tags: body['tags'] ? body['tags'].split(',').map((s) => s.trim()) : [],
      difficulty:
        (body['difficulty'] as 'easy' | 'medium' | 'hard') ?? undefined,
      prepTime: body['prepTime'] ? Number(body['prepTime']) : undefined,
      cookTime: body['cookTime'] ? Number(body['cookTime']) : undefined,
      calories: body['calories'] ? Number(body['calories']) : undefined,
    };

    // Ensure description exists (entity requires non-null description)
    dto.description =
      body['description'] ??
      (dto.instructions ? String(dto.instructions).slice(0, 300) : '');

    if (file && typeof file.filename === 'string') {
      dto.imageUrl = `/uploads/${file.filename}`;
    }

    return this.recipesService.create(dto as CreateRecipeDto, req.user.id);
  }

  @Get('my-recipes')
  @UseGuards(JwtAuthGuard)
  async getMyRecipes(
    @Request() req: { user: { id: string } },
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const pageNum = page || 1;
    const limitNum = limit || 10;
    return this.recipesService.findByAuthor(req.user.id, pageNum, limitNum);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.recipesService.update(id, updateRecipeDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    await this.recipesService.remove(id, req.user.id);
    return { message: 'Recipe deleted successfully' };
  }
}
