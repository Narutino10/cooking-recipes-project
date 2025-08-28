import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article, ArticleType, ArticleStatus } from './article.entity';
import { User } from '../users/user.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

export interface TransformedArticle extends Article {
  isPublished: boolean;
  viewCount: number;
  likeCount: number;
}

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
    createArticleDto: CreateArticleDto,
    userId: string,
  ): Promise<Article> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const article = this.articlesRepository.create({
      ...createArticleDto,
      authorId: userId,
      publishedAt:
        createArticleDto.status === ArticleStatus.PUBLISHED
          ? new Date()
          : undefined,
    });

    return this.articlesRepository.save(article);
  }

  async findAll(
    type?: ArticleType,
    category?: string,
    publishedOnly = true,
    page = 1,
    limit = 10,
  ): Promise<{
    articles: TransformedArticle[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .orderBy('article.createdAt', 'DESC');

    if (type) {
      query.andWhere('article.type = :type', { type });
    }

    if (category) {
      query.andWhere('article.category = :category', { category });
    }

    if (publishedOnly) {
      query.andWhere('article.status = :status', {
        status: ArticleStatus.PUBLISHED,
      });
    }

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    query.skip((page - 1) * limit).take(limit);

    const articles = await query.getMany();

    // Transform articles to match frontend expectations
    const transformedArticles = articles.map((article) => ({
      ...article,
      isPublished: article.status === ArticleStatus.PUBLISHED,
      viewCount: article.views,
      likeCount: article.likes,
    }));

    return {
      articles: transformedArticles,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<TransformedArticle> {
    const article = await this.articlesRepository.findOne({
      where: { id },
      relations: ['author', 'comments', 'comments.author'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Increment view count
    article.views += 1;
    await this.articlesRepository.save(article);

    // Transform article to match frontend expectations
    return {
      ...article,
      isPublished: article.status === ArticleStatus.PUBLISHED,
      viewCount: article.views,
      likeCount: article.likes,
    };
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
    userId: string,
  ): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== userId) {
      throw new NotFoundException('You can only update your own articles');
    }

    Object.assign(article, updateArticleDto);

    if (
      updateArticleDto.status === ArticleStatus.PUBLISHED &&
      !article.publishedAt
    ) {
      article.publishedAt = new Date();
    }

    return this.articlesRepository.save(article);
  }

  async remove(id: string, userId: string): Promise<void> {
    const article = await this.articlesRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== userId) {
      throw new NotFoundException('You can only delete your own articles');
    }

    await this.articlesRepository.remove(article);
  }

  async getCategories(type?: ArticleType): Promise<string[]> {
    const query = this.articlesRepository
      .createQueryBuilder('article')
      .select('DISTINCT article.category')
      .where('article.category IS NOT NULL');

    if (type) {
      query.andWhere('article.type = :type', { type });
    }

    const result = await query.getRawMany();
    return result
      .map((row: { category: string }) => row.category)
      .filter(
        (category: string) => category !== null && category !== undefined,
      );
  }

  async getArticlesByCategory(
    category: string,
    page = 1,
    limit = 10,
  ): Promise<{
    articles: TransformedArticle[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.findAll(undefined, category, true, page, limit);
    return result;
  }

  async searchArticles(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<{
    articles: TransformedArticle[];
    total: number;
    page: number;
    limit: number;
  }> {
    const searchQuery = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .where('article.status = :status', { status: ArticleStatus.PUBLISHED })
      .andWhere(
        '(article.title ILIKE :query OR article.content ILIKE :query OR article.tags::text ILIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('article.createdAt', 'DESC');

    // Get total count
    const total = await searchQuery.getCount();

    // Apply pagination
    searchQuery.skip((page - 1) * limit).take(limit);

    const articles = await searchQuery.getMany();

    // Transform articles to match frontend expectations
    const transformedArticles = articles.map((article) => ({
      ...article,
      isPublished: article.status === ArticleStatus.PUBLISHED,
      viewCount: article.views,
      likeCount: article.likes,
    }));

    return {
      articles: transformedArticles,
      total,
      page,
      limit,
    };
  }
}
