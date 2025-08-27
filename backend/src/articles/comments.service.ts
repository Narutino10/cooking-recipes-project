import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article, ArticleType, ArticleStatus } from './article.entity';
import { User } from '../users/user.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createArticleDto: CreateArticleDto, userId: string): Promise<Article> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const article = this.articlesRepository.create({
      ...createArticleDto,
      author: user,
      authorId: userId,
      publishedAt: createArticleDto.status === ArticleStatus.PUBLISHED ? new Date() : null,
    });

    return this.articlesRepository.save(article);
  }

  async findAll(type?: ArticleType, category?: string, publishedOnly = true): Promise<Article[]> {
    const query = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.likedBy', 'likedBy')
      .orderBy('article.createdAt', 'DESC');

    if (type) {
      query.andWhere('article.type = :type', { type });
    }

    if (category) {
      query.andWhere('article.category = :category', { category });
    }

    if (publishedOnly) {
      query.andWhere('article.status = :status', { status: ArticleStatus.PUBLISHED });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { id },
      relations: ['author', 'comments', 'comments.author', 'likedBy'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Increment view count
    article.views += 1;
    await this.articlesRepository.save(article);

    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto, userId: string): Promise<Article> {
    const article = await this.findOne(id);

    if (article.authorId !== userId) {
      throw new NotFoundException('You can only update your own articles');
    }

    Object.assign(article, updateArticleDto);

    if (updateArticleDto.status === ArticleStatus.PUBLISHED && !article.publishedAt) {
      article.publishedAt = new Date();
    }

    return this.articlesRepository.save(article);
  }

  async remove(id: string, userId: string): Promise<void> {
    const article = await this.findOne(id);

    if (article.authorId !== userId) {
      throw new NotFoundException('You can only delete your own articles');
    }

    await this.articlesRepository.remove(article);
  }

  async likeArticle(articleId: string, userId: string): Promise<Article> {
    const article = await this.findOne(articleId);
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isLiked = article.likedBy.some(u => u.id === userId);

    if (isLiked) {
      article.likedBy = article.likedBy.filter(u => u.id !== userId);
      article.likes -= 1;
    } else {
      article.likedBy.push(user);
      article.likes += 1;
    }

    return this.articlesRepository.save(article);
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
    return result.map(row => row.category).filter(Boolean);
  }

  async getTags(): Promise<string[]> {
    const articles = await this.articlesRepository.find({
      select: ['tags'],
      where: { status: ArticleStatus.PUBLISHED }
    });

    const allTags = articles
      .flatMap(article => article.tags || [])
      .filter((tag, index, array) => array.indexOf(tag) === index);

    return allTags;
  }
}</content>
<parameter name="filePath">c:\Users\Ibrah\OneDrive\Bureau\cooking-recipes-project\backend\src\articles\articles.service.ts
