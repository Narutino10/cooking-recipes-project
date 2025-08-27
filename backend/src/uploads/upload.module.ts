import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
