import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface NewsletterSubscription {
  email: string;
  preferences?: {
    newRecipes: boolean;
    weeklyDigest: boolean;
    communityUpdates: boolean;
  };
}

export interface NewsletterEmail {
  subject: string;
  content: string;
  recipients: string[];
  type: 'new_recipe' | 'weekly_digest' | 'community_update';
}

@Injectable()
export class EmailService {
  private transporter: Transporter | null;
  private newsletterSubscribers: Set<string> = new Set(); // In-memory storage for demo

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

  // Newsletter methods
  async subscribeToNewsletter(
    subscription: NewsletterSubscription,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // In a real app, you'd save this to a database
      this.newsletterSubscribers.add(subscription.email);

      const fromEmail =
        this.configService.get<string>('EMAIL_FROM') ||
        'Cooking Recipes <noreply@cooking-recipes.com>';

      const welcomeMailOptions = {
        from: fromEmail,
        to: subscription.email,
        subject: 'Bienvenue sur Cooking Recipes ! 🍳',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center; margin-bottom: 30px;">🍳 Bienvenue sur Cooking Recipes !</h1>

              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Merci de vous être abonné à notre newsletter ! Vous recevrez désormais :
              </p>

              <ul style="color: #666; line-height: 1.8; margin-bottom: 30px;">
                <li>✨ Les meilleures nouvelles recettes chaque semaine</li>
                <li>👨‍🍳 Conseils et astuces culinaires</li>
                <li>🎉 Événements et concours exclusifs</li>
                <li>📱 Mises à jour de la plateforme</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}"
                   style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                          color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
                  Découvrir les recettes
                </a>
              </div>

              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                Vous pouvez vous désabonner à tout moment depuis vos paramètres.
              </p>
            </div>
          </div>
        `,
      };

      if (this.transporter) {
        await this.transporter.sendMail(welcomeMailOptions);
      } else {
        console.log('Newsletter welcome email:', welcomeMailOptions);
      }

      return {
        success: true,
        message:
          'Vous êtes maintenant abonné à notre newsletter ! Bienvenue dans la communauté Cooking Recipes. 🍳',
      };
    } catch (error) {
      console.error("Erreur lors de l'abonnement à la newsletter:", error);
      throw new Error("Erreur lors de l'abonnement à la newsletter");
    }
  }

  async unsubscribeFromNewsletter(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.newsletterSubscribers.delete(email);
      return {
        success: true,
        message:
          'Vous avez été désabonné de notre newsletter. Nous espérons vous revoir bientôt ! 👋',
      };
    } catch (error) {
      console.error('Erreur lors du désabonnement:', error);
      throw new Error('Erreur lors du désabonnement');
    }
  }

  async sendNewsletterEmail(
    emailData: NewsletterEmail,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const fromEmail =
        this.configService.get<string>('EMAIL_FROM') ||
        'Cooking Recipes <noreply@cooking-recipes.com>';

      let successCount = 0;
      let failCount = 0;

      for (const recipient of emailData.recipients) {
        if (!this.newsletterSubscribers.has(recipient)) {
          continue; // Skip if not subscribed
        }

        const mailOptions = {
          from: fromEmail,
          to: recipient,
          subject: emailData.subject,
          html: this.generateNewsletterHTML(emailData),
        };

        try {
          if (this.transporter) {
            await this.transporter.sendMail(mailOptions);
          } else {
            console.log('Newsletter email:', mailOptions);
          }
          successCount++;
        } catch (error) {
          console.error(`Erreur envoi email à ${recipient}:`, error);
          failCount++;
        }
      }

      return {
        success: true,
        message: `Newsletter envoyée à ${successCount} abonnés${failCount > 0 ? ` (${failCount} échecs)` : ''}`,
      };
    } catch (error) {
      console.error("Erreur lors de l'envoi de la newsletter:", error);
      throw new Error("Erreur lors de l'envoi de la newsletter");
    }
  }

  async sendNewRecipeNotification(
    recipeName: string,
    recipeId: string,
    authorName: string,
  ): Promise<void> {
    if (this.newsletterSubscribers.size === 0) return;

    const subject = `🍳 Nouvelle recette : ${recipeName}`;
    const content = `
      <h2>Découvrez cette nouvelle recette !</h2>
      <p><strong>${recipeName}</strong> par ${authorName}</p>
      <p>Une nouvelle recette délicieuse vient d'être ajoutée à notre collection !</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/recipe/${recipeId}"
           style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #e74c3c 0%, #f39c12 100%);
                  color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
          Voir la recette
        </a>
      </div>
    `;

    const recipients = Array.from(this.newsletterSubscribers);
    await this.sendNewsletterEmail({
      subject,
      content,
      recipients,
      type: 'new_recipe',
    });
  }

  private generateNewsletterHTML(emailData: NewsletterEmail): string {
    const templates = {
      new_recipe: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">🍳 Cooking Recipes</h1>
              <p style="color: #666; margin: 10px 0 0;">Votre newsletter hebdomadaire</p>
            </div>
            ${emailData.content}
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #999; font-size: 12px;">
                Vous recevez cet email car vous êtes abonné à notre newsletter.<br>
                <a href="#" style="color: #999;">Se désabonner</a> | <a href="${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}" style="color: #999;">Visiter le site</a>
              </p>
            </div>
          </div>
        </div>
      `,
      weekly_digest: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">🍳 Cooking Recipes</h1>
              <p style="color: #666; margin: 10px 0 0;">Votre digest hebdomadaire</p>
            </div>
            ${emailData.content}
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #999; font-size: 12px;">
                Vous recevez cet email car vous êtes abonné à notre newsletter.<br>
                <a href="#" style="color: #999;">Se désabonner</a> | <a href="${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}" style="color: #999;">Visiter le site</a>
              </p>
            </div>
          </div>
        </div>
      `,
      community_update: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">🍳 Cooking Recipes</h1>
              <p style="color: #666; margin: 10px 0 0;">Actualités de la communauté</p>
            </div>
            ${emailData.content}
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #999; font-size: 12px;">
                Vous recevez cet email car vous êtes abonné à notre newsletter.<br>
                <a href="#" style="color: #999;">Se désabonner</a> | <a href="${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}" style="color: #999;">Visiter le site</a>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    return templates[emailData.type] || templates.new_recipe;
  }

  getNewsletterStats() {
    return {
      totalSubscribers: this.newsletterSubscribers.size,
      subscribers: Array.from(this.newsletterSubscribers),
    };
  }
}
