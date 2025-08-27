import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body()
    createCommentDto: CreateCommentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.commentsService.create(
      createCommentDto.articleId,
      createCommentDto.content,
      req.user.id,
      createCommentDto.parentCommentId,
    );
  }

  @Get('article/:articleId')
  findByArticle(@Param('articleId') articleId: string) {
    return this.commentsService.findByArticle(articleId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.commentsService.update(
      id,
      updateCommentDto.content,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.commentsService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  likeComment(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.commentsService.likeComment(id, req.user.id);
  }

  @Get(':id/replies')
  getCommentReplies(@Param('id') id: string) {
    return this.commentsService.getCommentReplies(id);
  }
}
