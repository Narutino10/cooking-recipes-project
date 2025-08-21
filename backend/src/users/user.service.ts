import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async updateUser(
    id: string,
    updateData: UpdateUserDto,
  ): Promise<User | null> {
    const updatePayload: Partial<User> = { ...updateData };

    // Hash le mot de passe si fourni
    if (updateData.password) {
      updatePayload.password = await bcrypt.hash(updateData.password, 12);
    }

    await this.userRepository.update(id, updatePayload);
    return this.findById(id);
  }
}
