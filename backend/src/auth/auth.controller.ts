import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ConfirmEmailDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('confirm-email')
  @HttpCode(HttpStatus.OK)
  async confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto) {
    return this.authService.confirmEmail(confirmEmailDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(
    @Request()
    req: {
      user: { id: string; email: string; firstName: string; lastName: string };
    },
  ) {
    const { id, email, firstName, lastName } = req.user;
    return {
      id,
      email,
      firstName,
      lastName,
    };
  }
}
