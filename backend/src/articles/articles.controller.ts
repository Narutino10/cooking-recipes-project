import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ArticleType } from './article.entity';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createArticleDto: CreateArticleDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.articlesService.create(createArticleDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('type') type?: ArticleType,
    @Query('category') category?: string,
    @Query('publishedOnly') publishedOnly?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const publishedOnlyBool = publishedOnly === 'false' ? false : true;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.articlesService.findAll(
      type,
      category,
      publishedOnlyBool,
      pageNum,
      limitNum,
    );
  }

  @Get('category/:category')
  getArticlesByCategory(
    @Param('category') category: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.articlesService.getArticlesByCategory(
      category,
      pageNum,
      limitNum,
    );
  }

  @Get('search')
  searchArticles(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.articlesService.searchArticles(query, pageNum, limitNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.articlesService.update(id, updateArticleDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.articlesService.remove(id, req.user.id);
  }
}
