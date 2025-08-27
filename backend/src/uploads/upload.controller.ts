import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthenticatedRequest,
  ) {
    return {
      avatarUrl: await this.uploadService.uploadAvatar(file, req.user.id),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('article-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadArticleImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthenticatedRequest,
  ) {
    return {
      imageUrl: await this.uploadService.uploadArticleImage(file, req.user.id),
    };
  }
}
