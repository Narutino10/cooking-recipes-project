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
  UploadedFiles,
  UseInterceptors,
  ForbiddenException,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Request as ExpressRequest } from 'express';
// Local lightweight file shape for uploaded files (avoid referencing global.Express.Multer)
type UploadFile = {
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
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: (
          req: ExpressRequest,
          file: UploadFile,
          cb: (err: Error | null, destination: string) => void,
        ) => {
          const uploadPath = path.join(process.cwd(), 'uploads');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (
          req: ExpressRequest,
          file: UploadFile,
          cb: (err: Error | null, filename: string) => void,
        ) => {
          const originalName =
            typeof file?.originalname === 'string' ? file.originalname : 'file';
          // safeName computed from a verified string
          const safeName = `${Date.now()}_${String(originalName).replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          cb(null, safeName);
        },
      }),
    }),
  )
  /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
  async createWithImage(
    @UploadedFiles() files: UploadFile[] | undefined,
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
      // accept 'servings' (current entity) and fallback to legacy 'nbPersons'
      servings: body['servings']
        ? Number(body['servings'])
        : body['nbPersons']
          ? Number(body['nbPersons'])
          : 1,
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

    if (Array.isArray(files) && files.length > 0) {
      dto.imageUrls = files
        .filter((f: UploadFile) => typeof f.filename === 'string')
        .map((f: UploadFile) => `/uploads/${String(f.filename)}`);
    }

    return this.recipesService.create(dto as CreateRecipeDto, req.user.id);
  }

  // Update images for an existing recipe: add new uploaded files and remove any URLs listed in 'remove' body param
  @Put(':id/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: (
          req: ExpressRequest,
          file: UploadFile,
          cb: (err: Error | null, destination: string) => void,
        ) => {
          const uploadPath = path.join(process.cwd(), 'uploads');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (
          req: ExpressRequest,
          file: UploadFile,
          cb: (err: Error | null, filename: string) => void,
        ) => {
          const originalName =
            typeof file?.originalname === 'string' ? file.originalname : 'file';
          const safeName = `${Date.now()}_${String(originalName).replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          cb(null, safeName);
        },
      }),
    }),
  )
  async updateImages(
    @Param('id') id: string,
    @UploadedFiles() files: UploadFile[] | undefined,
    @Body() body: Record<string, string>,
    @Request() req: { user: { id: string } },
  ) {
    const recipe = await this.recipesService.findOne(id);
    if (recipe.authorId !== req.user.id) {
      throw new ForbiddenException('You can only update your own recipes');
    }

    // remove list: comma separated image urls to remove
    const removeList = body['remove']
      ? body['remove']
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    let current: string[] = Array.isArray(recipe.imageUrls)
      ? recipe.imageUrls.slice()
      : [];

    // delete files from disk for removed urls
    for (const url of removeList) {
      const idx = current.indexOf(url);
      if (idx !== -1) {
        current.splice(idx, 1);
        if (url.startsWith('/uploads/')) {
          const filename = url.replace('/uploads/', '');
          const filePath = path.join(process.cwd(), 'uploads', filename);
          try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          } catch {
            // ignore unlink errors
          }
        }
      }
    }

    if (Array.isArray(files) && files.length > 0) {
      const added = files
        .filter((f: UploadFile) => typeof f.filename === 'string')
        .map((f: UploadFile) => `/uploads/${String(f.filename)}`);
      current = current.concat(added);
    }

    await this.recipesService.update(
      id,
      { imageUrls: current } as UpdateRecipeDto,
      req.user.id,
    );
    return { imageUrls: current };
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
