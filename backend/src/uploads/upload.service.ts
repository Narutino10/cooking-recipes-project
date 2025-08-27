import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class UploadService {
  private readonly uploadPath = path.join(__dirname, '../../../uploads');

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    // Créer le dossier uploads s'il n'existe pas
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadAvatar(
    file: Express.Multer.File,
    userId: string,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Vérifier le type de fichier
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Supprimer l'ancien avatar s'il existe
    if (user.avatar) {
      this.deleteAvatar(user.avatar);
    }

    // Générer un nom de fichier unique
    const fileExtension = path.extname(file.originalname);
    const fileName = `${userId}-avatar-${Date.now()}${fileExtension}`;
    const filePath = path.join(this.uploadPath, fileName);

    try {
      // Redimensionner et optimiser l'image
      /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
      await sharp(file.buffer)
        .resize(200, 200, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toFile(filePath);
      /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

      // Mettre à jour l'utilisateur avec le nouveau chemin d'avatar
      const avatarUrl = `/uploads/${fileName}`;
      user.avatar = avatarUrl;
      await this.usersRepository.save(user);

      return avatarUrl;
    } catch (err) {
      console.error('Error processing avatar image:', err);
      throw new BadRequestException('Error processing image');
    }
  }

  deleteAvatar(avatarUrl: string): void {
    const fileName = path.basename(avatarUrl);
    const filePath = path.join(this.uploadPath, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async uploadArticleImage(
    file: Express.Multer.File,
    userId: string,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 10MB');
    }

    const fileExtension = path.extname(file.originalname);
    const fileName = `${userId}-article-${Date.now()}${fileExtension}`;
    const filePath = path.join(this.uploadPath, fileName);

    try {
      // Redimensionner l'image pour les articles (max 800px de largeur)
      /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
      await sharp(file.buffer)
        .resize(800, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .jpeg({ quality: 85 })
        .toFile(filePath);
      /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

      return `/uploads/${fileName}`;
    } catch (err) {
      console.error('Error processing article image:', err);
      throw new BadRequestException('Error processing image');
    }
  }
}
