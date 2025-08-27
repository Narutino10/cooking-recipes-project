import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../users/user.entity';
import { Article } from './article.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
  ) {}

  async create(
    articleId: string,
    content: string,
    userId: string,
    parentCommentId?: string,
  ): Promise<Comment> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const article = await this.articlesRepository.findOne({
      where: { id: articleId },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    let parentComment: Comment | null = null;
    if (parentCommentId) {
      parentComment = await this.commentsRepository.findOne({
        where: { id: parentCommentId },
      });
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = this.commentsRepository.create({
      content,
      articleId,
      authorId: userId,
      parentCommentId: parentCommentId || undefined,
    });

    const savedComment = await this.commentsRepository.save(comment);

    // Increment comment count on article
    article.commentCount += 1;
    await this.articlesRepository.save(article);

    return savedComment;
  }

  async findByArticle(articleId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { articleId, parentCommentId: IsNull() },
      relations: ['author', 'replies', 'replies.author', 'likedBy'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['author', 'article', 'parentComment', 'replies', 'likedBy'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(id: string, content: string, userId: string): Promise<Comment> {
    const comment = await this.findOne(id);

    if (comment.authorId !== userId) {
      throw new NotFoundException('You can only update your own comments');
    }

    comment.content = content;
    return this.commentsRepository.save(comment);
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.findOne(id);

    if (comment.authorId !== userId) {
      throw new NotFoundException('You can only delete your own comments');
    }

    // Decrement comment count on article
    const article = await this.articlesRepository.findOne({
      where: { id: comment.articleId },
    });
    if (article) {
      article.commentCount -= 1;
      await this.articlesRepository.save(article);
    }

    await this.commentsRepository.remove(comment);
  }

  async likeComment(commentId: string, userId: string): Promise<Comment> {
    const comment = await this.findOne(commentId);
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isLiked = comment.likedBy.some((u) => u.id === userId);

    if (isLiked) {
      comment.likedBy = comment.likedBy.filter((u) => u.id !== userId);
      comment.likes -= 1;
    } else {
      comment.likedBy.push(user);
      comment.likes += 1;
    }

    return this.commentsRepository.save(comment);
  }

  async getCommentReplies(commentId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { parentCommentId: commentId },
      relations: ['author', 'replies', 'replies.author', 'likedBy'],
      order: { createdAt: 'ASC' },
    });
  }
}
