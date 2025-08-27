import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import {
  EmailService,
  NewsletterSubscription,
  NewsletterEmail,
} from './email.service';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly emailService: EmailService) {}

  @Post('subscribe')
  async subscribe(@Body() subscription: NewsletterSubscription) {
    return this.emailService.subscribeToNewsletter(subscription);
  }

  @Post('unsubscribe')
  async unsubscribe(@Body('email') email: string) {
    return this.emailService.unsubscribeFromNewsletter(email);
  }

  @Post('send')
  async sendNewsletter(@Body() emailData: NewsletterEmail) {
    return this.emailService.sendNewsletterEmail(emailData);
  }

  @Get('stats')
  async getStats() {
    return await Promise.resolve(this.emailService.getNewsletterStats());
  }

  @Get('is-subscribed/:email')
  async isSubscribed(@Param('email') email: string) {
    const subscribers = this.emailService.getNewsletterStats().subscribers;
    return await Promise.resolve({ subscribed: subscribers.includes(email) });
  }
}
