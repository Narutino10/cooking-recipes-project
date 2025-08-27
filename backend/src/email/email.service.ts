import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter | null;

  constructor(private configService: ConfigService) {
    // Support both EMAIL_* and SMTP_* env var names
    const host =
      this.configService.get<string>('EMAIL_HOST') ||
      this.configService.get<string>('SMTP_HOST');
    const port =
      Number(
        this.configService.get<string>('EMAIL_PORT') ||
          this.configService.get<string>('SMTP_PORT'),
      ) || undefined;
    const secure =
      (this.configService.get<string>('EMAIL_SECURE') ||
        this.configService.get<string>('SMTP_SECURE') ||
        'false') === 'true';
    const user =
      this.configService.get<string>('EMAIL_USER') ||
      this.configService.get<string>('SMTP_USER');
    const pass =
      this.configService.get<string>('EMAIL_PASS') ||
      this.configService.get<string>('SMTP_PASS');

    // If host is not provided or points to localhost, don't create a real transporter in dev
    if (!host || host === 'localhost' || host === '127.0.0.1') {
      console.warn(
        'Email transporter not configured or using localhost. Emails will be logged instead of sent.',
      );
      this.transporter = null;
    } else {
      // Build SMTP transport options. Type as any to avoid mismatches between
      // nodemailer vs @types/nodemailer definitions across versions.
      const smtpOptions = {
        host,
        ...(port ? { port } : {}),
        // secure indicates whether to use TLS
        ...(typeof secure === 'boolean' ? { secure } : {}),
        ...(user && pass ? { auth: { user, pass } } : {}),
      };
      this.transporter = nodemailer.createTransport(
        smtpOptions as nodemailer.TransportOptions,
      );
    }
  }

  async sendConfirmationEmail(
    to: string,
    token: string,
    firstName: string,
  ): Promise<void> {
    const confirmationUrl = `${this.configService.get<string>('FRONTEND_URL')}/confirm-email?token=${token}`;

    const fromEmail =
      this.configService.get<string>('EMAIL_FROM') ||
      'Cooking Recipes <noreply@cooking-recipes.com>';

    const mailOptions = {
      from: fromEmail,
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
      if (!this.transporter) {
        // In development when no SMTP is configured, just log the mail content instead of throwing
        console.log(
          'Skipping email send (transporter not configured). Mail content:',
          mailOptions,
        );
        return;
      }
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Don't fail the whole request in development; rethrow in production
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Failed to send confirmation email');
      }
      return;
    }
  }

  async sendPasswordResetEmail(
    to: string,
    token: string,
    firstName: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;

    const fromEmail =
      this.configService.get<string>('EMAIL_FROM') ||
      'Cooking Recipes <noreply@cooking-recipes.com>';

    const mailOptions = {
      from: fromEmail,
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
      if (!this.transporter) {
        console.log(
          'Skipping password reset email send (transporter not configured). Mail content:',
          mailOptions,
        );
        return;
      }
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Failed to send password reset email');
      }
      return;
    }
  }
}
