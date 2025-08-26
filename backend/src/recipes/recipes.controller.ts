/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

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
// Use the global Express.Multer.File type (provided by @types/multer) for compatibility
// Define a minimal UploadFile interface instead of relying on Express.Multer types.
// This avoids type mismatches between @types/express/@types/multer versions (especially in Docker).
interface UploadFile {
  /** original filename on the user's machine */
  originalname?: string;
  /** filename on disk (set by our diskStorage filename handler) */
  filename?: string;
  /** optional buffer when using memory storage */
  buffer?: Buffer;
  [key: string]: any;
}
import * as fs from 'fs';
import * as path from 'path';
// Helper to locate the uploads directory robustly. Prefer repository root `uploads/` if present,
// otherwise use `process.cwd()/uploads` and create it if needed.
function getUploadPath(): string {
  const p1 = path.join(process.cwd(), 'uploads');
  const p2 = path.join(process.cwd(), '..', 'uploads');
  if (fs.existsSync(p1)) return p1;
  if (fs.existsSync(p2)) return p2;
  // fallback: ensure p1 exists
  fs.mkdirSync(p1, { recursive: true });
  return p1;
}

// Helpers to safely read Multer file properties and contain necessary eslint disables
function getSafeOriginalName(file: unknown): string {
  const original = (file as any)?.originalname;
  return typeof original === 'string' ? original : 'file';
}

function hasFilename(file: unknown): file is UploadFile {
  return !!file && typeof (file as any).filename === 'string';
}

import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './create-recipe.dto';
import { UpdateRecipeDto } from './update-recipe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  // Metadata endpoint used by frontend to get valid intolerance options
  @Get('metadata/intolerances')
  getIntolerances(): string[] {
    // Keep in sync with AiController validation options or metadata service if added later
    return ['Lactose', 'Gluten', 'Nuts', 'Shellfish', 'Soy', 'Eggs', 'Peanuts'];
  }

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
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: (
          req: ExpressRequest,
          file: UploadFile,
          cb: (err: NodeJS.ErrnoException | null, destination: string) => void,
        ) => {
          const uploadPath = getUploadPath();
          cb(null, uploadPath);
        },
        filename: (
          req: ExpressRequest,
          file: UploadFile,
          cb: (err: NodeJS.ErrnoException | null, filename: string) => void,
        ) => {
          const originalName = getSafeOriginalName(file);
          const safeName = `${Date.now()}_${String(originalName).replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          cb(null, safeName);
        },
      }),
    }),
  )
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
      const validFiles = files.filter((f): f is UploadFile => hasFilename(f));
      dto.imageUrls = validFiles.map((f) => `/uploads/${f.filename}`);
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
          cb: (err: NodeJS.ErrnoException | null, destination: string) => void,
        ) => {
          const uploadPath = getUploadPath();
          cb(null, uploadPath);
        },
        filename: (
          req: ExpressRequest,
          file: UploadFile,
          cb: (err: NodeJS.ErrnoException | null, filename: string) => void,
        ) => {
          const originalName = getSafeOriginalName(file);
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
        .filter((f): f is UploadFile => hasFilename(f))
        .map((f) => `/uploads/${f.filename}`);
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
