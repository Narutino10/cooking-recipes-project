import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: { user: { id: string } }) {
    const user = await this.userService.findById(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailConfirmed: user.isEmailConfirmed,
      createdAt: user.createdAt,
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req: { user: { id: string } },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.userService.updateUser(
      req.user.id,
      updateUserDto,
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      isEmailConfirmed: updatedUser.isEmailConfirmed,
    };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      // Ne pas exposer l'email et autres infos sensibles
    };
  }
}
