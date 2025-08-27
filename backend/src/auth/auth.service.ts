import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/user.entity';
import { EmailService } from '../email/email.service';
import {
  RegisterDto,
  LoginDto,
  ConfirmEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Générer token de confirmation
    const emailConfirmationToken = uuidv4();

    // Créer l'utilisateur
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      emailConfirmationToken,
      isEmailConfirmed: false,
    });

    await this.userRepository.save(user);

    // Envoyer l'email de confirmation
    await this.emailService.sendConfirmationEmail(
      email,
      emailConfirmationToken,
      firstName,
    );

    return {
      message:
        'Inscription réussie. Veuillez vérifier votre email pour confirmer votre compte.',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Trouver l'utilisateur
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier si l'email est confirmé
    if (!user.isEmailConfirmed) {
      throw new UnauthorizedException(
        'Veuillez confirmer votre email avant de vous connecter',
      );
    }

    // Générer JWT
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async confirmEmail(confirmEmailDto: ConfirmEmailDto) {
    const { token } = confirmEmailDto;

    const user = await this.userRepository.findOne({
      where: { emailConfirmationToken: token },
    });

    if (!user) {
      throw new NotFoundException('Token de confirmation invalide');
    }

    user.isEmailConfirmed = true;
    user.emailConfirmationToken = null;
    await this.userRepository.save(user);

    return { message: 'Email confirmé avec succès' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
      return {
        message:
          'Si cet email est associé à un compte, un lien de réinitialisation a été envoyé.',
      };
    }

    // Générer token de réinitialisation
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await this.userRepository.save(user);

    // Envoyer l'email de réinitialisation
    await this.emailService.sendPasswordResetEmail(
      email,
      resetToken,
      user.firstName,
    );

    return {
      message: 'Un lien de réinitialisation a été envoyé à votre email.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user || !user.passwordResetExpires) {
      throw new BadRequestException(
        'Token de réinitialisation invalide ou expiré',
      );
    }

    if (user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Le token de réinitialisation a expiré');
    }

    // Hash du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    return {
      message: 'Mot de passe réinitialisé avec succès',
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }
}
