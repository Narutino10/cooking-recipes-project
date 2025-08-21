import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<string>('EMAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendConfirmationEmail(
    to: string,
    token: string,
    firstName: string,
  ): Promise<void> {
    const confirmationUrl = `${this.configService.get<string>('FRONTEND_URL')}/confirm-email?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to,
      subject: 'Confirmez votre inscription - Cooking Recipes',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Bienvenue ${firstName} !</h1>
          <p>Merci pour votre inscription sur Cooking Recipes.</p>
          <p>Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
          <a href="${confirmationUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #007bff; 
                    color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Confirmer mon email
          </a>
          <p>Ce lien expire dans 24 heures.</p>
          <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw new Error('Failed to send confirmation email');
    }
  }

  async sendPasswordResetEmail(
    to: string,
    token: string,
    firstName: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to,
      subject: 'Réinitialisez votre mot de passe - Cooking Recipes',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Réinitialisation de mot de passe</h1>
          <p>Bonjour ${firstName},</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #dc3545; 
                    color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Réinitialiser mon mot de passe
          </a>
          <p>Ce lien expire dans 1 heure.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}
